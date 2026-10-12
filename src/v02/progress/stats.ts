// Lifetime statistics, achievement claim state and challenge progress for Sovereign's Hand.
// PROPOSED (2026-10-11): new progression system modelled on Crownfall's src/progression (achievements + challenges).
// Stored in localStorage beside the profile (same development stand-in for a server account as profile.ts).
//
// Everything that turns game events into numbers is pure (summarizeMatch, matchDelta, recordMatch, applyDelta) so it
// can be tested without a browser; the small store at the bottom is the only part that touches storage.
import { useSyncExternalStore } from 'react';
import { CARDS, isChampionCard } from '../content/cards';
import { SET1_PRINTINGS } from '../content/printings';
import type { Printing } from '../content/printings';
import { round } from '../rules/engine';
import type { GameState, PlayerIndex } from '../rules/types';
import { STARTER_DECK_IDS } from '../content/cards';
import { activeChallenges } from './challenges';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Lifetime counters. Metric strings elsewhere read these as "sum:<key>", "max:<key>" and "set:<key>". */
export interface Stats {
  sum: Record<string, number>;
  max: Record<string, number>;
  set: Record<string, string[]>;
  /** Running values needed for streaks. */
  cur: { winStreak: number; dayStreak: number; lastDay: string | null; dayMatches: number };
}

/** A change to the statistics: added to sums, compared with maxes, merged into sets. */
export interface Delta {
  sum?: Record<string, number>;
  max?: Record<string, number>;
  set?: Record<string, string[]>;
}

export interface MatchSummary {
  mode: 'ai' | 'campaign';
  won: boolean;
  /** Deck the player used (a starter id, "custom-…" for a saved deck, or a campaign deck id). */
  deckId: string;
  rounds: number;
  /** ★ card ids of every champion the player put on the field (one entry per champion; tokens excluded). */
  deployed: string[];
  /** Card ids of the player's champions that reached ★★★ this match. */
  awakened: string[];
  /** ★★ Ascensions (★ → ★★). */
  ascensions: number;
  /** ★★★ Awakenings (★★ → ★★★). */
  awakenings: number;
  /** Rival shards broken by the player's attacks (crown damage). */
  shardsBroken: number;
  /** The player's shards broken by the rival's attacks. */
  shardsLost: number;
  /** The player's shards still whole at the end. */
  shardsLeft: number;
  /** Rival champions defeated. */
  defeats: number;
  relics: number;
  tactics: number;
  schemesSet: number;
  schemesSprung: number;
  edicts: number;
  tokens: number;
}

// ─── Reading a finished match ────────────────────────────────────────────────

/** Champions seen on the player's field during a match, by uid: their ★ card and the highest form reached. */
export type FieldTracker = Record<number, { base: string; top: string; token: boolean }>;

/** Call after every state change during a match. Pure: returns a new tracker when something new appears. */
export function trackField(tr: FieldTracker, s: GameState, me: PlayerIndex = 0): FieldTracker {
  let next = tr;
  for (const c of s.players[me].field) {
    const top = c.stack[c.stack.length - 1];
    const old = next[c.uid];
    if (!old || (old.top !== top && starOf(top) > starOf(old.top))) {
      if (next === tr) next = { ...tr };
      next[c.uid] = { base: old?.base ?? c.stack[0], top, token: !!c.token };
    }
  }
  return next;
}
const starOf = (id: string) => { const c = CARDS[id]; return c && isChampionCard(c) ? c.star : 0; };

const DEFEAT = / is defeated \(.*\) and (vanishes|goes to the Fallen pile)/;

