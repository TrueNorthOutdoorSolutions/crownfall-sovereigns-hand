import { describe, expect, it } from 'vitest';
import { checkDeck } from '../../src/v02/economy/decks';
import { CARDS, DECKS } from '../../src/v02/content/cards';
import { apply, ascensionOptions, guard, legalActions, might, newGame, relicCost, schemeCost } from '../../src/v02/rules/engine';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../../src/v02/rules/types';

// The Season 1.5 class mechanics (owner-approved 2026-10-11) and the cross-set rules.
function ok(s: GameState, p: PlayerIndex, a: Action): GameState {
  const r = apply(s, p, a);
  if (r.error) throw new Error(`${JSON.stringify(a)} rejected: ${r.error}`);
  return r.state;
}
const settle = (s: GameState) => {
  let g = 0;
  while (s.pending && g++ < 40) {
    const p = s.pending;
    s = p.kind === 'choose' ? ok(s, p.player, { type: 'choose', key: p.options[0]?.key ?? null })
      : p.kind === 'block' ? ok(s, p.player, { type: 'block', uid: null })
      : p.kind === 'respond' ? ok(s, p.player, { type: 'respond', key: null })
      : p.kind === 'shardfall' ? ok(s, p.player, { type: 'shardfall', use: false })
      : ok(s, p.player, { type: 'discard', handIndex: 0 });
  }
  return s;
};
function board(): GameState {
  let s = newGame({ seed: 3, decks: ['banner', 'ember'], first: 0 });
  s = ok(s, 0, { type: 'mulligan', redraw: false });
  s = ok(s, 1, { type: 'mulligan', redraw: false });
  s = settle(ok(s, 0, { type: 'endTurn' }));
  s = settle(ok(s, 1, { type: 'endTurn' }));
  for (const pl of s.players) { pl.hand = []; pl.field = []; pl.schemes = []; pl.fallen = []; pl.ascension = []; pl.command = 8; pl.commandMax = 8; }
  return s;
}
function put(s: GameState, p: PlayerIndex, stack: string[], opts: Partial<ChampionInPlay> = {}): ChampionInPlay {
  const c: ChampionInPlay = { uid: s.nextUid++, owner: p, stack, exhausted: false, arrivedTurn: -1, ascendedTurn: -1, shield: false,
    mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, relic: null, token: false, ...opts };
  s.players[p].field.push(c);
  return c;
}
const find = (s: GameState, uid: number) => s.players.flatMap((p) => p.field).find((c) => c.uid === uid)!;
const attack = (s: GameState, uid: number, target: 'crown' | number) => ok(ok(s, 0, { type: 'toBattle' }), 0, { type: 'attack', uid, target });
const stat = (id: string, k: 'might' | 'guard' | 'cost') => (CARDS[id] as unknown as Record<string, number>)[k];

