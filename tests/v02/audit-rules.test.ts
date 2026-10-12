import { describe, expect, it } from 'vitest';
import { CARDS } from '../../src/v02/content/cards';
import { CHANNEL_CAP, WARD_CAP, apply, guard, legalActions, might, newGame } from '../../src/v02/rules/engine';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../../src/v02/rules/types';

// Rules added by the Set 1 + Set 2 audit (owner-approved 2026-10-12, see prototype-v0.2/AUDIT_CHANGES.md).
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
const find = (s: GameState, uid: number) => s.players.flatMap((p) => p.field).find((c) => c.uid === uid);
const attack = (s: GameState, uid: number, target: 'crown' | number) => ok(ok(s, 0, { type: 'toBattle' }), 0, { type: 'attack', uid, target });
const stat = (id: string, k: 'might' | 'guard') => (CARDS[id] as unknown as Record<string, number>)[k];

describe('Sentinel ward cap (owner-approved 2026-10-12)', () => {
  it('Crown wards from every source together give at most −2 Might', () => {
    const s = board();
    put(s, 1, ['torren@2', 'torren@2-2', 'torren@2-3']); // −2
    put(s, 1, ['titanrho@2']); // −1
    put(s, 1, ['grimm@2', 'grimm@2-2']); // −1
    const k = put(s, 0, ['kael', 'kael-2']);
    const t = attack(s, k.uid, 'crown');
    expect(WARD_CAP).toBe(2);
    expect(might(t, find(t, k.uid)!)).toBe(stat('kael-2', 'might') - 2);
  });
});

describe('Channeler cap (owner-approved 2026-10-12)', () => {
  it('"Whenever you cast a Tactic" triggers only for the first two Tactics each turn', () => {
    const s = board();
    put(s, 0, ['emberling@2']); // Whenever you cast a Tactic, Scorch 1 a rival champion
    const foe = put(s, 1, ['titanrho']);
    s.players[0].hand = ['kindling', 'kindling', 'kindling'];
    let t = s;
    for (let k = 0; k < 3; k++) t = settle(ok(t, 0, { type: 'cast', handIndex: 0 }));
    expect(CHANNEL_CAP).toBe(2);
    expect(guard(t, find(t, foe.uid)!)).toBe(stat('titanrho', 'guard') - 2);
    expect(t.log.some((l) => /first 2 Tactics/.test(l.text))).toBe(true);
  });
  it('the count resets every turn', () => {
    const s = board();
    s.players[0].tacticsCast = { turn: s.turn - 1, n: 5 };
    put(s, 0, ['emberling@2']);
    const foe = put(s, 1, ['titanrho']);
    s.players[0].hand = ['kindling'];
    const t = settle(ok(s, 0, { type: 'cast', handIndex: 0 }));
    expect(guard(t, find(t, foe.uid)!)).toBe(stat('titanrho', 'guard') - 1);
  });
});

describe('Breakers and stealers never go blank (audit 2026-10-12)', () => {
  it('"Break a rival champion\'s Relic. If you can\'t, Scorch 2" falls back when there is no Relic', () => {
    const s = board();
    const foe = put(s, 1, ['titanrho']);
    s.players[0].hand = ['pyrax@2'];
    const t = settle(ok(s, 0, { type: 'deploy', handIndex: 0 }));
    expect(guard(t, find(t, foe.uid)!)).toBe(stat('titanrho', 'guard') - 2);
  });
  it('a Rogue that already holds a Relic swaps: its old Relic returns to its owner\'s hand', () => {
    const s = board();
    const nyx = put(s, 0, ['nyx@2'], { relic: 'relic-plate' });
    const foe = put(s, 1, ['titanrho'], { relic: 'relic-blade' });
    foe.mods.might = -20;
    foe.mods.guard = 20;
    const t = settle(attack(s, nyx.uid, foe.uid));
    expect(find(t, nyx.uid)!.relic).toBe('relic-blade');
    expect(find(t, nyx.uid)!.relicOwner).toBe(1);
    expect(t.players[0].hand).toContain('relic-plate');
  });
});

