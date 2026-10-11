import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARDS, isEdictCard, isSpellCard } from '../../src/v02/content/cards';
import { apply, ascendCost as ascendCostOf, guard as guardOf, might as mightOf, newGame, responseOptions } from '../../src/v02/rules/engine';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../../src/v02/rules/types';

// Every Set 1 Tactic, Swift Tactic, Scheme and Edict is played in a real game state and must change it.
// Card ids come from the generated master list, so a card added to Set 1 is tested automatically.

const csv = readFileSync('prototype-v0.2/master-card-list-set1.csv', 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean);
const rows = csv.map((l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g)!.map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')));
const SPELL_TYPES = new Set(['Tactic', 'Swift Tactic', 'Scheme', 'Edict']);
const IDS = rows.filter((r) => SPELL_TYPES.has(r[5])).map((r) => ({ no: r[0], id: r[1], type: r[5] }));

function ok(s: GameState, p: PlayerIndex, a: Action): GameState {
  const r = apply(s, p, a);
  if (r.error) throw new Error(`${JSON.stringify(a)} rejected: ${r.error}`);
  return r.state;
}
/** Answer every open question: take the first real option, decline optional extras that would stall. */
function settle(s: GameState, guard = 0): GameState {
  while (s.pending && s.pending.kind !== 'mulligan' && guard++ < 60) {
    const p = s.pending;
    if (p.kind === 'choose') s = ok(s, p.player, { type: 'choose', key: p.options[0]?.key ?? null });
    else if (p.kind === 'respond') s = ok(s, p.player, { type: 'respond', key: null });
    else if (p.kind === 'shardfall') s = ok(s, p.player, { type: 'shardfall', use: false });
    else if (p.kind === 'discard') s = ok(s, p.player, { type: 'discard', handIndex: 0 });
    else if (p.kind === 'block') s = ok(s, p.player, { type: 'block', uid: null });
  }
  return s;
}
function put(s: GameState, p: PlayerIndex, stack: string[], opts: Partial<ChampionInPlay> = {}): number {
  const uid = s.nextUid++;
  s.players[p].field.push({ uid, owner: p, stack, exhausted: false, arrivedTurn: -1, ascendedTurn: -1, shield: false,
    mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, relic: null, token: false, ...opts });
  return uid;
}
/** A busy mid-game board on player 0's main step: champions both sides, cards in hand and Fallen, full Command. */
function board(lead: 'behind' | 'ahead'): GameState {
  let s = newGame({ seed: 7, decks: ['banner', 'ember'], first: 0 });
  s = ok(s, 0, { type: 'mulligan', redraw: false });
  s = ok(s, 1, { type: 'mulligan', redraw: false });
  s = ok(s, 0, { type: 'endTurn' });
  s = settle(ok(settle(s), 1, { type: 'endTurn' }));
  for (const pl of s.players) { pl.hand = []; pl.field = []; pl.schemes = []; pl.fallen = []; pl.command = 8; pl.commandMax = 8; }
  put(s, 0, ['bramble']);                 // ★ that can Ascend (bramble-2 in the Ascension Pile below)
  put(s, 0, ['aurelia', 'aurelia-2'], { exhausted: true });
  put(s, 1, ['grimm']);
  put(s, 1, ['pip', 'pip-2']);
  s.players[0].ascension = ['bramble-2', 'bramble-3', ...s.players[0].ascension];
  s.players[0].fallen = ['fen', 'kira'];  // something to return or redeploy
  s.players[0].hand = ['pip'];              // something cheap to deploy for free
  const [mine, theirs] = lead === 'behind' ? [3, 5] : [5, 3];
  s.players[0].crown = s.players[0].crown.slice(0, mine);
  s.players[1].crown = s.players[1].crown.slice(0, theirs);
  return s;
}
const snapshot = (s: GameState) => JSON.stringify({
  players: s.players.map((p) => ({ field: p.field.map((c) => [c.stack, c.exhausted, c.shield, c.mods, c.relic, c.noAttack, c.token]),
    hand: p.hand.length, crown: p.crown.length, command: p.command, fallen: p.fallen, deck: p.deck.length, extra: p.extraZones, schemes: p.schemes.length })),
  edict: s.edict, turnMods: (s as unknown as { turnBuffs?: unknown }).turnBuffs,
});

/** Cast, set or proclaim the card on player 0's turn and return the state before (minus the card) and after. */
function playFromHand(id: string, lead: 'behind' | 'ahead') {
  const s = board(lead);
  s.players[0].hand.push(id);
  const handIndex = s.players[0].hand.length - 1;
  const c = CARDS[id];
  const before = snapshot({ ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, hand: p.hand.slice(0, -1) } : p)) } as GameState);
  const type = isEdictCard(c) ? 'playEdict' : isSpellCard(c) && c.kind === 'scheme' ? 'setScheme' : 'cast';
  const after = settle(ok(s, 0, { type, handIndex } as Action));
  return { s, after, before };
}

