// Sovereign's Hand V0.2: the single source of card truth.
// Used by the rules engine (src/v02/rules), the AI, the print-and-play kit and the balance simulator,
// so the physical and digital games cannot drift apart.
//
// Canon rule: every champion's name, title, tier, Origins, Classes and ability names must match
// prototype-v0.2/data/canon-snapshot.json (read from Desktop/Crownfall). Might, Guard, costs and card text
// are card-game design (PROPOSED). Tactic and Scheme names are working names, not canon.

import { SET1_LINES } from './set1';

export const RULES_VERSION = '0.2-paper-1';

export type Keyword = 'Charge' | 'Bulwark' | 'Ambush' | 'Flight' | 'Reach' | 'Ascendant';

/** Who an effect points at. `choose*` targets are picked by the controlling player when the effect resolves. */
export type Effect =
  | { op: 'scorch'; n: number; target: 'chooseRival' | 'attacker' | 'defender' }
  | { op: 'scorchAll'; n: number }
  | { op: 'shield'; target: 'chooseOwn' | 'chooseOwnOther' | 'self'; optional?: boolean }
  | { op: 'shieldAll' }
  | { op: 'buffAll'; might: number; extraIfBehind?: number }
  | { op: 'buffOthers'; might: number }
  | { op: 'buff'; might: number; guard: number; target: 'chooseAny' | 'chooseRival' | 'attacker' | 'defender' }
  | { op: 'draw'; n: number }
  | { op: 'returnFallen'; optional: boolean }
  | { op: 'deployFree'; maxCost: number }
  | { op: 'deployFromFallen'; maxCost: number }
  | { op: 'readyOther' }
  | { op: 'readySelf' }
  | { op: 'mend' }
  | { op: 'defeatGuardAtMost'; n: number }
  | { op: 'stopOthersAttacking' }
  | { op: 'readyOncePerTurn' }
  | { op: 'gateBlock' }
  | { op: 'cancelAttack' };

export interface Statics {
  mightIfBehind?: number;
  mightWhileBlocking?: number;
  auraMight?: number;
  auraGuard?: number;
}

export interface ChampionForm {
  star: 1 | 2 | 3;
  /** Command cost to deploy (★) or Ascend cost (★★/★★★). */
  cost: number;
  might: number;
  guard: number;
  keywords: Keyword[];
  ability?: string;
  text: string;
  arrive?: Effect[];
  ascend?: Effect[];
  attack?: Effect[];
  block?: Effect[];
  attacked?: Effect[];
  defeats?: Effect[];
  statics?: Statics;
}

export interface ChampionLine {
  canonId: string;
  name: string;
  title: string;
  tier: 1 | 2 | 3 | 4 | 5;
  origins: string[];
  classes: string[];
  forms: ChampionForm[];
}

export type SchemeTrigger = 'rivalAttacks' | 'crownAttacked' | 'crownUnblocked' | 'clash';

export interface SpellDef {
  id: string;
  deck: DeckId;
  kind: 'tactic' | 'scheme';
  name: string;
  cost: number;
  text: string;
  effects: Effect[];
  swift?: boolean;
  shardfall?: boolean;
  when?: SchemeTrigger;
}

export type DeckId = 'banner' | 'ember';

const scorchRivals = (n: number): Effect => ({ op: 'scorchAll', n });

