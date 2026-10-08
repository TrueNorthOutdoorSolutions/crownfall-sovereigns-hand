import { describe, expect, it } from 'vitest';
import { apply, cardsInZones, guard, legalActions, might, newGame } from '../../src/v02/rules/engine';
import { chooseAction, playOut } from '../../src/v02/ai/bot';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../../src/v02/rules/types';

// ── helpers ──
function started(seed = 42): GameState {
  let s = newGame({ seed, decks: ['banner', 'ember'], first: 0 });
  s = ok(s, 0, { type: 'mulligan', redraw: false });
  s = ok(s, 1, { type: 'mulligan', redraw: false });
  return s;
}
function ok(s: GameState, p: PlayerIndex, a: Action): GameState {
  const r = apply(s, p, a);
  if (r.error) throw new Error(`${JSON.stringify(a)} rejected: ${r.error}`);
  return r.state;
}
/** Put a champion straight onto the field (bypassing costs) for a focused scenario. */
function put(s: GameState, p: PlayerIndex, stack: string[], opts: Partial<ChampionInPlay> = {}): number {
  const uid = s.nextUid++;
  s.players[p].field.push({ uid, owner: p, stack, exhausted: false, arrivedTurn: -1, ascendedTurn: -1, shield: false,
    mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, ...opts });
  return uid;
}
/** A clean board in P1's Main step, round 2 (turn 2), with plenty of Command and no cards in hand. */
function board(): GameState {
  let s = started();
  s = ok(s, 0, { type: 'endTurn' });
  if (s.pending?.kind === 'discard') throw new Error('unexpected discard');
  s = ok(s, 1, { type: 'endTurn' });
  for (const pl of s.players) { pl.hand = []; pl.field = []; pl.schemes = []; pl.command = 8; pl.commandMax = 8; }
  return s;
}
const find = (s: GameState, uid: number) => s.players.flatMap((p) => p.field).find((c) => c.uid === uid);

describe('setup', () => {
  it('deals five Crown Shards, 5 cards to the first player and 6 to the second, and an 8-card Ascension Pile', () => {
    const s = newGame({ seed: 1, decks: ['banner', 'ember'], first: 0 });
    expect(s.players.map((p) => p.crown.length)).toEqual([5, 5]);
    expect(s.players.map((p) => p.hand.length)).toEqual([5, 6]);
    expect(s.players.map((p) => p.ascension.length)).toEqual([8, 8]);
    expect(s.players.map(cardsInZones)).toEqual([38, 38]);
    expect(s.pending).toEqual({ kind: 'mulligan', player: 0 });
  });
  it('first player starts with 1 Command and no draw; second player gets +1 Command on their first turn', () => {
    let s = started();
    expect(s.phase).toBe('main');
    expect(s.players[0].command).toBe(1);
    expect(s.players[0].hand.length).toBe(5);
    s = ok(s, 0, { type: 'endTurn' });
    expect(s.active).toBe(1);
    expect(s.players[1].command).toBe(2);
    expect(s.players[1].hand.length).toBe(7);
  });
  it('a redraw keeps the same hand size and conserves every card', () => {
    let s = newGame({ seed: 5, decks: ['banner', 'ember'], first: 1 });
    s = ok(s, 1, { type: 'mulligan', redraw: true });
    expect(s.players[1].hand.length).toBe(5);
    expect(cardsInZones(s.players[1])).toBe(38);
  });
});

