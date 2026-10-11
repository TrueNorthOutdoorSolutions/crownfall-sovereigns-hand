// Deck-building rules (RULEBOOK.md "Building a deck") and running a saved deck in the engine.
// The engine reads decks from DECKS by id, so a saved deck is registered there under its own id at play time;
// the engine and card data are not modified.
import { CARDS, DECKS, isChampionCard, isRelicCard } from '../content/cards';
import type { DeckDef } from '../content/cards';
import type { SavedDeck } from './profile';

export const DECK_SIZE = 30;
export const MAX_COPIES = 2;
export const ASCENSION_MAX = 8;
export const ASCENSION_COPIES = 2;

export interface DeckCheck { ok: boolean; errors: string[]; warnings: string[]; mainCount: number; ascCount: number }

/** Check a deck against the rules. `owned` (card id -> copies) adds collection limits when given. */
export function checkDeck(main: [string, number][], ascension: string[], owned?: (cardId: string) => number): DeckCheck {
  const errors: string[] = [], warnings: string[] = [];
  const mainCount = main.reduce((n, [, c]) => n + c, 0);
  if (mainCount !== DECK_SIZE) errors.push(`The deck needs exactly ${DECK_SIZE} cards (it has ${mainCount}).`);
  let ascendants = 0, guardians = 0;
  for (const [id, n] of main) {
    const c = CARDS[id];
    if (!c) { errors.push(`Unknown card ${id}.`); continue; }
    if (isChampionCard(c) && c.kind !== 'champion') errors.push(`${c.name} ${'★'.repeat(c.star)} belongs in the Ascension Pile, not the deck.`);
    if (n > MAX_COPIES) errors.push(`At most ${MAX_COPIES} copies of ${c.name}.`);
    if (isChampionCard(c) && c.keywords.includes('Ascendant')) ascendants += n;
    if (isChampionCard(c) && c.family === 'guardian') guardians += n;
    if (isRelicCard(c) && c.legendary && n > 1) errors.push(`${c.name} is Legendary: only 1 copy.`);
    if (owned && owned(id) < n) errors.push(`You own ${owned(id)} of ${c.name} (deck uses ${n}).`);
  }
  if (ascendants > 1) errors.push('At most 1 Ascendant (Tier V) champion per deck.');
  if (guardians > 1) errors.push('At most 1 Guardian per deck.');

  if (ascension.length > ASCENSION_MAX) errors.push(`The Ascension Pile holds at most ${ASCENSION_MAX} cards (it has ${ascension.length}).`);
  const perForm: Record<string, number> = {};
  for (const id of ascension) {
    const c = CARDS[id];
    if (!c || !isChampionCard(c) || c.kind !== 'ascension') { errors.push(`${c?.name ?? id} is not a ★★ or ★★★ card.`); continue; }
    perForm[id] = (perForm[id] ?? 0) + 1;
    if (!main.some(([m]) => m === c.lineId)) warnings.push(`${c.name} ${'★'.repeat(c.star)} has no ${c.name} ★ in the deck to Ascend from.`);
  }
  for (const [id, n] of Object.entries(perForm)) {
    if (n > ASCENSION_COPIES) errors.push(`At most ${ASCENSION_COPIES} copies of ${CARDS[id].name} ${'★'.repeat((CARDS[id] as { star: number }).star)} in the Ascension Pile.`);
    if (owned && owned(id) < n) errors.push(`You own ${owned(id)} of ${CARDS[id].name} ${'★'.repeat((CARDS[id] as { star: number }).star)} (pile uses ${n}).`);
  }
  return { ok: errors.length === 0, errors, warnings: [...new Set(warnings)], mainCount, ascCount: ascension.length };
}

/** Make a saved deck playable: register it in DECKS under its own id and return that id. */
export function registerDeck(d: SavedDeck): string {
  const id = `custom-${d.id}`;
  const def: DeckDef = { set: 1, name: d.name || 'Custom deck', origins: 'Your deck', color: '#7a5bd6', accent: '#f0c95a', pitch: '', main: d.main, ascension: d.ascension };
  DECKS[id] = def;
  return id;
}

/** Copy a starter deck as the starting point for a new saved deck. */
export function fromStarter(deckId: string, id: string): SavedDeck {
  const d = DECKS[deckId];
  return { id, name: `${d.name} (copy)`, main: d.main.map(([c, n]) => [c, n] as [string, number]), ascension: [...d.ascension], updated: Date.now() };
}