describe('Mythic Relics change a rule (audit 2026-10-12)', () => {
  it('Crown of the First Realm: you may Ascend twice each turn', () => {
    const s = board();
    put(s, 0, ['kael@2'], { relic: 'relic-first_realm_crown' });
    const b = put(s, 0, ['bolt@2']);
    s.players[0].ascension = ['kael@2-2', 'bolt@2-2'];
    let t = settle(ok(s, 0, { type: 'ascend', uid: s.players[0].field[0].uid }));
    expect(legalActions(t).some((a) => a.type === 'ascend' && a.uid === b.uid)).toBe(true);
    t = settle(ok(t, 0, { type: 'ascend', uid: b.uid }));
    expect(find(t, b.uid)!.stack).toEqual(['bolt@2', 'bolt@2-2']);
  });
  it('without it, only one Ascend each turn', () => {
    const s = board();
    const a = put(s, 0, ['kael@2']);
    const b = put(s, 0, ['bolt@2']);
    s.players[0].ascension = ['kael@2-2', 'bolt@2-2'];
    const t = settle(ok(s, 0, { type: 'ascend', uid: a.uid }));
    expect(legalActions(t).some((x) => x.type === 'ascend' && x.uid === b.uid)).toBe(false);
  });
  it('The Fallen King\'s Blade: an unblocked attack on the Crown breaks 1 more shard', () => {
    const s = board();
    const k = put(s, 0, ['kael@2'], { relic: 'relic-fallen_kings_blade' });
    const t = settle(attack(s, k.uid, 'crown'));
    expect(t.players[1].crown).toHaveLength(3);
  });
  it('Titan\'s Last Heart: an unblocked attack on your Crown breaks only 1 shard (it beats the Blade)', () => {
    const s = board();
    const k = put(s, 0, ['kael@2', 'kael@2-2', 'kael@2-3'], { relic: 'relic-fallen_kings_blade' });
    put(s, 1, ['titanrho'], { relic: 'relic-titans_last_heart', exhausted: true });
    const t = settle(attack(s, k.uid, 'crown'));
    expect(t.players[1].crown).toHaveLength(4);
  });
  it('Hourglass of Ash: the holder readies once per turn when it attacks a champion', () => {
    const s = board();
    const k = put(s, 0, ['kael@2', 'kael@2-2'], { relic: 'relic-hourglass_of_ash' });
    const f1 = put(s, 1, ['pip']);
    const f2 = put(s, 1, ['pip']);
    let t = settle(attack(s, k.uid, f1.uid));
    expect(find(t, k.uid)!.exhausted).toBe(false);
    t = settle(ok(t, 0, { type: 'attack', uid: k.uid, target: f2.uid }));
    expect(find(t, k.uid)!.exhausted).toBe(true); // once per turn
  });
  it('Spell Shroud: Scorch has no effect on the holder', () => {
    const s = board();
    put(s, 0, ['emberling@2']);
    const foe = put(s, 1, ['titanrho'], { relic: 'relic-spell_shroud' });
    s.players[0].hand = ['kindling'];
    const t = settle(ok(s, 0, { type: 'cast', handIndex: 0 }));
    expect(guard(t, find(t, foe.uid)!)).toBe(stat('titanrho', 'guard') + 2);
  });
  it('Sovereign Crown returns to its owner\'s hand when its holder is defeated', () => {
    const s = board();
    const k = put(s, 0, ['pip'], { relic: 'relic-sovereign_crown' });
    const foe = put(s, 1, ['titanrho']);
    foe.mods.might = 20;
    const t = settle(attack(s, k.uid, foe.uid));
    expect(find(t, k.uid)).toBeUndefined();
    expect(t.players[0].hand).toContain('relic-sovereign_crown');
  });
});

describe('New Set 2 Schemes (audit 2026-10-12)', () => {
  it('A Guardian Approaches summons a Guardian Construct that blocks the unblocked attack', () => {
    const s = board();
    s.players[1].schemes = [{ sid: 900, card: 'guardian_approaches', setTurn: 0 }];
    const k = put(s, 0, ['kael@2']);
    let t = attack(s, k.uid, 'crown');
    expect(t.pending?.kind).toBe('respond');
    t = settle(ok(t, 1, { type: 'respond', key: 's:900' }));
    expect(t.players[1].crown).toHaveLength(5);
    expect(t.log.some((l) => /Guardian Construct ★ blocks/.test(l.text))).toBe(true);
  });
  it('Old Power, Newly Yours takes the attacker\'s Relic, or Scorches the attacker', () => {
    const s = board();
    s.players[1].schemes = [{ sid: 901, card: 'old_power', setTurn: 0 }];
    const mine = put(s, 1, ['titanrho']);
    const k = put(s, 0, ['kael@2'], { relic: 'relic-blade' });
    let t = attack(s, k.uid, 'crown');
    while (t.pending?.kind === 'block') t = ok(t, 1, { type: 'block', uid: null });
    t = settle(ok(t, 1, { type: 'respond', key: 's:901' }));
    expect(find(t, mine.uid)!.relic).toBe('relic-blade');
    expect(find(t, mine.uid)!.relicOwner).toBe(0);
  });
});