/** Build the match summary from the final state, its log and the field tracker (engine behaviour untouched). */
export function summarizeMatch(s: GameState, tr: FieldTracker, opts: { me?: PlayerIndex; won: boolean; deckId: string; mode: 'ai' | 'campaign' }): MatchSummary {
  const me = opts.me ?? 0;
  const them: PlayerIndex = me === 0 ? 1 : 0;
  const mine = s.log.filter((e) => e.player === me);
  const count = (kind: string, re: RegExp) => mine.filter((e) => e.kind === kind && re.test(e.text)).length;
  let ascensions = 0, awakenings = 0;
  for (const e of mine) {
    if (e.kind !== 'ascend') continue;
    const st = /to (★+)/.exec(e.text)?.[1].length ?? 2;
    if (st >= 3) awakenings++; else ascensions++;
  }
  const seen = Object.values(tr);
  return {
    mode: opts.mode,
    won: opts.won,
    deckId: opts.deckId,
    rounds: round(s),
    deployed: seen.filter((x) => !x.token).map((x) => x.base),
    awakened: seen.filter((x) => !x.token && starOf(x.top) >= 3).map((x) => x.top),
    ascensions,
    awakenings,
    shardsBroken: s.stats.shardsBroken[me],
    shardsLost: s.stats.shardsBroken[them],
    shardsLeft: s.players[me].crown.length,
    defeats: s.log.filter((e) => e.player === them && e.kind === 'effect' && DEFEAT.test(e.text)).length,
    relics: count('play', / attaches /),
    tactics: count('play', / casts /) + count('scheme', /\(Swift\)/),
    schemesSet: count('play', / sets a Scheme/),
    schemesSprung: s.stats.schemes[me],
    edicts: count('scheme', /proclaims an Edict/),
    tokens: seen.filter((x) => x.token).length,
  };
}

// ─── Turning events into statistics ──────────────────────────────────────────

export const emptyStats = (): Stats => ({ sum: {}, max: {}, set: {}, cur: { winStreak: 0, dayStreak: 0, lastDay: null, dayMatches: 0 } });

const lineOf = (cardId: string) => { const c = CARDS[cardId]; return c && isChampionCard(c) ? c : null; };
const isStarter = (deckId: string) => STARTER_DECK_IDS.includes(deckId);