export const CHAMPION_LINES: ChampionLine[] = [
  // ── BANNER OF THE REALM (Kingdom / Dawnforged) ──
  {
    canonId: 'rowan', name: 'Rowan', title: 'Longbow of the Realm', tier: 1, origins: ['kingdom'], classes: ['ranger'],
    forms: [
      { star: 1, cost: 1, might: 2, guard: 2, keywords: ['Reach'], text: '' },
      { star: 2, cost: 0, might: 5, guard: 4, keywords: ['Reach'], ability: 'Kingsbolt',
        text: 'Attack: Scorch 2 the defender.', attack: [{ op: 'scorch', n: 2, target: 'defender' }] },
      { star: 3, cost: 1, might: 9, guard: 7, keywords: ['Reach'], ability: 'Kingsbolt',
        text: 'Ascend: Scorch 2 a rival champion. Attack: Scorch 2 the defender.',
        ascend: [{ op: 'scorch', n: 2, target: 'chooseRival' }], attack: [{ op: 'scorch', n: 2, target: 'defender' }] },
    ],
  },
  {
    canonId: 'kael', name: 'Kael', title: 'Seeker of the Crown', tier: 1, origins: ['kingdom'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 2, might: 3, guard: 2, keywords: [], text: '' },
      { star: 2, cost: 0, might: 6, guard: 5, keywords: [], ability: 'Crescent Slash',
        text: 'Attack: Scorch 1 each rival champion.', attack: [scorchRivals(1)] },
      { star: 3, cost: 1, might: 10, guard: 8, keywords: [], ability: 'Crescent Slash',
        text: 'Ascend: Scorch 1 each rival champion. Attack: Scorch 1 each rival champion.',
        ascend: [scorchRivals(1)], attack: [scorchRivals(1)] },
    ],
  },
  {
    canonId: 'solara', name: 'Solara', title: 'Novice of the Dawn', tier: 1, origins: ['dawnforged'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 2, keywords: [], ability: 'Sun Mend',
        text: 'Arrival: Shield another champion you control.', arrive: [{ op: 'shield', target: 'chooseOwnOther' }] },
      { star: 2, cost: 0, might: 3, guard: 5, keywords: [], ability: 'Sun Mend',
        text: 'Ascend: Shield each champion you control.', ascend: [{ op: 'shieldAll' }] },
      { star: 3, cost: 1, might: 6, guard: 9, keywords: [], ability: 'Sun Mend',
        text: 'Ascend: Shield each champion you control. Your other champions have +1 Guard.',
        ascend: [{ op: 'shieldAll' }], statics: { auraGuard: 1 } },
    ],
  },
  {
    canonId: 'elara', name: 'Elara', title: 'Field Surgeon of the Realm', tier: 2, origins: ['kingdom'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 3, might: 1, guard: 3, keywords: [], ability: 'Last Light',
        text: 'Arrival: Return a ★ champion from your Fallen pile to your hand.', arrive: [{ op: 'returnFallen', optional: false }] },
      { star: 2, cost: 1, might: 3, guard: 6, keywords: [], ability: 'Last Light',
        text: 'Ascend: Return a ★ champion from your Fallen pile to your hand.', ascend: [{ op: 'returnFallen', optional: false }] },
      { star: 3, cost: 2, might: 6, guard: 9, keywords: [], ability: 'Last Light',
        text: 'Ascend: Return up to two ★ champions from your Fallen pile to your hand. Shield each champion you control.',
        ascend: [{ op: 'returnFallen', optional: true }, { op: 'returnFallen', optional: true }, { op: 'shieldAll' }] },
    ],
  },
  {
    canonId: 'solenne', name: 'Solenne Ash', title: 'Knight of the Burning Dawn', tier: 2, origins: ['dawnforged'], classes: ['vanguard'],
    forms: [
      { star: 1, cost: 3, might: 3, guard: 3, keywords: ['Charge'], text: '' },
      { star: 2, cost: 1, might: 6, guard: 6, keywords: ['Charge'], ability: 'Solar Charge',
        text: 'Ascend: Scorch 2 a rival champion.', ascend: [{ op: 'scorch', n: 2, target: 'chooseRival' }] },
      { star: 3, cost: 2, might: 10, guard: 9, keywords: ['Charge'], ability: 'Solar Charge',
        text: 'Ascend: Scorch 2 each rival champion.', ascend: [scorchRivals(2)] },
    ],
  },
  {
    canonId: 'aurelia', name: 'Aurelia', title: 'Crown Commander', tier: 3, origins: ['kingdom'], classes: ['commander'],
    forms: [
      { star: 1, cost: 4, might: 3, guard: 4, keywords: [], ability: 'Rally the Crown',
        text: 'Attack: Your other champions get +1 Might this turn.', attack: [{ op: 'buffOthers', might: 1 }] },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Rally the Crown',
        text: 'Your other champions have +1 Might.', statics: { auraMight: 1 } },
      { star: 3, cost: 2, might: 9, guard: 10, keywords: [], ability: 'Rally the Crown',
        text: 'Your other champions have +1 Might and +1 Guard.', statics: { auraMight: 1, auraGuard: 1 } },
    ],
  },
  {
    canonId: 'varr', name: 'General Varr', title: 'The Unbroken Line', tier: 4, origins: ['kingdom'], classes: ['commander', 'vanguard'],
    forms: [
      { star: 1, cost: 5, might: 4, guard: 6, keywords: ['Bulwark'], ability: 'Hold the Line',
        text: 'Your other champions have +1 Guard.', statics: { auraGuard: 1 } },
      { star: 2, cost: 1, might: 7, guard: 9, keywords: ['Bulwark'], ability: 'Hold the Line',
        text: 'Ascend: Shield each champion you control. Your other champions have +1 Guard.', ascend: [{ op: 'shieldAll' }], statics: { auraGuard: 1 } },
      { star: 3, cost: 2, might: 10, guard: 12, keywords: ['Bulwark'], ability: 'Hold the Line',
        text: 'Ascend: Shield each champion you control. Your other champions have +2 Guard.', ascend: [{ op: 'shieldAll' }], statics: { auraGuard: 2 } },
    ],
  },
  {
    canonId: 'sol', name: 'Sol', title: 'The First Light', tier: 5, origins: ['dawnforged'], classes: ['ascendant', 'mystic'],
    forms: [
      { star: 1, cost: 6, might: 5, guard: 7, keywords: ['Ascendant'], ability: 'DAWN',
        text: 'Arrival: Shield each champion you control.', arrive: [{ op: 'shieldAll' }] },
      { star: 2, cost: 2, might: 8, guard: 10, keywords: ['Ascendant', 'Flight'], ability: 'DAWN',
        text: 'Ascend: Shield each champion you control.', ascend: [{ op: 'shieldAll' }] },
      { star: 3, cost: 3, might: 12, guard: 13, keywords: ['Ascendant', 'Flight'], ability: 'DAWN',
        text: 'Ascend: Scorch 3 each rival champion, then Mend 1.', ascend: [scorchRivals(3), { op: 'mend' }] },
    ],
  },

  // ── BLOOD & EMBER (Wildkin / Elemental, with Aurex) ──
  {
    canonId: 'fen', name: 'Fen', title: 'Blood of the Pack', tier: 1, origins: ['wildkin'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 1, might: 2, guard: 1, keywords: [],
        text: '+1 Might while you have fewer shards than your rival.', statics: { mightIfBehind: 1 } },
      { star: 2, cost: 0, might: 5, guard: 4, keywords: ['Ambush'], ability: 'Red Moon Pounce',
        text: '+1 Might while you have fewer shards than your rival.', statics: { mightIfBehind: 1 } },
      { star: 3, cost: 1, might: 9, guard: 7, keywords: ['Ambush'], ability: 'Red Moon Pounce',
        text: '+1 Might while you have fewer shards than your rival. Once per turn, when Fen defeats a champion on your turn, ready Fen.',
        statics: { mightIfBehind: 1 }, defeats: [{ op: 'readyOncePerTurn' }] },
    ],
  },
  {
    canonId: 'emberling', name: 'Emberling', title: 'Spark That Learned to Speak', tier: 1, origins: ['elemental'], classes: ['arcanist'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 1, keywords: [], ability: 'Kindle',
        text: 'Arrival: Scorch 2 a rival champion.', arrive: [{ op: 'scorch', n: 2, target: 'chooseRival' }] },
      { star: 2, cost: 0, might: 4, guard: 3, keywords: [], ability: 'Kindle',
        text: 'Ascend: Scorch 2 a rival champion. Attack: Scorch 1 the defender.',
        ascend: [{ op: 'scorch', n: 2, target: 'chooseRival' }], attack: [{ op: 'scorch', n: 1, target: 'defender' }] },
      { star: 3, cost: 1, might: 8, guard: 6, keywords: [], ability: 'Kindle',
        text: 'Ascend: Scorch 2 each rival champion. Attack: Scorch 2 the defender.',
        ascend: [scorchRivals(2)], attack: [{ op: 'scorch', n: 2, target: 'defender' }] },
    ],
  },
  {
    canonId: 'mirella', name: 'Mirella', title: 'Voice of the Tides', tier: 2, origins: ['elemental'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 2, might: 1, guard: 3, keywords: [], ability: 'Tidal Veil',
        text: 'Arrival: Shield another champion you control.', arrive: [{ op: 'shield', target: 'chooseOwnOther' }] },
      { star: 2, cost: 1, might: 3, guard: 6, keywords: [], ability: 'Tidal Veil',
        text: 'Ascend: Shield each champion you control.', ascend: [{ op: 'shieldAll' }] },
      { star: 3, cost: 2, might: 6, guard: 10, keywords: [], ability: 'Tidal Veil',
        text: 'Ascend: Shield each champion you control. Draw a card.', ascend: [{ op: 'shieldAll' }, { op: 'draw', n: 1 }] },
    ],
  },
  {
    canonId: 'grizz', name: 'Grizz', title: 'The Mountain That Walks', tier: 2, origins: ['wildkin'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 3, might: 4, guard: 4, keywords: [], ability: 'Maul',
        text: '+2 Might while blocking.', statics: { mightWhileBlocking: 2 } },
      { star: 2, cost: 1, might: 7, guard: 7, keywords: [], ability: 'Maul',
        text: '+2 Might while blocking. Attack: Scorch 1 the defender.', statics: { mightWhileBlocking: 2 },
        attack: [{ op: 'scorch', n: 1, target: 'defender' }] },
      { star: 3, cost: 2, might: 11, guard: 10, keywords: [], ability: 'Maul',
        text: '+3 Might while blocking. Attack: Scorch 2 the defender.', statics: { mightWhileBlocking: 3 },
        attack: [{ op: 'scorch', n: 2, target: 'defender' }] },
    ],
  },
  {
    canonId: 'ignara', name: 'Ignara', title: 'The Living Pyre', tier: 3, origins: ['elemental'], classes: ['vanguard'],
    forms: [
      { star: 1, cost: 3, might: 3, guard: 4, keywords: [], ability: 'Inferno Shell',
        text: 'Block: Scorch 2 the attacker.', block: [{ op: 'scorch', n: 2, target: 'attacker' }] },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Inferno Shell',
        text: 'Block: Scorch 2 the attacker.', block: [{ op: 'scorch', n: 2, target: 'attacker' }] },
      { star: 3, cost: 2, might: 9, guard: 10, keywords: ['Bulwark'], ability: 'Inferno Shell',
        text: 'Block: Scorch 2 the attacker. This also happens when Ignara is attacked.',
        block: [{ op: 'scorch', n: 2, target: 'attacker' }], attacked: [{ op: 'scorch', n: 2, target: 'attacker' }] },
    ],
  },
  {
    canonId: 'pyrax', name: 'Pyrax', title: 'Dragon-Blooded', tier: 4, origins: ['elemental'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 4, might: 5, guard: 4, keywords: [], text: '' },
      { star: 2, cost: 1, might: 8, guard: 8, keywords: [], ability: 'Dragonheart',
        text: 'Ascend: Scorch 1 each rival champion.', ascend: [scorchRivals(1)] },
      { star: 3, cost: 2, might: 11, guard: 11, keywords: [], ability: 'Dragonheart',
        text: 'Ascend: Scorch 2 each rival champion. Attack: Scorch 2 the defender.',
        ascend: [scorchRivals(2)], attack: [{ op: 'scorch', n: 2, target: 'defender' }] },
    ],
  },
  {
    canonId: 'aurex', name: 'Aurex', title: 'The Last Dragon', tier: 5, origins: ['wyrmblood'], classes: ['ascendant', 'bruiser'],
    forms: [
      { star: 1, cost: 6, might: 7, guard: 8, keywords: ['Ascendant'], ability: 'WORLD IN FLAMES',
        text: 'Arrival: Scorch 2 each rival champion.', arrive: [scorchRivals(2)] },
      { star: 2, cost: 2, might: 9, guard: 9, keywords: ['Ascendant', 'Flight'], ability: 'WORLD IN FLAMES',
        text: 'Attack: Scorch 2 the defender.', attack: [{ op: 'scorch', n: 2, target: 'defender' }] },
      { star: 3, cost: 3, might: 13, guard: 12, keywords: ['Ascendant', 'Flight'], ability: 'WORLD IN FLAMES',
        text: 'Ascend: Defeat each rival champion with Guard 3 or less. Your other champions can’t attack this turn.',
        ascend: [{ op: 'defeatGuardAtMost', n: 3 }, { op: 'stopOthersAttacking' }] },
    ],
  },
];

