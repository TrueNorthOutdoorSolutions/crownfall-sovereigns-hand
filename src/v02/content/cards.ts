// Sovereign's Hand V0.2: the single source of card truth.
// Used by the rules engine (src/v02/rules), the AI, the print-and-play kit and the balance simulator,
// so the physical and digital games cannot drift apart.
//
// Canon rule: every champion's name, title, tier, Origins, Classes and ability names must match
// prototype-v0.2/data/canon-snapshot.json (read from Desktop/Crownfall). Might, Guard, costs and card text
// are card-game design (PROPOSED). Tactic and Scheme names are working names, not canon.

import { SET1_LINES } from './set1';
import { SET1_TOKENS, SET1_SPELLS, SET1_EDICTS } from './set1-extras';
import { SET2_LINES, SET2_SPELLS, SET2_RELICS, SET2_EDICTS } from './set2';

export const RULES_VERSION = '0.2-paper-1';

export type Keyword = 'Charge' | 'Bulwark' | 'Ambush' | 'Flight' | 'Reach' | 'Ascendant' | 'Guardian';

/** Which set a card belongs to. */
export type SetId = 1 | 2;

/** Who an effect points at. `choose*` targets are picked by the controlling player when the effect resolves.
 *  Any effect may carry `when: 'behind' | 'ahead'` (only resolves if you have fewer / more shards than your rival). */
export type Effect = EffectBody & { when?: 'behind' | 'ahead' };
type EffectBody =
  | { op: 'scorch'; n: number; target: 'chooseRival' | 'attacker' | 'defender' }
  | { op: 'scorchAll'; n: number }
  | { op: 'shield'; target: 'chooseOwn' | 'chooseOwnOther' | 'self'; optional?: boolean }
  | { op: 'shieldAll' }
  | { op: 'buffAll'; might: number; guard?: number; extraIfBehind?: number; maxField?: number }
  | { op: 'buffTrait'; trait: string; might: number; guard?: number }
  | { op: 'selfShard'; n: number }
  | { op: 'ascendNow'; maxStar?: 1 | 2; stayReady?: boolean }
  | { op: 'extraZone'; n: number }
  | { op: 'coinFlip'; heads: Effect[]; tails: Effect[] }
  | { op: 'tuck' }
  | { op: 'buffOthers'; might: number }
  | { op: 'buff'; might: number; guard: number; target: 'chooseAny' | 'chooseRival' | 'attacker' | 'defender' }
  | { op: 'draw'; n: number; who?: 'self' | 'rival' }
  | { op: 'command'; n: number; who?: 'self' | 'rival' }
  | { op: 'summon'; token: string; count: number }
  | { op: 'buffRivals'; might: number; guard?: number }
  | { op: 'unequip' }
  | { op: 'returnFallen'; optional: boolean; what?: 'champion' | 'relic' }
  | { op: 'deployFree'; maxCost: number; family?: 'monster' }
  | { op: 'equipFree'; maxCost: number }
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
  /** Your other champions of this Origin have +might/+guard. */
  originAura?: { origin: string; might?: number; guard?: number };
  /** While this champion holds a Relic. */
  mightIfRelic?: number;
  guardIfRelic?: number;
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
  /** When this champion is defeated (any way). */
  defeated?: Effect[];
  /** At the start of its controller's turn. */
  rise?: Effect[];
  statics?: Statics;
}

export interface ChampionLine {
  /** Crownfall id of the champion, monster or summon this card depicts. */
  canonId: string;
  /** Unique id of this card line; defaults to canonId. Set 2 versions use "<canonId>@2". */
  lineId?: string;
  /** champion = one of the 55; monster/guardian = Crownfall monsters and bosses; token = a summon. */
  family?: 'champion' | 'monster' | 'guardian' | 'token';
  set?: SetId;
  name: string;
  /** Canonical title, or for Set 2 versions the PROPOSED epithet. */
  title: string;
  /** Set 2 epithets are new text awaiting approval. */
  epithetProposed?: boolean;
  /** PROPOSED art setting for a new version (Set 2), combined with each form's canonical look. */
  scene?: string;
  tier: 1 | 2 | 3 | 4 | 5;
  origins: string[];
  classes: string[];
  forms: ChampionForm[];
}

