import { describe, expect, it } from 'vitest';
import { SET1_PRINTINGS } from '../../src/v02/content/printings';
import { FINISH_MULT, devGrant, forge, forgePrice, getProfile, ownKey, salvageOne, salvageValue } from '../../src/v02/economy/profile';

describe('forge and salvage any finish', () => {
  const p = SET1_PRINTINGS.find((x) => x.kind === 'base')!;
  it('prices rise steeply by finish and Starstones mirror pack pricing', () => {
    const order = ['normal', 'holo', 'gilded', 'prismatic', 'rainbow'] as const;
    for (let i = 1; i < order.length; i++) expect(FINISH_MULT[order[i]]).toBeGreaterThan(FINISH_MULT[order[i - 1]]);
    const pr = forgePrice('mythic', 'rainbow');
    expect(pr.starstones).toBe(Math.ceil(pr.valor / 10));
    expect(salvageValue('common', 'holo')).toBeLessThan(forgePrice('common', 'holo').valor);
  });
  it('forges with Valor or Starstones and salvages one copy', () => {
    devGrant(100000, 10000);
    const k = ownKey(p.id, 'gilded'), before = getProfile().owned[k] ?? 0, v0 = getProfile().valor, s0 = getProfile().starstones;
    expect(forge(p.id, 'gilded', 'valor')).toBeNull();
    expect(getProfile().valor).toBe(v0 - forgePrice(p.rarity, 'gilded').valor);
    expect(forge(p.id, 'gilded', 'starstones')).toBeNull();
    expect(getProfile().starstones).toBe(s0 - forgePrice(p.rarity, 'gilded').starstones);
    expect(getProfile().owned[k]).toBe(before + 2);
    const v1 = getProfile().valor;
    expect(salvageOne(p.id, 'gilded')).toBe(salvageValue(p.rarity, 'gilded'));
    expect(getProfile().valor).toBe(v1 + salvageValue(p.rarity, 'gilded'));
    expect(getProfile().owned[k]).toBe(before + 1);
  });
  it('refuses special printings and copies you do not own', () => {
    const alt = SET1_PRINTINGS.find((x) => x.kind === 'alt')!;
    expect(typeof forge(alt.id, 'normal')).toBe('string');
    expect(typeof salvageOne(p.id, 'rainbow')).toBe(getProfile().owned[ownKey(p.id, 'rainbow')] ? 'number' : 'string');
  });
});
