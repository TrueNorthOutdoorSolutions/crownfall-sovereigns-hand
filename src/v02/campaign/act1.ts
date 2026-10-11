// Act I · The Shattered Crown — campaign content (PROPOSED story, owner-approved structure 2026-10-11).
// Every chapter: 3 Trials of 5 Bouts, then the Crowning against a Tier V legend (about 16 Bouts per chapter).
// Story is drawn from prototype-v0.2/lore (canon lines quoted exactly). Enemy decks are ordinary legal Set 1 decks.
import { DECKS } from '../content/cards';
import type { DeckDef } from '../content/cards';

export type Objective =
  | { kind: 'win' }
  /** Win while you still have at least n Crown Shards. */
  | { kind: 'keepShards'; n: number }
  /** Still have a shard when this round begins. */
  | { kind: 'survive'; rounds: number };

export interface BoutSetup {
  /** Shards each side starts with (the rest go to the bottom of that player's deck). */
  myCrown?: number;
  rivalCrown?: number;
  /** An Edict already in play, proclaimed by the rival. */
  edict?: string;
  /** Champions (★ card ids) already on the field when the Bout starts. */
  myField?: string[];
  rivalField?: string[];
}

export interface StoryLine { speaker: string; text: string; canon?: boolean }
export type Difficulty = 'contender' | 'masterwork' | 'omega';

export interface Bout {
  id: string;
  trial: number;
  bout: number;
  title: string;
  /** Champion card id shown on the story panel. */
  portrait: string;
  story: StoryLine[];
  rival: string;
  deck: string;
  setup?: BoutSetup;
  objective: Objective;
  /** Rules explained to the player in one line. */
  rules?: string;
  reward: { valor: number; cards?: string[] };
  /** The Crowning: setups per difficulty. Masterwork / Omega reopen after Act II. */
  crowning?: Record<Difficulty, { setup?: BoutSetup; deck: string; printing: 'base' | 'masterwork' | 'omega' }>;
}

export interface Chapter { id: string; numeral: string; title: string; legend: string; intro: StoryLine[]; trials: string[]; bouts: Bout[]; playerDeck: string; playerDeckName: string }

// ---------- enemy decks (30 cards; legal by the deck rules) ----------
const deck = (id: string, name: string, origins: string, main: [string, number][], ascension: string[]) => {
  DECKS[id] = { set: 1, name, origins, color: '#8a6d2a', accent: '#f0c95a', pitch: '', main, ascension } as DeckDef;
  return id;
};
const D = {
  training: deck('c1-training', 'Arena Sparring Ring', 'Mixed', [['pip', 2], ['bolt', 2], ['grimm', 2], ['kira', 2], ['bramble', 2],
    ['rally-banners', 2], ['royal-dispatch', 2], ['first-light', 2], ['kindling', 2], ['steady_coffers', 2], ['lucky_draw', 2], ['golden_parting', 2], ['coin_flip', 2], ['free_rolls', 2], ['royal_treasury', 2]], []),
  night: deck('c1-night', 'Shadows of the Crownfall', 'Umbral · Wildkin', [['nyx', 2], ['shade', 2], ['fen', 2], ['ronin', 2], ['veilwalker', 1], ['rask', 2],
    ['bloodscent', 2], ['ember-trap', 2], ['firebolt', 2], ['flare-up', 2], ['back_doctrine', 2], ['last_stand', 2], ['kindling', 2], ['opening_salvo', 2], ['glass_crown', 2], ['feral-howl', 1]],
    ['nyx-2', 'nyx-3', 'shade-2', 'shade-3']),
  kingdom: deck('c1-kingdom', 'Kingdom Duelists', 'Kingdom', [['kael', 2], ['rowan', 2], ['aurelia', 2], ['varr', 1], ['elara', 2], ['solenne', 2], ['knuckle', 2], ['borin', 2],
    ['rally-banners', 2], ['shield-wall', 2], ['royal-dispatch', 2], ['crest_kingdom', 2], ['battle_hymn', 2], ['crown_of_war', 1], ['arrow-volley', 2], ['executioner', 2]],
    ['kael-2', 'kael-3', 'aurelia-2', 'aurelia-3']),
  flyers: deck('c1-flyers', 'Wings Over the Arena', 'Astral · Riftborn', [['valkara', 2], ['dax', 2], ['zyrak', 2], ['seren', 2], ['astryon', 1], ['orion', 2],
    ['crest_astral', 2], ['firebolt', 2], ['royal-dispatch', 2], ['first-light', 2], ['star_touched', 2], ['ascension_rite', 2], ['arrow-volley', 2], ['kindling', 2], ['opening_salvo', 2], ['tempered_victory', 1]],
    ['seren-2', 'seren-3', 'valkara-2', 'valkara-3']),
  healers: deck('c1-healers', 'Dawn Wardens', 'Dawnforged · Kingdom', [['solara', 2], ['elara', 2], ['mirella', 2], ['elysian', 1], ['maeve', 2], ['grimm', 2], ['torren', 2],
    ['shield-wall', 2], ['dawnward-oath', 2], ['first-light', 2], ['crowns_favor', 2], ['forge_masters_favor', 2], ['mirror_shard', 2], ['return-to-fire', 2], ['royal-dispatch', 2], ['hold-the-gate', 1]],
    ['solara-2', 'solara-3', 'elara-2', 'elara-3', 'mirella-2', 'mirella-3']),
  charge: deck('c1-charge', 'The Burning List', 'Dawnforged · Voltborn', [['solenne', 2], ['kira', 2], ['ronin', 2], ['ladyvolt', 1], ['rask', 2], ['fen', 2],
    ['firebolt', 2], ['firestorm', 2], ['rally-banners', 2], ['flare-up', 2], ['opening_salvo', 2], ['feral-howl', 2], ['fallen_crown', 2], ['back_doctrine', 2], ['crown_of_war', 1], ['glass_crown', 2]],
    ['solenne-2', 'solenne-3', 'kira-2', 'kira-3']),
  surgeons: deck('c1-surgeons', 'Field Hospital', 'Kingdom · Hollow', [['elara', 2], ['solara', 2], ['kael', 2], ['rowan', 2], ['morrow', 2], ['grimm', 2],
    ['return-to-fire', 2], ['forge_masters_favor', 2], ['mirror_shard', 2], ['mystery_box', 2], ['shield-wall', 2], ['royal-dispatch', 2], ['dawnward-oath', 2], ['first-light', 2], ['golden_parting', 2]],
    ['elara-2', 'elara-3', 'morrow-2', 'morrow-3']),
  commanders: deck('c1-commanders', "Aurelia's Vanguard", 'Kingdom', [['aurelia', 2], ['kael', 2], ['rowan', 2], ['varr', 1], ['solenne', 2], ['knuckle', 2],
    ['rally-banners', 2], ['crest_kingdom', 2], ['opening_salvo', 2], ['crown_of_war', 2], ['battle_hymn', 2], ['grand_convergence', 1], ['royal-dispatch', 2], ['arrow-volley', 2], ['shield-wall', 2], ['tempered_victory', 2]],
    ['aurelia-2', 'aurelia-3', 'kael-2', 'kael-3']),
  wall: deck('c1-wall', 'The Unbroken Line', 'Kingdom · Gearbound · Titanborn', [['varr', 1], ['torren', 2], ['bolt', 2], ['titanrho', 1], ['grimm', 2], ['borin', 2], ['rowan', 2],
    ['shield-wall', 2], ['hold-the-gate', 2], ['dawnward-oath', 2], ['first-light', 2], ['cinder-veil', 2], ['crowns_favor', 2], ['royal-dispatch', 2], ['last_stand', 2], ['steady_coffers', 2]],
    ['torren-2', 'torren-3', 'borin-2', 'borin-3']),
  sol: deck('c1-sol', 'The First Light', 'Dawnforged · Kingdom', [['sol', 1], ['solara', 2], ['solenne', 2], ['elara', 2], ['kael', 2], ['aurelia', 2], ['varr', 1],
    ['dawnward-oath', 2], ['shield-wall', 2], ['first-light', 2], ['crowns_favor', 2], ['royal-dispatch', 2], ['rally-banners', 2], ['hold-the-gate', 2], ['crown_of_war', 1], ['grand_convergence', 1], ['star_touched', 2]],
    ['sol-2', 'sol-3', 'solara-2', 'solara-3', 'solenne-2', 'solenne-3', 'aurelia-2', 'aurelia-3']),
};
export const CAMPAIGN_DECKS = D;

const win: Objective = { kind: 'win' };
const S = (speaker: string, text: string, canon = false): StoryLine => ({ speaker, text, canon });

