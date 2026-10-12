// Player actions on progression: claim achievement and challenge rewards (Valor only), reroll a challenge,
// mark unlocks as announced. PROPOSED (2026-10-11), see achievements.ts / challenges.ts.
import { getProfile, grantValor } from '../economy/profile';
import { ACHIEVEMENT_BY_ID, evaluate } from './achievements';
import { CHAMPION_CHALLENGES, activeChallenges, championTiersDone, rerollPick } from './challenges';
import { getProgress, localDay, saveProgress } from './stats';

/** Claim every unlocked, unclaimed tier of one achievement. Returns the Valor paid (0 if nothing to claim). */
export function claimAchievement(id: string): number {
  const p = getProgress();
  const st = evaluate(p.stats, getProfile(), { claimed: p.claimed }).list.find((x) => x.def.id === id);
  if (!st || st.claimable <= 0 || !ACHIEVEMENT_BY_ID[id]) return 0;
  saveProgress({ ...getProgress(), claimed: { ...getProgress().claimed, [id]: st.done } });
  grantValor(st.pendingValor);
  return st.pendingValor;
}

/** Claim everything claimable. Returns the total Valor paid. */
export function claimAllAchievements(): number {
  const p = getProgress();
  const ev = evaluate(p.stats, getProfile(), { claimed: p.claimed });
  let total = 0;
  const claimed = { ...p.claimed };
  for (const st of ev.list) if (st.claimable > 0) { claimed[st.def.id] = st.done; total += st.pendingValor; }
  if (!total && ev.claimable === 0) return 0;
  saveProgress({ ...getProgress(), claimed });
  grantValor(total);
  return total;
}

/** Mark the given unlocks as announced (the toast calls this). */
export function markSeen(items: { id: string; tier: number }[]) {
  if (!items.length) return;
  const seen = { ...getProgress().seen };
  for (const { id, tier } of items) seen[id] = Math.max(seen[id] ?? 0, tier + 1);
  saveProgress({ ...getProgress(), seen, seenInit: true });
}

/** First check on a device: everything already unlocked counts as announced, so the player is not flooded. */
export function initSeen() {
  const p = getProgress();
  if (p.seenInit) return;
  const ev = evaluate(p.stats, getProfile(), { seen: p.seen });
  const seen = { ...p.seen };
  for (const { id, tier } of ev.newly) seen[id] = Math.max(seen[id] ?? 0, tier + 1);
  saveProgress({ ...p, seen, seenInit: true });
}

/** Claim a completed daily or weekly challenge. Returns the Valor paid. */
export function claimChallenge(instance: string, now: Date = new Date()): number {
  const p = getProgress();
  const a = activeChallenges(now, p.ch.swaps).find((x) => x.instance === instance);
  if (!a || p.ch.claimed[instance] || (p.ch.progress[instance] ?? 0) < a.def.target) return 0;
  saveProgress({ ...p, ch: { ...p.ch, claimed: { ...p.ch.claimed, [instance]: true } } });
  grantValor(a.def.valor);
  return a.def.valor;
}

export const canReroll = (now: Date = new Date()) => getProgress().ch.rerollDay !== localDay(now);

/** Swap one unfinished daily or weekly challenge for another. Once per local day. Returns an error or null. */
export function rerollChallenge(instance: string, now: Date = new Date()): string | null {
  const p = getProgress();
  if (!canReroll(now)) return 'You have already rerolled a challenge today.';
  const active = activeChallenges(now, p.ch.swaps);
  const a = active.find((x) => x.instance === instance);
  if (!a) return 'That challenge is no longer active.';
  if (p.ch.claimed[instance] || (p.ch.progress[instance] ?? 0) >= a.def.target) return 'A completed challenge cannot be rerolled.';
  const pick = rerollPick(a, active);
  if (!pick) return 'No other challenge is available.';
  saveProgress({ ...p, ch: { ...p.ch, swaps: { ...p.ch.swaps, [instance]: pick.id }, rerollDay: localDay(now) } });
  return null;
}

/** Claim every finished, unclaimed tier of a Champion Challenge. Returns the Valor paid. */
export function claimChampionChallenge(id: string): number {
  const p = getProgress();
  const c = CHAMPION_CHALLENGES.find((x) => x.id === id);
  if (!c) return 0;
  const done = championTiersDone(c, p.stats), had = p.ch.champClaimed[id] ?? 0;
  if (done <= had) return 0;
  const valor = c.valor.slice(had, done).reduce((n, v) => n + v, 0);
  saveProgress({ ...p, ch: { ...p.ch, champClaimed: { ...p.ch.champClaimed, [id]: done } } });
  grantValor(valor);
  return valor;
}