/** Set the Scheme on an earlier turn, then have the rival attack so its trigger happens; spring it. */
function springScheme(id: string, lead: 'behind' | 'ahead') {
  const d = CARDS[id];
  if (!isSpellCard(d) || d.kind !== 'scheme') throw new Error('not a scheme');
  let s = board(lead);
  s.players[0].schemes = [{ sid: 9001, card: id, setTurn: s.turn - 1 }];
  s = settle(ok(s, 0, { type: 'endTurn' }));
  for (const c of s.players[1].field) { c.exhausted = false; c.arrivedTurn = -1; }
  const att = s.players[1].field[0];
  const target = d.when === 'clash' ? s.players[0].field[0].uid : 'crown';
  s = ok(s, 1, { type: 'toBattle' });
  s = ok(s, 1, { type: 'attack', uid: att.uid, target });
  // Keep the block decision out of the way: no block, unless the trigger is a clash (target already a champion).
  let guard = 0;
  while (s.pending && guard++ < 10) {
    const p = s.pending;
    if (p.kind === 'block') { s = ok(s, p.player, { type: 'block', uid: null }); continue; }
    if (p.kind === 'respond' && p.player === 0) break;
    s = settle(s);
    break;
  }
  const offered = s.pending?.kind === 'respond' && s.pending.player === 0 ? s.pending.options.map((o) => o.key) : responseOptions(s, 0).map((o) => o.key);
  const before = snapshot(s);
  if (!offered.includes('s:9001')) return { offered: false, changed: false, error: null as string | null };
  const r = apply(s, 0, { type: 'respond', key: 's:9001' });
  if (r.error) return { offered: true, changed: false, error: r.error };
  const after = settle(r.state);
  return { offered: true, changed: snapshot(after) !== before, error: null };
}

describe('Every Set 1 Tactic, Swift Tactic, Scheme and Edict', () => {
  it('finds all 83 Set 1 non-champion cards in the card data', () => {
    expect(IDS).toHaveLength(83);
    for (const { no, id } of IDS) expect(CARDS[id], `${no} ${id}`).toBeDefined();
  });

  for (const { no, id, type } of IDS) {
    it(`${no} ${CARDS[id]?.name ?? id} (${type}) can be played and does something`, () => {
      const c = CARDS[id];
      if (type === 'Scheme') {
        const runs = [springScheme(id, 'behind'), springScheme(id, 'ahead')];
        expect(runs.find((r) => r.error)?.error ?? null).toBeNull();
        expect(runs.some((r) => r.offered), 'the Scheme is offered when its trigger happens').toBe(true);
        expect(runs.some((r) => r.changed), 'springing it changes the game').toBe(true);
        return;
      }
      const runs = (['behind', 'ahead'] as const).map((lead) => playFromHand(id, lead));
      for (const { after } of runs) {
        expect(after.players[0].hand.includes(id) && !(isSpellCard(c) && c.text.includes('hand')), 'the card left your hand').toBe(false);
        expect(after.log.some((l) => l.text.includes(c.name)), 'the battle log names it').toBe(true);
      }
      expect(runs.some(({ before, after }) => snapshot(after) !== before), 'it changes the game in at least one board state').toBe(true);
      if (isEdictCard(c)) for (const { after } of runs) expect(after.edict?.card).toBe(id);
    });
  }

  it('every Swift Tactic can be cast in a response window during a fight', () => {
    for (const { id, type } of IDS.filter((x) => x.type === 'Swift Tactic')) {
      let s = board('behind');
      s.players[0].hand.push(id);
      const me = s.players[0].field[0];
      s = ok(s, 0, { type: 'toBattle' });
      s = ok(s, 0, { type: 'attack', uid: me.uid, target: s.players[1].field[0].uid });
      let guard = 0;
      while (s.pending && !(s.pending.kind === 'respond' && s.pending.player === 0) && guard++ < 10) {
        const p = s.pending;
        s = ok(s, p.player, p.kind === 'respond' ? { type: 'respond', key: null } : p.kind === 'block' ? { type: 'block', uid: null } : { type: 'choose', key: null });
      }
      const key = `h:${s.players[0].hand.indexOf(id)}`;
      expect(s.pending?.kind === 'respond' && s.pending.options.some((o) => o.key === key), `${type} ${id} offered`).toBe(true);
      expect(apply(s, 0, { type: 'respond', key }).error).toBeNull();
    }
  });
});