describe('determinism and the legal-action contract', () => {
  it('the same seed and actions give identical states', () => {
    const a = playOut(newGame({ seed: 9, decks: ['banner', 'ember'] }));
    const b = playOut(newGame({ seed: 9, decks: ['banner', 'ember'] }));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  it('rejects actions from the wrong player and illegal actions without changing state', () => {
    const s = started();
    expect(apply(s, 1, { type: 'endTurn' }).error).toMatch(/P1's decision/);
    s.players[0].hand = ['sol'];
    const r = apply(s, 0, { type: 'deploy', handIndex: 0 });
    expect(r.error).toBe('Needs 6 Command (you have 1).');
    expect(r.state).toBe(s);
  });
  it('never mutates the previous state', () => {
    const s = started();
    const snap = JSON.stringify(s);
    ok(s, 0, { type: 'toBattle' });
    expect(JSON.stringify(s)).toBe(snap);
  });
});

describe('combat', () => {
  it('Might ≥ Guard defeats, simultaneously in both directions', () => {
    const s = board();
    const kael = put(s, 0, ['kael']); // 3/2
    const fen = put(s, 1, ['fen']); // 2/1 (+1 Might while behind: not behind)
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: kael, target: fen });
    expect(find(t, fen)).toBeUndefined();
    expect(find(t, kael)).toBeUndefined(); // Fen's Might 2 ≥ Kael's Guard 2
    expect(t.players[0].fallen).toContain('kael');
    expect(t.lastClash).toMatchObject({ attackerMight: 3, defenderGuard: 1, defenderMight: 2, attackerGuard: 2 });
  });
  it('a champion with 0 Might defeats nothing', () => {
    const s = board();
    const a = put(s, 0, ['kael']);
    const d = put(s, 1, ['emberling'], { mods: { might: -1, guard: 0 } }); // 0 Might
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: a, target: d });
    expect(find(t, a)).toBeDefined();
  });
  it('an unblocked Crown attack breaks 1 shard, which goes to the owner\'s hand; ★★★ breaks 2', () => {
    const s = board();
    const k3 = put(s, 0, ['kael', 'kael-2', 'kael-3']);
    const r1 = put(s, 0, ['rowan']);
    let t = ok(s, 0, { type: 'toBattle' });
    const hand = t.players[1].hand.length;
    t = ok(t, 0, { type: 'attack', uid: r1, target: 'crown' });
    while (t.pending?.kind === 'shardfall') t = ok(t, 1, { type: 'shardfall', use: false });
    expect(t.players[1].crown.length).toBe(4);
    expect(t.players[1].hand.length).toBe(hand + 1);
    t = ok(t, 0, { type: 'attack', uid: k3, target: 'crown' });
    while (t.pending?.kind === 'shardfall') t = ok(t, 1, { type: 'shardfall', use: false });
    expect(t.players[1].crown.length).toBe(2);
  });
  it('blocking turns the blocker sideways, but not with Bulwark', () => {
    const s = board();
    const a = put(s, 0, ['rowan']);
    const b = put(s, 1, ['grizz']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: a, target: 'crown' });
    expect(t.pending).toMatchObject({ kind: 'block', player: 1, options: [b] });
    t = ok(t, 1, { type: 'block', uid: b });
    expect(find(t, b)!.exhausted).toBe(true);
    expect(find(t, a)).toBeUndefined(); // Grizz blocks with Might 4+2
    const s2 = board();
    const a2 = put(s2, 1, ['rowan']);
    s2.active = 1;
    const v = put(s2, 0, ['varr']);
    let t2 = ok(s2, 1, { type: 'toBattle' });
    t2 = ok(t2, 1, { type: 'attack', uid: a2, target: 'crown' });
    t2 = ok(t2, 0, { type: 'block', uid: v });
    expect(find(t2, v)!.exhausted).toBe(false);
  });
  it('Flight can only be blocked by Flight or Reach', () => {
    const s = board();
    const sol2 = put(s, 0, ['sol', 'sol-2']);
    put(s, 1, ['grizz']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: sol2, target: 'crown' });
    expect(t.pending?.kind).not.toBe('block');
    const s2 = board();
    s2.active = 1;
    const ax = put(s2, 1, ['aurex', 'aurex-2']);
    const rowan = put(s2, 0, ['rowan']);
    let t2 = ok(s2, 1, { type: 'toBattle' });
    t2 = ok(t2, 1, { type: 'attack', uid: ax, target: 'crown' });
    expect(t2.pending).toMatchObject({ kind: 'block', options: [rowan] });
  });
  it('Breakthrough: beating the blocker and surviving still breaks 1 shard', () => {
    const s = board();
    const k3 = put(s, 0, ['kael', 'kael-2', 'kael-3']);
    const fen = put(s, 1, ['fen']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: k3, target: 'crown' });
    t = ok(t, 1, { type: 'block', uid: fen });
    while (t.pending?.kind === 'shardfall') t = ok(t, 1, { type: 'shardfall', use: false });
    expect(find(t, fen)).toBeUndefined();
    expect(t.players[1].crown.length).toBe(4);
  });
  it('a Shield stops one defeat', () => {
    const s = board();
    const a = put(s, 0, ['kael']);
    const d = put(s, 1, ['fen'], { shield: true });
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: a, target: d });
    expect(find(t, d)!.shield).toBe(false);
    expect(find(t, d)).toBeDefined();
  });
  it('Ambush: attacking a sideways champion strikes first, so it cannot strike back', () => {
    const s = board();
    s.active = 1;
    const fen2 = put(s, 1, ['fen', 'fen-2']); // 5/4 Ambush
    const solenne = put(s, 0, ['solenne'], { exhausted: true }); // 3/3
    let t = ok(s, 1, { type: 'toBattle' });
    t = ok(t, 1, { type: 'attack', uid: fen2, target: solenne });
    expect(find(t, solenne)).toBeUndefined();
    expect(find(t, fen2)).toBeDefined();
    const s2 = board();
    s2.active = 1;
    const f = put(s2, 1, ['fen', 'fen-2'], { mods: { might: 0, guard: -1 } }); // Guard 3
    const g = put(s2, 0, ['solenne']); // standing: no Ambush
    let t2 = ok(s2, 1, { type: 'toBattle' });
    t2 = ok(t2, 1, { type: 'attack', uid: f, target: g });
    expect(find(t2, f)).toBeUndefined();
  });
  it('a champion that just arrived cannot attack unless it has Charge', () => {
    const s = board();
    s.players[0].hand = ['kael', 'solenne'];
    let t = ok(s, 0, { type: 'deploy', handIndex: 0 });
    t = ok(t, 0, { type: 'deploy', handIndex: 0 });
    t = ok(t, 0, { type: 'toBattle' });
    const [kael, solenne] = t.players[0].field;
    expect(legalActions(t).some((a) => a.type === 'attack' && a.uid === kael.uid)).toBe(false);
    expect(legalActions(t).some((a) => a.type === 'attack' && a.uid === solenne.uid)).toBe(true);
  });
});

