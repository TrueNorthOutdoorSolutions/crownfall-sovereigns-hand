// Set 1: every Crownfall champion not in a starter deck, each with ★, ★★ and ★★★ forms.
// Names, titles, tiers, Origins, Classes and ability names are canonical (checked by prototype-v0.2/tools/validate.mjs).
// Might, Guard, costs and card text are DRAFT card-game design: not yet in any deck and not yet balance-tested.
// Each design follows the champion's Crownfall ability and combat role. Only the engine's proven effect vocabulary is used,
// so every card here is already playable by the rules engine.
import type { ChampionLine, Effect } from './cards';

const sc = (n: number): Effect => ({ op: 'scorch', n, target: 'chooseRival' });
const scAll = (n: number): Effect => ({ op: 'scorchAll', n });
const scDef = (n: number): Effect => ({ op: 'scorch', n, target: 'defender' });
const scAtt = (n: number): Effect => ({ op: 'scorch', n, target: 'attacker' });
const weaken = (n: number): Effect => ({ op: 'buff', might: -n, guard: 0, target: 'chooseRival' });
const weakenDef = (n: number): Effect => ({ op: 'buff', might: -n, guard: 0, target: 'defender' });
const shSelf: Effect = { op: 'shield', target: 'self' };
const shOwn: Effect = { op: 'shield', target: 'chooseOwn' };
const shOther: Effect = { op: 'shield', target: 'chooseOwnOther' };
const shAll: Effect = { op: 'shieldAll' };
const draw = (n: number): Effect => ({ op: 'draw', n });
const ret: Effect = { op: 'returnFallen', optional: false };
const retOpt: Effect = { op: 'returnFallen', optional: true };
const fromHand = (maxCost: number): Effect => ({ op: 'deployFree', maxCost });
const fromFallen = (maxCost: number): Effect => ({ op: 'deployFromFallen', maxCost });
const sweep = (n: number): Effect => ({ op: 'defeatGuardAtMost', n });
const ready: Effect = { op: 'readyOncePerTurn' };
const readyOther: Effect = { op: 'readyOther' };
const readySelf: Effect = { op: 'readySelf' };
const stop: Effect = { op: 'stopOthersAttacking' };
const again = (name: string) => `Once per turn, when ${name} defeats a champion on your turn, ready ${name}.`;

