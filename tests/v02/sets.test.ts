import { describe, expect, it } from 'vitest';
import { DECKS } from '../../src/v02/content/cards';
import { apply, cardsInZones, guard, legalActions, might, newGame, zonesFor } from '../../src/v02/rules/engine';
import { playOut } from '../../src/v02/ai/bot';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../../src/v02/rules/types';

function ok(s: GameState, p: PlayerIndex, a: Action): GameState {
  const r = apply(s, p, a);
  if (r.error) throw new Error(`${JSON.stringify(a)} rejected: ${r.error}`);
  return r.state;
}
function board(decks: [string, string] = ['vault', 'brood']): GameState {
  let s = newGame({ seed: 42, decks, first: 0 });
  s = ok(s, 0, { type: 'mulligan', redraw: false });
  s = ok(s, 1, { type: 'mulligan', redraw: false });
  s = ok(s, 0, { type: 'endTurn' });
  s = ok(s, 1, { type: 'endTurn' });
  for (const pl of s.players) { pl.hand = []; pl.field = []; pl.schemes = []; pl.fallen = []; pl.command = 8; pl.commandMax = 8; }
  return s;
}
function put(s: GameState, p: PlayerIndex, stack: string[], opts: Partial<ChampionInPlay> = {}): number {
  const uid = s.nextUid++;
  s.players[p].field.push({ uid, owner: p, stack, exhausted: false, arrivedTurn: -1, ascendedTurn: -1, shield: false,
    mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, relic: null, token: false, ...opts });
  return uid;
}
const find = (s: GameState, uid: number) => s.players.flatMap((p) => p.field).find((c) => c.uid === uid)!;
const drainResponses = (t: GameState) => {
  while (t.pending && (t.pending.kind === 'respond' || t.pending.kind === 'shardfall')) {
    t = ok(t, t.pending.player, t.pending.kind === 'respond' ? { type: 'respond', key: null } : { type: 'shardfall', use: false });
  }
  return t;
};

describe('Relics', () => {
  it('attach to a champion, add stats and keywords, and follow it to the Fallen pile', () => {
    const s = board();
    const k = put(s, 0, ['kael@2', 'kael@2-2']);
    s.players[0].hand = ['relic-blade', 'relic-feather'];
    let t = ok(s, 0, { type: 'equip', handIndex: 0, uid: k });
    expect(find(t, k).relic).toBe('relic-blade');
    expect(might(t, find(t, k))).toBe(5 + 2 + 2); // ★★ base 5, Royal Blade +2, Kael ★★: +2 Might while holding a Relic
    expect(legalActions(t).some((a) => a.type === 'equip' && a.uid === k)).toBe(false); // one Relic per champion
    const g = put(t, 1, ['grizz@2']);
    t.players[1].field.find((c) => c.uid === g)!.mods.might = 20;
    t = ok(t, 0, { type: 'toBattle' });
    t = drainResponses(ok(t, 0, { type: 'attack', uid: k, target: g }));
    expect(t.players[0].fallen).toEqual(expect.arrayContaining(['kael@2', 'kael@2-2', 'relic-blade']));
  });
  it('Emblems add an Origin, and the Crown of the First Realm counts as every Origin', () => {
    const s = board();
    const a = put(s, 0, ['aurelia@2']); // other Kingdom champions have +1 Might
    const g = put(s, 0, ['gearwick@2']);
    s.players[0].hand = ['relic-kingdom_emblem'];
    const before = might(s, find(s, g));
    const t = ok(s, 0, { type: 'equip', handIndex: 0, uid: g });
    expect(might(t, find(t, g))).toBe(before + 1 + 1); // Emblem +1, and now Kingdom so Aurelia's aura adds +1
    expect(might(t, find(t, a))).toBe(3); // Aurelia's aura is for her *other* champions
    const w = put(t, 0, ['fen@2']);
    t.players[0].hand = ['relic-first_realm_crown'];
    const u = ok(t, 0, { type: 'equip', handIndex: 0, uid: w });
    expect(might(u, find(u, w))).toBe(2 + 1 + 1); // Fen ★ 2, Crown +1, every Origin so Kingdom aura +1
  });
  it('the Sovereign Crown gives a fifth Champion Zone', () => {
    const s = board();
    const k = put(s, 0, ['kael@2']);
    s.players[0].hand = ['relic-sovereign_crown'];
    const t = ok(s, 0, { type: 'equip', handIndex: 0, uid: k });
    expect(zonesFor(t, 0)).toBe(5);
  });
  it('"Attach a Relic … for free" on Arrival', () => {
    const s = board();
    s.players[0].hand = ['kael@2', 'relic-plate'];
    let t = ok(s, 0, { type: 'deploy', handIndex: 0 });
    expect(t.players[0].field[0].relic).toBe('relic-plate');
    expect(t.players[0].command).toBe(6);
    expect(t.players[0].hand).toEqual([]);
  });
});