/** Every Crownfall champion: the 15 starter-deck lines above plus the rest of Set 1. */
export const ALL_LINES: ChampionLine[] = [...CHAMPION_LINES, ...SET1_LINES];

export const SPELLS: SpellDef[] = [
  // Banner
  { id: 'rally-banners', deck: 'banner', kind: 'tactic', name: 'Rally the Banners', cost: 1,
    text: 'Your champions get +1 Might this turn.', effects: [{ op: 'buffAll', might: 1 }] },
  { id: 'reinforcements', deck: 'banner', kind: 'tactic', name: 'Reinforcements', cost: 2, shardfall: true,
    text: 'Deploy a ★ champion costing 2 or less from your hand for free.', effects: [{ op: 'deployFree', maxCost: 2 }] },
  { id: 'royal-dispatch', deck: 'banner', kind: 'tactic', name: 'Royal Dispatch', cost: 2,
    text: 'Draw 2 cards.', effects: [{ op: 'draw', n: 2 }] },
  { id: 'shield-wall', deck: 'banner', kind: 'tactic', name: 'Shield Wall', cost: 2,
    text: 'Shield up to two champions you control.',
    effects: [{ op: 'shield', target: 'chooseOwn', optional: true }, { op: 'shield', target: 'chooseOwn', optional: true }] },
  { id: 'first-light', deck: 'banner', kind: 'tactic', name: 'First Light', cost: 1, swift: true,
    text: 'A champion gets +2 Guard this turn.', effects: [{ op: 'buff', might: 0, guard: 2, target: 'chooseAny' }] },
  { id: 'dawnward-oath', deck: 'banner', kind: 'scheme', name: 'Dawnward Oath', cost: 1, when: 'rivalAttacks',
    text: 'Spring when a rival champion attacks: Shield one of your champions.', effects: [{ op: 'shield', target: 'chooseOwn' }] },
  { id: 'hold-the-gate', deck: 'banner', kind: 'scheme', name: 'Hold the Gate', cost: 0, shardfall: true, when: 'crownUnblocked',
    text: 'Spring when a rival champion attacks your Crown and is not blocked: ready one of your champions; it blocks that attack.',
    effects: [{ op: 'gateBlock' }] },
  { id: 'arrow-volley', deck: 'banner', kind: 'scheme', name: 'Arrow Volley', cost: 1, when: 'rivalAttacks',
    text: 'Spring when a rival champion attacks: it gets −2 Might this turn.', effects: [{ op: 'buff', might: -2, guard: 0, target: 'attacker' }] },

  // Ember
  { id: 'firebolt', deck: 'ember', kind: 'tactic', name: 'Firebolt', cost: 1,
    text: 'Scorch 2 a rival champion.', effects: [{ op: 'scorch', n: 2, target: 'chooseRival' }] },
  { id: 'firestorm', deck: 'ember', kind: 'tactic', name: 'Firestorm', cost: 2,
    text: 'Scorch 1 each rival champion. Draw a card.', effects: [scorchRivals(1), { op: 'draw', n: 1 }] },
  { id: 'feral-howl', deck: 'ember', kind: 'tactic', name: 'Feral Howl', cost: 1,
    text: 'Your champions get +1 Might this turn, or +2 if you have fewer shards than your rival.',
    effects: [{ op: 'buffAll', might: 1, extraIfBehind: 1 }] },
  { id: 'return-to-fire', deck: 'ember', kind: 'tactic', name: 'Return to the Fire', cost: 2, shardfall: true,
    text: 'Return up to two ★ champions from your Fallen pile to your hand.',
    effects: [{ op: 'returnFallen', optional: true }, { op: 'returnFallen', optional: true }] },
  { id: 'flare-up', deck: 'ember', kind: 'tactic', name: 'Flare Up', cost: 1, swift: true,
    text: 'A champion gets +2 Might this turn.', effects: [{ op: 'buff', might: 2, guard: 0, target: 'chooseAny' }] },
  { id: 'kindling', deck: 'ember', kind: 'tactic', name: 'Kindling', cost: 0, shardfall: true,
    text: 'Draw a card.', effects: [{ op: 'draw', n: 1 }] },
  { id: 'bloodscent', deck: 'ember', kind: 'scheme', name: 'Bloodscent', cost: 0, shardfall: true, when: 'clash',
    text: 'Spring when one of your champions is attacked or blocks: it gets +3 Guard this turn.',
    effects: [{ op: 'buff', might: 0, guard: 3, target: 'defender' }] },
  { id: 'ember-trap', deck: 'ember', kind: 'scheme', name: 'Ember Trap', cost: 1, when: 'rivalAttacks',
    text: 'Spring when a rival champion attacks: Scorch 2 it.', effects: [{ op: 'scorch', n: 2, target: 'attacker' }] },
  { id: 'cinder-veil', deck: 'ember', kind: 'scheme', name: 'Cinder Veil', cost: 1, when: 'crownAttacked',
    text: 'Spring when a rival champion attacks your Crown: that attack ends. No shards break.', effects: [{ op: 'cancelAttack' }] },
];

