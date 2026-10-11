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

export const ACT_I = { id: 'act1', title: 'The Shattered Crown', chapters: [CHAPTER_I, CHAPTER_II] };
export const ALL_BOUTS: Bout[] = ACT_I.chapters.flatMap((c) => c.bouts);