describe('Ascension', () => {
  it('needs the champion on the field since the turn began, costs Command, turns it sideways, once per turn', () => {
    const s = board();
    const k = put(s, 0, ['kael']);
    const sx = put(s, 0, ['solenne']);
    const fresh = put(s, 0, ['solenne'], { arrivedTurn: s.turn });
    expect(apply(s, 0, { type: 'ascend', uid: fresh }).error).toBe('It must have been on the field when your turn began.');
    let t = ok(s, 0, { type: 'ascend', uid: k });
    const kael = find(t, k)!;
    expect(kael.stack).toEqual(['kael', 'kael-2']);
    expect(kael.exhausted).toBe(true);
    expect(t.players[0].command).toBe(8); // Kael ★★ costs 0
    expect(t.players[0].ascension).not.toContain('kael-2');
    expect(apply(t, 0, { type: 'ascend', uid: sx }).error).toBe('You already Ascended this turn.');
  });
  it('a champion that already attacked can Ascend after battle', () => {
    const s = board();
    const k = put(s, 0, ['kael']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: k, target: 'crown' });
    while (t.pending?.kind === 'shardfall') t = ok(t, 1, { type: 'shardfall', use: false });
    expect(apply(t, 0, { type: 'ascend', uid: k }).error).toBe('Ascend during your Main step or after battle.');
    t = ok(t, 0, { type: 'endBattle' });
    t = ok(t, 0, { type: 'ascend', uid: k });
    expect(find(t, k)!.stack).toHaveLength(2);
  });
  it('Ascend effects resolve (Solenne ★★★ Scorches every rival champion)', () => {
    const s = board();
    const so = put(s, 0, ['solenne', 'solenne-2']);
    const g = put(s, 1, ['grizz']);
    const t = ok(s, 0, { type: 'ascend', uid: so });
    expect(guard(t, find(t, g)!)).toBe(2);
    expect(might(t, find(t, so)!)).toBe(10);
  });
});