/** The day before a local date key (YYYY-MM-DD). */
export function prevDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(y, m - 1, d - 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** Everything one match adds to the statistics (streaks need the current stats and the local day). */
export function matchDelta(m: MatchSummary, stats: Stats = emptyStats(), day = '2000-01-01'): Delta {
  const sum: Record<string, number> = {}, max: Record<string, number> = {}, set: Record<string, string[]> = {};
  const add = (k: string, n = 1) => { if (n) sum[k] = (sum[k] ?? 0) + n; };
  const best = (k: string, n: number) => { max[k] = Math.max(max[k] ?? 0, n); };
  const put = (k: string, ...v: string[]) => { set[k] = [...new Set([...(set[k] ?? []), ...v])]; };

  add('matches'); add(`matches_${m.mode}`);
  if (m.won) {
    add('wins'); add(`wins_${m.mode}`);
    put('decks_won', m.deckId);
    if (isStarter(m.deckId)) put('starters_won', m.deckId);
    if (m.deckId.startsWith('custom-')) add('wins_custom');
    if (m.shardsLost === 0) add('flawless_wins');
    if (m.shardsLeft === 1) add('last_shard_wins');
    if (m.rounds <= 6) add('swift_wins');
    if (m.rounds <= 4) add('blitz_wins');
    if (m.rounds >= 10) add('long_wins');
    if (m.ascensions + m.awakenings === 0) add('humble_wins');
  } else add('losses');
  if (isStarter(m.deckId)) put('starters_played', m.deckId);

  // Champions, Origins and Classes.
  add('deploys', m.deployed.length);
  for (const id of m.deployed) {
    const c = lineOf(id);
    if (!c) continue;
    if (c.family === 'champion') {
      put('champions_played', c.canonId);
      if (m.won) { put('champions_won', c.canonId); add(`wins_with.${c.canonId}`); }
    }
    if (c.line.tier === 5) add('tier5_deploys');
    for (const o of c.line.origins) { add(`origin.${o}`); put('origins_played', o); }
    for (const k of c.line.classes) { add(`class.${k}`); put('classes_played', k); }
  }
  // wins_with counts once per match per champion, even with two copies on the field.
  if (m.won) for (const k of Object.keys(sum)) if (k.startsWith('wins_with.')) sum[k] = 1;

  // Ascension (★★) and Awakening (★★★).
  add('ascensions', m.ascensions);
  add('awakenings', m.awakenings);
  best('ascend_one_match', m.ascensions + m.awakenings);
  best('awaken_one_match', m.awakenings);
  for (const id of m.awakened) {
    const c = lineOf(id);
    if (!c) continue;
    put('awakened', c.canonId);
    add(`awaken.${c.canonId}`);
    if (c.line.tier === 5) add('legend_awakenings');
  }

  // Combat.
  add('shards_broken', m.shardsBroken);
  add('defeats', m.defeats);
  best('defeats_one_match', m.defeats);
  add('relics', m.relics);
  best('relics_one_match', m.relics);
  add('tactics', m.tactics);
  add('schemes_set', m.schemesSet);
  add('schemes_sprung', m.schemesSprung);
  best('schemes_one_match', m.schemesSprung);
  add('edicts', m.edicts);
  add('tokens', m.tokens);

  // Streaks.
  const win = m.won ? stats.cur.winStreak + 1 : 0;
  best('win_streak', win);
  const dayStreak = stats.cur.lastDay === day ? stats.cur.dayStreak : stats.cur.lastDay === prevDay(day) ? stats.cur.dayStreak + 1 : 1;
  best('day_streak', dayStreak);
  best('matches_one_day', stats.cur.lastDay === day ? stats.cur.dayMatches + 1 : 1);
  return { sum, max, set };
}

/** Apply a delta to the statistics. Pure. */
export function applyDelta(stats: Stats, d: Delta): Stats {
  const sum = { ...stats.sum }, max = { ...stats.max }, set = { ...stats.set };
  for (const [k, n] of Object.entries(d.sum ?? {})) sum[k] = (sum[k] ?? 0) + n;
  for (const [k, n] of Object.entries(d.max ?? {})) max[k] = Math.max(max[k] ?? 0, n);
  for (const [k, v] of Object.entries(d.set ?? {})) set[k] = [...new Set([...(set[k] ?? []), ...v])];
  return { ...stats, sum, max, set };
}

/** Record one finished match. Pure: returns the new statistics and the delta (challenges use the delta). */
export function recordMatch(stats: Stats, m: MatchSummary, day: string): { stats: Stats; delta: Delta } {
  const delta = matchDelta(m, stats, day);
  const next = applyDelta(stats, delta);
  const sameDay = stats.cur.lastDay === day;
  next.cur = {
    winStreak: m.won ? stats.cur.winStreak + 1 : 0,
    dayStreak: sameDay ? stats.cur.dayStreak : stats.cur.lastDay === prevDay(day) ? stats.cur.dayStreak + 1 : 1,
    lastDay: day,
    dayMatches: sameDay ? stats.cur.dayMatches + 1 : 1,
  };
  return { stats: next, delta };
}

// ─── Economy events ──────────────────────────────────────────────────────────

const PRINT: Record<string, Printing> = Object.fromEntries(SET1_PRINTINGS.map((p) => [p.id, p]));

/** Packs opened (pulls as returned by the pack opener). */
export function packDelta(pulls: { printing: string; finish: string }[][], currency: 'valor' | 'starstones', valorCost: number): Delta {
  const sum: Record<string, number> = { packs_opened: pulls.length };
  const inc = (k: string) => { sum[k] = (sum[k] ?? 0) + 1; };
  for (const pk of pulls) for (const c of pk) {
    const p = PRINT[c.printing];
    if (c.finish !== 'normal' && p?.kind === 'base') inc('foils_pulled');
    if (c.finish !== 'normal') inc(`pulled.${c.finish}`);
    if (p?.kind === 'alt') inc('alts_pulled');
    if (p?.kind === 'masterwork') inc('masterworks_pulled');
    if (p?.kind === 'omega') inc('omegas_pulled');
    if (p?.kind === 'base' && p.rarity === 'mythic') inc('mythics_pulled');
  }
  if (currency === 'valor') sum.valor_spent = valorCost;
  return { sum, max: { bundle_size: pulls.length } };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export interface ChallengeState {
  /** Progress per active challenge instance ("<challenge id>@<period>"). */
  progress: Record<string, number>;
  /** Distinct values for "set:" challenges, per instance. */
  sets: Record<string, string[]>;
  claimed: Record<string, true>;
  /** Rerolled instances: old instance -> replacement challenge id. */
  swaps: Record<string, string>;
  /** Local day of the last reroll (one reroll per day). */
  rerollDay: string | null;
  /** Champion Challenges: tiers claimed per challenge id. */
  champClaimed: Record<string, number>;
}

export interface ProgressState {
  v: 1;
  stats: Stats;
  /** Achievement id -> tiers claimed. */
  claimed: Record<string, number>;
  /** Achievement id -> tiers already announced with a toast. */
  seen: Record<string, number>;
  /** False until the first check, which marks existing unlocks as seen without a burst of toasts. */
  seenInit: boolean;
  ch: ChallengeState;
}

const KEY = 'sovereigns-hand-progress-v1';
export const freshProgress = (): ProgressState => ({
  v: 1, stats: emptyStats(), claimed: {}, seen: {}, seenInit: false,
  ch: { progress: {}, sets: {}, claimed: {}, swaps: {}, rerollDay: null, champClaimed: {} },
});

let current: ProgressState = load();
const listeners = new Set<() => void>();
function load(): ProgressState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) {
      const p = JSON.parse(raw) as Partial<ProgressState>;
      const f = freshProgress();
      return { ...f, ...p, stats: { ...f.stats, ...p.stats, cur: { ...f.stats.cur, ...p.stats?.cur } }, ch: { ...f.ch, ...p.ch } };
    }
  } catch { /* private mode or blocked storage: start fresh */ }
  return freshProgress();
}
export function saveProgress(next: ProgressState) {
  current = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach((l) => l());
}
export const getProgress = () => current;
export function useProgress(): ProgressState {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => current, () => current);
}
/** Test helper: replace the in-memory state without touching storage listeners' semantics. */
export function resetProgress(p: ProgressState = freshProgress()) { saveProgress(p); }

