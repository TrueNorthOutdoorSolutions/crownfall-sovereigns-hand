import { SET1_PRINTINGS } from '../content/printings';
import type { Printing } from '../content/printings';

/** Every printing of every card that has approved art (Set 1 today). */
export const PRINTINGS: Printing[] = [...SET1_PRINTINGS];
export const PRINTING_BY_ID: Record<string, Printing> = Object.fromEntries(PRINTINGS.map((p) => [p.id, p]));

/** The standard printing (base card or token) for each card id. */
const BASE_BY_CARD: Record<string, Printing> = Object.fromEntries(
  PRINTINGS.filter((p) => p.kind === 'base' || p.kind === 'token').map((p) => [p.cardId, p]),
);

export const imgUrl = (p: Printing) => `${import.meta.env.BASE_URL}${p.img}`;
export const cardBackUrl = `${import.meta.env.BASE_URL}v02/cards/back.webp`;
export const basePrinting = (cardId: string): Printing | undefined => BASE_BY_CARD[cardId];
export const cardImage = (cardId: string): string | undefined => {
  const p = BASE_BY_CARD[cardId];
  return p ? imgUrl(p) : undefined;
};
