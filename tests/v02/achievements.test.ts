import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chooseAction } from '../../src/v02/ai/bot';
import { ALL_BOUTS } from '../../src/v02/campaign/act1';
import { actor, apply, newGame } from '../../src/v02/rules/engine';
import type { GameState } from '../../src/v02/rules/types';
import { getProfile } from '../../src/v02/economy/profile';
import { ACHIEVEMENTS, CATEGORY_INFO, describe as fill, evaluate, profileMetrics } from '../../src/v02/progress/achievements';
import { ALL_CHALLENGES, CHAMPION_CHALLENGES, DAILY_POOL, WEEKLY_POOL, activeChallenges, rerollPick, weekKey } from '../../src/v02/progress/challenges';
import { claimAchievement, claimChallenge, rerollChallenge } from '../../src/v02/progress/claim';
import {
  applyDelta, commitMatch, emptyStats, freshProgress, getProgress, matchDelta, packDelta, recordMatch, resetProgress, summarizeMatch, trackField, withDelta,
} from '../../src/v02/progress/stats';
import type { FieldTracker, MatchSummary } from '../../src/v02/progress/stats';

const summary = (over: Partial<MatchSummary> = {}): MatchSummary => ({
  mode: 'ai', won: true, deckId: 'banner', rounds: 8, deployed: ['kael', 'sol'], awakened: ['sol-3'], ascensions: 2, awakenings: 1,
  shardsBroken: 5, shardsLost: 2, shardsLeft: 3, defeats: 4, relics: 0, tactics: 3, schemesSet: 1, schemesSprung: 1, edicts: 0, tokens: 0, ...over,
});

function playTracked(seed: number, decks: [string, string] = ['banner', 'ember']): { s: GameState; tr: FieldTracker } {
  let s = newGame({ seed, decks });
  let tr: FieldTracker = {};
  for (let i = 0; i < 5000 && s.phase !== 'over'; i++) {
    const p = actor(s)!;
    const r = apply(s, p, chooseAction(s, p));
    if (r.error) throw new Error(r.error);
    s = r.state;
    tr = trackField(tr, s, 0);
  }
  return { s, tr };
}

describe('Achievement catalogue', () => {
  it('has 100–140 entries with unique ids, known categories and 1–5 tiers in ascending order', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(100);
    expect(ACHIEVEMENTS.length).toBeLessThanOrEqual(140);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(CATEGORY_INFO[a.category], a.id).toBeDefined();
      expect(a.tiers.length, a.id).toBeGreaterThanOrEqual(1);
      expect(a.tiers.length, a.id).toBeLessThanOrEqual(5);
      for (let i = 1; i < a.tiers.length; i++) expect(a.tiers[i].target, a.id).toBeGreaterThan(a.tiers[i - 1].target);
      for (const t of a.tiers) { expect(t.valor).toBeGreaterThan(0); expect(t.valor).toBeLessThanOrEqual(300); }
      expect(a.metric, a.id).toMatch(/^(sum|max|set|prof):\S+$/);
      if (a.tiers.length > 1 || a.desc.includes('{n}')) expect(fill(a.desc, a.tiers[0].target)).not.toContain('{n}');
    }
  });

  it('every ribbon file exists in public/v02/ribbons', () => {
    for (const a of ACHIEVEMENTS) if (a.ribbon) expect(existsSync(join('public', 'v02', 'ribbons', `${a.ribbon}.webp`)), a.ribbon).toBe(true);
  });

  it('covers secret entries, future (Arena of Ascension) entries and one entry per chapter and Crowning', () => {
    expect(ACHIEVEMENTS.filter((a) => a.hidden).length).toBeGreaterThanOrEqual(4);
    expect(ACHIEVEMENTS.filter((a) => a.category === 'arena').every((a) => a.future)).toBe(true);
    expect(ACHIEVEMENTS.filter((a) => a.id.startsWith('ach_chapter_')).length).toBe(8);
    expect(ACHIEVEMENTS.filter((a) => a.id.startsWith('ach_crowning_')).length).toBe(8);
  });

  it('uses singular wording at 1', () => {
    expect(fill('Win {n} matches.', 1)).toBe('Win 1 match.');
    expect(fill('Win {n} matches.', 10)).toBe('Win 10 matches.');
  });
});

