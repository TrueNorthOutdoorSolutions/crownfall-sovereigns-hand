import { describe, expect, it } from 'vitest';
import { ALL_LINES, DECKS } from '../../src/v02/content/cards';
import type { DeckDef } from '../../src/v02/content/cards';
import { apply, cardsInZones, guard, might, newGame } from '../../src/v02/rules/engine';
import { playOut } from '../../src/v02/ai/bot';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../../src/v02/rules/types';

function ok(s: GameState, p: PlayerIndex, a: Action): GameState {
  const r = apply(s, p, a);
  if (r.error) throw new Error(`${JSON.stringify(a)} rejected: ${r.error}`);
  return r.state;
}
function board(): GameState {
  let s = newGame({ seed: 42, decks: ['banner', 'ember'], first: 0 });
  s = ok(s, 0, { type: 'mulligan', redraw: false });
  s = ok(s, 1, { type: 'mulligan', redraw: false });
  s = ok(s, 0, { type: 'endTurn' });
  s = ok(s, 1, { type: 'endTurn' });
  for (const pl of s.players) { pl.hand = []; pl.field = []; pl.schemes = []; pl.fallen = []; pl.command = 8; pl.commandMax = 8; pl.ascension = []; }
  return s;
}
function put(s: GameState, p: PlayerIndex, stack: string[], opts: Partial<ChampionInPlay> = {}): number {
  const uid = s.nextUid++;
  s.players[p].field.push({ uid, owner: p, stack, exhausted: false, arrivedTurn: -1, ascendedTurn: -1, shield: false,
    mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, ...opts });
  return uid;
}
const find = (s: GameState, uid: number) => s.players.flatMap((p) => p.field).find((c) => c.uid === uid)!;

describe('Set 1 effects', () => {
  it('"Shield <self>" shields the champion itself (Bolt arrival)', () => {
    const s = board();
    s.players[0].hand = ['bolt'];
    const t = ok(s, 0, { type: 'deploy', handIndex: 0 });
    expect(t.players[0].field[0].shield).toBe(true);
  });
  it('"A rival champion gets −N Might" lowers a chosen rival champion (Hexie arrival)', () => {
    const s = board();
    const g = put(s, 1, ['grizz']);
    s.players[0].hand = ['hexie'];
    const t = ok(s, 0, { type: 'deploy', handIndex: 0 });
    expect(might(t, find(t, g))).toBe(2);
  });
  it('"Attack: The defender gets −N Might" also hits a blocker (Knuckle)', () => {
    const s = board();
    const k = put(s, 0, ['knuckle']); // 5/5, defender −2 Might
    const g = put(s, 1, ['grizz']); // blocks with 4+2 = 6 Might
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: k, target: 'crown' });
    t = ok(t, 1, { type: 'block', uid: g });
    while (t.pending?.kind === 'respond' || t.pending?.kind === 'shardfall') t = ok(t, t.pending.player, t.pending.kind === 'respond' ? { type: 'respond', key: null } : { type: 'shardfall', use: false });
    // Grizz Might 6 − 2 = 4 < Knuckle Guard 5: Knuckle survives; Knuckle 5 ≥ Grizz Guard 4: Grizz falls, Breakthrough.
    expect(t.players[0].field.some((c) => c.uid === k)).toBe(true);
    expect(t.players[1].field.some((c) => c.uid === g)).toBe(false);
    expect(t.players[1].crown.length).toBe(4);
  });
  it('"Deploy … from your Fallen pile" raises a fallen champion (Morrow ★★)', () => {
    const s = board();
    const m = put(s, 0, ['morrow']);
    s.players[0].ascension = ['morrow-2', 'morrow-3'];
    s.players[0].fallen = ['rowan', 'sol'];
    const t = ok(s, 0, { type: 'ascend', uid: m });
    expect(t.players[0].field.map((c) => c.stack[0])).toContain('rowan');
    expect(t.players[0].fallen).toEqual(['sol']); // Sol costs 6: not eligible
  });
  it('"Ready another champion you control" (Lady Volt ★★★)', () => {
    const s = board();
    const lv = put(s, 0, ['ladyvolt', 'ladyvolt-2']);
    const tired = put(s, 0, ['kael'], { exhausted: true });
    s.players[0].ascension = ['ladyvolt-3'];
    const t = ok(s, 0, { type: 'ascend', uid: lv });
    expect(find(t, tired).exhausted).toBe(false);
    expect(find(t, lv).exhausted).toBe(true);
  });
  it('Crownless breaks the rule: Ascending does not turn it sideways', () => {
    const s = board();
    const c = put(s, 0, ['crownless']);
    s.players[0].ascension = ['crownless-2', 'crownless-3'];
    const t = ok(s, 0, { type: 'ascend', uid: c });
    expect(find(t, c).exhausted).toBe(false);
    expect(find(t, c).stack).toEqual(['crownless', 'crownless-2']);
  });
  it('Dreadmouth shields itself after defeating a champion on your turn', () => {
    const s = board();
    const d = put(s, 0, ['dreadmouth']); // 5/4
    const f = put(s, 1, ['fen']); // 2/1
    let t = ok(s, 0, { type: 'toBattle' });
    t = ok(t, 0, { type: 'attack', uid: d, target: f });
    expect(find(t, d).shield).toBe(true);
    expect(guard(t, find(t, d))).toBe(4);
  });
});

describe('every Set 1 card is playable by the engine and AI', () => {
  // Build test decks that cycle through all 55 champion lines, each with its ★★ and ★★★ forms in the Ascension Pile.
  const lines = ALL_LINES.filter((l) => (l.set ?? 1) === 1 && (l.family ?? 'champion') === 'champion').map((l) => l.canonId);
  const decks: DeckDef[] = [];
  for (let i = 0; i < lines.length; i += 4) {
    const group = lines.slice(i, i + 4);
    while (group.length < 4) group.push(lines[group.length]);
    const fill = lines.filter((x) => !group.includes(x)).slice((i * 7) % 40, ((i * 7) % 40) + 11);
    const main: [string, number][] = [...group.map((id) => [id, 2] as [string, number]), ...fill.map((id) => [id, 2] as [string, number])].slice(0, 15);
    decks.push({ name: `Test ${i / 4 + 1}`, origins: '', color: '#888', accent: '#ccc', pitch: '', main, ascension: group.flatMap((id) => [`${id}-2`, `${id}-3`]) });
  }
  it('covers all 165 champion cards', () => {
    const used = new Set(decks.flatMap((d) => [...d.main.map(([id]) => id), ...d.ascension]));
    expect(used.size).toBe(165);
  });
  it('plays complete AI games with every test deck, conserving every card', () => {
    const reg = DECKS as unknown as Record<string, DeckDef>;
    decks.forEach((d, i) => { reg[`test${i}`] = d; });
    try {
      for (let i = 0; i < decks.length; i++) {
        for (let k = 0; k < 6; k++) {
          const a = `test${i}`, b = `test${(i + 1 + k) % decks.length}`;
          const end = playOut(newGame({ seed: 9000 + i * 10 + k, decks: [a, b] as never }));
          expect(end.phase).toBe('over');
          expect(end.players.map(cardsInZones)).toEqual([38, 38]);
        }
      }
    } finally {
      decks.forEach((_, i) => { delete reg[`test${i}`]; });
    }
  });
});