/** Equipment attached to a champion. Crown Artifacts are legendary: one copy per deck. */
export interface RelicDef {
  id: string;
  kind: 'relic';
  set: SetId;
  /** Crownfall item id the card is based on. */
  canonId: string;
  name: string;
  cost: number;
  text: string;
  relicType: 'component' | 'completed' | 'emblem' | 'artifact' | 'crown';
  might?: number;
  guard?: number;
  keywords?: Keyword[];
  /** Emblems: the champion also counts as this Origin. */
  origin?: string;
  /** Sovereign Crown: you have one more Champion Zone while it is in play. */
  extraZone?: boolean;
  /** Crown of the First Realm: the holder counts as every Origin. */
  allOrigins?: boolean;
  attack?: Effect[];
  block?: Effect[];
  defeats?: Effect[];
  defeated?: Effect[];
  rise?: Effect[];
  statics?: Statics;
  legendary?: boolean;
  deck?: DeckId;
  /** PROPOSED art brief. */
  art?: string;
}

/** A shared rule card. Playing one replaces the Edict already in play. */
export interface EdictRule {
  commandBonus?: number;
  ascendDiscount?: number;
  star3Discount?: number;
  shardDraw?: boolean;
  attackShardCommand?: boolean;
  cycle?: boolean;
  relicDiscount?: number;
  monsterDraw?: boolean;
  relicReturn?: boolean;
}
export interface EdictDef {
  id: string;
  kind: 'edict';
  set: SetId;
  canonId: string;
  name: string;
  cost: number;
  /** Crownfall champion who proclaims it (canon). */
  host: string;
  text: string;
  rule: EdictRule;
  deck?: DeckId;
  art?: string;
}

export type SchemeTrigger = 'rivalAttacks' | 'crownAttacked' | 'crownUnblocked' | 'clash';

export interface SpellDef {
  id: string;
  set?: SetId;
  /** Crownfall Crown Power id the card is named after, when it has one. */
  canonId?: string;
  deck?: DeckId;
  kind: 'tactic' | 'scheme';
  name: string;
  cost: number;
  text: string;
  effects: Effect[];
  swift?: boolean;
  shardfall?: boolean;
  when?: SchemeTrigger;
  /** PROPOSED art brief; flavour from a canonical announcer line when the name comes from one. */
  art?: string;
  flavour?: string;
}