export interface DeckDef {
  name: string;
  origins: string;
  color: string;
  accent: string;
  pitch: string;
  main: [string, number][];
  ascension: string[];
}

export const DECKS: Record<DeckId, DeckDef> = {
  banner: {
    name: 'Banner of the Realm', origins: 'Kingdom · Dawnforged', color: '#3d6fd8', accent: '#d9a92c',
    pitch: 'Go wide, protect your champions with Shields, and rebuild from the Fallen pile. Sol is your Ascendant.',
    main: [['rowan', 2], ['kael', 2], ['solara', 2], ['elara', 2], ['solenne', 2], ['aurelia', 2], ['varr', 1], ['sol', 1],
      ['rally-banners', 2], ['reinforcements', 2], ['royal-dispatch', 2], ['shield-wall', 2], ['first-light', 2],
      ['dawnward-oath', 2], ['hold-the-gate', 2], ['arrow-volley', 2]],
    ascension: ['kael-2', 'kael-3', 'solenne-2', 'solenne-3', 'aurelia-2', 'aurelia-3', 'sol-2', 'sol-3'],
  },
  ember: {
    name: 'Blood & Ember', origins: 'Wildkin · Elemental · Wyrmblood', color: '#c2451e', accent: '#e8a33a',
    pitch: 'Scorch blockers, hit hard, and get stronger when you fall behind. Aurex is your Ascendant.',
    main: [['fen', 2], ['emberling', 2], ['mirella', 2], ['grizz', 2], ['ignara', 2], ['pyrax', 2], ['aurex', 1],
      ['firebolt', 2], ['firestorm', 2], ['feral-howl', 2], ['return-to-fire', 2], ['flare-up', 2], ['kindling', 1],
      ['bloodscent', 2], ['ember-trap', 2], ['cinder-veil', 2]],
    ascension: ['fen-2', 'fen-3', 'ignara-2', 'ignara-3', 'pyrax-2', 'pyrax-3', 'aurex-2', 'aurex-3'],
  },
};

