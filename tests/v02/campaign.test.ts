import { describe, expect, it } from 'vitest';
import { ALL_BOUTS, CAMPAIGN_DECKS, CHAPTER_I } from '../../src/v02/campaign/act1';
import { applySetup, judge } from '../../src/v02/campaign/setup';
import { CARDS, DECKS } from '../../src/v02/content/cards';
import { checkDeck } from '../../src/v02/economy/decks';
import { newGame } from '../../src/v02/rules/engine';
import { playOut } from '../../src/v02/ai/bot';

describe('Campaign Act I · Chapter I', () => {
  it('has 3 Trials of 5 Bouts and a Crowning against its legend', () => {
    expect(CHAPTER_I.bouts).toHaveLength(16);
    for (const t of [1, 2, 3]) expect(CHAPTER_I.bouts.filter((b) => b.trial === t)).toHaveLength(5);
    expect(CHAPTER_I.bouts.at(-1)!.crowning).toBeDefined();
  });
  it('every enemy deck is legal', () => {
    for (const id of Object.values(CAMPAIGN_DECKS)) expect(checkDeck(DECKS[id].main, DECKS[id].ascension).errors, id).toEqual([]);
  });
  it('every card a Bout uses or rewards exists', () => {
    for (const b of ALL_BOUTS) {
      expect(DECKS[b.deck], b.id).toBeDefined();
      for (const id of [b.portrait, ...(b.reward.cards ?? []), ...(b.setup?.myField ?? []), ...(b.setup?.rivalField ?? []), ...(b.setup?.edict ? [b.setup.edict] : [])])
        expect(CARDS[id], `${b.id}: ${id}`).toBeDefined();
    }
  });
  it('every Bout plays to a result in the real engine', () => {
    for (const b of ALL_BOUTS) {
      const s0 = applySetup(newGame({ seed: 11, decks: ['banner', b.deck] }), b.setup);
      if (b.setup?.rivalCrown) expect(s0.players[1].crown).toHaveLength(b.setup.rivalCrown);
      if (b.setup?.myField) expect(s0.players[0].field).toHaveLength(b.setup.myField.length);
      const end = playOut(s0);
      expect(end.phase, b.id).toBe('over');
      const v = judge(end, b.objective);
      expect(v.done, b.id).toBe(true);
    }
  });
});

import { clearBout, getProfile } from '../../src/v02/economy/profile';
describe('Campaign rewards', () => {
  it('the first clear pays Valor and grants the card once; a replay pays nothing', () => {
    const before = getProfile().valor;
    const owned = (k: string) => getProfile().owned[k] ?? 0;
    const solaraKey = 'S1-013|normal';
    const had = owned(solaraKey);
    expect(clearBout('c1-t1-b1', { valor: 60, cards: ['solara'] }).first).toBe(true);
    expect(getProfile().valor).toBe(before + 60);
    expect(owned(solaraKey)).toBe(had + 1);
    expect(clearBout('c1-t1-b1', { valor: 60, cards: ['solara'] }).first).toBe(false);
    expect(getProfile().valor).toBe(before + 60);
  });
  it('a won survive Bout is judged a win when its round begins', async () => {
    const { judge } = await import('../../src/v02/campaign/setup');
    const s = newGame({ seed: 3, decks: ['banner', 'ember'] });
    s.turn = 10; // round 6
    expect(judge(s, { kind: 'survive', rounds: 6 })).toMatchObject({ done: true, won: true });
  });
});
