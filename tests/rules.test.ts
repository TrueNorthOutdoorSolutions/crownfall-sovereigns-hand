import { describe, expect, it } from 'vitest';
import { catalog, decks, champions } from '../src/content/prototype';
import { prototypePrinting } from '../src/content/editions';
import { applyAction, armyTrait, createGame, isLegal, legalActions, replay, stats, RULES } from '../src/game/rules';
import { chooseAction } from '../src/game/ai';
import type { GameState, Unit, Player, Front } from '../src/game/types';

function unit(card: string, owner: Player, front: Front, uid: number, extra: Partial<Unit> = {}): Unit {
  return { card, owner, front, uid, stars: 1, wounds: 0, growth: 0, item: null, ...extra };
}
function battle(state: GameState) {
  if (state.phase === 'resolution') state = applyAction(state, { type: 'continue' });
  state.active = 0; state.passes = 0;
  return applyAction(applyAction(state, { type: 'pass' }), { type: 'pass' });
}
describe('deterministic match rules', () => {
  it('builds legal 30-card decks, preserves seeded order, and never mutates inputs', () => {
    const s = createGame(71), saved = structuredClone(s);
    expect(s).toEqual(createGame(71)); expect(s.players[0].deck.length).toBe(25);
    for (const id of decks.dawn.ids) expect([...s.players[0].hand, ...s.players[0].deck].filter(x => x === id)).toHaveLength(3);
    applyAction(s, { type: 'pass' }); expect(s).toEqual(saved);
  });
  it('alternates one action at a time, resets pass streaks, and only resolves consecutive passes', () => {
    let s = createGame(2); s.players[1].hand = ['shp-gilded'];
    s = applyAction(s, { type: 'pass' }); expect(s.active).toBe(1);
    s = applyAction(s, { type: 'deploy', handIndex: 0, front: 'wild' }); expect(s.passes).toBe(0);
    s = applyAction(s, { type: 'pass' }); expect(s.phase).toBe('planning');
    s = applyAction(s, { type: 'pass' }); expect(s.phase).toBe('resolution');
    s = applyAction(s, { type: 'continue' }); expect(s.round).toBe(2); expect(s.active).toBe(1); expect(s.players[0].command).toBe(5);
  });
  it('enforces costs, front capacity, ownership, and the three-star ceiling', () => {
    const s = createGame(3); s.players[0].hand = ['shp-gilded', 'shp-solstice']; s.players[0].command = 1;
    s.units = [unit('shp-gilded', 0, 'wild', 1, { stars: 3 }), unit('shp-sunward', 0, 'wild', 2), unit('shp-ember', 0, 'wild', 3), unit('shp-gilded', 1, 'throne', 4)];
    expect(isLegal(s, { type: 'deploy', handIndex: 0, front: 'wild' })).toBe(false);
    expect(isLegal(s, { type: 'deploy', handIndex: 1, front: 'forge' })).toBe(false);
    expect(isLegal(s, { type: 'ascend', handIndex: 0, uid: 1 })).toBe(false);
    expect(isLegal(s, { type: 'move', uid: 4, front: 'forge' })).toBe(false);
    expect(() => applyAction(s, { type: 'equip', uid: 1, item: 'shp-item-blade' })).toThrow('Illegal action');
  });
  it('uses exactly three copies for three stars and restores Guard on ascension', () => {
    let s = createGame(1); s.players[0].hand = ['shp-sunward', 'shp-sunward', 'shp-sunward'];
    s = applyAction(s, { type: 'deploy', handIndex: 0, front: 'throne' }); s = applyAction(s, { type: 'pass' });
    s.units[0].wounds = 4;
    s = applyAction(s, { type: 'ascend', handIndex: 0, uid: 1 }); s = applyAction(s, { type: 'pass' });
    s = applyAction(s, { type: 'ascend', handIndex: 0, uid: 1 });
    expect(s.units[0].stars).toBe(3); expect(s.units[0].wounds).toBe(0); expect(s.players[0].hand).toHaveLength(0); expect(s.players[0].command).toBe(0);
  });
  it('deals damage simultaneously and spills front-to-back; tied survivors give no influence', () => {
    const s = createGame(1);
    s.units = [unit('shp-gilded', 0, 'throne', 1), unit('shp-sunward', 0, 'throne', 2), unit('shp-solstice', 1, 'throne', 3)];
    const result = battle(s), f = result.lastResolution!.fronts[1];
    expect(f.before).toEqual([6, 7]); // Dawnkin +1 each; lone duelist +2.
    expect(result.units.some(u => u.uid === 1)).toBe(false);
    expect(result.units.find(u => u.uid === 2)?.wounds).toBe(4);
    expect(result.units.some(u => u.uid === 3)).toBe(false);
    expect(f.winner).toBe(0);
    const tied = createGame(1); tied.units = [unit('shp-sunward', 0, 'wild', 1), unit('shp-sunward', 1, 'wild', 2)];
    expect(battle(tied).crown).toBe(0);
  });
  it('uses distinct identities for traits, blocks Ironbound damage, and caps Wild growth', () => {
    const s = createGame(1); s.units = [unit('shp-sunward', 0, 'wild', 1), unit('shp-sunward', 0, 'wild', 2)];
    expect(armyTrait(s, 0, 'Vanguard')).toBe(false); expect(stats(s, s.units[0]).might).toBe(2);
    s.units = [unit('shp-anvil', 0, 'forge', 1), unit('shp-cinder', 0, 'forge', 2), unit('shp-gilded', 1, 'forge', 3), unit('shp-thorn', 0, 'wild', 4, { growth: 2 })];
    const r = battle(s); expect(r.lastResolution!.fronts[2].damage[0]).toBe(0);
    expect(r.units.find(u => u.uid === 4)?.growth).toBe(2);
  });
  it('makes Forge benefits physical fixed recipes and prohibits double equipment', () => {
    let s = createGame(1); s.units = [unit('shp-anvil', 0, 'forge', 1)]; s = battle(s);
    expect(s.players[0].components).toBe(1);
    s = applyAction(s, { type: 'continue' }); s.active = 0; s.players[0].components = 2;
    s = applyAction(s, { type: 'equip', uid: 1, item: 'shp-item-blade' });
    expect(s.players[0].components).toBe(0); expect(stats(s, s.units[0]).might).toBe(4);
    s.active = 0; s.players[0].components = 2;
    expect(isLegal(s, { type: 'equip', uid: 1, item: 'shp-item-aegis' })).toBe(false);
  });
  it('requires a second positive-influence resolution at the endpoint and permits reversal', () => {
    let s = createGame(1); s.crown = 5; s.units = [unit('shp-anvil', 0, 'throne', 1)];
    s = battle(s); expect(s.crown).toBe(6); expect(s.winner).toBe(null); expect(s.claim).toBe(0);
    const tied = structuredClone(s); tied.units = []; expect(battle(tied).winner).toBe(null);
    const reversed = structuredClone(s); reversed.units = [unit('shp-anvil', 1, 'throne', 1)];
    expect(battle(reversed).claim).toBe(null);
    s = applyAction(s, { type: 'continue' }); s = battle(s); expect(s.winner).toBe(0); expect(s.phase).toBe('finished');
  });
  it('handles the round limit explicitly, including a centre-track draw', () => {
    const s = createGame(1); s.round = RULES.maxRounds; s.units = [];
    expect(battle(s).phase).toBe('finished'); expect(battle(s).winner).toBe(null);
    s.crown = -1; expect(battle(s).winner).toBe(1);
  });
  it('replays the action journal exactly, including resolved battles', () => {
    let s = createGame(19); for (let i = 0; i < 20 && s.phase !== 'finished'; i++) s = applyAction(s, chooseAction(s));
    expect(replay(s.initialSeed, s.deckIds, s.history)).toEqual(s);
  });
  it('keeps collectible editions completely separate from gameplay strength', () => {
    const standard = prototypePrinting(champions[0].id, '001');
    const sovereign = { ...standard, printingId: 'premium', treatment: 'SOVEREIGN', foil: 'etched' };
    expect(catalog[standard.gameplayCardId]).toEqual(catalog[sovereign.gameplayCardId]);
    expect(new Set(champions.map(c => c.id)).size).toBe(15);
  });
  it('AI takes an available ascension when it prevents an imminent Crown loss', () => {
    const s = createGame(1); s.active = 1; s.crown = 5; s.claim = 0; s.players[1].hand = ['shp-sunward']; s.players[1].command = 1;
    s.units = [unit('shp-sunward', 1, 'throne', 1), unit('shp-sunward', 0, 'throne', 2, { stars: 2 })];
    expect(chooseAction(s).type).toBe('ascend');
  });
  it('AI choices do not depend on the opponent’s hidden card identities or deck order', () => {
    const s = createGame(14); s.active = 1;
    const changed = structuredClone(s);
    changed.players[0].hand = changed.players[0].hand.map(() => 'shp-solstice');
    changed.players[0].deck.reverse(); changed.players[1].deck.reverse();
    expect(chooseAction(s)).toEqual(chooseAction(changed));
  });
  it('AI matches terminate, preserve card accounting, and never produce illegal actions', () => {
    for (const seed of [7, 19, 101]) {
      let s = createGame(seed), actions = 0;
      while (s.phase !== 'finished' && actions < 500) {
        const a = chooseAction(s); expect(legalActions(s)).toContainEqual(a); s = applyAction(s, a); actions++;
        for (const p of [0, 1] as Player[]) {
          const cards = s.players[p].hand.length + s.players[p].deck.length + s.players[p].discard.length + s.units.filter(u => u.owner === p).reduce((n, u) => n + u.stars, 0);
          expect(cards).toBe(30); expect(s.players[p].command).toBeGreaterThanOrEqual(0);
        }
      }
      expect(s.phase).toBe('finished'); expect(actions).toBeLessThan(500);
    }
  });
});