// ── Flat card index ────────────────────────────────────────────────────────────
export interface ChampionCard extends ChampionForm {
  id: string;
  kind: 'champion' | 'ascension';
  name: string;
  title: string;
  canonId: string;
  line: ChampionLine;
  /** Starter deck this champion belongs to; undefined for set cards not yet in a deck. */
  deck?: DeckId;
  /** Shards an unblocked attack breaks: 2 for ★★★, otherwise 1. */
  crown: 1 | 2;
}
export type SpellCard = SpellDef;
export type Card = ChampionCard | SpellCard;

const deckOfLine: Record<string, DeckId> = {};
for (const [deckId, d] of Object.entries(DECKS) as [DeckId, DeckDef][]) for (const [id] of d.main) deckOfLine[id] = deckId;

export const CARDS: Record<string, Card> = {};
for (const line of ALL_LINES) {
  for (const f of line.forms) {
    const id = f.star === 1 ? line.canonId : `${line.canonId}-${f.star}`;
    CARDS[id] = {
      ...f, id, kind: f.star === 1 ? 'champion' : 'ascension', name: line.name, title: line.title,
      canonId: line.canonId, line, deck: deckOfLine[line.canonId], crown: f.star === 3 ? 2 : 1,
    };
  }
}
for (const s of SPELLS) CARDS[s.id] = s;

export const isChampionCard = (c: Card): c is ChampionCard => c.kind === 'champion' || c.kind === 'ascension';
export const card = (id: string): Card => {
  const c = CARDS[id];
  if (!c) throw new Error(`Unknown card ${id}`);
  return c;
};
export const champion = (id: string): ChampionCard => {
  const c = card(id);
  if (!isChampionCard(c)) throw new Error(`${id} is not a champion card`);
  return c;
};
export const spell = (id: string): SpellCard => {
  const c = card(id);
  if (isChampionCard(c)) throw new Error(`${id} is not a spell`);
  return c;
};

/** Canonical Origin colours from Crownfall (src/data/traits.ts), used to frame cards that are not in a starter deck. */
export const ORIGIN_COLORS: Record<string, string> = {
  kingdom: '#5b8cff', gearbound: '#e8b04a', astral: '#9ab8ff', verdant: '#7dd35a', hollow: '#8fd6bd', umbral: '#a67cff',
  elemental: '#ff8a3c', wildkin: '#d9894a', voltborn: '#6fd8ff', riftborn: '#ff5ae0', dawnforged: '#ffd66b', hexbound: '#d15cff',
  titanborn: '#c9a36b', wyrmblood: '#ff5a1f', crownless: '#fff4c8',
};