export type DeckId = string;

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
      { star: 1, cost: 1, might: 2, guard: 1, keywords: [], ability: 'Red Moon Pounce',
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

/** Every champion, monster, Guardian and token line across both sets. */
export const ALL_LINES: ChampionLine[] = [...CHAMPION_LINES, ...SET1_LINES, ...SET1_TOKENS, ...SET2_LINES];

export const SPELLS: SpellDef[] = [
  // Banner
  { id: 'rally-banners', canonId: 'sharpened_steel', deck: 'banner', kind: 'tactic', name: 'Sharpened Steel', cost: 1,
    text: 'Your champions get +1 Might this turn.', effects: [{ op: 'buffAll', might: 1 }] },
  { id: 'reinforcements', canonId: 'reserve_guard', deck: 'banner', kind: 'tactic', name: 'Reserve Guard', cost: 2, shardfall: true,
    text: 'Deploy a ★ champion costing 2 or less from your hand for free.', effects: [{ op: 'deployFree', maxCost: 2 }] },
  { id: 'royal-dispatch', deck: 'banner', kind: 'tactic', name: 'Royal Dispatch', cost: 2,
    text: 'Draw 2 cards.', effects: [{ op: 'draw', n: 2 }] },
  { id: 'shield-wall', canonId: 'front_doctrine', deck: 'banner', kind: 'tactic', name: 'Frontline Doctrine', cost: 2,
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
  { id: 'firestorm', canonId: 'wildfire', deck: 'ember', kind: 'tactic', name: 'Wildfire', cost: 2,
    text: 'Scorch 1 each rival champion. Draw a card.', effects: [scorchRivals(1), { op: 'draw', n: 1 }] },
  { id: 'feral-howl', canonId: 'wildkin_pact', deck: 'ember', kind: 'tactic', name: 'Wildkin Pact', cost: 1,
    text: 'Your champions get +1 Might this turn, or +2 if you have fewer shards than your rival.',
    effects: [{ op: 'buffAll', might: 1, extraIfBehind: 1 }] },
  { id: 'return-to-fire', canonId: 'rebirth_rite', deck: 'ember', kind: 'tactic', name: 'Rebirth Rite', cost: 2, shardfall: true,
    text: 'Return up to two ★ champions from your Fallen pile to your hand.',
    effects: [{ op: 'returnFallen', optional: true }, { op: 'returnFallen', optional: true }] },
  { id: 'flare-up', canonId: 'chaotic_surge', deck: 'ember', kind: 'tactic', name: 'Chaotic Surge', cost: 1, swift: true,
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

/** Set 1 and Set 2 Tactics and Schemes beyond the starter-deck spells above. */
export const EXTRA_SPELLS: SpellDef[] = [...SET1_SPELLS, ...SET2_SPELLS];
export const RELICS: RelicDef[] = [...SET2_RELICS];
export const EDICTS: EdictDef[] = [...SET1_EDICTS, ...SET2_EDICTS];

export interface DeckDef {
  /** Set the deck belongs to (Set 1 if omitted). */
  set?: SetId;
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
  // ── Set 2 starter decks (DRAFT, simulator-balanced only) ──
  vault: {
    set: 2, name: 'Vault Delvers', origins: 'Kingdom · Gearbound · Titanborn', color: '#c9a36b', accent: '#5b8cff',
    pitch: 'Arm your champions with Relics from the Vault and hold the line with the Crystal Golem. ATLAS-Ω is your Ascendant.',
    main: [['kael@2', 2], ['rowan@2', 2], ['gearwick@2', 2], ['borin@2', 2], ['aurelia@2', 2], ['varr@2', 1], ['atlas@2', 1], ['guardian-golem', 1],
      ['spark@2', 2], ['knuckle@2', 1], ['titanrho@2', 1],
      ['relic-blade', 2], ['relic-plate', 1], ['relic-colossus_edge', 1], ['relic-crownsworn', 1], ['relic-kingdom_emblem', 1], ['relic-aegis_codex', 1], ['relic-fallen_kings_blade', 1],
      ['treasure_is_yours', 1], ['vault_remembers', 1], ['hex_war', 1], ['steel_will_answer', 1], ['unbinding_charm', 1]],
    ascension: ['kael@2-2', 'kael@2-3', 'aurelia@2-2', 'aurelia@2-3', 'borin@2-2', 'borin@2-3', 'atlas@2-2', 'atlas@2-3'],
  },
  brood: {
    set: 2, name: "Guardians' Brood", origins: 'Monsters · Hollow · Umbral', color: '#6a3fa0', accent: '#8fd6bd',
    pitch: 'Flood the Arena with Monsters and Void Spiders, then raise the fallen. The Unwritten King is your Ascendant.',
    main: [['monster-mite', 2], ['monster-hound', 2], ['monster-alpha', 2], ['monster-shardling', 1],
      ['grimm@2', 2], ['nyx@2', 2], ['shade@2', 2], ['morrow@2', 2], ['dreadmouth@2', 1], ['unwritten@2', 1], ['guardian-spiderqueen', 1],
      ['wild_encounter', 2], ['pack_leader', 2], ['boss_encounter', 1], ['stirs_beneath', 1], ['one_still_stands', 2], ['not_yet', 1],
      ['relic-hollow_emblem', 1], ['relic-bloodoath', 1], ['relic-nullifier', 1]],
    ascension: ['nyx@2-2', 'nyx@2-3', 'morrow@2-2', 'morrow@2-3', 'dreadmouth@2-2', 'dreadmouth@2-3', 'unwritten@2-2', 'unwritten@2-3'],
  },
};

// ── Flat card index ────────────────────────────────────────────────────────────
export interface ChampionCard extends ChampionForm {
  id: string;
  kind: 'champion' | 'ascension' | 'token';
  name: string;
  title: string;
  canonId: string;
  lineId: string;
  family: 'champion' | 'monster' | 'guardian' | 'token';
  set: SetId;
  line: ChampionLine;
  /** Starter deck this champion belongs to; undefined for set cards not yet in a deck. */
  deck?: DeckId;
  /** Shards an unblocked attack breaks: 2 for ★★★, otherwise 1. */
  crown: 1 | 2;
}
export type SpellCard = SpellDef;
export type RelicCard = RelicDef;
export type EdictCard = EdictDef;
export type Card = ChampionCard | SpellCard | RelicCard | EdictCard;

const deckOfLine: Record<string, DeckId> = {};
for (const [deckId, d] of Object.entries(DECKS) as [DeckId, DeckDef][]) for (const [id] of d.main) deckOfLine[id] ??= deckId;

export const CARDS: Record<string, Card> = {};
for (const line of ALL_LINES) {
  const lineId = line.lineId ?? line.canonId;
  const family = line.family ?? 'champion';
  for (const f of line.forms) {
    const id = f.star === 1 ? lineId : `${lineId}-${f.star}`;
    if (CARDS[id]) throw new Error(`Duplicate card id ${id}`);
    CARDS[id] = {
      ...f, id, kind: family === 'token' ? 'token' : f.star === 1 ? 'champion' : 'ascension', name: line.name, title: line.title,
      canonId: line.canonId, lineId, family, set: line.set ?? 1, line, deck: deckOfLine[lineId], crown: f.star === 3 ? 2 : 1,
    };
  }
}
for (const s of [...SPELLS, ...EXTRA_SPELLS]) {
  if (CARDS[s.id]) throw new Error(`Duplicate card id ${s.id}`);
  CARDS[s.id] = { set: 1, ...s, deck: s.deck ?? deckOfLine[s.id] };
}
for (const r of [...RELICS, ...EDICTS]) {
  if (CARDS[r.id]) throw new Error(`Duplicate card id ${r.id}`);
  CARDS[r.id] = { ...r, deck: r.deck ?? deckOfLine[r.id] };
}

export const isChampionCard = (c: Card): c is ChampionCard => c.kind === 'champion' || c.kind === 'ascension' || c.kind === 'token';
export const isSpellCard = (c: Card): c is SpellCard => c.kind === 'tactic' || c.kind === 'scheme';
export const isRelicCard = (c: Card): c is RelicCard => c.kind === 'relic';
export const isEdictCard = (c: Card): c is EdictCard => c.kind === 'edict';
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
  if (!isSpellCard(c)) throw new Error(`${id} is not a Tactic or Scheme`);
  return c;
};
export const relic = (id: string): RelicCard => {
  const c = card(id);
  if (!isRelicCard(c)) throw new Error(`${id} is not a Relic`);
  return c;
};
export const edict = (id: string): EdictCard => {
  const c = card(id);
  if (!isEdictCard(c)) throw new Error(`${id} is not an Edict`);
  return c;
};

/** Canonical Origin colours from Crownfall (src/data/traits.ts), used to frame cards that are not in a starter deck. */
export const ORIGIN_COLORS: Record<string, string> = {
  kingdom: '#5b8cff', gearbound: '#e8b04a', astral: '#9ab8ff', verdant: '#7dd35a', hollow: '#8fd6bd', umbral: '#a67cff',
  elemental: '#ff8a3c', wildkin: '#d9894a', voltborn: '#6fd8ff', riftborn: '#ff5ae0', dawnforged: '#ffd66b', hexbound: '#d15cff',
  titanborn: '#c9a36b', wyrmblood: '#ff5a1f', crownless: '#fff4c8',
};