export const CHAPTER_I: Chapter = {
  id: 'c1', numeral: 'I', title: 'The First Light', legend: 'sol', playerDeck: 'banner', playerDeckName: 'Banner of the Realm',
  trials: ['Meeting the Light', 'The Tests of the Realm', 'The Banners Gather'],
  intro: [
    S('Narration', 'Long ago, the Crown fell. Its pieces scattered across every realm.'),
    S('The Arena', 'The Arena of Ascension opens.', true),
    S('The Arena', 'Welcome, Sovereign. Watch, learn, and rise.', true),
    S('Narration', 'The Realm and the Dawn are first to answer your banner. Before the Arena grants you a Crowning, you must earn their trust, one Bout at a time.'),
  ],
  bouts: [
    // ── Trial 1 · Meeting the Light ──
    { id: 'c1-t1-b1', trial: 1, bout: 1, title: 'The First Morning', portrait: 'solara', rival: 'Arena Sparring Ring', deck: D.training,
      story: [S('Narration', 'A young novice waits at the edge of the sparring ring, a lamp in her hands.'), S('Solara', 'The dawn walks with you.', true),
        S('Solara', 'My order says the Crown is the first sunrise, stolen. Help me prove I am ready to bring it back.')],
      setup: { rivalCrown: 3 }, objective: win, rules: 'The sparring ring has only 3 Crown Shards.', reward: { valor: 60, cards: ['solara'] } },
    { id: 'c1-t1-b2', trial: 1, bout: 2, title: 'Night Watch', portrait: 'solenne', rival: 'Shadows of the Crownfall', deck: D.night,
      story: [S('Narration', 'Night falls on the floating kingdom, and something moves between the pillars.'), S('Solenne Ash', 'Shadows, beware.', true),
        S('Solenne Ash', 'They strike from the dark and the side. Strike first, and they have nothing.')],
      objective: win, rules: 'Your rival plays Ambush champions. Charge lets you strike first.', reward: { valor: 60, cards: ['solenne'] } },
    { id: 'c1-t1-b3', trial: 1, bout: 3, title: 'A Fair Fight', portrait: 'kael', rival: 'Kingdom Duelists', deck: D.kingdom,
      story: [S('Kael', 'Everyone wants the Crown. I only want to be worthy of it.'), S('Kael', 'I will be worthy.', true),
        S('Kael', 'A worthy Sovereign does not throw their Crown away to win. Keep it whole.')],
      setup: { rivalField: ['titanrho'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'The rival starts with Titan Rho on the field. Win with at least 3 of your shards.', reward: { valor: 60, cards: ['kael'] } },
    { id: 'c1-t1-b4', trial: 1, bout: 4, title: 'A Hundred Paces', portrait: 'rowan', rival: 'Wings Over the Arena', deck: D.flyers,
      story: [S('Narration', 'Something circles high above the Arena.'), S('Rowan', 'The wind is kind today.', true),
        S('Rowan', 'Flyers can only be stopped by flyers, or by an archer with Reach. Keep me standing.')],
      objective: win, rules: 'Your rival plays Flight champions. Only Flight or Reach can block them.', reward: { valor: 60, cards: ['rowan'] } },
    { id: 'c1-t1-b5', trial: 1, bout: 5, title: 'Who Needs Mending?', portrait: 'elara', rival: 'Field Hospital', deck: D.surgeons,
      story: [S('Narration', 'You arrive late, your banner already bloodied.'), S('Elara', 'Who needs mending?', true),
        S('Elara', 'You are behind. Good. That is when we learn who we really are.')],
      setup: { myCrown: 3 }, objective: win, rules: 'You start with only 3 Crown Shards.', reward: { valor: 70, cards: ['elara'] } },
    // ── Trial 2 · The Tests of the Realm ──
    { id: 'c1-t2-b1', trial: 2, bout: 1, title: "The Novice's Test", portrait: 'solara', rival: 'Dawn Wardens', deck: D.healers,
      story: [S('Solara', 'The Wardens want to see if you can break a wall of light.'), S('Solara', 'The light answers me now.', true)],
      objective: win, rules: 'The Dawn Wardens Shield and heal. Scorch through their Guard.', reward: { valor: 80 } },
    { id: 'c1-t2-b2', trial: 2, bout: 2, title: 'The List', portrait: 'solenne', rival: 'The Burning List', deck: D.charge,
      story: [S('Narration', 'Solenne swore to burn away every shadow in the Crownfall. She has started a list.', true), S('Solenne Ash', 'Your name is not on it. Yet. Show me why it should stay off.')],
      objective: win, rules: 'An aggressive Charge deck. Block early.', reward: { valor: 80 } },
    { id: 'c1-t2-b3', trial: 2, bout: 3, title: "The Seeker's Test", portrait: 'kael', rival: 'Kingdom Duelists', deck: D.kingdom,
      story: [S('Kael', 'Stronger — for the Crown.', true), S('Kael', 'Trade well. Block well. That is all a duel is.')],
      objective: win, reward: { valor: 80 } },
    { id: 'c1-t2-b4', trial: 2, bout: 4, title: "The Longbow's Test", portrait: 'rowan', rival: 'Wings Over the Arena', deck: D.flyers,
      story: [S('Rowan', 'A thousand paces, now.', true), S('Rowan', 'The Arena has raised its banners. Every shard you break pays you back.')],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 80 } },
    { id: 'c1-t2-b5', trial: 2, bout: 5, title: "The Surgeon's Test", portrait: 'elara', rival: 'Field Hospital', deck: D.surgeons,
      story: [S('Elara', 'No one falls today.', true), S('Elara', 'My soldiers keep coming back. Can you keep up?')],
      objective: win, reward: { valor: 90 } },
    // ── Trial 3 · The Banners Gather ──
    { id: 'c1-t3-b1', trial: 3, bout: 1, title: 'Two Crowns', portrait: 'aurelia', rival: "Aurelia's Vanguard", deck: D.commanders,
      story: [S('Narration', 'Aurelia already has a crown. She wants to know why this one is bigger.', true), S('Aurelia', 'Rally to me!', true),
        S('Aurelia', 'Prove your banner is worth the Kingdom’s time. Lose no more than two shards.')],
      objective: { kind: 'keepShards', n: 3 }, rules: 'Win with at least 3 of your shards.', reward: { valor: 100, cards: ['aurelia'] } },
    { id: 'c1-t3-b2', trial: 3, bout: 2, title: 'Rally to Me', portrait: 'aurelia', rival: 'Kingdom Duelists', deck: D.kingdom,
      story: [S('Aurelia', 'For the realm!', true), S('Narration', 'Kael and Rowan take the field at your side. The Arena pours its Command into both armies.')],
      setup: { myField: ['kael', 'rowan'], edict: 'edict-crowns_bounty' }, objective: win, rules: 'You start with Kael and Rowan on the field. Edict in play: Crown’s Bounty.', reward: { valor: 100 } },
    { id: 'c1-t3-b3', trial: 3, bout: 3, title: 'The Unbroken Line', portrait: 'varr', rival: 'The Unbroken Line', deck: D.wall,
      story: [S('Narration', 'Varr has held every line he was given. He was never given the Crown.', true), S('General Varr', 'Form up!', true),
        S('General Varr', 'A wall cannot be pushed. It can only be gone around.')],
      objective: win, rules: 'A defensive deck of Bulwark and Shields. Go wide and Scorch.', reward: { valor: 100, cards: ['varr'] } },
    { id: 'c1-t3-b4', trial: 3, bout: 4, title: 'Nine Days at the Bridge', portrait: 'varr', rival: 'Blood & Ember', deck: 'ember',
      story: [S('General Varr', 'The line does not break.', true), S('Narration', 'Blood & Ember pours across the bridge. Varr stands beside you. Hold until the sixth round begins.')],
      setup: { myField: ['varr'] }, objective: { kind: 'survive', rounds: 6 }, rules: 'Survive: still have a shard when round 6 begins.', reward: { valor: 110 } },
    { id: 'c1-t3-b5', trial: 3, bout: 5, title: 'Before the Light', portrait: 'varr', rival: 'The Unbroken Line', deck: D.wall,
      story: [S('General Varr', 'Hold the line!', true), S('General Varr', 'Beyond this gate waits the First Light. Show me you can hold a line before you face it.')],
      objective: { kind: 'keepShards', n: 4 }, rules: 'Win with at least 4 of your shards.', reward: { valor: 120 } },
    // ── The Crowning ──
    { id: 'c1-crowning', trial: 4, bout: 1, title: 'The Crowning: Sol', portrait: 'sol', rival: 'Sol, The First Light', deck: D.sol,
      story: [S('Narration', 'The gate opens on light so bright the shadows forget where to stand.'),
        S('Narration', 'Before anything, there was Sol. Sol would like it back that way.', true),
        S('Sol', 'Before anything, there was me.', true), S('Sol', 'Show me what you would do with the morning, Sovereign.')],
      objective: win, rules: 'The Crowning. Sol is in the rival’s deck.', reward: { valor: 300, cards: ['sol-2', 'sol-3'] },
      crowning: {
        contender: { deck: D.sol, printing: 'base' },
        masterwork: { deck: D.sol, printing: 'masterwork', setup: { edict: 'edict-exalted_dawn' } },
        omega: { deck: D.sol, printing: 'omega', setup: { edict: 'edict-exalted_dawn', rivalField: ['sol'] } },
      } },
  ],
};


// ════════════════════════ Chapter II · Blood and Ember ════════════════════════
const D2 = {
  pack: deck('c2-pack', 'The Winter Pack', 'Wildkin · Umbral', [['fen', 2], ['rask', 2], ['grizz', 2], ['nyx', 2], ['shade', 2], ['ronin', 2],
    ['feral-howl', 2], ['fallen_crown', 2], ['bloodscent', 2], ['last_stand', 2], ['firebolt', 2], ['flare-up', 2], ['back_doctrine', 2], ['opening_salvo', 2], ['kindling', 2]],
    ['fen-2', 'fen-3', 'rask-2', 'rask-3']),
  heavies: deck('c2-heavies', 'The Mountain Range', 'Wildkin · Titanborn · Verdant', [['grizz', 2], ['knuckle', 2], ['borin', 2], ['torren', 2], ['titanrho', 1], ['gaia', 1], ['bramble', 2],
    ['shield-wall', 2], ['last_stand', 2], ['first-light', 2], ['crown_of_war', 2], ['crowns_favor', 2], ['royal-dispatch', 2], ['steady_coffers', 2], ['battle_hymn', 2], ['crest_verdant', 2]],
    ['grizz-2', 'grizz-3', 'knuckle-2', 'knuckle-3']),
  pit: deck('c2-pit', 'The Pits of Sszar', 'Wildkin · Voltborn · Astral', [['rask', 2], ['fen', 2], ['ronin', 2], ['astryon', 1], ['ladyvolt', 1], ['kael', 2], ['valkara', 2],
    ['feral-howl', 2], ['fallen_crown', 2], ['executioner', 2], ['battle_hymn', 2], ['back_doctrine', 2], ['flare-up', 2], ['crest_duelist', 2], ['opening_salvo', 2], ['glass_crown', 2]],
    ['rask-2', 'rask-3', 'ronin-2', 'ronin-3']),
  sparks: deck('c2-sparks', 'Too Many Sparks', 'Elemental · Gearbound · Hexbound', [['emberling', 2], ['pip', 2], ['gearwick', 2], ['hexie', 2], ['zyrak', 2], ['ignara', 2],
    ['firebolt', 2], ['firestorm', 2], ['kindling', 2], ['crown_of_chaos', 2], ['executioner', 2], ['opening_salvo', 2], ['lucky_draw', 2], ['ember-trap', 2], ['golden_parting', 2]],
    ['emberling-2', 'emberling-3', 'pip-2', 'pip-3']),
  tides: deck('c2-tides', 'The Silent Tide', 'Elemental · Dawnforged · Astral', [['mirella', 2], ['solara', 2], ['elysian', 1], ['elara', 2], ['seren', 2], ['torren', 2], ['grimm', 1],
    ['shield-wall', 2], ['dawnward-oath', 2], ['royal-dispatch', 2], ['crown_bond', 2], ['crowns_favor', 2], ['first-light', 2], ['merchant_prince', 2], ['hold-the-gate', 2], ['studious', 2]],
    ['mirella-2', 'mirella-3', 'seren-2', 'seren-3']),
  pyre: deck('c2-pyre', 'The Living Pyre', 'Elemental · Verdant · Titanborn', [['ignara', 2], ['bramble', 2], ['thorn', 2], ['torren', 2], ['grimm', 2], ['varr', 1], ['gaia', 1],
    ['cinder-veil', 2], ['ember-trap', 2], ['last_stand', 2], ['bloodscent', 2], ['firebolt', 2], ['shield-wall', 2], ['first-light', 2], ['royal-dispatch', 2], ['steady_coffers', 2]],
    ['ignara-2', 'ignara-3', 'thorn-2', 'thorn-3']),
  dragonfire: deck('c2-dragonfire', 'Dragon-Blooded', 'Elemental · Wildkin · Voltborn', [['pyrax', 2], ['emberling', 2], ['ignara', 2], ['fen', 2], ['kira', 2], ['solenne', 2],
    ['firebolt', 2], ['firestorm', 2], ['feral-howl', 2], ['flare-up', 2], ['crown_of_war', 2], ['fallen_crown', 2], ['ascension_rite', 2], ['tempered_victory', 2], ['kindling', 2]],
    ['pyrax-2', 'pyrax-3', 'emberling-2', 'emberling-3']),
  aurex: deck('c2-aurex', 'The Last Dragon', 'Wyrmblood · Elemental · Wildkin', [['aurex', 1], ['pyrax', 2], ['ignara', 2], ['emberling', 2], ['fen', 2], ['grizz', 2], ['valkara', 2],
    ['firebolt', 2], ['firestorm', 2], ['feral-howl', 2], ['flare-up', 2], ['crown_of_war', 1], ['ember-trap', 2], ['cinder-veil', 2], ['fourth_crown', 2], ['return-to-fire', 2]],
    ['aurex-2', 'aurex-3', 'pyrax-2', 'pyrax-3', 'ignara-2', 'ignara-3', 'valkara-2', 'valkara-3']),
};
Object.assign(CAMPAIGN_DECKS, D2);

export const CHAPTER_II: Chapter = {
  id: 'c2', numeral: 'II', title: 'Blood and Ember', legend: 'aurex', playerDeck: 'ember', playerDeckName: 'Blood & Ember',
  trials: ['The Hunt Begins', 'Tests of Fang and Flame', 'The Road to the Dragon'],
  intro: [
    S('Narration', 'Sol has seen what your banner can do. Word travels fast in the Crownfall, and it reaches the wild places first.'),
    S('Narration', 'Every dragon died for the Crown. Aurex is here to find out whether it was worth it.', true),
    S('Narration', 'Before the last dragon will face you, the beasts and the fires of the Crownfall want to see if you can keep up.'),
  ],
  bouts: [
    // ── Trial 1 · The Hunt Begins ──
    { id: 'c2-t1-b1', trial: 1, bout: 1, title: 'Red Moon Rising', portrait: 'fen', rival: 'The Winter Pack', deck: D2.pack,
      story: [S('Narration', 'Fen tracks weakness. He learned it from the winters, and the winters were thorough.', true), S('Fen', 'I smell weakness.', true),
        S('Fen', 'You start behind. Good. The pack hunts hardest when it is hungry.')],
      setup: { myCrown: 3 }, objective: win, rules: 'You start with only 3 Crown Shards. Fen hits harder while you are behind.', reward: { valor: 70, cards: ['fen'] } },
    { id: 'c2-t1-b2', trial: 1, bout: 2, title: 'The Mountain', portrait: 'grizz', rival: 'The Winter Pack', deck: D2.pack,
      story: [S('Narration', 'Grizz does not understand the Crown. He understands that everyone wants it, and he likes a crowd.', true), S('Grizz', 'GRAHH!', true),
        S('Narration', 'Grizz plants himself in front of your Crown. Let him block.')],
      setup: { myField: ['grizz'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'Grizz starts on your field. Win with at least 3 of your shards.', reward: { valor: 70, cards: ['grizz'] } },
    { id: 'c2-t1-b3', trial: 1, bout: 3, title: 'One, Two, Three', portrait: 'rask', rival: 'Arena Sparring Ring', deck: D.training,
      story: [S('Narration', 'Rask counts in threes. So do his opponents, briefly.', true), S('Rask', 'One. Two. Three.', true)],
      setup: { myField: ['rask'], rivalCrown: 3 }, objective: win, rules: 'Rask starts on your field. The sparring ring has 3 shards.', reward: { valor: 70, cards: ['rask'] } },
    { id: 'c2-t1-b4', trial: 1, bout: 4, title: 'Too Close to the Spell', portrait: 'emberling', rival: 'Too Many Sparks', deck: D2.sparks,
      story: [S('Narration', 'She was a candle once. Then someone read a spell too close to her.', true), S('Emberling', 'Can I burn something?', true),
        S('Emberling', 'Scorch takes away Guard. Little champions melt. Big ones get worried!')],
      objective: win, rules: 'A deck full of small Scorch effects. Watch your champions’ Guard.', reward: { valor: 70, cards: ['emberling'] } },
    { id: 'c2-t1-b5', trial: 1, bout: 5, title: 'The Silence', portrait: 'mirella', rival: 'Too Many Sparks', deck: D2.sparks,
      story: [S('Narration', 'Mirella can hear every ocean. The Crownfall has none, and the silence frightens her.', true), S('Mirella', 'The tide turns.', true),
        S('Mirella', 'Stand with me until the fire runs out.')],
      setup: { myField: ['mirella'] }, objective: { kind: 'survive', rounds: 5 }, rules: 'Mirella starts on your field. Survive until round 5 begins.', reward: { valor: 80, cards: ['mirella'] } },
    // ── Trial 2 · Tests of Fang and Flame ──
    { id: 'c2-t2-b1', trial: 2, bout: 1, title: 'The Pack’s Test', portrait: 'fen', rival: 'The Winter Pack', deck: D2.pack,
      story: [S('Fen', 'The pack grows.', true), S('Fen', 'Keep your blockers standing. We strike what is already tired.')],
      objective: win, rules: 'An Ambush deck: champions that strike sideways targets first.', reward: { valor: 90 } },
    { id: 'c2-t2-b2', trial: 2, bout: 2, title: 'The Bear’s Test', portrait: 'grizz', rival: 'The Mountain Range', deck: D2.heavies,
      story: [S('Grizz', 'BIGGER GRAHH!', true), S('Narration', 'A wall of fur and stone. You will not push through it. Go around.')],
      objective: win, reward: { valor: 90 } },
    { id: 'c2-t2-b3', trial: 2, bout: 3, title: 'The Pit Champion’s Test', portrait: 'rask', rival: 'The Pits of Sszar', deck: D2.pit,
      story: [S('Rask', 'The crowd chants my name.', true), S('Narration', 'The pits pay for every shard broken. Rask has never left them hungry.')],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 90 } },
    { id: 'c2-t2-b4', trial: 2, bout: 4, title: 'The Spark’s Test', portrait: 'emberling', rival: 'Too Many Sparks', deck: D2.sparks,
      story: [S('Emberling', "I'm a real fire now!", true), S('Emberling', 'Let’s see who burns out first!')],
      objective: win, reward: { valor: 90 } },
    { id: 'c2-t2-b5', trial: 2, bout: 5, title: 'The Tide’s Test', portrait: 'mirella', rival: 'The Silent Tide', deck: D2.tides,
      story: [S('Mirella', 'Every ocean sings with me.', true), S('Narration', 'Shields rise like waves. Break them, or flow around them.')],
      objective: win, rules: 'A deck of Shields and card draw.', reward: { valor: 100 } },
    // ── Trial 3 · The Road to the Dragon ──
    { id: 'c2-t3-b1', trial: 3, bout: 1, title: 'The Wall of Fire', portrait: 'ignara', rival: 'The Living Pyre', deck: D2.pyre,
      story: [S('Narration', 'Ignara was born in a volcano. She considers everywhere else cold.', true), S('Ignara', 'Everywhere else is cold.', true),
        S('Ignara', 'Attack me. Everyone does, once.')],
      objective: { kind: 'keepShards', n: 3 }, rules: 'Blockers that burn their attackers. Win with at least 3 shards.', reward: { valor: 100, cards: ['ignara'] } },
    { id: 'c2-t3-b2', trial: 3, bout: 2, title: 'The Pyre’s Test', portrait: 'ignara', rival: 'The Living Pyre', deck: D2.pyre,
      story: [S('Ignara', 'Burn brighter!', true), S('Narration', 'Each shard that breaks feeds its owner a card. The fire spreads.')],
      setup: { edict: 'edict-shard_season' }, objective: win, rules: 'Edict in play: Shard Season.', reward: { valor: 100 } },
    { id: 'c2-t3-b3', trial: 3, bout: 3, title: 'Lizard With a Temper', portrait: 'pyrax', rival: 'Dragon-Blooded', deck: D2.dragonfire,
      story: [S('Narration', "Pyrax's grandmother was a dragon. Pyrax intends to be one too.", true), S('Pyrax', 'Grandmother would be proud.', true),
        S('Pyrax', 'You want to meet the last dragon? Get past the next one first.')],
      objective: win, reward: { valor: 110, cards: ['pyrax'] } },
    { id: 'c2-t3-b4', trial: 3, bout: 4, title: 'The Crowd Roars', portrait: 'grizz', rival: 'The Mountain Range', deck: D2.heavies,
      story: [S('Narration', 'Grizz and Rask take the field together. The crowd loves it. So does the Arena, which pours Command into both sides.')],
      setup: { myField: ['grizz', 'rask'], edict: 'edict-crowns_bounty' }, objective: win, rules: 'Grizz and Rask start on your field. Edict in play: Crown’s Bounty.', reward: { valor: 110 } },
    { id: 'c2-t3-b5', trial: 3, bout: 5, title: 'Halfway', portrait: 'pyrax', rival: 'Dragon-Blooded', deck: D2.dragonfire,
      story: [S('Pyrax', 'The dragon wakes.', true), S('Pyrax', 'He is just beyond that gate. Show him we are worth waking for.')],
      setup: { myField: ['pyrax'], edict: 'edict-scholars_ascent' }, objective: { kind: 'keepShards', n: 3 }, rules: 'Pyrax starts on your field. Edict in play: Scholar’s Ascent. Win with at least 3 shards.', reward: { valor: 120 } },
    // ── The Crowning ──
    { id: 'c2-crowning', trial: 4, bout: 1, title: 'The Crowning: Aurex', portrait: 'aurex', rival: 'Aurex, The Last Dragon', deck: D2.aurex,
      story: [S('Narration', 'The sky over the Arena turns the colour of embers. Something vast settles on the far wall.'),
        S('Aurex', 'The last dragon answers.', true),
        S('Aurex', 'Every dragon died for that Crown. Tell me, Sovereign. Was it worth it?')],
      objective: win, rules: 'The Crowning. Aurex is in the rival’s deck.', reward: { valor: 300, cards: ['aurex-2', 'aurex-3'] },
      crowning: {
        contender: { deck: D2.aurex, printing: 'base' },
        masterwork: { deck: D2.aurex, printing: 'masterwork', setup: { edict: 'edict-war_banners' } },
        omega: { deck: D2.aurex, printing: 'omega', setup: { edict: 'edict-war_banners', rivalField: ['aurex'] } },
      } },
  ],
};

// ════════════════════════ Chapter III · The Iron Covenant ════════════════════════
const D3 = {
  player: deck('c3-player', 'Iron Covenant', 'Gearbound · Titanborn', [['pip', 2], ['bolt', 2], ['gearwick', 2], ['hex3', 2], ['spark', 2], ['torren', 2], ['borin', 2], ['knuckle', 2], ['titanrho', 1],
    ['crest_gearbound', 2], ['shield-wall', 2], ['royal-dispatch', 2], ['firebolt', 2], ['hold-the-gate', 2], ['first-light', 1], ['crowns_favor', 2]],
    ['gearwick-2', 'gearwick-3', 'spark-2', 'spark-3', 'borin-2', 'borin-3', 'torren-2', 'torren-3']),
  blast: deck('c3-blast', 'Demolition Crew', 'Gearbound · Hexbound · Verdant', [['pip', 2], ['thorn', 2], ['vessimer', 1], ['hexie', 2], ['emberling', 2], ['kira', 2],
    ['firebolt', 2], ['firestorm', 2], ['crown_of_chaos', 2], ['executioner', 2], ['ember-trap', 2], ['kindling', 2], ['opening_salvo', 2], ['coin_flip', 2], ['lucky_draw', 2], ['glass_crown', 1]],
    ['pip-2', 'pip-3', 'hexie-2', 'hexie-3']),
  door: deck('c3-door', 'The Door That Remains', 'Gearbound · Hollow · Titanborn', [['bolt', 2], ['grimm', 2], ['torren', 2], ['titanrho', 1], ['varr', 1], ['gaia', 1], ['rowan', 2],
    ['shield-wall', 2], ['hold-the-gate', 2], ['dawnward-oath', 2], ['first-light', 2], ['cinder-veil', 2], ['last_stand', 2], ['crowns_favor', 2], ['steady_coffers', 2], ['royal-dispatch', 2], ['studious', 1]],
    ['bolt-2', 'bolt-3', 'grimm-2', 'grimm-3']),
  siege: deck('c3-siege', 'Siege Battery', 'Gearbound · Riftborn · Voltborn', [['gearwick', 2], ['blacktide', 1], ['dax', 2], ['kira', 2], ['rowan', 2], ['orion', 2],
    ['firestorm', 2], ['firebolt', 2], ['arrow-volley', 2], ['royal-dispatch', 2], ['crest_gearbound', 2], ['opening_salvo', 2], ['crown_of_war', 1], ['ember-trap', 2], ['kindling', 2], ['golden_parting', 2]],
    ['gearwick-2', 'gearwick-3', 'dax-2', 'dax-3']),
  prototypes: deck('c3-prototypes', 'The Prototype Lab', 'Gearbound · Astral · Hollow', [['hex3', 2], ['spark', 2], ['seren', 2], ['morrow', 2], ['pip', 2],
    ['training_dummy', 2], ['summoners_pact', 2], ['living_arena', 1], ['crest_gearbound', 2], ['royal-dispatch', 2], ['shield-wall', 2], ['crown_bond', 2], ['opening_salvo', 2], ['steady_coffers', 2], ['lucky_draw', 1], ['tempered_victory', 2]],
    ['spark-2', 'spark-3', 'hex3-2', 'hex3-3']),
  fortress: deck('c3-fortress', 'The Last Fortress', 'Gearbound · Titanborn', [['titanrho', 1], ['torren', 2], ['bolt', 2], ['borin', 2], ['grimm', 2], ['varr', 1], ['gaia', 1],
    ['shield-wall', 2], ['hold-the-gate', 2], ['cinder-veil', 2], ['last_stand', 2], ['dawnward-oath', 2], ['first-light', 2], ['crowns_favor', 2], ['crown_of_war', 1], ['steady_coffers', 2], ['royal-dispatch', 2]],
    ['torren-2', 'torren-3', 'borin-2', 'borin-3']),
  forge: deck('c3-forge', 'Titan’s Deep', 'Titanborn · Wildkin', [['borin', 2], ['knuckle', 2], ['grizz', 2], ['rask', 2], ['torren', 2], ['kael', 2],
    ['crown_of_war', 2], ['battle_hymn', 2], ['feral-howl', 2], ['flare-up', 2], ['back_doctrine', 2], ['last_stand', 2], ['royal-dispatch', 2], ['fallen_crown', 2], ['crest_duelist', 2]],
    ['knuckle-2', 'knuckle-3', 'borin-2', 'borin-3']),
  atlas: deck('c3-atlas', 'Omega Protocol', 'Gearbound', [['atlas', 1], ['titanrho', 1], ['gearwick', 2], ['spark', 2], ['hex3', 2], ['bolt', 2], ['torren', 2], ['borin', 2],
    ['crest_gearbound', 2], ['shield-wall', 2], ['hold-the-gate', 2], ['crown_of_war', 1], ['grand_convergence', 1], ['royal-dispatch', 2], ['firestorm', 2], ['fourth_crown', 2], ['crowns_favor', 2]],
    ['atlas-2', 'atlas-3', 'gearwick-2', 'gearwick-3', 'spark-2', 'spark-3', 'hex3-2', 'hex3-3']),
};
Object.assign(CAMPAIGN_DECKS, D3);

export const CHAPTER_III: Chapter = {
  id: 'c3', numeral: 'III', title: 'The Iron Covenant', legend: 'atlas', playerDeck: D3.player, playerDeckName: 'Iron Covenant',
  trials: ['The Workshop Wakes', 'Tests of Iron', 'The Deep Forge'],
  intro: [
    S('Narration', 'Below the floating kingdom, workshops hum and forges never cool. The machines and the mountain-folk have watched your banner rise.'),
    S('Narration', 'ATLAS-Ω was built to end a war. It did. It is still waiting for its next order.', true),
    S('Narration', 'The Iron Covenant lends you its own deck. Prove you can run it, and the war machine will answer.'),
  ],
  bouts: [
    // ── Trial 1 · The Workshop Wakes ──
    { id: 'c3-t1-b1', trial: 1, bout: 1, title: 'Pip Brought Explosives', portrait: 'pip', rival: 'Demolition Crew', deck: D3.blast,
      story: [S('Narration', 'Pip was told the Crownfall was a place of great explosions. Pip was not told correctly, so Pip brought his own.', true), S('Pip', 'Pip brought explosives!', true)],
      setup: { rivalCrown: 3 }, objective: win, rules: 'The Demolition Crew has only 3 shards.', reward: { valor: 80, cards: ['pip'] } },
    { id: 'c3-t1-b2', trial: 1, bout: 2, title: 'The Door Is Gone', portrait: 'bolt', rival: 'Demolition Crew', deck: D3.blast,
      story: [S('Narration', 'Bolt was built to guard a door. The door is gone. Bolt has decided you are the door now.', true), S('Bolt', 'Unit B-07 online.', true)],
      setup: { myField: ['bolt'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'Bolt starts on your field. Win with at least 3 shards.', reward: { valor: 80, cards: ['bolt'] } },
    { id: 'c3-t1-b3', trial: 1, bout: 3, title: 'Calculating Trajectory', portrait: 'gearwick', rival: 'Siege Battery', deck: D3.siege,
      story: [S('Narration', 'Gearwick-9 has calculated the odds of winning the Crown. It will not tell you them.', true), S('Gearwick-9', 'Calculating trajectory.', true)],
      objective: win, rules: 'A long-range deck that Scorches every rival champion.', reward: { valor: 80, cards: ['gearwick'] } },
    { id: 'c3-t1-b4', trial: 1, bout: 4, title: 'Very, Very Careful', portrait: 'hex3', rival: 'The Prototype Lab', deck: D3.prototypes,
      story: [S('Narration', 'Prototypes one and two exploded. HEX-3 is careful. HEX-3 is very, very careful.', true), S('HEX-3', 'Reactor stable. Mostly.', true)],
      setup: { myField: ['hex3'] }, objective: { kind: 'survive', rounds: 5 }, rules: 'HEX-3 starts on your field. Survive until round 5 begins.', reward: { valor: 90, cards: ['hex3'] } },
    { id: 'c3-t1-b5', trial: 1, bout: 5, title: 'Excessive Voltage', portrait: 'spark', rival: 'The Prototype Lab', deck: D3.prototypes,
      story: [S('Narration', 'Professor Spark was expelled from four academies for "excessive voltage".', true), S('Professor Spark', 'Excessive voltage? Never!', true)],
      setup: { edict: 'edict-crowns_bounty' }, objective: win, rules: 'Edict in play: Crown’s Bounty. Tokens everywhere.', reward: { valor: 90, cards: ['spark'] } },
    // ── Trial 2 · Tests of Iron ──
    { id: 'c3-t2-b1', trial: 2, bout: 1, title: 'BIGGER BOOM', portrait: 'pip', rival: 'Demolition Crew', deck: D3.blast,
      story: [S('Pip', 'BIGGER BOOM!', true), S('Narration', 'Every shard that breaks hands its owner a card. Pip calls that "more ammunition".')],
      setup: { edict: 'edict-shard_season' }, objective: win, rules: 'Edict in play: Shard Season.', reward: { valor: 100 } },
    { id: 'c3-t2-b2', trial: 2, bout: 2, title: 'Upgrade Accepted', portrait: 'bolt', rival: 'The Door That Remains', deck: D3.door,
      story: [S('Bolt', 'Upgrade accepted.', true), S('Narration', 'A deck of doors and walls. Find the hinge.')],
      objective: win, reward: { valor: 100 } },
    { id: 'c3-t2-b3', trial: 2, bout: 3, title: 'Additional Barrels', portrait: 'gearwick', rival: 'Siege Battery', deck: D3.siege,
      story: [S('Gearwick-9', 'Additional barrels installed.', true)],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 100 } },
    { id: 'c3-t2-b4', trial: 2, bout: 4, title: 'Core Output Increased', portrait: 'hex3', rival: 'The Prototype Lab', deck: D3.prototypes,
      story: [S('HEX-3', 'Core output increased.', true), S('Narration', 'HEX-3 is still being careful. Its rivals are not.')],
      objective: win, reward: { valor: 100 } },
    { id: 'c3-t2-b5', trial: 2, bout: 5, title: 'Version Two', portrait: 'spark', rival: 'The Prototype Lab', deck: D3.prototypes,
      story: [S('Professor Spark', 'Version two, even better!', true), S('Professor Spark', 'Ascending is cheaper today. I may have adjusted the Arena. Slightly.')],
      setup: { edict: 'edict-scholars_ascent' }, objective: { kind: 'keepShards', n: 3 }, rules: 'Edict in play: Scholar’s Ascent. Win with at least 3 shards.', reward: { valor: 110 } },
    // ── Trial 3 · The Deep Forge ──
    { id: 'c3-t3-b1', trial: 3, bout: 1, title: 'Stand Behind Me', portrait: 'torren', rival: 'Titan’s Deep', deck: D3.forge,
      story: [S('Narration', 'The Titanborn say a shield is a promise. Torren has never broken one.', true), S('Torren', 'Stand behind me.', true)],
      setup: { myField: ['torren'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'Torren starts on your field. Win with at least 3 shards.', reward: { valor: 110, cards: ['torren'] } },
    { id: 'c3-t3-b2', trial: 3, bout: 2, title: 'The Forge Is Hot', portrait: 'borin', rival: 'Titan’s Deep', deck: D3.forge,
      story: [S('Narration', 'The Forgekin of Titan’s Deep sing to metal until it agrees to become a hammer. Borin sings loudest.', true), S('Borin Ironbelly', 'The forge is hot!', true)],
      objective: win, reward: { valor: 110, cards: ['borin'] } },
    { id: 'c3-t3-b3', trial: 3, bout: 3, title: 'Surface Fighters', portrait: 'knuckle', rival: 'Titan’s Deep', deck: D3.forge,
      story: [S('Narration', 'Knuckle has never lost a fight in the Underpits. He is here to see if the surface is any harder.', true), S('Knuckle', 'Surface fighters. Cute.', true)],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 110, cards: ['knuckle'] } },
    { id: 'c3-t3-b4', trial: 3, bout: 4, title: 'City Status: Unknown', portrait: 'titanrho', rival: 'The Last Fortress', deck: D3.fortress,
      story: [S('Narration', 'Titan Rho guarded a city for ten thousand years. It does not know the city fell.', true), S('Titan Rho', 'City status: unknown. Defending anyway.', true)],
      objective: win, rules: 'The most defensive deck yet. Go wide, Scorch, and be patient.', reward: { valor: 120, cards: ['titanrho'] } },
    { id: 'c3-t3-b5', trial: 3, bout: 5, title: 'Perimeter Held', portrait: 'titanrho', rival: 'Siege Battery', deck: D3.siege,
      story: [S('Titan Rho', 'Fortress mode.', true), S('Narration', 'Titan Rho and Torren take the wall beside you while the siege guns open up. Hold until round 6.')],
      setup: { myField: ['titanrho', 'torren'] }, objective: { kind: 'survive', rounds: 6 }, rules: 'Titan Rho and Torren start on your field. Survive until round 6 begins.', reward: { valor: 120 } },
    // ── The Crowning ──
    { id: 'c3-crowning', trial: 4, bout: 1, title: 'The Crowning: ATLAS-Ω', portrait: 'atlas', rival: 'ATLAS-Ω, Final-Generation War Machine', deck: D3.atlas,
      story: [S('Narration', 'The workshop doors slide open. Something enormous has been standing in the dark, perfectly still, for a very long time.'),
        S('ATLAS-Ω', 'Awaiting orders.', true),
        S('ATLAS-Ω', 'New order received: test the Sovereign.')],
      objective: win, rules: 'The Crowning. ATLAS-Ω is in the rival’s deck.', reward: { valor: 300, cards: ['atlas-2', 'atlas-3'] },
      crowning: {
        contender: { deck: D3.atlas, printing: 'base' },
        masterwork: { deck: D3.atlas, printing: 'masterwork', setup: { edict: 'edict-crowns_bounty' } },
        omega: { deck: D3.atlas, printing: 'omega', setup: { edict: 'edict-crowns_bounty', rivalField: ['atlas'] } },
      } },
  ],
};

// ════════════════════════ Chapter IV · The Greenwall ════════════════════════
const D4 = {
  player: deck('c4-player', 'The Greenwall', 'Verdant · Hexbound', [['bramble', 2], ['thorn', 2], ['gaia', 1], ['hexie', 2], ['maeve', 2], ['vessimer', 1], ['torren', 2], ['elara', 2],
    ['crest_verdant', 2], ['shield-wall', 2], ['crowns_favor', 2], ['firebolt', 2], ['hold-the-gate', 2], ['dawnward-oath', 2], ['royal-dispatch', 2], ['living_arena', 1], ['first-light', 1]],
    ['bramble-2', 'bramble-3', 'thorn-2', 'thorn-3', 'maeve-2', 'maeve-3', 'hexie-2', 'hexie-3']),
  grove: deck('c4-grove', 'Roots of the Greenwall', 'Verdant · Titanborn · Gearbound', [['bramble', 2], ['torren', 2], ['gaia', 1], ['grimm', 2], ['titanrho', 1], ['bolt', 2],
    ['shield-wall', 2], ['crest_verdant', 2], ['last_stand', 2], ['first-light', 2], ['dawnward-oath', 2], ['crowns_favor', 2], ['hold-the-gate', 2], ['steady_coffers', 2], ['living_arena', 1], ['royal-dispatch', 2], ['cinder-veil', 1]],
    ['bramble-2', 'bramble-3', 'torren-2', 'torren-3']),
  thorns: deck('c4-thorns', 'The Unwelcoming Wood', 'Verdant · Hexbound · Umbral', [['thorn', 2], ['vessimer', 1], ['pip', 2], ['hexie', 2], ['emberling', 2], ['nyx', 2],
    ['firebolt', 2], ['firestorm', 2], ['ember-trap', 2], ['executioner', 2], ['crown_of_chaos', 2], ['bloodscent', 2], ['kindling', 2], ['glass_crown', 2], ['void_pact', 2], ['lucky_draw', 1]],
    ['thorn-2', 'thorn-3', 'hexie-2', 'hexie-3']),
  toads: deck('c4-toads', 'Hexie’s Hat', 'Hexbound · Riftborn · Gearbound', [['hexie', 2], ['zyrak', 2], ['pip', 2], ['emberling', 2], ['kira', 2],
    ['coin_flip', 2], ['roll_of_fate', 2], ['mystery_box', 2], ['crownfall_dice', 2], ['crown_of_chaos', 2], ['pandora', 2], ['firebolt', 2], ['kindling', 2], ['lucky_draw', 2], ['wild_gift', 2]],
    ['hexie-2', 'hexie-3', 'zyrak-2', 'zyrak-3']),
  bargains: deck('c4-bargains', 'The Old Bargain', 'Hexbound · Umbral · Hollow', [['maeve', 2], ['vessimer', 1], ['shade', 2], ['morrow', 2], ['dreadmouth', 2], ['nyx', 2],
    ['blood_price', 2], ['crimson_augury', 2], ['dark_bargain', 2], ['soul_tax', 2], ['abyssal_hunger', 2], ['void_pact', 2], ['royal-dispatch', 2], ['shield-wall', 2], ['crown_bond', 1], ['crowns_favor', 2]],
    ['maeve-2', 'maeve-3', 'morrow-2', 'morrow-3']),
  alchemy: deck('c4-alchemy', 'The Alchemist’s Table', 'Hexbound · Gearbound · Verdant', [['vessimer', 1], ['maeve', 2], ['hexie', 2], ['spark', 2], ['gearwick', 2], ['thorn', 2],
    ['firestorm', 2], ['executioner', 2], ['ember-trap', 2], ['crown_of_chaos', 2], ['merchant_prince', 2], ['pandora', 2], ['royal-dispatch', 2], ['kindling', 2], ['glass_crown', 2], ['golden_parting', 1]],
    ['vessimer-2', 'vessimer-3', 'gearwick-2', 'gearwick-3']),
  worldroot: deck('c4-worldroot', 'The Worldroot', 'Verdant · Elemental · Wildkin', [['gaia', 1], ['bramble', 2], ['thorn', 2], ['mirella', 2], ['torren', 2], ['grizz', 2], ['elara', 2],
    ['living_arena', 1], ['crest_verdant', 2], ['shield-wall', 2], ['crowns_favor', 2], ['summoners_pact', 2], ['first-light', 2], ['dawnward-oath', 2], ['royal-dispatch', 2], ['grand_convergence', 1], ['last_stand', 1]],
    ['gaia-2', 'gaia-3', 'bramble-2', 'bramble-3']),
  mother: deck('c4-mother', 'Every Forest', 'Verdant · Astral · Hollow', [['mother', 1], ['gaia', 1], ['bramble', 2], ['thorn', 2], ['maeve', 2], ['seren', 2], ['morrow', 2],
    ['living_arena', 1], ['summoners_pact', 2], ['crest_verdant', 2], ['shield-wall', 2], ['crowns_favor', 2], ['dawnward-oath', 2], ['royal-dispatch', 2], ['grand_convergence', 1], ['return-to-fire', 2], ['first-light', 2]],
    ['mother-2', 'mother-3', 'gaia-2', 'gaia-3', 'bramble-2', 'bramble-3', 'maeve-2', 'maeve-3']),
};
Object.assign(CAMPAIGN_DECKS, D4);

export const CHAPTER_IV: Chapter = {
  id: 'c4', numeral: 'IV', title: 'The Greenwall', legend: 'mother', playerDeck: D4.player, playerDeckName: 'The Greenwall',
  trials: ['Into the Greenwall', 'The Forest’s Tests', 'The Worldroot'],
  intro: [
    S('Narration', 'Past the last tower of the kingdom, the stone gives way to roots. The Greenwall forests have been listening to the Arena for a very long time.'),
    S('Narration', 'Every forest in every world is one of her children. She would like the Crown for the last one.', true),
    S('Narration', 'The forest lends you its banner. Walk carefully. Not everything that grows here is friendly.'),
  ],
  bouts: [
    // ── Trial 1 · Into the Greenwall ──
    { id: 'c4-t1-b1', trial: 1, bout: 1, title: 'Roots First', portrait: 'bramble', rival: 'Roots of the Greenwall', deck: D4.grove,
      story: [S('Narration', 'The Greenwall forests sent their smallest guardian into the Crownfall. The forest does not understand crowns. It understands roots.', true), S('Bramble', 'Roots first. Then questions.', true)],
      setup: { rivalCrown: 3 }, objective: win, rules: 'The grove has only 3 shards, but its champions are hard to move.', reward: { valor: 90, cards: ['bramble'] } },
    { id: 'c4-t1-b2', trial: 1, bout: 2, title: 'Not Every Forest Wants Visitors', portrait: 'thorn', rival: 'The Unwelcoming Wood', deck: D4.thorns,
      story: [S('Narration', 'Not every forest wants visitors.', true), S('Thorn', 'Step closer…', true)],
      objective: { kind: 'keepShards', n: 3 }, rules: 'A deck of Scorch and traps. Win with at least 3 shards.', reward: { valor: 90, cards: ['thorn'] } },
    { id: 'c4-t1-b3', trial: 1, bout: 3, title: 'Who Wants to Be a Toad?', portrait: 'hexie', rival: 'Hexie’s Hat', deck: D4.toads,
      story: [S('Narration', 'Hexie is not supposed to be here. Neither was anything she has ever turned into a toad.', true), S('Hexie', 'Who wants to be a toad?', true),
        S('Narration', 'Her deck runs on coin flips. Nothing about this Bout will go to plan.')],
      setup: { myField: ['hexie'] }, objective: win, rules: 'Hexie starts on your field. Expect the unexpected.', reward: { valor: 90, cards: ['hexie'] } },
    { id: 'c4-t1-b4', trial: 1, bout: 4, title: 'Every Gift Has a Price', portrait: 'maeve', rival: 'The Old Bargain', deck: D4.bargains,
      story: [S('Narration', 'Maeve always keeps her bargains. That is what makes them frightening.', true), S('Maeve', 'Every gift has a price.', true),
        S('Maeve', 'You may start with four shards. That is my gift. Spend them wisely.')],
      setup: { myCrown: 4 }, objective: win, rules: 'You start with 4 Crown Shards. The rival breaks its own shards for power.', reward: { valor: 90, cards: ['maeve'] } },
    { id: 'c4-t1-b5', trial: 1, bout: 5, title: 'A New Experiment', portrait: 'vessimer', rival: 'The Alchemist’s Table', deck: D4.alchemy,
      story: [S('Narration', 'Nobody has seen Vessimer’s face. Vessimer is not sure he still has one.', true), S('Vessimer', 'A new experiment!', true)],
      setup: { myField: ['vessimer'] }, objective: { kind: 'survive', rounds: 5 }, rules: 'Vessimer starts on your field. Survive until round 5 begins.', reward: { valor: 100, cards: ['vessimer'] } },
    // ── Trial 2 · The Forest's Tests ──
    { id: 'c4-t2-b1', trial: 2, bout: 1, title: 'I Grew!', portrait: 'bramble', rival: 'Roots of the Greenwall', deck: D4.grove,
      story: [S('Bramble', 'I grew!', true), S('Narration', 'The Arena pours Command into both sides. The grove spends it on walls.')],
      setup: { edict: 'edict-crowns_bounty' }, objective: win, rules: 'Edict in play: Crown’s Bounty.', reward: { valor: 110 } },
    { id: 'c4-t2-b2', trial: 2, bout: 2, title: 'In Full Bloom', portrait: 'thorn', rival: 'The Unwelcoming Wood', deck: D4.thorns,
      story: [S('Thorn', 'In full bloom.', true)],
      setup: { edict: 'edict-shard_season' }, objective: win, rules: 'Edict in play: Shard Season.', reward: { valor: 110 } },
    { id: 'c4-t2-b3', trial: 2, bout: 3, title: 'My Hat Has Opinions', portrait: 'hexie', rival: 'Hexie’s Hat', deck: D4.toads,
      story: [S('Hexie', 'My hat has opinions!', true), S('Hexie', 'Mostly about you.')],
      objective: win, reward: { valor: 110 } },
    { id: 'c4-t2-b4', trial: 2, bout: 4, title: 'The Old Bargain Holds', portrait: 'maeve', rival: 'The Old Bargain', deck: D4.bargains,
      story: [S('Maeve', 'The old bargain holds.', true)],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 110 } },
    { id: 'c4-t2-b5', trial: 2, bout: 5, title: 'The Formula Improves', portrait: 'vessimer', rival: 'The Alchemist’s Table', deck: D4.alchemy,
      story: [S('Vessimer', 'The formula improves.', true)],
      objective: { kind: 'keepShards', n: 3 }, rules: 'Win with at least 3 shards.', reward: { valor: 120 } },
    // ── Trial 3 · The Worldroot ──
    { id: 'c4-t3-b1', trial: 3, bout: 1, title: 'I Remember Who Built This Place', portrait: 'gaia', rival: 'The Worldroot', deck: D4.worldroot,
      story: [S('Narration', 'Gaia Prime was old when the Crownfall was built. She remembers who built it.', true), S('Gaia Prime', 'I remember who built this place.', true),
        S('Gaia Prime', 'No, I will not tell you. Not yet.')],
      objective: win, reward: { valor: 120, cards: ['gaia'] } },
    { id: 'c4-t3-b2', trial: 3, bout: 2, title: 'The Forest Walks', portrait: 'gaia', rival: 'The Worldroot', deck: D4.worldroot,
      story: [S('Gaia Prime', 'The forest walks with me.', true)],
      setup: { edict: 'edict-scholars_ascent' }, objective: { kind: 'keepShards', n: 3 }, rules: 'Edict in play: Scholar’s Ascent. Win with at least 3 shards.', reward: { valor: 120 } },
    { id: 'c4-t3-b3', trial: 3, bout: 3, title: 'Debts Collected', portrait: 'maeve', rival: 'The Alchemist’s Table', deck: D4.alchemy,
      story: [S('Maeve', 'Debts collected.', true), S('Narration', 'Maeve and Thorn stand with you. Vessimer owes Maeve something, and she has come to collect.')],
      setup: { myField: ['maeve', 'thorn'] }, objective: win, rules: 'Maeve and Thorn start on your field.', reward: { valor: 120 } },
    { id: 'c4-t3-b4', trial: 3, bout: 4, title: 'The Garden Wins', portrait: 'thorn', rival: 'The Old Bargain', deck: D4.bargains,
      story: [S('Thorn', 'The garden wins.', true), S('Narration', 'Bramble and Thorn hold the hedge line. Survive until round 6.')],
      setup: { myField: ['bramble', 'thorn'] }, objective: { kind: 'survive', rounds: 6 }, rules: 'Bramble and Thorn start on your field. Survive until round 6 begins.', reward: { valor: 130 } },
    { id: 'c4-t3-b5', trial: 3, bout: 5, title: 'Worldroot!', portrait: 'gaia', rival: 'The Worldroot', deck: D4.worldroot,
      story: [S('Gaia Prime', 'Worldroot!', true), S('Gaia Prime', 'She is waiting at the heart of the forest. Show me you will not wither in front of her.')],
      setup: { myField: ['gaia'] }, objective: { kind: 'keepShards', n: 4 }, rules: 'Gaia Prime starts on your field. Win with at least 4 shards.', reward: { valor: 130 } },
    // ── The Crowning ──
    { id: 'c4-crowning', trial: 4, bout: 1, title: 'The Crowning: Mother Verdant', portrait: 'mother', rival: 'Mother Verdant', deck: D4.mother,
      story: [S('Narration', 'At the heart of the Greenwall, the trees lean inward, as if listening. Someone very old is waiting there.'),
        S('Mother Verdant', 'Come, my children.', true),
        S('Mother Verdant', 'And you, little Sovereign. Let us see what grows.')],
      objective: win, rules: 'The Crowning. Mother Verdant is in the rival’s deck.', reward: { valor: 300, cards: ['mother-2', 'mother-3'] },
      crowning: {
        contender: { deck: D4.mother, printing: 'base' },
        masterwork: { deck: D4.mother, printing: 'masterwork', setup: { edict: 'edict-crowns_bounty' } },
        omega: { deck: D4.mother, printing: 'omega', setup: { edict: 'edict-crowns_bounty', rivalField: ['mother'] } },
      } },
  ],
};

// ════════════════════════ Chapter V · The Unremembered ════════════════════════
const D5 = {
  player: deck('c5-player', 'The Unremembered', 'Hollow · Kingdom · Umbral', [['grimm', 2], ['morrow', 2], ['dreadmouth', 2], ['elara', 2], ['torren', 2], ['shade', 2], ['nyx', 2],
    ['return-to-fire', 2], ['forge_masters_favor', 2], ['mirror_shard', 2], ['summoners_pact', 2], ['shield-wall', 2], ['royal-dispatch', 2], ['last_stand', 2], ['dawnward-oath', 1], ['crowns_favor', 1]],
    ['grimm-2', 'grimm-3', 'morrow-2', 'morrow-3', 'dreadmouth-2', 'dreadmouth-3', 'elara-2', 'elara-3']),
  sentry: deck('c5-sentry', 'The Old Guard', 'Hollow · Gearbound · Kingdom', [['grimm', 2], ['bolt', 2], ['torren', 2], ['varr', 1], ['titanrho', 1], ['rowan', 2],
    ['shield-wall', 2], ['hold-the-gate', 2], ['last_stand', 2], ['dawnward-oath', 2], ['first-light', 2], ['cinder-veil', 2], ['crowns_favor', 2], ['steady_coffers', 2], ['royal-dispatch', 2], ['studious', 2]],
    ['grimm-2', 'grimm-3', 'bolt-2', 'bolt-3']),
  maw: deck('c5-maw', 'The Gullet', 'Hollow · Wildkin · Titanborn', [['dreadmouth', 2], ['grizz', 2], ['rask', 2], ['fen', 2], ['knuckle', 2], ['shade', 2],
    ['feral-howl', 2], ['fallen_crown', 2], ['executioner', 2], ['crown_of_war', 2], ['flare-up', 2], ['back_doctrine', 2], ['blood_price', 2], ['soul_tax', 2], ['glass_crown', 2]],
    ['dreadmouth-2', 'dreadmouth-3', 'knuckle-2', 'knuckle-3']),
  legion: deck('c5-legion', 'The Waiting Legion', 'Hollow · Astral · Umbral', [['morrow', 2], ['seren', 2], ['spark', 2], ['vespera', 1], ['elara', 2], ['grimm', 2],
    ['summoners_pact', 2], ['training_dummy', 2], ['return-to-fire', 2], ['mirror_shard', 2], ['forge_masters_favor', 2], ['living_arena', 1], ['royal-dispatch', 2], ['shield-wall', 2], ['crowns_favor', 2], ['tempered_victory', 2]],
    ['morrow-2', 'morrow-3', 'seren-2', 'seren-3']),
  crypt: deck('c5-crypt', 'The Buried Fields', 'Hollow · Umbral · Hexbound', [['grimm', 2], ['dreadmouth', 2], ['morrow', 2], ['nyx', 2], ['shade', 2], ['maeve', 2],
    ['crimson_augury', 2], ['dark_bargain', 2], ['abyssal_hunger', 2], ['void_pact', 2], ['return-to-fire', 2], ['executioner', 2], ['firebolt', 2], ['royal-dispatch', 2], ['kindling', 2]],
    ['dreadmouth-2', 'dreadmouth-3', 'morrow-2', 'morrow-3']),
  unwritten: deck('c5-unwritten', 'The Forgotten Legion', 'Hollow', [['unwritten', 1], ['morrow', 2], ['grimm', 2], ['dreadmouth', 2], ['vespera', 1], ['shade', 2], ['elara', 2],
    ['summoners_pact', 2], ['return-to-fire', 2], ['mirror_shard', 2], ['forge_masters_favor', 2], ['abyssal_hunger', 2], ['shield-wall', 2], ['royal-dispatch', 2], ['crown_of_war', 1], ['grand_convergence', 1], ['crowns_favor', 2]],
    ['unwritten-2', 'unwritten-3', 'morrow-2', 'morrow-3', 'grimm-2', 'grimm-3', 'dreadmouth-2', 'dreadmouth-3']),
};
Object.assign(CAMPAIGN_DECKS, D5);

export const CHAPTER_V: Chapter = {
  id: 'c5', numeral: 'V', title: 'The Unremembered', legend: 'unwritten', playerDeck: D5.player, playerDeckName: 'The Unremembered',
  trials: ['The Buried Fields', 'Tests of the Forgotten', 'The Unwritten Road'],
  intro: [
    S('Narration', 'Some of the Crownfall’s champions are older than its stones. A few of them should not be walking at all.'),
    S('Narration', 'His name was erased from every record. He wants the Crown to write it back.', true),
    S('Narration', 'The forgotten answer only to those who remember them. Take up their banner, and learn their names.'),
  ],
  bouts: [
    // ── Trial 1 · The Buried Fields ──
    { id: 'c5-t1-b1', trial: 1, bout: 1, title: 'Reporting for Duty', portrait: 'grimm', rival: 'The Old Guard', deck: D5.sentry,
      story: [S('Narration', 'His war ended three centuries ago. Nobody told Grimm.', true), S('Grimm', 'Reporting for duty. Again.', true)],
      setup: { rivalCrown: 3 }, objective: win, rules: 'The Old Guard has only 3 shards, but it blocks everything.', reward: { valor: 100, cards: ['grimm'] } },
    { id: 'c5-t1-b2', trial: 1, bout: 2, title: 'Nobody Told Grimm', portrait: 'grimm', rival: 'The Buried Fields', deck: D5.crypt,
      story: [S('Narration', 'Grimm takes his post at your side. Nobody asked him to. Nobody needed to.')],
      setup: { myField: ['grimm'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'Grimm starts on your field. Win with at least 3 shards.', reward: { valor: 100 } },
    { id: 'c5-t1-b3', trial: 1, bout: 3, title: 'Hungry…', portrait: 'dreadmouth', rival: 'The Gullet', deck: D5.maw,
      story: [S('Narration', 'It ate a kingdom once. It is still hungry.', true), S('Dreadmouth', 'Hungry…', true)],
      objective: win, rules: 'A deck that grows stronger as it eats your champions.', reward: { valor: 100, cards: ['dreadmouth'] } },
    { id: 'c5-t1-b4', trial: 1, bout: 4, title: 'Death Is a Waste of Soldiers', portrait: 'morrow', rival: 'The Waiting Legion', deck: D5.legion,
      story: [S('Narration', 'Morrow believes death is a waste of good soldiers.', true), S('Morrow', 'Death is a waste of soldiers.', true),
        S('Narration', 'Every champion you defeat may come back. Keep pressing.')],
      objective: win, rules: 'The Legion keeps bringing champions back from the Fallen pile.', reward: { valor: 100, cards: ['morrow'] } },
    { id: 'c5-t1-b5', trial: 1, bout: 5, title: 'The Gullet', portrait: 'dreadmouth', rival: 'The Gullet', deck: D5.maw,
      story: [S('Narration', 'Dreadmouth has decided you are more interesting than food. For now. It stands with you in the valley of teeth.')],
      setup: { myField: ['dreadmouth'] }, objective: { kind: 'survive', rounds: 5 }, rules: 'Dreadmouth starts on your field. Survive until round 5 begins.', reward: { valor: 110 } },
    // ── Trial 2 · Tests of the Forgotten ──
    { id: 'c5-t2-b1', trial: 2, bout: 1, title: 'Still Haven’t Died Properly', portrait: 'grimm', rival: 'The Old Guard', deck: D5.sentry,
      story: [S('Grimm', "Still haven't died properly.", true)],
      setup: { edict: 'edict-crowns_bounty' }, objective: win, rules: 'Edict in play: Crown’s Bounty.', reward: { valor: 120 } },
    { id: 'c5-t2-b2', trial: 2, bout: 2, title: 'MORE TEETH', portrait: 'dreadmouth', rival: 'The Gullet', deck: D5.maw,
      story: [S('Dreadmouth', 'MORE TEETH.', true)],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 120 } },
    { id: 'c5-t2-b3', trial: 2, bout: 3, title: 'My Legion Grows', portrait: 'morrow', rival: 'The Waiting Legion', deck: D5.legion,
      story: [S('Morrow', 'My legion grows.', true)],
      setup: { edict: 'edict-scholars_ascent' }, objective: win, rules: 'Edict in play: Scholar’s Ascent.', reward: { valor: 120 } },
    { id: 'c5-t2-b4', trial: 2, bout: 4, title: 'The Graves Answer', portrait: 'morrow', rival: 'The Buried Fields', deck: D5.crypt,
      story: [S('Narration', 'The Buried Fields break their own shards for power. Every shard that breaks hands its owner a card.')],
      setup: { edict: 'edict-shard_season' }, objective: win, rules: 'Edict in play: Shard Season.', reward: { valor: 120 } },
    { id: 'c5-t2-b5', trial: 2, bout: 5, title: 'Another War Ended', portrait: 'grimm', rival: 'The Old Guard', deck: D5.sentry,
      story: [S('Grimm', 'Another war ended.', true), S('Grimm', 'Probably.')],
      objective: { kind: 'keepShards', n: 3 }, rules: 'Win with at least 3 shards.', reward: { valor: 130 } },
    // ── Trial 3 · The Unwritten Road ──
    { id: 'c5-t3-b1', trial: 3, bout: 1, title: 'Delicious', portrait: 'dreadmouth', rival: 'The Buried Fields', deck: D5.crypt,
      story: [S('Dreadmouth', 'Delicious.', true), S('Narration', 'You arrive with one shard already gone. Something in the Fields took a bite.')],
      setup: { myCrown: 4 }, objective: win, rules: 'You start with 4 Crown Shards.', reward: { valor: 130 } },
    { id: 'c5-t3-b2', trial: 3, bout: 2, title: 'Rise, and Rest', portrait: 'morrow', rival: 'The Buried Fields', deck: D5.crypt,
      story: [S('Morrow', 'Rise, and rest.', true), S('Narration', 'Morrow and Grimm take the field with you. The old soldiers know this ground.')],
      setup: { myField: ['morrow', 'grimm'] }, objective: win, rules: 'Morrow and Grimm start on your field.', reward: { valor: 130 } },
    { id: 'c5-t3-b3', trial: 3, bout: 3, title: 'The Missing Page', portrait: 'morrow', rival: 'The Waiting Legion', deck: D5.legion,
      story: [S('Narration', 'Every record of one name has been scraped clean. The Legion guards the place where the page was torn out.')],
      setup: { edict: 'edict-open_market' }, objective: { kind: 'keepShards', n: 3 }, rules: 'Edict in play: The Open Market. Win with at least 3 shards.', reward: { valor: 130 } },
    { id: 'c5-t3-b4', trial: 3, bout: 4, title: 'Hold the Grave', portrait: 'grimm', rival: 'The Gullet', deck: D5.maw,
      story: [S('Narration', 'Grimm and Dreadmouth stand at the mouth of the grave road. Something is coming up it. Hold until round 6.')],
      setup: { myField: ['grimm', 'dreadmouth'] }, objective: { kind: 'survive', rounds: 6 }, rules: 'Grimm and Dreadmouth start on your field. Survive until round 6 begins.', reward: { valor: 140 } },
    { id: 'c5-t3-b5', trial: 3, bout: 5, title: 'Remember My Name', portrait: 'unwritten', rival: 'The Waiting Legion', deck: D5.legion,
      story: [S('The Unwritten King', 'Remember my name.', true), S('Narration', 'The voice comes from beyond the last gate. Nobody in the Legion will say who it belongs to.')],
      objective: { kind: 'keepShards', n: 4 }, rules: 'Win with at least 4 shards.', reward: { valor: 140 } },
    // ── The Crowning ──
    { id: 'c5-crowning', trial: 4, bout: 1, title: 'The Crowning: The Unwritten King', portrait: 'unwritten', rival: 'The Unwritten King', deck: D5.unwritten,
      story: [S('Narration', 'A throne of grey stone stands where no throne is recorded. On it sits a king no record remembers.'),
        S('The Unwritten King', 'The forgotten answer.', true),
        S('The Unwritten King', 'Win, Sovereign, and perhaps you will be the one to write it down.')],
      objective: win, rules: 'The Crowning. The Unwritten King is in the rival’s deck.', reward: { valor: 300, cards: ['unwritten-2', 'unwritten-3'] },
      crowning: {
        contender: { deck: D5.unwritten, printing: 'base' },
        masterwork: { deck: D5.unwritten, printing: 'masterwork', setup: { edict: 'edict-shard_season' } },
        omega: { deck: D5.unwritten, printing: 'omega', setup: { edict: 'edict-shard_season', rivalField: ['unwritten'] } },
      } },
  ],
};

// ════════════════════════ Chapter VI · The Court of Night ════════════════════════
const D6 = {
  player: deck('c6-player', 'The Court of Night', 'Umbral · Voltborn · Wildkin', [['nyx', 2], ['shade', 2], ['vespera', 1], ['veilwalker', 1], ['ronin', 2], ['fen', 2], ['maeve', 2],
    ['bloodscent', 2], ['ember-trap', 2], ['back_doctrine', 2], ['executioner', 2], ['firebolt', 2], ['royal-dispatch', 2], ['glass_crown', 2], ['last_stand', 2], ['summoners_pact', 2]],
    ['nyx-2', 'nyx-3', 'shade-2', 'shade-3', 'vespera-2', 'vespera-3']),
  thieves: deck('c6-thieves', 'Thieves of the Star', 'Umbral · Riftborn · Voltborn', [['nyx', 2], ['shade', 2], ['veilwalker', 1], ['blacktide', 1], ['dax', 2], ['kira', 2],
    ['bloodscent', 2], ['ember-trap', 2], ['firebolt', 2], ['flare-up', 2], ['back_doctrine', 2], ['kindling', 2], ['lucky_draw', 2], ['glass_crown', 2], ['golden_parting', 2], ['victors_spoils', 2]],
    ['nyx-2', 'nyx-3', 'dax-2', 'dax-3']),
  masks: deck('c6-masks', 'The Faces', 'Umbral · Voltborn · Astral', [['shade', 2], ['nyx', 2], ['ronin', 2], ['veilwalker', 1], ['astryon', 1], ['fen', 2],
    ['executioner', 2], ['back_doctrine', 2], ['last_stand', 2], ['bloodscent', 2], ['crest_duelist', 2], ['glass_crown', 2], ['void_pact', 2], ['firebolt', 2], ['kindling', 2], ['opening_salvo', 2]],
    ['shade-2', 'shade-3', 'ronin-2', 'ronin-3']),
  court: deck('c6-court', 'The Unseen Court', 'Umbral · Hollow · Gearbound', [['vespera', 1], ['morrow', 2], ['seren', 2], ['spark', 2], ['hex3', 2], ['shade', 2],
    ['summoners_pact', 2], ['training_dummy', 2], ['living_arena', 1], ['royal-dispatch', 2], ['shield-wall', 2], ['crown_bond', 2], ['tempered_victory', 2], ['crowns_favor', 2], ['dawnward-oath', 2], ['opening_salvo', 2]],
    ['vespera-2', 'vespera-3', 'morrow-2', 'morrow-3']),
  void: deck('c6-void', 'Where the Empire Was', 'Umbral · Riftborn · Hexbound', [['maeve', 2], ['shade', 2], ['nyx', 2], ['dreadmouth', 2], ['zyrak', 2], ['hexie', 2],
    ['blood_price', 2], ['crimson_augury', 2], ['dark_bargain', 2], ['soul_tax', 2], ['crown_of_nothing', 2], ['abyssal_hunger', 2], ['void_pact', 2], ['executioner', 2], ['royal-dispatch', 2]],
    ['zyrak-2', 'zyrak-3', 'maeve-2', 'maeve-3']),
  noctara: deck('c6-noctara', 'Empress of Nothing', 'Umbral', [['noctara', 1], ['vespera', 1], ['shade', 2], ['nyx', 2], ['maeve', 2], ['zyrak', 2], ['veilwalker', 1],
    ['crown_of_nothing', 2], ['void_pact', 2], ['executioner', 2], ['abyssal_hunger', 2], ['dark_bargain', 2], ['royal-dispatch', 2], ['shield-wall', 2], ['crown_of_war', 1], ['grand_convergence', 1], ['crimson_augury', 2], ['firebolt', 1]],
    ['noctara-2', 'noctara-3', 'vespera-2', 'vespera-3', 'shade-2', 'shade-3', 'nyx-2', 'nyx-3']),
};
Object.assign(CAMPAIGN_DECKS, D6);

export const CHAPTER_VI: Chapter = {
  id: 'c6', numeral: 'VI', title: 'The Court of Night', legend: 'noctara', playerDeck: D6.player, playerDeckName: 'The Court of Night',
  trials: ['Whispers After Dark', 'Tests of the Night', 'The Empire That Vanished'],
  intro: [
    S('Narration', 'When the Arena’s torches burn low, another Crownfall wakes: thieves on the rooftops, masks in the alleys, a court that meets only when no one is watching.'),
    S('Narration', 'Noctara ruled an empire until it disappeared. She is not sure she did not do it.', true),
    S('Narration', 'The night lends you its banner. Keep your Crown close.'),
  ],
  bouts: [
    // ── Trial 1 · Whispers After Dark ──
    { id: 'c6-t1-b1', trial: 1, bout: 1, title: 'You Didn’t See Me', portrait: 'nyx', rival: 'Thieves of the Star', deck: D6.thieves,
      story: [S('Narration', 'Nyx stole a star once. She gave it back. Mostly.', true), S('Nyx', "You didn't see me.", true)],
      setup: { rivalCrown: 3 }, objective: win, rules: 'The thieves have only 3 shards, but they strike from the shadows.', reward: { valor: 110, cards: ['nyx'] } },
    { id: 'c6-t1-b2', trial: 1, bout: 2, title: 'She Gave It Back. Mostly.', portrait: 'nyx', rival: 'The Faces', deck: D6.masks,
      story: [S('Narration', 'Nyx slips onto your side of the field. You did not see her arrive.')],
      setup: { myField: ['nyx'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'Nyx starts on your field. Win with at least 3 shards.', reward: { valor: 110 } },
    { id: 'c6-t1-b3', trial: 1, bout: 3, title: 'A Mark Has Been Chosen', portrait: 'shade', rival: 'The Faces', deck: D6.masks,
      story: [S('Narration', 'Shade has worn many faces. The mask is the only one that stayed.', true), S('Shade', 'A mark has been chosen.', true)],
      objective: win, rules: 'A deck of Ambush assassins. Do not leave champions sideways.', reward: { valor: 110, cards: ['shade'] } },
    { id: 'c6-t1-b4', trial: 1, bout: 4, title: 'The Mask Stays', portrait: 'shade', rival: 'Thieves of the Star', deck: D6.thieves,
      story: [S('Narration', 'Shade stands with you tonight. Nobody knows why. Shade does not explain.')],
      setup: { myField: ['shade'] }, objective: { kind: 'survive', rounds: 5 }, rules: 'Shade starts on your field. Survive until round 5 begins.', reward: { valor: 120 } },
    { id: 'c6-t1-b5', trial: 1, bout: 5, title: 'Court Is in Session', portrait: 'vespera', rival: 'The Unseen Court', deck: D6.court,
      story: [S('Narration', 'Vespera rules a court that exists only when no one is looking.', true), S('Queen Vespera', 'Court is in session.', true)],
      objective: win, rules: 'The court fills the field with tokens.', reward: { valor: 120, cards: ['vespera'] } },
    // ── Trial 2 · Tests of the Night ──
    { id: 'c6-t2-b1', trial: 2, bout: 1, title: 'Quieter. Sharper.', portrait: 'nyx', rival: 'Thieves of the Star', deck: D6.thieves,
      story: [S('Nyx', 'Quieter. Sharper.', true)],
      setup: { edict: 'edict-war_banners' }, objective: win, rules: 'Edict in play: War Banners.', reward: { valor: 130 } },
    { id: 'c6-t2-b2', trial: 2, bout: 2, title: 'The Mask Cracks', portrait: 'shade', rival: 'The Faces', deck: D6.masks,
      story: [S('Shade', 'The mask cracks. Good.', true)],
      setup: { edict: 'edict-shard_season' }, objective: win, rules: 'Edict in play: Shard Season.', reward: { valor: 130 } },
    { id: 'c6-t2-b3', trial: 2, bout: 3, title: 'My Courtiers Grow Bold', portrait: 'vespera', rival: 'The Unseen Court', deck: D6.court,
      story: [S('Queen Vespera', 'My courtiers grow bold.', true)],
      setup: { edict: 'edict-crowns_bounty' }, objective: win, rules: 'Edict in play: Crown’s Bounty.', reward: { valor: 130 } },
    { id: 'c6-t2-b4', trial: 2, bout: 4, title: 'When No One Is Looking', portrait: 'vespera', rival: 'The Unseen Court', deck: D6.court,
      story: [S('Narration', 'The court only exists while no one is watching. Keep your eyes on your own Crown.')],
      objective: { kind: 'keepShards', n: 3 }, rules: 'Win with at least 3 shards.', reward: { valor: 130 } },
    { id: 'c6-t2-b5', trial: 2, bout: 5, title: 'The Void Deepens', portrait: 'noctara', rival: 'Where the Empire Was', deck: D6.void,
      story: [S('Noctara', 'The void deepens.', true), S('Narration', 'The rival breaks its own shards to feed the void. It may break itself first, or break you.')],
      objective: win, rules: 'A deck that breaks its own shards for power.', reward: { valor: 140 } },
    // ── Trial 3 · The Empire That Vanished ──
    { id: 'c6-t3-b1', trial: 3, bout: 1, title: 'Gone Before They Knew', portrait: 'nyx', rival: 'Where the Empire Was', deck: D6.void,
      story: [S('Nyx', 'Gone before they knew.', true), S('Narration', 'Nyx and Shade take the field with you, side by side for the first time.')],
      setup: { myField: ['nyx', 'shade'] }, objective: win, rules: 'Nyx and Shade start on your field.', reward: { valor: 140 } },
    { id: 'c6-t3-b2', trial: 3, bout: 2, title: 'Rise, My Court!', portrait: 'vespera', rival: 'The Faces', deck: D6.masks,
      story: [S('Queen Vespera', 'Rise, my court!', true)],
      setup: { myField: ['vespera'] }, objective: { kind: 'keepShards', n: 3 }, rules: 'Queen Vespera starts on your field. Win with at least 3 shards.', reward: { valor: 140 } },
    { id: 'c6-t3-b3', trial: 3, bout: 3, title: 'Dismissed', portrait: 'vespera', rival: 'The Unseen Court', deck: D6.court,
      story: [S('Queen Vespera', 'Dismissed.', true), S('Queen Vespera', 'Or not. Show me.')],
      setup: { edict: 'edict-scholars_ascent' }, objective: win, rules: 'Edict in play: Scholar’s Ascent.', reward: { valor: 140 } },
    { id: 'c6-t3-b4', trial: 3, bout: 4, title: 'Where the Empire Was', portrait: 'noctara', rival: 'Where the Empire Was', deck: D6.void,
      story: [S('Narration', 'You walk where a city once stood. Nothing is left, not even ruins. Something has already taken one of your shards.')],
      setup: { myCrown: 4 }, objective: win, rules: 'You start with 4 Crown Shards.', reward: { valor: 150 } },
    { id: 'c6-t3-b5', trial: 3, bout: 5, title: 'All Things End', portrait: 'noctara', rival: 'Where the Empire Was', deck: D6.void,
      story: [S('Noctara', 'All things end in me.', true), S('Narration', 'Her voice comes from the empty air. Show her you will not end so easily.')],
      objective: { kind: 'keepShards', n: 4 }, rules: 'Win with at least 4 shards.', reward: { valor: 150 } },
    // ── The Crowning ──
    { id: 'c6-crowning', trial: 4, bout: 1, title: 'The Crowning: Noctara', portrait: 'noctara', rival: 'Noctara, Empress of Nothing', deck: D6.noctara,
      story: [S('Narration', 'The Arena’s lights go out one by one, until only the Crown’s shards are glowing. Then those go dark too.'),
        S('Noctara', 'All things end in me.', true),
        S('Noctara', 'Perhaps you will not. Perhaps you will be the first.')],
      objective: win, rules: 'The Crowning. Noctara is in the rival’s deck.', reward: { valor: 300, cards: ['noctara-2', 'noctara-3'] },
      crowning: {
        contender: { deck: D6.noctara, printing: 'base' },
        masterwork: { deck: D6.noctara, printing: 'masterwork', setup: { edict: 'edict-shard_season' } },
        omega: { deck: D6.noctara, printing: 'omega', setup: { edict: 'edict-shard_season', rivalField: ['noctara'] } },
      } },
  ],
};

export const ACT_I = { id: 'act1', title: 'The Shattered Crown', chapters: [CHAPTER_I, CHAPTER_II, CHAPTER_III, CHAPTER_IV, CHAPTER_V, CHAPTER_VI] };
export const ALL_BOUTS: Bout[] = ACT_I.chapters.flatMap((c) => c.bouts);