describe('Statistics', () => {
  it('reads a real AI-vs-AI match from the final state, the log and the field tracker', () => {
    const { s, tr } = playTracked(42);
    expect(s.phase).toBe('over');
    const m = summarizeMatch(s, tr, { me: 0, won: s.winner === 0, deckId: 'banner', mode: 'ai' });
    expect(m.deployed.length).toBeGreaterThan(0);
    expect(m.rounds).toBeGreaterThan(1);
    expect(m.ascensions + m.awakenings).toBe(s.stats.ascends[0]);
    expect(m.shardsBroken).toBe(s.stats.shardsBroken[0]);
    expect(m.deployed.every((id) => !id.endsWith('-2') && !id.endsWith('-3'))).toBe(true);
  });

  it('finds Tactics, Relics, defeats, Schemes and tokens in the log across real matches', () => {
    const t = { tactics: 0, relics: 0, defeats: 0, schemesSet: 0, tokens: 0, edicts: 0, awakenings: 0 };
    for (let k = 0; k < 16; k++) {
      const { s, tr } = playTracked(100 + k, k % 2 ? ['vault', 'brood'] : ['brood', 'vault']);
      const m = summarizeMatch(s, tr, { won: s.winner === 0, deckId: s.players[0].deckId, mode: 'ai' });
      for (const key of Object.keys(t) as (keyof typeof t)[]) t[key] += m[key];
    }
    for (let k = 0; k < 8; k++) {
      const { s, tr } = playTracked(300 + k);
      const m = summarizeMatch(s, tr, { won: s.winner === 0, deckId: 'banner', mode: 'ai' });
      t.tactics += m.tactics; t.awakenings += m.awakenings;
    }
    expect(t.tactics).toBeGreaterThan(0);
    expect(t.relics).toBeGreaterThan(0);
    expect(t.defeats).toBeGreaterThan(0);
    expect(t.schemesSet).toBeGreaterThan(0);
    expect(t.tokens).toBeGreaterThan(0);
  });

  it('a match bumps counters, sets and streaks', () => {
    const day = '2026-10-11';
    let { stats } = recordMatch(emptyStats(), summary(), day);
    expect(stats.sum.wins).toBe(1);
    expect(stats.sum.matches).toBe(1);
    expect(stats.sum.deploys).toBe(2);
    expect(stats.set.champions_played.sort()).toEqual(['kael', 'sol']);
    expect(stats.sum['origin.kingdom']).toBe(1);
    expect(stats.sum['awaken.sol']).toBe(1);
    expect(stats.sum.legend_awakenings).toBe(1);
    expect(stats.sum['wins_with.sol']).toBe(1);
    ({ stats } = recordMatch(stats, summary({ deckId: 'custom-x', shardsLost: 0 }), day));
    expect(stats.max.win_streak).toBe(2);
    expect(stats.sum.wins_custom).toBe(1);
    expect(stats.sum.flawless_wins).toBe(1);
    ({ stats } = recordMatch(stats, summary({ won: false }), '2026-10-12'));
    expect(stats.cur.winStreak).toBe(0);
    expect(stats.max.win_streak).toBe(2);
    expect(stats.max.day_streak).toBe(2);
    expect(stats.max.matches_one_day).toBe(2);
    expect(stats.sum.losses).toBe(1);
  });

  it('counts pack pulls by finish and kind', () => {
    const d = packDelta([[{ printing: 'S1-001', finish: 'holo' }, { printing: 'S1-MW01', finish: 'gilded' }]], 'valor', 150);
    expect(d.sum).toMatchObject({ packs_opened: 1, foils_pulled: 1, 'pulled.holo': 1, masterworks_pulled: 1, valor_spent: 150 });
    expect(applyDelta(emptyStats(), d).max.bundle_size).toBe(1);
  });
});

describe('Evaluation and claims', () => {
  it('unlocks tiers, reports what is new since the last check and never unlocks future entries', () => {
    const stats = emptyStats();
    stats.sum.wins = 10;
    for (const k of ['arena_wins', 'arena_matches']) stats.sum[k] = 999;
    const profile = { owned: {}, decks: [], packsOpened: 0, valor: 0, campaign: {} };
    const ev = evaluate(stats, profile, { seen: { ach_victor: 1 } });
    const victor = ev.list.find((s) => s.def.id === 'ach_victor')!;
    expect(victor.done).toBe(2);
    expect(victor.claimable).toBe(2);
    expect(ev.newly).toContainEqual({ id: 'ach_victor', tier: 1 });
    expect(ev.newly).not.toContainEqual({ id: 'ach_victor', tier: 0 });
    expect(ev.list.filter((s) => s.def.future).every((s) => s.done === 0)).toBe(true);
    expect(ev.score).toBeGreaterThan(0);
    const secret = ev.list.find((s) => s.def.hidden)!;
    expect(secret.secret).toBe(true);
  });

  it('derives campaign and collection metrics from the profile', () => {
    const campaign = Object.fromEntries(ALL_BOUTS.slice(0, 16).map((b) => [b.id, { cleared: true as const, at: 1 }]));
    const m = profileMetrics({ owned: { 'S1-001|normal': 2, 'S1-001|holo': 1, 'S1-MW01|gilded': 1 }, decks: [], packsOpened: 3, valor: 10, campaign });
    expect(m.bouts_cleared).toBe(16);
    expect(m['chapter.c1']).toBe(16);
    expect(m['crowning.c1']).toBe(1);
    expect(m.crownings).toBe(1);
    expect(m.set1_base).toBe(1);
    expect(m.playsets).toBe(1);
    expect(m['finish.holo']).toBe(1);
    expect(m.masterworks).toBe(1);
  });

  it('claiming pays the Valor once', () => {
    resetProgress(freshProgress());
    const before = getProfile().valor;
    commitMatch(777001, summary());
    expect(getProgress().stats.sum.wins).toBe(1);
    commitMatch(777001, summary()); // same match again: ignored
    expect(getProgress().stats.sum.wins).toBe(1);
    const paid = claimAchievement('ach_victor');
    expect(paid).toBe(20);
    expect(getProfile().valor).toBe(before + 20);
    expect(claimAchievement('ach_victor')).toBe(0);
    expect(getProfile().valor).toBe(before + 20);
  });
});

