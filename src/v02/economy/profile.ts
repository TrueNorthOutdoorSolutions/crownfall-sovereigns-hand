// The player's profile: wallet (Valor / Starstones), card collection and saved decks.
// Stored in localStorage as a development stand-in for a server account (same approach as Crownfall's commerce).
import { useSyncExternalStore } from 'react';
import { SET1_PRINTINGS } from '../content/printings';
import type { Printing, Rarity } from '../content/printings';
import { PACK_PRICE } from './odds';
import type { Finish } from './odds';
import { bundleFor, openBundle } from './packs';
import type { Pack } from './packs';

/** Valor rewards (PROPOSED). */
export const VALOR_EARN = { match: 30, win: 30, firstWinOfDay: 100 };
/** Forge: buy one standard copy of any base card directly, so nothing is ever only obtainable by chance. */
export const FORGE_PRICE: Record<Rarity, number> = { common: 40, uncommon: 100, elite: 250, epic: 600, mythic: 1500 };
/** Salvage: standard copies beyond the 2 a deck can use turn back into Valor. */
export const SALVAGE_VALUE: Record<Rarity, number> = { common: 10, uncommon: 25, elite: 60, epic: 150, mythic: 400 };
export const PLAYSET = 2;

/** Starstone bundles sold for real money (PROPOSED prices, CAD). Development builds simulate the purchase; no
 *  payment is taken until a payment provider is connected and the launch review is done. */
export const STARSTONE_OFFERS = [
  { id: 'ss-80', stones: 80, price: 4.99 },
  { id: 'ss-170', stones: 170, price: 9.99 },
  { id: 'ss-360', stones: 360, price: 19.99 },
  { id: 'ss-950', stones: 950, price: 49.99 },
  { id: 'ss-2000', stones: 2000, price: 99.99 },
];

export const ownKey = (printing: string, finish: Finish) => `${printing}|${finish}`;
const PRINT: Record<string, Printing> = Object.fromEntries(SET1_PRINTINGS.map((p) => [p.id, p]));

export interface SavedDeck { id: string; name: string; main: [string, number][]; ascension: string[]; updated: number }
export interface Profile {
  v: 1;
  valor: number;
  starstones: number;
  owned: Record<string, number>;
  packsOpened: number;
  lastWinDay: string | null;
  decks: SavedDeck[];
  /** Most recent pack opening, so a refresh mid-reveal does not lose it. */
  lastOpening: Pack[] | null;
  /** Running record of real-money purchases (simulated in development). */
  purchases: { id: string; stones: number; price: number; at: number; simulated: boolean }[];
}

const KEY = 'sovereigns-hand-profile-v1';
/** New players start with enough Valor for a few packs. */
const fresh = (): Profile => ({ v: 1, valor: 1500, starstones: 0, owned: {}, packsOpened: 0, lastWinDay: null, decks: [], lastOpening: null, purchases: [] });

let current: Profile = load();
const listeners = new Set<() => void>();
function load(): Profile {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch { /* private mode or blocked storage: play on with a fresh profile */ }
  return fresh();
}
function save(next: Profile) {
  current = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach((l) => l());
}
export const getProfile = () => current;
export function useProfile(): Profile {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => current, () => current);
}

/** How many copies of a card the player owns, all printings and finishes together (what the deck builder uses). */
export function copiesOfCard(p: Profile, cardId: string): number {
  let n = 0;
  for (const [k, c] of Object.entries(p.owned)) if (PRINT[k.split('|')[0]]?.cardId === cardId) n += c;
  return n;
}

export type Currency = 'valor' | 'starstones';
export function buyPacks(count: number, currency: Currency, seed: number): { packs: Pack[] } | { error: string } {
  const bundle = bundleFor(count);
  const cost = PACK_PRICE[currency] * bundle.packs;
  if (current[currency] < cost) return { error: `Not enough ${currency === 'valor' ? 'Valor' : 'Starstones'}.` };
  const packs = openBundle(seed, bundle);
  const owned = { ...current.owned };
  for (const pk of packs) for (const c of pk) owned[ownKey(c.printing, c.finish)] = (owned[ownKey(c.printing, c.finish)] ?? 0) + 1;
  save({ ...current, [currency]: current[currency] - cost, owned, packsOpened: current.packsOpened + bundle.packs, lastOpening: packs });
  return { packs };
}

export function forge(printing: string): string | null {
  const p = PRINT[printing];
  if (!p || p.kind !== 'base') return 'Only standard cards can be forged.';
  const cost = FORGE_PRICE[p.rarity];
  if (current.valor < cost) return 'Not enough Valor.';
  const k = ownKey(printing, 'normal');
  save({ ...current, valor: current.valor - cost, owned: { ...current.owned, [k]: (current.owned[k] ?? 0) + 1 } });
  return null;
}

/** Turn standard base copies beyond a playset into Valor. Foils and special printings are never salvaged. */
export function salvageExtras(): number {
  let gained = 0;
  const owned = { ...current.owned };
  for (const [k, n] of Object.entries(owned)) {
    const [id, finish] = k.split('|');
    const p = PRINT[id];
    if (!p || p.kind !== 'base' || finish !== 'normal' || n <= PLAYSET) continue;
    gained += (n - PLAYSET) * SALVAGE_VALUE[p.rarity];
    owned[k] = PLAYSET;
  }
  if (gained) save({ ...current, valor: current.valor + gained, owned });
  return gained;
}

export const today = () => new Date().toISOString().slice(0, 10);
/** Valor for finishing a match. */
export function rewardMatch(won: boolean): { total: number; lines: [string, number][] } {
  const lines: [string, number][] = [['Match played', VALOR_EARN.match]];
  if (won) lines.push(['Victory', VALOR_EARN.win]);
  const firstWin = won && current.lastWinDay !== today();
  if (firstWin) lines.push(['First win of the day', VALOR_EARN.firstWinOfDay]);
  const total = lines.reduce((a, [, n]) => a + n, 0);
  save({ ...current, valor: current.valor + total, lastWinDay: firstWin ? today() : current.lastWinDay });
  return { total, lines };
}

export function buyStarstones(offerId: string): string | null {
  const o = STARSTONE_OFFERS.find((x) => x.id === offerId);
  if (!o) return 'Unknown offer.';
  save({ ...current, starstones: current.starstones + o.stones, purchases: [...current.purchases, { id: o.id, stones: o.stones, price: o.price, at: Date.now(), simulated: true }] });
  return null;
}

export function saveDeck(deck: SavedDeck) {
  save({ ...current, decks: [...current.decks.filter((d) => d.id !== deck.id), { ...deck, updated: Date.now() }] });
}
export function deleteDeck(id: string) { save({ ...current, decks: current.decks.filter((d) => d.id !== id) }); }
export function clearLastOpening() { save({ ...current, lastOpening: null }); }
/** Development helper: top up the wallet for testing. */
export function devGrant(valor: number, starstones: number) { save({ ...current, valor: current.valor + valor, starstones: current.starstones + starstones }); }