describe('Set 2 classes', () => {
  // Guard is set to exactly base Might + 1, so only the class bonus wins the fight.
  const toGuard = (s: GameState, c: ChampionInPlay, g: number) => { c.mods.guard += g - guard(s, c); };
  it('Hunter: +Might while fighting an Ascended champion, not a ★ one', () => {
    const m = stat('fen@2', 'might');
    let s = board();
    let fen = put(s, 0, ['fen@2']), foe = put(s, 1, ['pip', 'pip-2']);
    toGuard(s, foe, m + 1);
    let t = settle(attack(s, fen.uid, foe.uid));
    expect(t.players[1].field.some((c) => c.uid === foe.uid)).toBe(false); // the ★★ falls to the Hunter bonus
    s = board();
    fen = put(s, 0, ['fen@2']); foe = put(s, 1, ['pip']);
    toGuard(s, foe, m + 1);
    t = settle(attack(s, fen.uid, foe.uid));
    expect(t.players[1].field.some((c) => c.uid === foe.uid)).toBe(true); // no bonus against a ★
  });
  it('Gladiator: +Might while attacking a champion', () => {
    const m = stat('rask@2', 'might');
    const s = board();
    const rask = put(s, 0, ['rask@2']), foe = put(s, 1, ['pip']);
    toGuard(s, foe, m + 1);
    const t = settle(attack(s, rask.uid, foe.uid));
    expect(t.players[1].field.some((c) => c.uid === foe.uid)).toBe(false);
  });
  it('Sentinel: rival champions attacking your Crown get −Might', () => {
    const s = board();
    put(s, 1, ['torren@2', 'torren@2-2', 'torren@2-3']); // −2
    const k = put(s, 0, ['kael', 'kael-2']);
    const t = attack(s, k.uid, 'crown');
    expect(might(t, find(t, k.uid))).toBe(Math.max(0, stat('kael-2', 'might') - 2));
  });
  it('Binder: your tokens get the aura', () => {
    const s = board();
    put(s, 0, ['morrow@2', 'morrow@2-2']); // tokens +1/+1
    const tok = put(s, 0, ['token-skeleton'], { token: true });
    expect([might(s, tok), guard(s, tok)]).toEqual([stat('token-skeleton', 'might') + 1, stat('token-skeleton', 'guard') + 1]);
  });
  it('Seer: Schemes cost less to spring; Artificer: Relics cost less', () => {
    const s = board();
    put(s, 0, ['hexie@2', 'hexie@2-2', 'hexie@2-3']); // 2 less
    expect(schemeCost(s, 0, CARDS['cinder-veil'] as never)).toBe(Math.max(0, stat('cinder-veil', 'cost') - 2));
    put(s, 0, ['bolt@2']); // Relics 1 less
    expect(relicCost(s, CARDS['relic-blade'] as never, 0)).toBe(Math.max(0, stat('relic-blade', 'cost') - 1));
  });
  it('Channeler: casting a Tactic triggers it', () => {
    const s = board();
    put(s, 0, ['emberling@2']); // Whenever you cast a Tactic, Scorch 1 a rival champion
    const foe = put(s, 1, ['torren']);
    s.players[0].hand = ['royal-dispatch'];
    const t = settle(ok(s, 0, { type: 'cast', handIndex: 0 }));
    expect(guard(t, find(t, foe.uid))).toBe(stat('torren', 'guard') - 1);
  });
  it('Sapper breaks a rival Relic and a face-down Scheme', () => {
    const s = board();
    const foe = put(s, 1, ['torren'], { relic: 'relic-blade' });
    s.players[1].schemes = [{ sid: 999, card: 'cinder-veil', setTurn: 0 }];
    s.players[0].hand = ['pip@2', 'bramble@2'];
    let t = settle(ok(s, 0, { type: 'deploy', handIndex: 0 })); // Pip ★: break a rival champion's Relic
    expect(find(t, foe.uid).relic).toBeNull();
    expect(t.players[1].fallen).toContain('relic-blade');
    t = settle(ok(t, 0, { type: 'deploy', handIndex: 0 })); // Bramble ★: break a face-down Scheme
    expect(t.players[1].schemes).toHaveLength(0);
    expect(t.players[1].fallen).toContain('cinder-veil');
  });
  it('Rogue steals a Relic, and the card still belongs to its owner', () => {
    const s = board();
    const nyx = put(s, 0, ['nyx@2']);
    const foe = put(s, 1, ['torren'], { relic: 'relic-blade' });
    const t = settle(attack(s, nyx.uid, foe.uid));
    const thief = t.players[0].field.find((c) => c.uid === nyx.uid);
    if (thief?.relic) {
      expect(thief.relic).toBe('relic-blade');
      expect(thief.relicOwner).toBe(1);
    } else {
      // Nyx was defeated in the fight: the stolen Relic goes to its OWNER's Fallen pile, not the thief's.
      expect(t.players[1].fallen).toContain('relic-blade');
      expect(t.players[0].fallen).not.toContain('relic-blade');
    }
  });
});

describe('Cross-set rules (owner rule 2026-10-11)', () => {
  it('a Set 1 ★ can Ascend into a Set 2 ★★ of the same name, and you choose between versions', () => {
    const s = board();
    const b = put(s, 0, ['bramble']);
    s.players[0].ascension = ['bramble-2', 'bramble@2-2'];
    expect(ascensionOptions(s, b).map((c) => c.id)).toEqual(['bramble-2', 'bramble@2-2']);
    expect(legalActions(s).some((a) => a.type === 'ascend' && a.card === 'bramble@2-2')).toBe(true);
    const t = settle(ok(s, 0, { type: 'ascend', uid: b.uid, card: 'bramble@2-2' }));
    expect(find(t, b.uid).stack).toEqual(['bramble', 'bramble@2-2']);
    expect(t.players[0].ascension).toEqual(['bramble-2']);
  });
  it('at most 2 champions of the same name across sets', () => {
    const base = DECKS.banner.main.filter(([id]) => id !== 'rowan');
    expect(checkDeck([...base, ['rowan', 1], ['rowan@2', 1]] as [string, number][], DECKS.banner.ascension).errors.filter((e) => /Rowan/.test(e))).toEqual([]);
    expect(checkDeck([...base, ['rowan', 2], ['rowan@2', 1]] as [string, number][], DECKS.banner.ascension).errors.join()).toMatch(/At most 2 Rowan/);
  });
});
