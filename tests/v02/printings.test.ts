import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARDS } from '../../src/v02/content/cards';
import { SET1_PRINTINGS, SET1_TOTAL } from '../../src/v02/content/printings';

describe('Set 1 printed card art', () => {
  it('has one base printing for every numbered card, each pointing at a real card', () => {
    const base = SET1_PRINTINGS.filter((p) => p.kind === 'base');
    expect(base).toHaveLength(SET1_TOTAL);
    for (const p of SET1_PRINTINGS) expect(CARDS[p.cardId], `${p.id} -> ${p.cardId}`).toBeDefined();
  });
  it('has the special printings: 52 Alternate Art, 10 Masterworks, 10 Omegas, 8 tokens', () => {
    const count = (k: string) => SET1_PRINTINGS.filter((p) => p.kind === k).length;
    expect([count('alt'), count('masterwork'), count('omega'), count('token')]).toEqual([52, 10, 10, 8]);
  });
  it('has an image file for every printing', () => {
    for (const p of SET1_PRINTINGS) expect(existsSync(`public/${p.img}`), p.img).toBe(true);
  });
});
