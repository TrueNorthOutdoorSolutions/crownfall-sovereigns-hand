import { expect, it } from 'vitest';
import { createGame, applyAction } from '../src/game/rules';
import { restoreGame, serializeGame } from '../src/persistence/journal';

it('round-trips a versioned save by replaying legal actions', () => {
  let game = createGame(29);
  game = applyAction(game, { type: 'deploy', handIndex: 0, front: 'throne' });
  expect(restoreGame(serializeGame(game))).toEqual(game);
});
it('rejects corrupted, incompatible and illegal journals without accepting arbitrary state', () => {
  expect(restoreGame('{')).toBe(null);
  const data = JSON.parse(serializeGame(createGame(9)));
  expect(restoreGame(JSON.stringify({ ...data, contentVersion: 'canonical-fiction' }))).toBe(null);
  expect(restoreGame(JSON.stringify({ ...data, seed: 0 }))).toBe(null);
  expect(restoreGame(JSON.stringify({ ...data, deckIds: ['unknown', 'dawn'] }))).toBe(null);
  expect(restoreGame(JSON.stringify({ ...data, actions: [{ type: 'continue' }] }))).toBe(null);
});
it('accepts legal action objects independent of JSON property ordering', () => {
  const data = JSON.parse(serializeGame(createGame(3)));
  data.actions = [{ front: 'wild', handIndex: 0, type: 'deploy' }];
  expect(restoreGame(JSON.stringify(data))?.units.length).toBe(1);
});