describe('Edicts', () => {
  it('stay in play for both players and are replaced by a new one', () => {
    const s = board(['banner', 'ember']);
    s.players[0].hand = ['edict-crowns_bounty'];
    s.players[1].hand = ['edict-scholars_ascent'];
    let t = ok(s, 0, { type: 'playEdict', handIndex: 0 });
    expect(t.edict).toEqual({ card: 'edict-crowns_bounty', owner: 0 });
    t = ok(t, 0, { type: 'endTurn' });
    expect(t.players[1].command).toBe(t.players[1].commandMax + 1); // Crown's Bounty works for the rival too
    t = ok(t, 1, { type: 'playEdict', handIndex: t.players[1].hand.indexOf('edict-scholars_ascent') });
    expect(t.edict?.card).toBe('edict-scholars_ascent');
    expect(t.players[0].fallen).toContain('edict-crowns_bounty');
  });
});

describe('tokens, Monsters and Guardians', () => {
  it('tokens vanish when defeated (never reach the Fallen pile)', () => {
    const s = board();
    s.players[1].hand = ['guardian-spiderqueen'];
    s.active = 1;
    const t = ok(s, 1, { type: 'deploy', handIndex: 0 });
    const spiders = t.players[1].field.filter((c) => c.token);
    expect(spiders).toHaveLength(2);
    const k = put(t, 0, ['kael@2']);
    t.active = 0; t.phase = 'main';
    let u = ok(t, 0, { type: 'toBattle' });
    u = drainResponses(ok(u, 0, { type: 'attack', uid: k, target: spiders[0].uid }));
    expect(u.players[1].field.some((c) => c.uid === spiders[0].uid)).toBe(false);
    expect(u.players[1].fallen).not.toContain('token-spiderling');
  });
  it('Monster Loot: when a Monster is defeated its rival draws', () => {
    const s = board();
    const k = put(s, 0, ['kael@2']);
    const mite = put(s, 1, ['monster-mite']);
    const hand = s.players[0].hand.length;
    let t = ok(s, 0, { type: 'toBattle' });
    t = drainResponses(ok(t, 0, { type: 'attack', uid: k, target: mite }));
    expect(t.players[0].hand.length).toBe(hand + 1);
  });
  it('the Clockwork Hydra splits into Hydra Hatchlings when defeated', () => {
    const s = board();
    const big = put(s, 0, ['atlas@2', 'atlas@2-2', 'atlas@2-3'], { mods: { might: 10, guard: 0 } });
    const hydra = put(s, 1, ['guardian-hydra']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = drainResponses(ok(t, 0, { type: 'attack', uid: big, target: hydra }));
    expect(t.players[1].field.filter((c) => c.stack[0] === 'token-hydralet')).toHaveLength(4);
  });
  it('the Void Spider Queen summons a spider at the start of its owner\'s turn', () => {
    const s = board();
    put(s, 1, ['guardian-spiderqueen']);
    const t = ok(s, 0, { type: 'endTurn' });
    expect(t.players[1].field.filter((c) => c.token)).toHaveLength(1);
  });
});

describe('Crown Power mechanics', () => {
  it('Void: a card that would break your last shard cannot be cast', () => {
    const s = board(['banner', 'ember']);
    s.players[0].hand = ['blood_price'];
    s.players[0].crown = ['firebolt'];
    expect(apply(s, 0, { type: 'cast', handIndex: 0 }).error).toBe('It would break your last shard.');
    s.players[0].crown = ['firebolt', 'firebolt'];
    const t = ok(s, 0, { type: 'cast', handIndex: 0 });
    expect(t.players[0].crown).toHaveLength(1);
    expect(t.players[0].command).toBe(8 - 0 + 3);
  });
  it('Evolution: Ascension Rite ascends a ★ champion for free without using the turn\'s Ascend', () => {
    const s = board(['banner', 'ember']);
    const k = put(s, 0, ['kael']);
    s.players[0].hand = ['ascension_rite'];
    const t = ok(s, 0, { type: 'cast', handIndex: 0 });
    expect(find(t, k).stack).toEqual(['kael', 'kael-2']);
    expect(t.players[0].ascendedOnTurn).not.toBe(t.turn);
  });
  it('Evolution: Prodigy\'s Path adds a Champion Zone for the rest of the game', () => {
    const s = board(['banner', 'ember']);
    s.players[0].hand = ['prodigy_path'];
    const t = ok(s, 0, { type: 'cast', handIndex: 0 });
    expect(zonesFor(t, 0)).toBe(5);
  });
  it('Chaos: coin flips are deterministic for a seed', () => {
    const s = board(['banner', 'ember']);
    s.players[0].hand = ['coin_flip'];
    const a = ok(s, 0, { type: 'cast', handIndex: 0 });
    const b = ok(s, 0, { type: 'cast', handIndex: 0 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  it('Creation: Crests boost champions of their Origin only', () => {
    const s = board(['banner', 'ember']);
    const k = put(s, 0, ['kael']);
    const so = put(s, 0, ['solara']);
    s.players[0].hand = ['crest_kingdom'];
    const t = ok(s, 0, { type: 'cast', handIndex: 0 });
    expect(might(t, find(t, k))).toBe(3 + 2);
    expect(guard(t, find(t, so))).toBe(2);
  });
});

describe('all four starter decks', () => {
  it('play complete AI games against each other, conserving every card', () => {
    const ids = Object.keys(DECKS);
    for (const a of ids) for (const b of ids) {
      for (let k = 0; k < 3; k++) {
        const end = playOut(newGame({ seed: 500 + k, decks: [a, b] }));
        expect(end.phase).toBe('over');
        expect(end.players.map(cardsInZones)).toEqual([38, 38]);
      }
    }
  });
});
