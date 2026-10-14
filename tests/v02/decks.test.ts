import { describe, expect, it } from 'vitest';
import { DECKS, STARTER_DECK_IDS } from '../../src/v02/content/cards';
import { SET1_PRINTINGS } from '../../src/v02/content/printings';
import { grantStarters, ownKey } from '../../src/v02/economy/profile';
import type { Profile } from '../../src/v02/economy/profile';
import { checkDeck, fromStarter, registerDeck } from '../../src/v02/economy/decks';
import { newGame } from '../../src/v02/rules/engine';
import { playOut } from '../../src/v02/ai/bot';

describe('Deck building', () => {
  it('every starter deck is legal', () => {
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

  it('the four Set 1 starters share no card (no champion, Ascension form or spell in two decks)', () => {
    const set1 = STARTER_DECK_IDS.filter((d) => (DECKS[d].set ?? 1) === 1);
    expect(set1).toEqual(['banner', 'ember', 'iron', 'veil']);
    const seen = new Map<string, string>();
    for (const d of set1) for (const id of [...DECKS[d].main.map(([c]) => c), ...DECKS[d].ascension]) {
      expect(seen.get(id) ?? d, `${id} is in ${seen.get(id)} and ${d}`).toBe(d);
      seen.set(id, d);
    }
  });
  it('grants every Set 1 starter once, and tops up old profiles with only the new starters', () => {
    const base = (cardId: string) => ownKey(SET1_PRINTINGS.find((p) => p.kind === 'base' && p.cardId === cardId)!.id, 'normal');
    const blank: Profile = { v: 1, valor: 0, starstones: 0, owned: {}, packsOpened: 0, lastWinDay: null, decks: [], lastOpening: null, purchases: [] };
    const fresh = grantStarters(blank);
    expect(fresh.startersGranted).toEqual(['banner', 'ember', 'iron', 'veil']);
    expect(fresh.owned[base('rowan')]).toBe(2);
    expect(fresh.owned[base('unwritten-3')]).toBe(1);
    expect(grantStarters(fresh)).toBe(fresh); // nothing granted twice
    // A profile from before Iron Requiem / Veil of Knives: keeps what it has, gains only the two new decks.
    const old: Profile = { ...blank, owned: { [base('rowan')]: 5, [base('nyx')]: 1 }, starterGranted: true };
    const topped = grantStarters(old);
    expect(topped.owned[base('rowan')]).toBe(5);
    expect(topped.owned[base('nyx')]).toBe(3);
    expect(topped.owned[base('pip')]).toBe(2);
    expect(topped.startersGranted).toEqual(['banner', 'ember', 'iron', 'veil']);
  });
});
