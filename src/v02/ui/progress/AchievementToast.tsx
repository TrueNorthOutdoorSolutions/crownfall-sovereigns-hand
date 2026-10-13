// "Achievement unlocked" toast (PROPOSED 2026-10-11). Mount once inside the stage; it watches the progress store and
// the profile, and announces each newly unlocked tier in turn. Click to dismiss early.
import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useProfile } from '../../economy/profile';
import { ACHIEVEMENT_BY_ID, RARITY_COLOR, RARITY_LABEL, describe, evaluate, tierName } from '../../progress/achievements';
import { initSeen, markSeen } from '../../progress/claim';
import { useProgress } from '../../progress/stats';
import { ribbonUrl } from './Achievements';
import { useSettings } from '../../settings';
import './progress.css';

// Hold: while a pack opening is revealing cards, unlock pop-ups wait so they never spoil a pull (owner 2026-10-13).
let held = false;
const holdListeners = new Set<() => void>();
export function holdAchievementToasts(on: boolean) { if (held !== on) { held = on; holdListeners.forEach((l) => l()); } }
const useHeld = () => useSyncExternalStore((cb) => { holdListeners.add(cb); return () => holdListeners.delete(cb); }, () => held, () => held);

/** Number of achievement tiers ready to claim, for a badge on the home tile. */
export function useAchievementBadge(): number {
  const progress = useProgress();
  const profile = useProfile();
  return useMemo(() => evaluate(progress.stats, profile, { claimed: progress.claimed }).claimable, [progress, profile]);
}

export function AchievementToast({ ms = 3800 }: { ms?: number }) {
  const progress = useProgress();
  const profile = useProfile();
  useEffect(() => { initSeen(); }, []);
  const popups = useSettings().achievementPopups;
  const hold = useHeld();
  const first = useMemo(() => (progress.seenInit ? evaluate(progress.stats, profile, { seen: progress.seen }).newly[0] ?? null : null), [progress, profile]);
  useEffect(() => {
    if (!first || hold) return;
    if (!popups) { markSeen([first]); return; }
    const t = setTimeout(() => markSeen([first]), ms);
    return () => clearTimeout(t);
  }, [first, ms, popups, hold]);
  if (!first || !popups || hold) return null;
  const def = ACHIEVEMENT_BY_ID[first.id];
  if (!def) return null;
  const tier = def.tiers[first.tier];
  return (
    <div className="pg-toast" role="status" aria-live="polite" style={{ ['--r' as string]: RARITY_COLOR[tier.rarity] }} onClick={() => markSeen([first])}>
      {def.ribbon ? <img src={ribbonUrl(def.ribbon)} alt="" /> : <div className="pg-glyph">{def.icon}</div>}
      <div>
        <small>Achievement unlocked · {RARITY_LABEL[tier.rarity]}</small>
        <b>{tierName(def, first.tier)}</b>
        <span>{describe(def.desc, tier.target)} · ✧ {tier.valor} to claim{tier.title ? ` · Title: ${tier.title}` : ''}</span>
      </div>
    </div>
  );
}
