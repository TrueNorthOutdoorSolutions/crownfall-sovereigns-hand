// CHALLENGES — objectives with a reset period, modelled on Crownfall's src/progression/challenges.ts.
// PROPOSED (2026-10-11): pools, targets and Valor rewards are new and await the owner's approval.
//
//   daily     3 active, reset at local midnight, doable in 1–3 matches
//   weekly    3 active, reset Monday (local), ask for different ways to play
//   champion  permanent, tiered: one pair per Tier V legend (the Crowning legends)
//
// The rotation depends on the local date alone (plus the player's own rerolls), so the same day always shows the same
// set. Progress comes from the statistics deltas recorded in stats.ts. No challenge costs Valor or Starstones to
// complete, and no challenge asks a player to lose. Rewards are Valor only.
import { CARDS } from '../content/cards';
import { describe } from './achievements';
import type { Stats } from './stats';

export type ChallengeCategory = 'daily' | 'weekly';

export interface ChallengeDef {
  id: string;
  category: ChallengeCategory;
  name: string;
  /** "{n}" is replaced with the target. */
  desc: string;
  /** Statistics key: "sum:<key>" adds across events, "max:<key>" is the best single event, "set:<key>" counts distinct values. */
  metric: string;
  target: number;
  valor: number;
}

const ch = (id: string, category: ChallengeCategory, name: string, desc: string, metric: string, target: number, valor: number): ChallengeDef =>
  ({ id: `ch_${id}`, category, name, desc, metric, target, valor });

export const DAILY_POOL: ChallengeDef[] = [
  ch('d_play', 'daily', 'Into the Arena', 'Play {n} matches.', 'sum:matches', 2, 40),
  ch('d_win', 'daily', 'Daily Victory', 'Win {n} match.', 'sum:wins', 1, 50),
  ch('d_deploy', 'daily', 'Call the Banners', 'Deploy {n} champions.', 'sum:deploys', 8, 40),
  ch('d_ascend', 'daily', 'Rising Star', 'Ascend champions to ★★ {n} times.', 'sum:ascensions', 3, 45),
  ch('d_awaken', 'daily', 'Awakening', 'Awaken a champion to ★★★.', 'sum:awakenings', 1, 50),
  ch('d_shards', 'daily', 'Crown Breaker', "Break {n} of your rivals' Crown Shards.", 'sum:shards_broken', 6, 45),
  ch('d_defeat', 'daily', 'Clear the Field', 'Defeat {n} rival champions.', 'sum:defeats', 6, 45),
  ch('d_tactics', 'daily', 'Quick Thinking', 'Cast {n} Tactics.', 'sum:tactics', 4, 40),
  ch('d_schemes', 'daily', 'Laid Plans', 'Spring {n} Schemes.', 'sum:schemes_sprung', 2, 45),
  ch('d_relics', 'daily', 'Armed for War', 'Attach {n} Relics to your champions.', 'sum:relics', 2, 45),
  ch('d_edict', 'daily', 'By Royal Decree', 'Proclaim an Edict.', 'sum:edicts', 1, 45),
  ch('d_bout', 'daily', 'The Road to the Crown', 'Win {n} campaign Bout.', 'sum:bouts_won', 1, 50),
  ch('d_variety', 'daily', 'Fresh Faces', 'Deploy {n} different champions.', 'set:champions_played', 5, 40),
  ch('d_tokens', 'daily', 'Reinforcements', 'Summon {n} tokens.', 'sum:tokens', 2, 40),
];

export const WEEKLY_POOL: ChallengeDef[] = [
  ch('w_wins', 'weekly', 'Week of Victories', 'Win {n} matches.', 'sum:wins', 5, 200),
  ch('w_play', 'weekly', 'Regular of the Arena', 'Play {n} matches.', 'sum:matches', 12, 180),
  ch('w_awaken', 'weekly', 'Week of Awakenings', 'Awaken champions to ★★★ {n} times.', 'sum:awakenings', 5, 200),
  ch('w_ascend', 'weekly', 'Climb Together', 'Ascend champions to ★★ {n} times.', 'sum:ascensions', 15, 180),
  ch('w_bouts', 'weekly', 'Campaigner', 'Win {n} campaign Bouts.', 'sum:bouts_won', 5, 220),
  ch('w_shards', 'weekly', 'Siege Week', "Break {n} of your rivals' Crown Shards.", 'sum:shards_broken', 35, 180),
  ch('w_defeat', 'weekly', 'Reaper of the Arena', 'Defeat {n} rival champions.', 'sum:defeats', 30, 180),
  ch('w_variety', 'weekly', 'Open Mind', 'Deploy {n} different champions.', 'set:champions_played', 15, 200),
  ch('w_custom', 'weekly', 'Architect’s Week', 'Win {n} matches with a deck you built.', 'sum:wins_custom', 2, 220),
  ch('w_decks', 'weekly', 'Shifting Banners', 'Win with {n} different decks.', 'set:decks_won', 2, 200),
  ch('w_flawless', 'weekly', 'Untouched Crown', "Win {n} match without your rival breaking a shard.", 'sum:flawless_wins', 1, 250),
  ch('w_streak', 'weekly', 'On a Roll', 'Win {n} matches in a row.', 'max:win_streak', 3, 250),
];

