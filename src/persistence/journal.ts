import { CONTENT_VERSION, decks } from '../content/prototype';
import { replay } from '../game/rules';
import type { Action, GameState } from '../game/types';

export const SAVE_KEY = 'sovereigns-hand:prototype:v1';
export function serializeGame(state: GameState) {
  return JSON.stringify({ format: 1, contentVersion: CONTENT_VERSION, seed: state.initialSeed, deckIds: state.deckIds, actions: state.history });
}
export function restoreGame(value: string): GameState | null {
  try {
    const data = JSON.parse(value);
    if (data.format !== 1 || data.contentVersion !== CONTENT_VERSION || !Number.isInteger(data.seed) || data.seed <= 0 || data.seed > 0xffffffff || !Array.isArray(data.actions) || data.actions.length > 2000 || !Array.isArray(data.deckIds) || data.deckIds.length !== 2 || !data.deckIds.every((id: string) => Object.hasOwn(decks, id))) return null;
    return replay(data.seed, data.deckIds, data.actions as Action[]);
  } catch { return null; }
}