export const SET1_LINES: ChampionLine[] = [
  // ───────────────────────────── TIER I ─────────────────────────────
  {
    canonId: 'bramble', name: 'Bramble', title: 'Sapling of the Greenwall', tier: 1, origins: ['verdant'], classes: ['warden'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 3, keywords: [], ability: 'Rootslam', text: 'Block: Scorch 1 the attacker.', block: [scAtt(1)] },
      { star: 2, cost: 0, might: 4, guard: 6, keywords: ['Bulwark'], ability: 'Rootslam', text: 'Block: Scorch 2 the attacker.', block: [scAtt(2)] },
      { star: 3, cost: 1, might: 7, guard: 10, keywords: ['Bulwark'], ability: 'Rootslam',
        text: 'Ascend: Scorch 2 each rival champion. Block: Scorch 2 the attacker.', ascend: [scAll(2)], block: [scAtt(2)] },
    ],
  },
  {
    canonId: 'kira', name: 'Kira Volt', title: 'Arc-Tech Prodigy', tier: 1, origins: ['voltborn'], classes: ['ranger'],
    forms: [
      { star: 1, cost: 1, might: 2, guard: 1, keywords: ['Charge'], text: '' },
      { star: 2, cost: 0, might: 5, guard: 3, keywords: ['Charge'], ability: 'Overcharged Round', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 3, cost: 1, might: 9, guard: 6, keywords: ['Charge'], ability: 'Overcharged Round', text: 'Attack: Scorch 2 each rival champion.', attack: [scAll(2)] },
    ],
  },
  {
    canonId: 'grimm', name: 'Grimm', title: 'The Soldier Who Stayed', tier: 1, origins: ['hollow'], classes: ['vanguard'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 3, keywords: [], ability: 'Refuse Death', text: 'Block: Shield Grimm.', block: [shSelf] },
      { star: 2, cost: 0, might: 4, guard: 6, keywords: [], ability: 'Refuse Death',
        text: 'Block: Shield Grimm. Ascend: Return a ★ champion from your Fallen pile to your hand.', block: [shSelf], ascend: [ret] },
      { star: 3, cost: 1, might: 7, guard: 10, keywords: ['Bulwark'], ability: 'Refuse Death',
        text: 'Block: Shield Grimm. Ascend: Return a ★ champion from your Fallen pile to your hand.', block: [shSelf], ascend: [ret] },
    ],
  },
  {
    canonId: 'pip', name: 'Pip', title: 'Demolitions Enthusiast', tier: 1, origins: ['gearbound'], classes: ['saboteur'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 1, keywords: [], ability: 'Special Delivery', text: 'Arrival: Scorch 1 each rival champion.', arrive: [scAll(1)] },
      { star: 2, cost: 1, might: 3, guard: 4, keywords: [], ability: 'Special Delivery',
        text: 'Ascend: Scorch 1 each rival champion. Attack: Scorch 1 each rival champion.', ascend: [scAll(1)], attack: [scAll(1)] },
      { star: 3, cost: 1, might: 7, guard: 7, keywords: [], ability: 'Special Delivery',
        text: 'Ascend: Scorch 2 each rival champion. Attack: Scorch 1 each rival champion.', ascend: [scAll(2)], attack: [scAll(1)] },
    ],
  },
  {
    canonId: 'torren', name: 'Torren', title: 'Shield of the Deep', tier: 1, origins: ['titanborn'], classes: ['warden'],
    forms: [
      { star: 1, cost: 2, might: 1, guard: 5, keywords: ['Bulwark'], text: '' },
      { star: 2, cost: 0, might: 3, guard: 8, keywords: ['Bulwark'], ability: 'Stonewall', text: 'Your other champions have +1 Guard.', statics: { auraGuard: 1 } },
      { star: 3, cost: 1, might: 6, guard: 12, keywords: ['Bulwark'], ability: 'Stonewall',
        text: 'Ascend: Shield each champion you control. Your other champions have +1 Guard.', ascend: [shAll], statics: { auraGuard: 1 } },
    ],
  },
  {
    canonId: 'nyx', name: 'Nyx', title: 'The Quiet Hand', tier: 1, origins: ['umbral'], classes: ['assassin'],
    forms: [
      { star: 1, cost: 1, might: 3, guard: 1, keywords: ['Ambush'], text: '' },
      { star: 2, cost: 0, might: 6, guard: 3, keywords: ['Ambush'], ability: 'Fade', text: 'Attack: Scorch 1 the defender.', attack: [scDef(1)] },
      { star: 3, cost: 1, might: 10, guard: 5, keywords: ['Ambush', 'Flight'], ability: 'Fade', text: 'Attack: Scorch 2 the defender.', attack: [scDef(2)] },
    ],
  },
  {
    canonId: 'hexie', name: 'Hexie', title: 'Apprentice of Mischief', tier: 1, origins: ['hexbound'], classes: ['arcanist'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 2, keywords: [], ability: 'Unstable Hex', text: 'Arrival: A rival champion gets −2 Might this turn.', arrive: [weaken(2)] },
      { star: 2, cost: 0, might: 3, guard: 5, keywords: [], ability: 'Unstable Hex', text: 'Ascend: A rival champion gets −3 Might this turn.', ascend: [weaken(3)] },
      { star: 3, cost: 1, might: 6, guard: 8, keywords: [], ability: 'Unstable Hex',
        text: 'Ascend: A rival champion gets −4 Might this turn. Attack: Scorch 1 the defender.', ascend: [weaken(4)], attack: [scDef(1)] },
    ],
  },
  {
    canonId: 'bolt', name: 'Bolt', title: 'Unit B-07', tier: 1, origins: ['gearbound'], classes: ['vanguard'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 3, keywords: [], ability: 'Emergency Plating', text: 'Arrival: Shield Bolt.', arrive: [shSelf] },
      { star: 2, cost: 0, might: 4, guard: 7, keywords: ['Bulwark'], ability: 'Emergency Plating', text: 'Ascend: Shield Bolt.', ascend: [shSelf] },
      { star: 3, cost: 1, might: 7, guard: 11, keywords: ['Bulwark'], ability: 'Emergency Plating',
        text: 'Ascend: Shield Bolt. Your other champions have +1 Guard.', ascend: [shSelf], statics: { auraGuard: 1 } },
    ],
  },

  // ───────────────────────────── TIER II ─────────────────────────────
  {
    canonId: 'gearwick', name: 'Gearwick-9', title: 'Siege Calculator', tier: 2, origins: ['gearbound'], classes: ['artillerist'],
    forms: [
      { star: 1, cost: 3, might: 3, guard: 2, keywords: ['Reach'], ability: 'Mortar Protocol', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 2, cost: 1, might: 6, guard: 5, keywords: ['Reach'], ability: 'Mortar Protocol',
        text: 'Ascend: Scorch 1 each rival champion. Attack: Scorch 1 each rival champion.', ascend: [scAll(1)], attack: [scAll(1)] },
      { star: 3, cost: 2, might: 9, guard: 8, keywords: ['Reach'], ability: 'Mortar Protocol', text: 'Attack: Scorch 2 each rival champion.', attack: [scAll(2)] },
    ],
  },
  {
    canonId: 'shade', name: 'Shade', title: 'The Mask With No Face', tier: 2, origins: ['umbral'], classes: ['assassin'],
    forms: [
      { star: 1, cost: 2, might: 3, guard: 1, keywords: ['Ambush'], text: '' },
      { star: 2, cost: 1, might: 6, guard: 3, keywords: ['Ambush'], ability: 'Execution Mark', text: again('Shade'), defeats: [ready] },
      { star: 3, cost: 2, might: 10, guard: 5, keywords: ['Ambush'], ability: 'Execution Mark',
        text: `Ascend: Defeat each rival champion with Guard 1 or less. ${again('Shade')}`, ascend: [sweep(1)], defeats: [ready] },
    ],
  },
  {
    canonId: 'borin', name: 'Borin Ironbelly', title: 'Forgekin Hearthbreaker', tier: 2, origins: ['titanborn'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 3, might: 3, guard: 4, keywords: [], ability: 'Molten Hammer', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Molten Hammer', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 3, cost: 2, might: 10, guard: 10, keywords: ['Bulwark'], ability: 'Molten Hammer', text: 'Attack: Scorch 2 each rival champion.', attack: [scAll(2)] },
    ],
  },
  {
    canonId: 'seren', name: 'Seren', title: 'Keeper of Starlings', tier: 2, origins: ['astral'], classes: ['summoner'],
    forms: [
      { star: 1, cost: 2, might: 1, guard: 2, keywords: [], ability: 'Starling', text: 'Arrival: Draw a card.', arrive: [draw(1)] },
      { star: 2, cost: 1, might: 3, guard: 5, keywords: ['Flight'], ability: 'Starling',
        text: 'Ascend: Deploy a ★ champion costing 2 or less from your hand for free.', ascend: [fromHand(2)] },
      { star: 3, cost: 2, might: 6, guard: 8, keywords: ['Flight'], ability: 'Starling',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your hand for free. Draw a card.', ascend: [fromHand(3), draw(1)] },
    ],
  },
  {
    canonId: 'thorn', name: 'Thorn', title: 'Blighted Bloom', tier: 2, origins: ['verdant'], classes: ['saboteur'],
    forms: [
      { star: 1, cost: 2, might: 2, guard: 2, keywords: [], ability: 'Toxic Bloom', text: 'Arrival: Scorch 1 each rival champion.', arrive: [scAll(1)] },
      { star: 2, cost: 1, might: 4, guard: 5, keywords: [], ability: 'Toxic Bloom',
        text: 'Ascend: Scorch 1 each rival champion. Block: Scorch 2 the attacker.', ascend: [scAll(1)], block: [scAtt(2)] },
      { star: 3, cost: 2, might: 7, guard: 8, keywords: [], ability: 'Toxic Bloom',
        text: 'Ascend: Scorch 2 each rival champion. Block: Scorch 2 the attacker.', ascend: [scAll(2)], block: [scAtt(2)] },
    ],
  },
  {
    canonId: 'dax', name: 'Dax Meridian', title: 'The Gun Between Worlds', tier: 2, origins: ['riftborn'], classes: ['ranger'],
    forms: [
      { star: 1, cost: 2, might: 3, guard: 2, keywords: ['Reach'], ability: 'Ricochet', text: 'Attack: Scorch 1 a rival champion.', attack: [sc(1)] },
      { star: 2, cost: 1, might: 6, guard: 4, keywords: ['Flight'], ability: 'Ricochet', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 3, cost: 2, might: 10, guard: 7, keywords: ['Flight'], ability: 'Ricochet', text: 'Attack: Scorch 2 each rival champion.', attack: [scAll(2)] },
    ],
  },
  {
    canonId: 'rask', name: 'Rask', title: 'Pit Champion of Sszar', tier: 2, origins: ['wildkin'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 2, might: 3, guard: 2, keywords: [], ability: "Predator's Rhythm",
        text: '+1 Might while you have fewer shards than your rival.', statics: { mightIfBehind: 1 } },
      { star: 2, cost: 1, might: 6, guard: 5, keywords: [], ability: "Predator's Rhythm",
        text: `+1 Might while you have fewer shards than your rival. ${again('Rask')}`, statics: { mightIfBehind: 1 }, defeats: [ready] },
      { star: 3, cost: 2, might: 10, guard: 8, keywords: ['Ambush'], ability: "Predator's Rhythm",
        text: `+1 Might while you have fewer shards than your rival. ${again('Rask')}`, statics: { mightIfBehind: 1 }, defeats: [ready] },
    ],
  },
  {
    canonId: 'hex3', name: 'HEX-3', title: 'Arcane Prototype', tier: 2, origins: ['gearbound'], classes: ['arcanist'],
    forms: [
      { star: 1, cost: 2, might: 2, guard: 3, keywords: [], ability: 'Mana Reactor', text: 'Attack: Scorch 2 the defender.', attack: [scDef(2)] },
      { star: 2, cost: 1, might: 5, guard: 6, keywords: [], ability: 'Mana Reactor',
        text: 'Ascend: Scorch 1 each rival champion. Attack: Scorch 2 the defender.', ascend: [scAll(1)], attack: [scDef(2)] },
      { star: 3, cost: 2, might: 8, guard: 9, keywords: ['Bulwark'], ability: 'Mana Reactor', text: 'Attack: Scorch 3 the defender.', attack: [scDef(3)] },
    ],
  },

  // ───────────────────────────── TIER III ─────────────────────────────
  {
    canonId: 'valkara', name: 'Valkara', title: 'Wing of Judgment', tier: 3, origins: ['astral'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 3, might: 4, guard: 3, keywords: ['Flight'], text: '' },
      { star: 2, cost: 1, might: 7, guard: 6, keywords: ['Flight'], ability: 'Judgment Dive', text: 'Ascend: Scorch 2 a rival champion.', ascend: [sc(2)] },
      { star: 3, cost: 2, might: 11, guard: 9, keywords: ['Flight'], ability: 'Judgment Dive', text: 'Ascend: Scorch 2 each rival champion.', ascend: [scAll(2)] },
    ],
  },
  {
    canonId: 'dreadmouth', name: 'Dreadmouth', title: 'The Hunger Below', tier: 3, origins: ['hollow'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 4, might: 5, guard: 4, keywords: [], ability: 'Devour', text: 'When Dreadmouth defeats a champion on your turn, Shield Dreadmouth.', defeats: [shSelf] },
      { star: 2, cost: 1, might: 8, guard: 7, keywords: [], ability: 'Devour', text: 'When Dreadmouth defeats a champion on your turn, Shield Dreadmouth.', defeats: [shSelf] },
      { star: 3, cost: 2, might: 12, guard: 10, keywords: [], ability: 'Devour',
        text: 'When Dreadmouth defeats a champion on your turn, Shield Dreadmouth. Attack: Scorch 2 the defender.', defeats: [shSelf], attack: [scDef(2)] },
    ],
  },
  {
    canonId: 'spark', name: 'Professor Spark', title: 'Arc-Engineer Extraordinaire', tier: 3, origins: ['gearbound'], classes: ['summoner'],
    forms: [
      { star: 1, cost: 3, might: 2, guard: 3, keywords: [], ability: 'Deploy Turret',
        text: 'Arrival: Deploy a ★ champion costing 1 or less from your hand for free.', arrive: [fromHand(1)] },
      { star: 2, cost: 1, might: 5, guard: 6, keywords: [], ability: 'Deploy Turret',
        text: 'Ascend: Deploy a ★ champion costing 2 or less from your hand for free.', ascend: [fromHand(2)] },
      { star: 3, cost: 2, might: 8, guard: 9, keywords: ['Bulwark'], ability: 'Deploy Turret',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your hand for free. Your other champions have +1 Guard.',
        ascend: [fromHand(3)], statics: { auraGuard: 1 } },
    ],
  },
  {
    canonId: 'orion', name: 'Orion', title: 'The Constellation Sniper', tier: 3, origins: ['astral'], classes: ['ranger'],
    forms: [
      { star: 1, cost: 3, might: 4, guard: 2, keywords: ['Reach'], ability: 'Constellation Shot', text: 'Attack: Scorch 2 the defender.', attack: [scDef(2)] },
      { star: 2, cost: 1, might: 7, guard: 5, keywords: ['Reach'], ability: 'Constellation Shot',
        text: 'Ascend: Scorch 3 a rival champion. Attack: Scorch 2 the defender.', ascend: [sc(3)], attack: [scDef(2)] },
      { star: 3, cost: 2, might: 11, guard: 8, keywords: ['Reach'], ability: 'Constellation Shot',
        text: 'Ascend: Scorch 4 a rival champion. Attack: Scorch 2 the defender.', ascend: [sc(4)], attack: [scDef(2)] },
    ],
  },
  {
    canonId: 'maeve', name: 'Maeve', title: 'The Old Bargain', tier: 3, origins: ['verdant', 'hexbound'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 3, might: 2, guard: 4, keywords: [], ability: "Nature's Bargain",
        text: 'Arrival: A rival champion gets −2 Might this turn. Shield another champion you control.', arrive: [weaken(2), shOther] },
      { star: 2, cost: 1, might: 4, guard: 7, keywords: [], ability: "Nature's Bargain",
        text: 'Ascend: A rival champion gets −3 Might this turn. Shield a champion you control.', ascend: [weaken(3), shOwn] },
      { star: 3, cost: 2, might: 7, guard: 10, keywords: [], ability: "Nature's Bargain",
        text: 'Ascend: Scorch 2 each rival champion. Shield each champion you control.', ascend: [scAll(2), shAll] },
    ],
  },
  {
    canonId: 'ronin', name: 'Ronin Zero', title: 'The Frame That Wanders', tier: 3, origins: ['voltborn'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 3, might: 4, guard: 3, keywords: ['Charge'], text: '' },
      { star: 2, cost: 1, might: 7, guard: 6, keywords: ['Charge'], ability: 'Zero Frame', text: again('Ronin Zero'), defeats: [ready] },
      { star: 3, cost: 2, might: 11, guard: 9, keywords: ['Charge', 'Ambush'], ability: 'Zero Frame', text: again('Ronin Zero'), defeats: [ready] },
    ],
  },
  {
    canonId: 'morrow', name: 'Morrow', title: 'The Gravecaller', tier: 3, origins: ['hollow'], classes: ['summoner'],
    forms: [
      { star: 1, cost: 3, might: 2, guard: 3, keywords: [], ability: 'Raise Fallen',
        text: 'Arrival: Return a ★ champion from your Fallen pile to your hand.', arrive: [ret] },
      { star: 2, cost: 1, might: 5, guard: 6, keywords: [], ability: 'Raise Fallen',
        text: 'Ascend: Deploy a ★ champion costing 2 or less from your Fallen pile for free.', ascend: [fromFallen(2)] },
      { star: 3, cost: 2, might: 8, guard: 9, keywords: [], ability: 'Raise Fallen',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your Fallen pile for free. Return a ★ champion from your Fallen pile to your hand.',
        ascend: [fromFallen(3), retOpt] },
    ],
  },
  {
    canonId: 'blacktide', name: 'Captain Blacktide', title: 'Terror of the Rift Seas', tier: 3, origins: ['riftborn'], classes: ['artillerist'],
    forms: [
      { star: 1, cost: 4, might: 4, guard: 3, keywords: ['Reach'], ability: 'Broadside', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 2, cost: 1, might: 7, guard: 6, keywords: ['Reach'], ability: 'Broadside', text: 'Attack: Scorch 2 each rival champion.', attack: [scAll(2)] },
      { star: 3, cost: 2, might: 10, guard: 9, keywords: ['Reach'], ability: 'Broadside',
        text: 'Ascend: Scorch 2 each rival champion. Attack: Scorch 2 each rival champion.', ascend: [scAll(2)], attack: [scAll(2)] },
    ],
  },
  {
    canonId: 'knuckle', name: 'Knuckle', title: 'Pit King', tier: 3, origins: ['titanborn'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 4, might: 5, guard: 5, keywords: [], ability: 'Arena Breaker', text: 'Attack: The defender gets −2 Might this turn.', attack: [weakenDef(2)] },
      { star: 2, cost: 1, might: 8, guard: 8, keywords: [], ability: 'Arena Breaker', text: 'Attack: The defender gets −3 Might this turn.', attack: [weakenDef(3)] },
      { star: 3, cost: 2, might: 12, guard: 11, keywords: ['Bulwark'], ability: 'Arena Breaker', text: 'Attack: The defender gets −4 Might this turn.', attack: [weakenDef(4)] },
    ],
  },
  {
    canonId: 'zyrak', name: 'Zyrak', title: 'Shard of the Far Lattice', tier: 3, origins: ['riftborn'], classes: ['arcanist'],
    forms: [
      { star: 1, cost: 3, might: 2, guard: 3, keywords: ['Flight'], ability: 'Prismatic Collapse', text: 'Arrival: Scorch 2 a rival champion.', arrive: [sc(2)] },
      { star: 2, cost: 1, might: 5, guard: 6, keywords: ['Flight'], ability: 'Prismatic Collapse', text: 'Ascend: Scorch 2 each rival champion.', ascend: [scAll(2)] },
      { star: 3, cost: 2, might: 8, guard: 9, keywords: ['Flight'], ability: 'Prismatic Collapse', text: 'Ascend: Scorch 3 each rival champion.', ascend: [scAll(3)] },
    ],
  },

  // ───────────────────────────── TIER IV ─────────────────────────────
  {
    canonId: 'astryon', name: 'Astryon', title: 'The Seven-Star Blade', tier: 4, origins: ['astral'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 5, might: 6, guard: 4, keywords: ['Flight'], ability: 'Seven-Star Dance', text: 'Attack: Scorch 1 each rival champion.', attack: [scAll(1)] },
      { star: 2, cost: 1, might: 9, guard: 7, keywords: ['Flight'], ability: 'Seven-Star Dance',
        text: `Attack: Scorch 1 each rival champion. ${again('Astryon')}`, attack: [scAll(1)], defeats: [ready] },
      { star: 3, cost: 2, might: 13, guard: 10, keywords: ['Flight'], ability: 'Seven-Star Dance',
        text: `Attack: Scorch 2 each rival champion. ${again('Astryon')}`, attack: [scAll(2)], defeats: [ready] },
    ],
  },
  {
    canonId: 'vespera', name: 'Queen Vespera', title: 'Monarch of the Umbral Court', tier: 4, origins: ['umbral'], classes: ['summoner'],
    forms: [
      { star: 1, cost: 4, might: 3, guard: 4, keywords: [], ability: 'Court of Shadows',
        text: 'Arrival: Deploy a ★ champion costing 2 or less from your hand for free.', arrive: [fromHand(2)] },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Court of Shadows',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your hand for free. Your other champions have +1 Might.',
        ascend: [fromHand(3)], statics: { auraMight: 1 } },
      { star: 3, cost: 2, might: 9, guard: 10, keywords: [], ability: 'Court of Shadows',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your Fallen pile for free. Your other champions have +1 Might.',
        ascend: [fromFallen(3)], statics: { auraMight: 1 } },
    ],
  },
  {
    canonId: 'titanrho', name: 'Titan Rho', title: 'The Last Fortress', tier: 4, origins: ['gearbound'], classes: ['warden'],
    forms: [
      { star: 1, cost: 5, might: 3, guard: 8, keywords: ['Bulwark', 'Reach'], text: '' },
      { star: 2, cost: 1, might: 6, guard: 11, keywords: ['Bulwark', 'Reach'], ability: 'Fortress Mode',
        text: 'Ascend: Shield Titan Rho. Block: Scorch 2 the attacker.', ascend: [shSelf], block: [scAtt(2)] },
      { star: 3, cost: 2, might: 9, guard: 14, keywords: ['Bulwark', 'Reach'], ability: 'Fortress Mode',
        text: 'Ascend: Shield each champion you control. Block: Scorch 3 the attacker.', ascend: [shAll], block: [scAtt(3)] },
    ],
  },
  {
    canonId: 'elysian', name: 'Elysian', title: 'Grace of the Firmament', tier: 4, origins: ['astral'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 5, might: 3, guard: 6, keywords: ['Flight'], ability: 'Divine Intervention', text: 'Arrival: Shield each champion you control.', arrive: [shAll] },
      { star: 2, cost: 1, might: 6, guard: 9, keywords: ['Flight'], ability: 'Divine Intervention',
        text: 'Ascend: Shield each champion you control. Your other champions have +1 Guard.', ascend: [shAll], statics: { auraGuard: 1 } },
      { star: 3, cost: 2, might: 9, guard: 12, keywords: ['Flight'], ability: 'Divine Intervention',
        text: 'Ascend: Shield each champion you control, then Mend 1.', ascend: [shAll, { op: 'mend' }] },
    ],
  },
  {
    canonId: 'veilwalker', name: 'Veilwalker', title: 'The Anomaly', tier: 4, origins: ['riftborn'], classes: ['assassin'],
    forms: [
      { star: 1, cost: 4, might: 6, guard: 3, keywords: ['Flight', 'Ambush'], text: '' },
      { star: 2, cost: 1, might: 9, guard: 6, keywords: ['Flight', 'Ambush'], ability: 'Reality Cut', text: 'Attack: Scorch 2 the defender.', attack: [scDef(2)] },
      { star: 3, cost: 2, might: 13, guard: 8, keywords: ['Flight', 'Ambush'], ability: 'Reality Cut',
        text: 'Ascend: Defeat each rival champion with Guard 2 or less. Attack: Scorch 2 the defender.', ascend: [sweep(2)], attack: [scDef(2)] },
    ],
  },
  {
    canonId: 'gaia', name: 'Gaia Prime', title: 'The Worldroot', tier: 4, origins: ['verdant'], classes: ['warden'],
    forms: [
      { star: 1, cost: 5, might: 3, guard: 7, keywords: ['Bulwark'], ability: 'Worldroot', text: 'Arrival: Scorch 2 each rival champion.', arrive: [scAll(2)] },
      { star: 2, cost: 1, might: 6, guard: 10, keywords: ['Bulwark'], ability: 'Worldroot',
        text: 'Ascend: Scorch 2 each rival champion. Your other champions have +1 Guard.', ascend: [scAll(2)], statics: { auraGuard: 1 } },
      { star: 3, cost: 2, might: 9, guard: 13, keywords: ['Bulwark'], ability: 'Worldroot',
        text: 'Ascend: Scorch 3 each rival champion. Your other champions have +1 Guard.', ascend: [scAll(3)], statics: { auraGuard: 1 } },
    ],
  },
  {
    canonId: 'ladyvolt', name: 'Lady Volt', title: 'Thunder in Heels', tier: 4, origins: ['voltborn'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 4, might: 5, guard: 3, keywords: ['Charge'], ability: 'Thunderstep', text: again('Lady Volt'), defeats: [ready] },
      { star: 2, cost: 1, might: 8, guard: 6, keywords: ['Charge'], ability: 'Thunderstep',
        text: `Attack: Scorch 1 each rival champion. ${again('Lady Volt')}`, attack: [scAll(1)], defeats: [ready] },
      { star: 3, cost: 2, might: 12, guard: 9, keywords: ['Charge'], ability: 'Thunderstep',
        text: `Ascend: Ready another champion you control. ${again('Lady Volt')}`, ascend: [readyOther], defeats: [ready] },
    ],
  },
  {
    canonId: 'vessimer', name: 'Vessimer', title: 'The Tinctor', tier: 4, origins: ['hexbound'], classes: ['saboteur'],
    forms: [
      { star: 1, cost: 4, might: 3, guard: 4, keywords: [], ability: 'Grand Experiment',
        text: 'Arrival: Scorch 2 a rival champion. A rival champion gets −2 Might this turn.', arrive: [sc(2), weaken(2)] },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Grand Experiment',
        text: 'Ascend: Scorch 2 each rival champion. Shield a champion you control.', ascend: [scAll(2), shOwn] },
      { star: 3, cost: 2, might: 9, guard: 10, keywords: [], ability: 'Grand Experiment',
        text: 'Ascend: Scorch 2 each rival champion. Shield each champion you control. Draw a card.', ascend: [scAll(2), shAll, draw(1)] },
    ],
  },

  // ───────────────────────────── TIER V (Ascendants) ─────────────────────────────
  {
    canonId: 'noctara', name: 'Noctara', title: 'Empress of Nothing', tier: 5, origins: ['umbral'], classes: ['ascendant', 'arcanist'],
    forms: [
      { star: 1, cost: 6, might: 6, guard: 7, keywords: ['Ascendant'], ability: 'THE UNMAKING', text: 'Arrival: Scorch 2 each rival champion.', arrive: [scAll(2)] },
      { star: 2, cost: 2, might: 8, guard: 10, keywords: ['Ascendant', 'Flight'], ability: 'THE UNMAKING',
        text: 'Ascend: A rival champion gets −4 Might this turn. Scorch 3 a rival champion.', ascend: [weaken(4), sc(3)] },
      { star: 3, cost: 3, might: 12, guard: 13, keywords: ['Ascendant', 'Flight'], ability: 'THE UNMAKING',
        text: 'Ascend: Defeat each rival champion with Guard 4 or less. Your other champions can’t attack this turn.', ascend: [sweep(4), stop] },
    ],
  },
  {
    canonId: 'atlas', name: 'ATLAS-Ω', title: 'Final-Generation War Machine', tier: 5, origins: ['gearbound'], classes: ['ascendant', 'warden'],
    forms: [
      { star: 1, cost: 6, might: 4, guard: 10, keywords: ['Ascendant', 'Bulwark'], ability: 'OMEGA PROTOCOL', text: 'Arrival: Shield ATLAS-Ω.', arrive: [shSelf] },
      { star: 2, cost: 2, might: 7, guard: 13, keywords: ['Ascendant', 'Bulwark', 'Reach'], ability: 'OMEGA PROTOCOL',
        text: 'Your other champions have +1 Guard.', statics: { auraGuard: 1 } },
      { star: 3, cost: 3, might: 11, guard: 16, keywords: ['Ascendant', 'Bulwark', 'Reach'], ability: 'OMEGA PROTOCOL',
        text: 'Ascend: Scorch 3 each rival champion. Attack: Scorch 3 each rival champion.', ascend: [scAll(3)], attack: [scAll(3)] },
    ],
  },
  {
    canonId: 'unwritten', name: 'The Unwritten King', title: 'Lord of the Forgotten', tier: 5, origins: ['hollow'], classes: ['ascendant', 'summoner'],
    forms: [
      { star: 1, cost: 6, might: 5, guard: 7, keywords: ['Ascendant'], ability: 'THE FORGOTTEN LEGION',
        text: 'Arrival: Deploy a ★ champion costing 3 or less from your Fallen pile for free.', arrive: [fromFallen(3)] },
      { star: 2, cost: 2, might: 8, guard: 10, keywords: ['Ascendant'], ability: 'THE FORGOTTEN LEGION',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your Fallen pile for free.', ascend: [fromFallen(3)] },
      { star: 3, cost: 3, might: 12, guard: 13, keywords: ['Ascendant'], ability: 'THE FORGOTTEN LEGION',
        text: 'Ascend: Deploy a ★ champion costing 4 or less from your Fallen pile for free. Your other champions have +1 Might.',
        ascend: [fromFallen(4)], statics: { auraMight: 1 } },
    ],
  },
  {
    canonId: 'veyra', name: 'Veyra Sol', title: 'Reality Hunter', tier: 5, origins: ['riftborn'], classes: ['ascendant', 'assassin'],
    forms: [
      { star: 1, cost: 6, might: 8, guard: 5, keywords: ['Ascendant', 'Flight', 'Ambush'], text: '' },
      { star: 2, cost: 2, might: 11, guard: 8, keywords: ['Ascendant', 'Flight', 'Ambush'], ability: 'BETWEEN WORLDS', text: again('Veyra Sol'), defeats: [ready] },
      { star: 3, cost: 3, might: 15, guard: 11, keywords: ['Ascendant', 'Flight', 'Ambush'], ability: 'BETWEEN WORLDS',
        text: `Attack: Scorch 3 the defender. ${again('Veyra Sol')}`, attack: [scDef(3)], defeats: [ready] },
    ],
  },
  {
    canonId: 'mother', name: 'Mother Verdant', title: 'Life Eternal', tier: 5, origins: ['verdant'], classes: ['ascendant', 'summoner'],
    forms: [
      { star: 1, cost: 6, might: 4, guard: 9, keywords: ['Ascendant'], ability: 'LIFE ETERNAL', text: 'Arrival: Shield each champion you control.', arrive: [shAll] },
      { star: 2, cost: 2, might: 7, guard: 12, keywords: ['Ascendant'], ability: 'LIFE ETERNAL',
        text: 'Ascend: Return up to two ★ champions from your Fallen pile to your hand.', ascend: [retOpt, retOpt] },
      { star: 3, cost: 3, might: 10, guard: 15, keywords: ['Ascendant'], ability: 'LIFE ETERNAL',
        text: 'Ascend: Deploy a ★ champion costing 3 or less from your Fallen pile for free. Shield each champion you control. Mend 1.',
        ascend: [fromFallen(3), shAll, { op: 'mend' }] },
    ],
  },
  {
    canonId: 'crownless', name: 'Crownless', title: 'The One Who Refused', tier: 5, origins: ['crownless'], classes: ['ascendant'],
    forms: [
      { star: 1, cost: 6, might: 7, guard: 7, keywords: ['Ascendant', 'Charge'], text: '' },
      { star: 2, cost: 2, might: 10, guard: 10, keywords: ['Ascendant', 'Charge', 'Ambush'], ability: 'BREAK THE RULES',
        text: 'Ascend: Ready Crownless. (It ignores the rule that Ascending turns a champion sideways.)', ascend: [readySelf] },
      { star: 3, cost: 3, might: 14, guard: 13, keywords: ['Ascendant', 'Charge', 'Ambush', 'Flight'], ability: 'BREAK THE RULES',
        text: 'Ascend: Ready Crownless.', ascend: [readySelf] },
    ],
  },
];
