// Opening packs. Pure and seedable: the same seed always opens the same cards (tests and replays rely on it).
import { SET1_PRINTINGS } from '../content/printings';
import type { Printing, Rarity } from '../content/printings';
import { ALT_FOIL_CHANCE, BUNDLES, COMMON_SLOTS, UNCOMMON_SLOTS, boosted } from './odds';
import type { Bundle, Finish, Guarantee } from './odds';

export interface Pull { printing: string; finish: Finish; slot: 'common' | 'uncommon' | 'hero' | 'foil' }
export type Pack = Pull[];

/** Small fast seedable RNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POOL = SET1_PRINTINGS;
const byRarity = (r: Rarity) => POOL.filter((p) => p.kind === 'base' && p.rarity === r);
const BASE: Record<Rarity, Printing[]> = { common: byRarity('common'), uncommon: byRarity('uncommon'), elite: byRarity('elite'), epic: byRarity('epic'), mythic: byRarity('mythic') };
const SPECIAL = { alt: POOL.filter((p) => p.kind === 'alt'), masterwork: POOL.filter((p) => p.kind === 'masterwork'), omega: POOL.filter((p) => p.kind === 'omega') };

function pickWeighted<K extends string>(r: () => number, probs: Record<K, number>): K {
  let x = r();
  const keys = Object.keys(probs) as K[];
  for (const k of keys) { x -= probs[k]; if (x < 0) return k; }
  return keys[keys.length - 1];
}
const pickOne = <T,>(r: () => number, list: T[]): T => list[Math.floor(r() * list.length)];

/** Open one pack. Commons and Uncommons never repeat inside the same pack. */
export function openPack(r: () => number, boost = 1): Pack {
  const b = boosted(boost);
  const pack: Pack = [];
  const distinct = (list: Printing[], n: number, slot: Pull['slot']) => {
    const left = [...list];
    for (let i = 0; i < n; i++) pack.push({ printing: left.splice(Math.floor(r() * left.length), 1)[0].id, finish: 'normal', slot });
  };
  distinct(BASE.common, COMMON_SLOTS, 'common');
  distinct(BASE.uncommon, UNCOMMON_SLOTS, 'uncommon');

  // Hero slot: a special printing can replace it; otherwise Elite / Epic / Mythic.
  const roll = r();
  const s = b.special;
  if (roll < s.omega) pack.push({ printing: pickOne(r, SPECIAL.omega).id, finish: 'gilded', slot: 'hero' });
  else if (roll < s.omega + s.masterwork) pack.push({ printing: pickOne(r, SPECIAL.masterwork).id, finish: 'gilded', slot: 'hero' });
  else if (roll < s.omega + s.masterwork + s.alt) {
    const finish: Finish = r() < ALT_FOIL_CHANCE ? pickWeighted(r, b.finish) : 'normal';
    pack.push({ printing: pickOne(r, SPECIAL.alt).id, finish, slot: 'hero' });
  } else pack.push({ printing: pickOne(r, BASE[pickWeighted(r, b.hero)]).id, finish: 'normal', slot: 'hero' });

  // Foil slot: always foil, any rarity.
  pack.push({ printing: pickOne(r, BASE[pickWeighted(r, b.foil)]).id, finish: pickWeighted(r, b.finish), slot: 'foil' });
  return pack;
}

const PRINT: Record<string, Printing> = Object.fromEntries(POOL.map((p) => [p.id, p]));
const RANK: Record<Rarity, number> = { common: 0, uncommon: 1, elite: 2, epic: 3, mythic: 4 };
export const meets = (packs: Pack[], g: Guarantee): boolean => packs.some((pk) => pk.some((c) => {
  const p = PRINT[c.printing];
  switch (g) {
    case 'epicPlus': return RANK[p.rarity] >= 3 || p.kind !== 'base';
    case 'mythic': return p.rarity === 'mythic';
    case 'alt': return p.kind === 'alt';
    case 'rainbow': return c.finish === 'rainbow';
    case 'masterwork': return p.kind === 'masterwork' || p.kind === 'omega';
  }
}));

/** Open a bundle: the bundle's boost applies to every pack, and if its guarantee was not met the LAST pack's
 *  Hero (or Foil, for Rainbow) slot is upgraded so the promise is always kept. */
export function openBundle(seed: number, bundle: Bundle): Pack[] {
  const r = rng(seed);
  const packs = Array.from({ length: bundle.packs }, () => openPack(r, bundle.boost));
  const g = bundle.guarantee;
  if (g && !meets(packs, g)) {
    const last = packs[packs.length - 1];
    const hero = last.findIndex((c) => c.slot === 'hero'), foil = last.findIndex((c) => c.slot === 'foil');
    if (g === 'rainbow') last[foil] = { ...last[foil], finish: 'rainbow' };
    else if (g === 'alt') last[hero] = { printing: pickOne(r, SPECIAL.alt).id, finish: 'normal', slot: 'hero' };
    else if (g === 'masterwork') last[hero] = { printing: pickOne(r, SPECIAL.masterwork).id, finish: 'gilded', slot: 'hero' };
    else last[hero] = { printing: pickOne(r, BASE[g === 'mythic' ? 'mythic' : 'epic']).id, finish: 'normal', slot: 'hero' };
  }
  return packs;
}

export const bundleFor = (packs: number) => BUNDLES.find((b) => b.packs === packs) ?? BUNDLES[0];
