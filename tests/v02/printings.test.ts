import { existsSync, readFileSync } from 'node:fs';
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
  it('uses the Set 1 digital rarity (rarity rubric, owner decision 2026-10-12), not the printed tier letter', () => {
    const digital: Record<string, string> = JSON.parse(readFileSync('prototype-v0.2/data/set1-digital-rarity.json', 'utf8')).rarity;
    for (const p of SET1_PRINTINGS.filter((x) => x.kind !== 'token')) expect(p.rarity, `${p.id} ${p.cardId}`).toBe(digital[p.cardId]);
    const count = (r: string) => SET1_PRINTINGS.filter((p) => p.kind === 'base' && p.rarity === r).length;
    // Rarity is per card, never by tier: Tier V Aurex ★★ is Uncommon and Tier I Torren ★★★ is Mythic.
    expect(digital['aurex-2']).toBe('uncommon');
    expect(digital['torren-3']).toBe('mythic');
    expect(count('mythic')).toBeLessThan(20);
    for (const r of ['common', 'uncommon', 'elite', 'epic', 'mythic']) expect(count(r)).toBeGreaterThan(0);
  });
  it('has an image file for every printing', () => {
    for (const p of SET1_PRINTINGS) expect(existsSync(`public/${p.img}`), p.img).toBe(true);
  });
});
