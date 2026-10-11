import { describe, expect, it } from 'vitest';
import { DECKS } from '../../src/v02/content/cards';
import { checkDeck, fromStarter, registerDeck } from '../../src/v02/economy/decks';
import { newGame } from '../../src/v02/rules/engine';
import { playOut } from '../../src/v02/ai/bot';

describe('Deck building', () => {
  it('all four starter decks are legal', () => {
    for (const [id, d] of Object.entries(DECKS)) {
      const r = checkDeck(d.main, d.ascension);
      expect(r.errors, id).toEqual([]);
    }
  });
  it('catches the rules: 30 cards, 2 copies, 1 Ascendant, Ascension cards only in the pile, 8-card pile', () => {
    const banner = DECKS.banner;
    expect(checkDeck(banner.main.slice(1), banner.ascension).errors.join()).toMatch(/exactly 30/);
    expect(checkDeck([...banner.main.filter(([c]) => c !== 'rowan'), ['rowan', 3]] as [string, number][], banner.ascension).errors.join()).toMatch(/At most 2 copies/);
    const twoAscendants = [...banner.main.filter(([c]) => c !== 'rowan'), ['aurex', 1], ['rowan', 1]] as [string, number][];
    expect(checkDeck(twoAscendants, banner.ascension).errors.join()).toMatch(/1 Ascendant/);
    expect(checkDeck([...banner.main.filter(([c]) => c !== 'rowan'), ['kael-2', 2]] as [string, number][], banner.ascension).errors.join()).toMatch(/Ascension Pile, not the deck/);
    expect(checkDeck(banner.main, [...banner.ascension, 'fen-2']).errors.join()).toMatch(/at most 8/);
  });
  it('enforces collection limits when given', () => {
    const r = checkDeck(DECKS.banner.main, DECKS.banner.ascension, () => 1);
    expect(r.ok).toBe(false);
    expect(r.errors.join()).toMatch(/You own 1/);
  });
  it('a saved deck plays a full game in the real engine', () => {
    const id = registerDeck(fromStarter('ember', 'test'));
    const end = playOut(newGame({ seed: 5, decks: [id, 'banner'] }));
    expect(end.phase).toBe('over');
  });
});