describe('Set 1 cards do exactly what their text says (one card per kind of effect)', () => {
  const cast = (id: string, lead: 'behind' | 'ahead' = 'behind') => {
    const s = board(lead);
    s.players[0].hand.push(id);
    const type = isEdictCard(CARDS[id]) ? 'playEdict' : 'cast';
    return { s, t: settle(ok(s, 0, { type, handIndex: s.players[0].hand.length - 1 } as Action)) };
  };
  const g = (s: GameState, p: PlayerIndex, i: number) => guardOf(s, s.players[p].field[i]);
  const m = (s: GameState, p: PlayerIndex, i: number) => mightOf(s, s.players[p].field[i]);

  it('Firebolt: Scorch 2 a rival champion', () => {
    const { s, t } = cast('firebolt');
    expect(g(t, 1, 0)).toBe(g(s, 1, 0) - 2);
  });
  it('Wildfire: Scorch 1 each rival champion, draw a card', () => {
    const { s, t } = cast('firestorm');
    expect([g(t, 1, 0), g(t, 1, 1)]).toEqual([g(s, 1, 0) - 1, g(s, 1, 1) - 1]);
    expect(t.players[0].hand.length).toBe(s.players[0].hand.length - 1 + 1);
  });
  it('Wildkin Pact: +1 Might, or +2 when behind', () => {
    const behind = cast('feral-howl', 'behind'), ahead = cast('feral-howl', 'ahead');
    expect(m(behind.t, 0, 0) - m(behind.s, 0, 0)).toBe(2);
    expect(m(ahead.t, 0, 0) - m(ahead.s, 0, 0)).toBe(1);
  });
  it('Royal Dispatch: draw 2 cards; Windfall: gain 4 Command (Command spent first)', () => {
    const d = cast('royal-dispatch');
    expect(d.t.players[0].hand.length).toBe(d.s.players[0].hand.length - 1 + 2);
    const w = cast('windfall');
    expect(w.t.players[0].command).toBe(8 - 1 + 4); // Windfall costs 1; gained Command is not capped
  });
  it('Executioner\'s Oath: defeat each rival champion with Guard 1 or less', () => {
    const s = board('behind');
    s.players[1].field[0].mods.guard = -s.players[1].field[0].mods.guard - guardOf(s, s.players[1].field[0]) + 1; // Guard exactly 1
    s.players[0].hand.push('executioner');
    const t = settle(ok(s, 0, { type: 'cast', handIndex: s.players[0].hand.length - 1 }));
    expect(t.players[1].field).toHaveLength(1);
  });
  it('Crown Dummy summons one token; Living Arena summons two Treants', () => {
    expect(cast('training_dummy').t.players[0].field.filter((c) => c.token)).toHaveLength(1);
    expect(cast('living_arena').t.players[0].field.filter((c) => c.token)).toHaveLength(2);
  });
  it('Prodigy\'s Path gives one more Champion Zone; Unmaking Pact breaks two of your shards and gives two', () => {
    expect(cast('prodigy_path').t.players[0].extraZones).toBe(1);
    const u = cast('unmaking_pact', 'ahead');
    expect(u.t.players[0].extraZones).toBe(2);
    expect(u.t.players[0].crown.length).toBe(u.s.players[0].crown.length - 2);
  });
  it('Crown\'s Favor: Mend 1 adds a shard', () => {
    const { s, t } = cast('crowns_favor');
    expect(t.players[0].crown.length).toBe(s.players[0].crown.length + 1);
  });
  it('Ascension Rite Ascends a ★ champion to ★★ for free', () => {
    const { t } = cast('ascension_rite');
    expect(t.players[0].field.some((c) => c.stack.join() === 'bramble,bramble-2')).toBe(true);
  });
  it('Forge Master\'s Favor returns a ★ champion from the Fallen pile to hand', () => {
    const { t } = cast('forge_masters_favor');
    expect(t.players[0].hand.filter((id) => id === 'fen' || id === 'kira')).toHaveLength(1);
    expect(t.players[0].fallen).toContain('forge_masters_favor');
  });
  it('Edicts: Crown\'s Bounty adds 1 Command each turn; Scholar\'s Ascent makes Ascending 1 cheaper', () => {
    let { t } = cast('edict-crowns_bounty');
    t = settle(ok(t, 0, { type: 'endTurn' }));
    expect(t.players[1].command).toBe(t.players[1].commandMax + 1);
    const sa = cast('edict-scholars_ascent').t;
    expect(ascendCostOf(sa, CARDS['bramble-2'] as never)).toBe(Math.max(0, (CARDS['bramble-2'] as { cost: number }).cost - 1));
  });
});
