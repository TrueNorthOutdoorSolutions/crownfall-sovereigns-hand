import { describe, expect, it } from 'vitest';
import { SET1_PRINTINGS } from '../../src/v02/content/printings';
import { BUNDLES, PACK_SIZE, packOdds } from '../../src/v02/economy/odds';
import { meets, openBundle, openPack, rng } from '../../src/v02/economy/packs';

const P = Object.fromEntries(SET1_PRINTINGS.map((p) => [p.id, p]));

describe('Packs', () => {
  it('a pack is 5 Commons, 3 Uncommons, a Hero card and a foil, with no repeats among the Commons and Uncommons', () => {
    const r = rng(1);
    for (let i = 0; i < 500; i++) {
      const pk = openPack(r);
      expect(pk).toHaveLength(PACK_SIZE);
      const commons = pk.filter((c) => c.slot === 'common'), uncommons = pk.filter((c) => c.slot === 'uncommon');
      expect(commons.every((c) => P[c.printing].rarity === 'common' && P[c.printing].kind === 'base')).toBe(true);
      expect(uncommons.every((c) => P[c.printing].rarity === 'uncommon' && P[c.printing].kind === 'base')).toBe(true);
      expect(new Set([...commons, ...uncommons].map((c) => c.printing)).size).toBe(8);
      expect(pk.find((c) => c.slot === 'foil')!.finish).toMatch(/holo|gilded|prismatic|rainbow/);
      const hero = pk.find((c) => c.slot === 'hero')!;
      const hp = P[hero.printing];
      expect(hp.kind === 'base' ? ['elite', 'epic', 'mythic'].includes(hp.rarity) : true).toBe(true);
      if (hp.kind === 'masterwork' || hp.kind === 'omega') expect(hero.finish).toBe('gilded');
    }
  });
  it('tokens are never in packs', () => {
    const r = rng(2);
    for (let i = 0; i < 300; i++) expect(openPack(r).some((c) => P[c.printing].kind === 'token')).toBe(false);
  });
  it('the same seed opens the same bundle', () => {
    expect(openBundle(99, BUNDLES[2])).toEqual(openBundle(99, BUNDLES[2]));
  });
  it('the published odds match what 40,000 opened packs actually give (within tolerance)', () => {
    const r = rng(12345), N = 40000, odds = packOdds(1);
    let mythic = 0, alt = 0, rainbow = 0, foilMythic = 0;
    for (let i = 0; i < N; i++) {
      const pk = openPack(r);
      if (pk.some((c) => P[c.printing].kind === 'base' && P[c.printing].rarity === 'mythic')) mythic++;
      if (pk.some((c) => P[c.printing].kind === 'alt')) alt++;
      if (pk.some((c) => c.finish === 'rainbow')) rainbow++;
      if (pk.some((c) => c.slot === 'foil' && P[c.printing].rarity === 'mythic')) foilMythic++;
    }
    expect(mythic / N).toBeCloseTo(odds.anyOf.mythic, 2);
    expect(alt / N).toBeCloseTo(odds.alt, 2);
    expect(rainbow / N).toBeCloseTo(odds.anyRainbow, 2);
    expect(foilMythic / N).toBeCloseTo(odds.foilOf.mythic, 2);
  });
  it('every bundle always keeps its guarantee', () => {
    for (const b of BUNDLES.filter((x) => x.guarantee)) {
      for (let seed = 1; seed <= (b.packs >= 100 ? 15 : 60); seed++) expect(meets(openBundle(seed, b), b.guarantee!), `${b.packs} packs seed ${seed}`).toBe(true);
    }
  });
  it('bigger bundles really do improve the odds', () => {
    const odds = BUNDLES.map((b) => packOdds(b.boost));
    for (let i = 1; i < odds.length; i++) {
      expect(odds[i].anyOf.mythic).toBeGreaterThan(odds[i - 1].anyOf.mythic);
      expect(odds[i].alt).toBeGreaterThan(odds[i - 1].alt);
      expect(odds[i].masterwork).toBeGreaterThan(odds[i - 1].masterwork);
    }
  });
});
