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

export interface Chapter { id: string; numeral: string; title: string; legend: string; intro: StoryLine[]; trials: string[]; bouts: Bout[] }

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
  id: 'c1', numeral: 'I', title: 'The First Light', legend: 'sol',
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

export const ACT_I = { id: 'act1', title: 'The Shattered Crown', chapters: [CHAPTER_I] };
export const ALL_BOUTS: Bout[] = ACT_I.chapters.flatMap((c) => c.bouts);