const pad = (n: number) => String(n).padStart(2, '0');
export const localDay = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Add a delta to the statistics AND to every challenge active right now. Pure. */
export function withDelta(p: ProgressState, d: Delta, now: Date): ProgressState {
  const stats = applyDelta(p.stats, d);
  const active = activeChallenges(now, p.ch.swaps);
  const progress: Record<string, number> = {}, sets: Record<string, string[]> = {};
  for (const a of active) {
    const [kind, key] = a.def.metric.split(':') as ['sum' | 'max' | 'set', string];
    const was = p.ch.progress[a.instance] ?? 0;
    if (kind === 'sum') progress[a.instance] = was + (d.sum?.[key] ?? 0);
    else if (kind === 'max') progress[a.instance] = Math.max(was, d.max?.[key] ?? 0);
    else {
      const v = [...new Set([...(p.ch.sets[a.instance] ?? []), ...(d.set?.[key] ?? [])])];
      sets[a.instance] = v;
      progress[a.instance] = v.length;
    }
  }
  // Instances from past periods are dropped here, so storage never grows.
  const keep = new Set(active.map((a) => a.instance));
  const claimed = Object.fromEntries(Object.entries(p.ch.claimed).filter(([k]) => keep.has(k))) as Record<string, true>;
  const swaps = Object.fromEntries(Object.entries(p.ch.swaps).filter(([k]) => { const period = k.split('@')[1]; return active.some((a) => a.period === period); }));
  return { ...p, stats, ch: { ...p.ch, progress, sets, claimed, swaps } };
}

/** Record any event (economy hooks). Never throws: progress must not break the game. */
export function record(d: Delta, now: Date = new Date()) {
  try { saveProgress(withDelta(current, d, now)); } catch { /* ignore */ }
}

const recordedSeeds = new Set<number>();
/** Record a finished match once (the seed identifies it; guards against repeated renders). */
export function commitMatch(seed: number, m: MatchSummary, now: Date = new Date()) {
  if (recordedSeeds.has(seed)) return;
  recordedSeeds.add(seed);
  try {
    const { stats, delta } = recordMatch(current.stats, m, localDay(now));
    const next = withDelta(current, delta, now);
    saveProgress({ ...next, stats: { ...next.stats, cur: stats.cur } });
  } catch { /* ignore */ }
}