export const ALL_CHALLENGES: ChallengeDef[] = [...DAILY_POOL, ...WEEKLY_POOL];
export const CHALLENGE_BY_ID: Record<string, ChallengeDef> = Object.fromEntries(ALL_CHALLENGES.map((c) => [c.id, c]));

// ─── Champion Challenges (permanent, tiered) ─────────────────────────────────

export interface ChampionChallengeDef { id: string; champion: string; name: string; desc: string; metric: string; tiers: number[]; valor: number[] }

/** The eight Tier V legends met at the Act I Crownings. */
export const LEGENDS: [string, string][] = ['sol', 'aurex', 'atlas', 'mother', 'unwritten', 'noctara', 'veyra', 'crownless'].map((id) => [id, CARDS[id]?.name ?? id]);
export const CHAMPION_TIER_VALOR = [50, 100, 200];
export const CHAMPION_CHALLENGES: ChampionChallengeDef[] = LEGENDS.flatMap(([id, name]) => [
  { id: `cc_${id}_awaken`, champion: id, name: `${name}: Awakened`, desc: `Awaken ${name} to ★★★ {n} times.`, metric: `sum:awaken.${id}`, tiers: [1, 5, 20], valor: CHAMPION_TIER_VALOR },
  { id: `cc_${id}_wins`, champion: id, name: `${name}: Crowned Together`, desc: `Win {n} matches with ${name} deployed.`, metric: `sum:wins_with.${id}`, tiers: [1, 10, 50], valor: CHAMPION_TIER_VALOR },
]);

// ─── Periods & rotation ──────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Monday of the local week, as a key. */
export function weekKey(d: Date): string {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return `w${dayKey(m)}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** Deterministic order of a pool for a key. */
const order = <T,>(pool: T[], key: string): T[] => pool.map((x, i) => ({ x, h: hash(`${key}#${i}`) })).sort((a, b) => a.h - b.h).map((y) => y.x);

export interface ActiveChallenge { def: ChallengeDef; period: string; instance: string; endsAt: number }

/** The daily and weekly challenges active at a moment, after the player's rerolls (old instance -> new challenge id). */
export function activeChallenges(now: Date, swaps: Record<string, string> = {}): ActiveChallenge[] {
  const dk = dayKey(now), wk = weekKey(now);
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + 7);
  const build = (pool: ChallengeDef[], period: string, endsAt: number) => order(pool, period).slice(0, 3).map((def) => {
    let d = def;
    for (let i = 0; i < 10 && swaps[`${d.id}@${period}`]; i++) d = CHALLENGE_BY_ID[swaps[`${d.id}@${period}`]] ?? d;
    return { def: d, period, instance: `${d.id}@${period}`, endsAt };
  });
  return [...build(DAILY_POOL, dk, nextDay), ...build(WEEKLY_POOL, wk, monday.getTime())];
}

/** The challenge a reroll would bring in: deterministic, never one already active in that period. */
export function rerollPick(a: ActiveChallenge, active: ActiveChallenge[]): ChallengeDef | null {
  const pool = a.def.category === 'daily' ? DAILY_POOL : WEEKLY_POOL;
  const taken = new Set(active.filter((x) => x.period === a.period).map((x) => x.def.id));
  return order(pool, `${a.instance}#reroll`).find((d) => !taken.has(d.id) && d.id !== a.def.id) ?? null;
}

/** Progress of a Champion Challenge from lifetime statistics. */
export function championValue(c: ChampionChallengeDef, stats: Stats): number {
  const [, key] = c.metric.split(':');
  return stats.sum[key] ?? 0;
}
export const championTiersDone = (c: ChampionChallengeDef, stats: Stats) => c.tiers.filter((t) => championValue(c, stats) >= t).length;

export const challengeText = (desc: string, n: number) => describe(desc, n);
