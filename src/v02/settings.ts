// Player settings. Stored in localStorage on this device (same development stand-in as profile.ts).
import { useSyncExternalStore } from 'react';

export interface Settings {
  /** Starting speed of AI turns and battle animations (the in-match Speed button still toggles it). */
  speed: 'normal' | 'fast';
  /** ★★ Ascension / ★★★ Awakening celebrations. */
  celebrations: 'full' | 'short' | 'off';
  /** Turns off movement animations, on top of the device's own reduce-motion setting. */
  reduceMotion: boolean;
  /** "Achievement unlocked" pop-ups. */
  achievementPopups: boolean;
  /** Ask before ending a turn from the Main phase, i.e. without going to battle. */
  confirmEndTurn: boolean;
}

export const DEFAULT_SETTINGS: Settings = { speed: 'normal', celebrations: 'full', reduceMotion: false, achievementPopups: true, confirmEndTurn: false };
export const SETTINGS_KEY = 'sovereigns-hand-settings-v1';

let current: Settings = load();
const listeners = new Set<() => void>();

function load(): Settings {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function apply(s: Settings) {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('reduce-motion', s.reduceMotion);
}
apply(current);

export const getSettings = () => current;
export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  current = { ...current, [key]: value };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(current)); } catch { /* storage unavailable: keep in memory */ }
  apply(current);
  listeners.forEach((l) => l());
}
export function resetSettings() {
  current = { ...DEFAULT_SETTINGS };
  try { localStorage.removeItem(SETTINGS_KEY); } catch { /* ignore */ }
  apply(current);
  listeners.forEach((l) => l());
}
export function useSettings(): Settings {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => current, () => current);
}