describe('Challenges', () => {
  it('pools are well formed with small Valor-only rewards', () => {
    expect(new Set(ALL_CHALLENGES.map((c) => c.id)).size).toBe(ALL_CHALLENGES.length);
    expect(DAILY_POOL.length).toBeGreaterThanOrEqual(6);
    expect(WEEKLY_POOL.length).toBeGreaterThanOrEqual(6);
    for (const c of ALL_CHALLENGES) { expect(c.valor).toBeGreaterThan(0); expect(c.valor).toBeLessThanOrEqual(250); expect(c.metric).toMatch(/^(sum|max|set):/); }
    expect(CHAMPION_CHALLENGES.length).toBe(16);
  });

  it('the same local date always gives the same 3 daily and 3 weekly challenges', () => {
    const a = activeChallenges(new Date(2026, 9, 11, 9)), b = activeChallenges(new Date(2026, 9, 11, 23, 59));
    expect(a.map((x) => x.instance)).toEqual(b.map((x) => x.instance));
    expect(a.filter((x) => x.def.category === 'daily')).toHaveLength(3);
    expect(a.filter((x) => x.def.category === 'weekly')).toHaveLength(3);
    expect(new Set(a.map((x) => x.def.id)).size).toBe(6);
    // Weekly set is shared by every day of the same week (Mon 12 Oct – Sun 18 Oct 2026).
    const mon = activeChallenges(new Date(2026, 9, 12)), sun = activeChallenges(new Date(2026, 9, 18));
    expect(weekKey(new Date(2026, 9, 12))).toBe(weekKey(new Date(2026, 9, 18)));
    expect(mon.filter((x) => x.def.category === 'weekly').map((x) => x.def.id)).toEqual(sun.filter((x) => x.def.category === 'weekly').map((x) => x.def.id));
    // Different days give different daily sets at least some of the time.
    const days = new Set(Array.from({ length: 14 }, (_, i) => activeChallenges(new Date(2026, 9, 1 + i)).filter((x) => x.def.category === 'daily').map((x) => x.def.id).join()));
    expect(days.size).toBeGreaterThan(5);
  });

  it('progress comes from statistics deltas; one reroll a day brings in a different challenge', () => {
    const now = new Date(2026, 9, 11, 12);
    resetProgress(freshProgress());
    const active = activeChallenges(now);
    const first = active[0];
    const pick = rerollPick(first, active)!;
    expect(pick.id).not.toBe(first.def.id);
    expect(active.some((x) => x.def.id === pick.id && x.period === first.period)).toBe(false);
    expect(rerollChallenge(first.instance, now)).toBeNull();
    expect(rerollChallenge(active[1].instance, now)).toMatch(/already rerolled/);
    const after = activeChallenges(now, getProgress().ch.swaps);
    expect(after[0].def.id).toBe(pick.id);
    // Fill every active challenge with a big delta, then claim the swapped one.
    const big = { sum: Object.fromEntries(after.map((x) => [x.def.metric.split(':')[1], 1000])), max: Object.fromEntries(after.map((x) => [x.def.metric.split(':')[1], 1000])),
      set: Object.fromEntries(after.map((x) => [x.def.metric.split(':')[1], Array.from({ length: 30 }, (_, i) => `v${i}`)])) };
    resetProgress(withDelta(getProgress(), big, now));
    const before = getProfile().valor;
    expect(claimChallenge(after[0].instance, now)).toBe(pick.valor);
    expect(getProfile().valor).toBe(before + pick.valor);
    expect(claimChallenge(after[0].instance, now)).toBe(0);
  });

  it('matchDelta feeds daily metrics', () => {
    const d = matchDelta(summary());
    expect(d.sum?.matches).toBe(1);
    expect(d.sum?.wins).toBe(1);
    expect(d.set?.champions_played).toContain('sol');
  });
});
