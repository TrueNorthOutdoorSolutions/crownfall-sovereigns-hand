// Pack odds for Sovereign's Hand. THE single source of truth: the pack opener rolls from these tables and the
// in-game odds page is computed from them, so the published odds can never drift from what the code does.
// Agreed with the owner 2026-10-11 (PROPOSED numbers; change them here only).
import type { Rarity } from '../content/printings';

export const RARITIES: Rarity[] = ['common', 'uncommon', 'elite', 'epic', 'mythic'];
export const RARITY_NAMES: Record<Rarity, string> = { common: 'Common', uncommon: 'Uncommon', elite: 'Elite', epic: 'Epic', mythic: 'Mythic' };

/** Foil finishes. Normal cards can be Holo, Prismatic or Sovereign Rainbow; Masterworks and Omegas only ever Gilded. */
export type Finish = 'normal' | 'holo' | 'prismatic' | 'rainbow' | 'gilded';
export const FINISH_NAMES: Record<Finish, string> = { normal: 'Standard', holo: 'Holo', prismatic: 'Prismatic', rainbow: 'Sovereign Rainbow', gilded: 'Gilded' };

export const PACK_SIZE = 10;
/** Slots 1-5 Commons, 6-8 Uncommons, slot 9 the Hero slot, slot 10 the Foil slot. */
export const COMMON_SLOTS = 5;
export const UNCOMMON_SLOTS = 3;

/** Hero slot (slot 9). Epic and Mythic weights are multiplied by the bundle boost. */
export const HERO_WEIGHTS: Record<'elite' | 'epic' | 'mythic', number> = { elite: 70, epic: 24, mythic: 6 };
/** Foil slot (slot 10) rarity. Epic and Mythic weights are multiplied by the bundle boost. */
export const FOIL_WEIGHTS: Record<Rarity, number> = { common: 50, uncommon: 28, elite: 13, epic: 7, mythic: 2 };
/** Finish of a foil. Prismatic and Rainbow weights are multiplied by the bundle boost. */
export const FINISH_WEIGHTS: Record<'holo' | 'prismatic' | 'rainbow', number> = { holo: 80, prismatic: 17, rainbow: 3 };

/** Chance per pack that a special printing replaces the Hero slot (before the bundle boost). */
export const SPECIAL_CHANCE = {
  alt: 1 / 12,
  masterwork: 1 / 500, // development odds; physical release is serial-numbered X/100
  omega: 1 / 5000, // development odds; physical release is serial-numbered X/10
};
/** An Alternate Art pulled from the Hero slot is foil this often (then rolls Holo / Prismatic / Rainbow). */
export const ALT_FOIL_CHANCE = 0.25;

export type Guarantee = 'epicPlus' | 'mythic' | 'alt' | 'rainbow' | 'masterwork';
export interface Bundle { packs: number; boost: number; guarantee: Guarantee | null }
export const BUNDLES: Bundle[] = [
  { packs: 1, boost: 1.0, guarantee: null },
  { packs: 5, boost: 1.1, guarantee: null },
  { packs: 10, boost: 1.25, guarantee: 'epicPlus' },
  { packs: 25, boost: 1.4, guarantee: 'mythic' },
  { packs: 50, boost: 1.6, guarantee: 'alt' },
  { packs: 100, boost: 1.8, guarantee: 'rainbow' },
  { packs: 250, boost: 2.0, guarantee: 'masterwork' },
];
export const GUARANTEE_TEXT: Record<Guarantee, string> = {
  epicPlus: 'at least 1 Epic or better', mythic: 'at least 1 Mythic', alt: 'at least 1 Alternate Art',
  rainbow: 'at least 1 Sovereign Rainbow foil', masterwork: 'at least 1 Masterwork',
};

/** Prices per pack. Valor is earned by playing; Starstones are the premium currency. */
export const PACK_PRICE = { valor: 150, starstones: 15 };

// ---------- derived probabilities (used by the odds page and the tests) ----------

const norm = <K extends string>(w: Record<K, number>): Record<K, number> => {
  const total = (Object.values(w) as number[]).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, (v as number) / total])) as Record<K, number>;
};
export const boosted = (boost: number) => ({
  hero: norm({ elite: HERO_WEIGHTS.elite, epic: HERO_WEIGHTS.epic * boost, mythic: HERO_WEIGHTS.mythic * boost }),
  foil: norm({ ...FOIL_WEIGHTS, epic: FOIL_WEIGHTS.epic * boost, mythic: FOIL_WEIGHTS.mythic * boost }),
  finish: norm({ holo: FINISH_WEIGHTS.holo, prismatic: FINISH_WEIGHTS.prismatic * boost, rainbow: FINISH_WEIGHTS.rainbow * boost }),
  special: { alt: SPECIAL_CHANCE.alt * boost, masterwork: SPECIAL_CHANCE.masterwork * boost, omega: SPECIAL_CHANCE.omega * boost },
});

/** Per-pack chances for the odds page (before bundle guarantees, which only ever improve a bundle). */
export function packOdds(boost = 1) {
  const b = boosted(boost);
  const special = b.special.alt + b.special.masterwork + b.special.omega;
  const heroNormal = 1 - special;
  const rarity = (r: Rarity) => (r === 'elite' || r === 'epic' || r === 'mythic' ? heroNormal * b.hero[r] : 0) + b.foil[r];
  return {
    anyOf: Object.fromEntries(RARITIES.map((r) => [r, rarity(r)])) as Record<Rarity, number>,
    foilOf: b.foil,
    finish: b.finish,
    anyRainbow: b.finish.rainbow + b.special.alt * ALT_FOIL_CHANCE * b.finish.rainbow,
    alt: b.special.alt,
    altFoil: b.special.alt * ALT_FOIL_CHANCE,
    masterwork: b.special.masterwork,
    omega: b.special.omega,
  };
}