describe('Schemes, Tactics and Shardfall', () => {
  it('a Scheme set this turn cannot be sprung until a later turn; Cinder Veil ends a Crown attack', () => {
    const s = board();
    s.players[1].schemes = [{ sid: 900, card: 'cinder-veil', setTurn: s.turn }];
    s.players[1].command = 3;
    const a = put(s, 0, ['kael', 'kael-2', 'kael-3']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: a, target: 'crown' });
    while (t.pending?.kind === 'shardfall') t = ok(t, 1, { type: 'shardfall', use: false });
    expect(t.players[1].crown.length).toBe(3); // set this turn: not springable
    const s2 = board();
    s2.players[1].schemes = [{ sid: 901, card: 'cinder-veil', setTurn: s2.turn - 1 }];
    s2.players[1].command = 3;
    const a2 = put(s2, 0, ['kael', 'kael-2', 'kael-3']);
    let t2 = ok(s2, 0, { type: 'toBattle' });
    t2 = ok(t2, 0, { type: 'attack', uid: a2, target: 'crown' });
    expect(t2.pending).toMatchObject({ kind: 'respond', player: 1 });
    t2 = ok(t2, 1, { type: 'respond', key: 's:901' });
    expect(t2.players[1].crown.length).toBe(5);
    expect(t2.players[1].command).toBe(2);
  });
  it('Hold the Gate readies a champion to block an unblocked attack', () => {
    const s = board();
    s.players[1].schemes = [{ sid: 902, card: 'hold-the-gate', setTurn: s.turn - 1 }];
    s.players[0].schemes = [];
    s.active = 1;
    s.players.reverse(); // P1 (index 0) defends with Banner cards
    for (const [i, p] of s.players.entries()) for (const c of p.field) c.owner = i as PlayerIndex;
    const att = put(s, 1, ['rowan']);
    const tired = put(s, 0, ['varr'], { exhausted: true });
    s.players[0].schemes = [{ sid: 903, card: 'hold-the-gate', setTurn: s.turn - 1 }];
    let t = ok(s, 1, { type: 'toBattle' });
    t = ok(t, 1, { type: 'attack', uid: att, target: 'crown' });
    t = ok(t, 0, { type: 'respond', key: 's:903' });
    expect(find(t, att)).toBeUndefined();
    expect(t.players[0].crown.length).toBe(5);
    expect(find(t, tired)!.exhausted).toBe(false); // Bulwark: blocking doesn't turn Varr sideways
  });
  it('Shardfall offers a free Scheme when that shard breaks', () => {
    const s = board();
    s.players[1].crown[s.players[1].crown.length - 1] = 'bloodscent';
    const a = put(s, 0, ['rowan']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: a, target: 'crown' });
    expect(t.pending).toEqual({ kind: 'shardfall', player: 1, card: 'bloodscent' });
    t = ok(t, 1, { type: 'shardfall', use: true });
    expect(t.players[1].schemes.map((x) => x.card)).toEqual(['bloodscent']);
    expect(t.players[1].hand).not.toContain('bloodscent');
  });
  it('choosing a target for an Arrival effect (Emberling Scorch 2)', () => {
    const s = board();
    s.active = 1;
    put(s, 0, ['kael']);
    put(s, 0, ['rowan']);
    s.players[1].hand = ['emberling'];
    let t = ok(s, 1, { type: 'deploy', handIndex: 0 });
    expect(t.pending?.kind).toBe('choose');
    const key = (t.pending as { options: { key: string }[] }).options[1].key;
    t = ok(t, 1, { type: 'choose', key });
    expect(guard(t, find(t, Number(key.slice(2)))!)).toBe(0);
  });
});

describe('turn limits and victory', () => {
  it('from round 10 each player breaks one of their own shards at the start of their turn', () => {
    const s = board();
    s.turn = 17; // round 9, P2's turn next = turn 18 (round 10)
    s.active = 0;
    const t = ok(s, 0, { type: 'endTurn' });
    expect(t.players[1].crown.length).toBe(4);
  });
  it('an empty deck breaks a shard instead of drawing', () => {
    const s = board();
    s.players[1].deck = [];
    const t = ok(s, 0, { type: 'endTurn' });
    expect(t.players[1].crown.length).toBe(4);
  });
  it('hand limit 8: discard down at end of turn', () => {
    const s = board();
    s.players[0].hand = Array.from({ length: 10 }, () => 'firebolt');
    s.players[0].deckId = 'banner';
    let t = ok(s, 0, { type: 'endTurn' });
    expect(t.pending).toEqual({ kind: 'discard', player: 0, count: 2 });
    t = ok(t, 0, { type: 'discard', handIndex: 0 });
    t = ok(t, 0, { type: 'discard', handIndex: 0 });
    expect(t.active).toBe(1);
  });
  it('the game ends the moment the last shard breaks', () => {
    const s = board();
    s.players[1].crown = ['firebolt'];
    const a = put(s, 0, ['rowan']);
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: a, target: 'crown' });
    expect(t.phase).toBe('over');
    expect(t.winner).toBe(0);
    expect(legalActions(t)).toEqual([]);
  });
});

describe('AI opponent', () => {
  it('plays 60 complete seeded games using only legal actions, conserving every card', () => {
    for (let k = 0; k < 60; k++) {
      const end = playOut(newGame({ seed: 300 + k, decks: k % 2 ? ['ember', 'banner'] : ['banner', 'ember'] }));
      expect(end.phase).toBe('over');
      expect(end.players.map(cardsInZones)).toEqual([38, 38]);
    }
  });
  it('always proposes a legal action', () => {
    let s = newGame({ seed: 77, decks: ['banner', 'ember'] });
    for (let i = 0; i < 400 && s.phase !== 'over'; i++) {
      const p = (s.pending ? s.pending.player : s.active) as PlayerIndex;
      const a = chooseAction(s, p);
      expect(legalActions(s)).toContainEqual(a);
      s = ok(s, p, a);
    }
  });
});
