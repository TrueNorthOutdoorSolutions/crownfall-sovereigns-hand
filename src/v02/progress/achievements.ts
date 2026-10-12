// ACHIEVEMENTS — permanent accomplishments for Sovereign's Hand. Pure data + a pure evaluator.
// PROPOSED (2026-10-11): every entry, target, reward and title here is new and awaits the owner's approval.
// Modelled on Crownfall's src/progression/achievements.ts: one entry holds up to five tiers (I–V), each with a rarity,
// an Achievement Score and a small Valor reward. "{n}" in a description is the tier target. `hidden` entries show as
// "???" until their first tier unlocks; `future` entries describe content that does not exist yet and never unlock.
// Ribbon art is reused from Crownfall (copied into public/v02/ribbons/); a ribbon may serve a differently named entry.
import { ALL_LINES } from '../content/cards';
import { SET1_PRINTINGS } from '../content/printings';
import type { Printing } from '../content/printings';
import { ACT_I, ALL_BOUTS } from '../campaign/act1';
import type { Profile } from '../economy/profile';
import type { Stats } from './stats';

export type AchRarity = 'common' | 'uncommon' | 'elite' | 'epic' | 'mythic';
export const RARITY_ORDER: AchRarity[] = ['common', 'uncommon', 'elite', 'epic', 'mythic'];
export const RARITY_LABEL: Record<AchRarity, string> = { common: 'Common', uncommon: 'Uncommon', elite: 'Elite', epic: 'Epic', mythic: 'Mythic' };
export const RARITY_COLOR: Record<AchRarity, string> = { common: '#b8c0cc', uncommon: '#6fe08a', elite: '#4a9bff', epic: '#c267ff', mythic: '#ff9a3b' };
/** Achievement Score per unlocked tier. */
export const RARITY_SCORE: Record<AchRarity, number> = { common: 10, uncommon: 20, elite: 40, epic: 80, mythic: 160 };
/** Valor paid when a tier is claimed (PROPOSED, deliberately modest: a pack costs 150). */
export const RARITY_VALOR: Record<AchRarity, number> = { common: 20, uncommon: 40, elite: 75, epic: 150, mythic: 300 };

export type AchievementCategory =
  | 'victories' | 'campaign' | 'ascension' | 'champions' | 'origins' | 'classes' | 'decks' | 'collection' | 'packs'
  | 'economy' | 'combat' | 'difficulty' | 'streaks' | 'secret' | 'arena';

export const CATEGORY_INFO: Record<AchievementCategory, { name: string; glyph: string }> = {
  victories: { name: 'Victories', glyph: '♛' }, campaign: { name: 'Campaign', glyph: '⚑' }, ascension: { name: 'Ascension & Awakening', glyph: '★' },
  champions: { name: 'Champions', glyph: '❖' }, origins: { name: 'Origins', glyph: '◈' }, classes: { name: 'Classes', glyph: '⬡' },
  decks: { name: 'Decks', glyph: '▤' }, collection: { name: 'Collection', glyph: '❂' }, packs: { name: 'Packs & Shop', glyph: '✉' },
  economy: { name: 'Economy', glyph: '◉' }, combat: { name: 'Combat', glyph: '⚔' }, difficulty: { name: 'Difficulty', glyph: '⛰' },
  streaks: { name: 'Streaks', glyph: '✹' }, secret: { name: 'Secret', glyph: '?' }, arena: { name: 'Arena of Ascension', glyph: '✪' },
};
export const CATEGORY_ORDER = Object.keys(CATEGORY_INFO) as AchievementCategory[];

export interface AchievementTier {
  target: number;
  rarity: AchRarity;
  valor: number;
  /** Title granted at this tier (PROPOSED names). */
  title?: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  /** "{n}" is replaced with the tier target. */
  desc: string;
  category: AchievementCategory;
  /** Glyph shown when there is no ribbon. */
  icon: string;
  /** "sum:<key>", "max:<key>", "set:<key>" (statistics) or "prof:<key>" (read from the profile). */
  metric: string;
  tiers: AchievementTier[];
  /** Ribbon file in public/v02/ribbons/ (reused from Crownfall). */
  ribbon?: string;
  hidden?: boolean;
  /** Content that does not exist yet: shown greyed with this note, never unlockable. */
  future?: string;
}

const R = (...r: AchRarity[]) => r;
const T = (targets: number[], rarities: AchRarity[], titles: Record<number, string> = {}): AchievementTier[] =>
  targets.map((target, i) => {
    const rarity = rarities[Math.min(i, rarities.length - 1)];
    return { target, rarity, valor: RARITY_VALOR[rarity], ...(titles[i] ? { title: titles[i] } : {}) };
  });
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
export const roman = (i: number) => ROMAN[i] ?? String(i + 1);
export const tierName = (def: AchievementDef, i: number) => (def.tiers.length > 1 ? `${def.name} ${roman(i)}` : def.name);

const a = (slug: string, name: string, desc: string, category: AchievementCategory, icon: string, metric: string, tiers: AchievementTier[], ribbon?: string, extra: Partial<AchievementDef> = {}): AchievementDef =>
  ({ id: `ach_${slug}`, name, desc, category, icon, metric, tiers, ...(ribbon ? { ribbon } : {}), ...extra });

// ─── Facts the catalogue is sized from ───────────────────────────────────────

const BASE_PRINTS = SET1_PRINTINGS.filter((p) => p.kind === 'base');
const MYTHIC_COUNT = BASE_PRINTS.filter((p) => p.rarity === 'mythic').length;
const ALT_COUNT = SET1_PRINTINGS.filter((p) => p.kind === 'alt').length;
const MW_COUNT = SET1_PRINTINGS.filter((p) => p.kind === 'masterwork').length;
const OM_COUNT = SET1_PRINTINGS.filter((p) => p.kind === 'omega').length;
const SURVIVE_BOUTS = ALL_BOUTS.filter((b) => b.objective.kind === 'survive').length;
const KEEP_BOUTS = ALL_BOUTS.filter((b) => b.objective.kind === 'keepShards').length;
const UNDERDOG_BOUTS = ALL_BOUTS.filter((b) => isUnderdog(b)).length;
function isUnderdog(b: (typeof ALL_BOUTS)[number]) {
  const s = b.crowning ? b.crowning.contender.setup : b.setup;
  return (s?.myCrown ?? 5) < (s?.rivalCrown ?? 5);
}
const upTo = (list: number[], max: number) => [...new Set([...list.filter((n) => n < max), max])];

const CHAMPION_LINES = ALL_LINES.filter((l) => (l.family ?? 'champion') === 'champion');
const ORIGINS = [...new Set(CHAMPION_LINES.flatMap((l) => l.origins))].sort();
const CLASSES = [...new Set(CHAMPION_LINES.flatMap((l) => l.classes))].sort();
const CHAMPION_COUNT = new Set(CHAMPION_LINES.map((l) => l.canonId)).size;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Catalogue ───────────────────────────────────────────────────────────────

const BASE: AchievementDef[] = [
  // ── Victories ──
  a('victor', 'Victor', 'Win {n} matches.', 'victories', '♛', 'sum:wins', T([1, 10, 50, 100, 500], R('common', 'uncommon', 'elite', 'epic', 'mythic'), { 2: 'the Victorious', 4: 'the Undefeated' }), 'ascended'),
  a('veteran', 'Veteran of the Arena', 'Play {n} matches.', 'victories', '⚑', 'sum:matches', T([1, 10, 50, 200, 1000], R('common', 'common', 'uncommon', 'elite', 'epic')), 'veteran'),
  a('ai_victor', 'Machine Breaker', 'Win {n} matches in Play vs AI.', 'victories', '⚙', 'sum:wins_ai', T([1, 10, 50, 100, 250], R('common', 'uncommon', 'elite', 'epic', 'mythic')), 'round_victor'),
  a('starters', 'Four Banners', 'Win with {n} different starter decks.', 'victories', '⚐', 'set:starters_won', T([1, 2, 4], R('common', 'uncommon', 'elite')), 'sovereigns_won'),
  a('flawless', 'Flawless', 'Win {n} matches without your rival breaking a single Crown Shard.', 'victories', '✧', 'sum:flawless_wins', T([1, 5, 25], R('uncommon', 'elite', 'epic')), 'flawless'),
  a('swift', 'Swift Coronation', 'Win {n} matches by round 6.', 'victories', '⚡', 'sum:swift_wins', T([1, 10, 50], R('uncommon', 'elite', 'epic')), 'quick_crown'),
  a('long_game', 'The Long Game', 'Win {n} matches that reach round 10.', 'victories', '⌛', 'sum:long_wins', T([1, 5, 25], R('uncommon', 'elite', 'epic')), 'long_game'),
  a('hall_of_fame', 'Hall of Fame', 'Reach an Achievement Score of {n}.', 'victories', '✪', 'prof:achievement_score', T([500, 2000, 5000, 10000], R('uncommon', 'elite', 'epic', 'mythic'), { 3: 'Legend of the Hand' }), 'score'),

  // ── Campaign ──
  a('bouts', 'The Shattered Crown', 'Clear {n} Bouts in Act I.', 'campaign', '⚑', 'prof:bouts_cleared', T(upTo([1, 16, 48, 96], ALL_BOUTS.length), R('common', 'uncommon', 'elite', 'epic', 'mythic'), { 4: 'Hand of the Crown' }), 'champion_challenges'),
  a('bouts_won', 'Campaigner', 'Win {n} campaign Bouts (replays count).', 'campaign', '⚔', 'sum:bouts_won', T([5, 25, 100, 250], R('common', 'uncommon', 'elite', 'epic')), 'pve'),
  a('crownings', 'Crownbreaker', 'Win {n} Crownings against the Tier V legends.', 'campaign', '♔', 'prof:crownings', T(upTo([1, 2, 4, 6], ACT_I.chapters.length), R('uncommon', 'elite', 'elite', 'epic', 'mythic'), { 4: 'Crownbreaker' }), 'sovereign_crown'),
  a('act1', 'Act I Complete', 'Clear every Bout of Act I, all eight Crownings included.', 'campaign', '♛', 'prof:act1', T([1], R('mythic'), { 0: 'Sovereign of the Shattered Crown' }), 'perfect_crown'),
  a('act2', 'Act II', 'Complete Act II of the campaign.', 'campaign', '♛', 'prof:act2', T([1], R('mythic')), undefined, { future: 'Coming with Act II' }),

  // ── Ascension & Awakening ──
  a('ascend', 'Rising Stars', 'Ascend champions to ★★ {n} times.', 'ascension', '★', 'sum:ascensions', T([5, 25, 100, 500, 2000], R('common', 'uncommon', 'elite', 'epic', 'mythic')), 'star2'),
  a('awaken', 'Awakened', 'Awaken champions to ★★★ {n} times.', 'ascension', '✶', 'sum:awakenings', T([1, 10, 50, 200, 1000], R('common', 'uncommon', 'elite', 'epic', 'mythic'), { 2: 'Starforged' }), 'star3'),
  a('awaken_variety', 'Constellation', `Awaken {n} different champions to ★★★.`, 'ascension', '✦', 'set:awakened', T(upTo([5, 15, 30], CHAMPION_COUNT), R('uncommon', 'elite', 'epic', 'mythic')), 'star3_variety'),
  a('legend_awaken', 'Myth Made Real', 'Awaken a Tier V legend to ★★★ {n} times.', 'ascension', '♆', 'sum:legend_awakenings', T([1, 10, 50], R('elite', 'epic', 'mythic')), 'mythic_star3'),
  a('ascend_match', 'Ascension Storm', 'Ascend or Awaken {n} times in one match.', 'ascension', '⇮', 'max:ascend_one_match', T([3, 5, 7], R('uncommon', 'elite', 'epic')), 'swift_ascension'),
  a('awaken_match', 'Twin Stars', 'Awaken {n} champions to ★★★ in one match.', 'ascension', '✶', 'max:awaken_one_match', T([2], R('epic')), 'star3_army'),

  // ── Champions ──
  a('variety', 'Many Faces', `Deploy {n} different champions of the ${CHAMPION_COUNT}.`, 'champions', '❖', 'set:champions_played', T(upTo([10, 25, 40], CHAMPION_COUNT), R('common', 'uncommon', 'elite', 'epic'), { 3: `Keeper of the ${CHAMPION_COUNT}` }), 'variety'),
  a('won_with', 'Companions in Victory', 'Win matches with {n} different champions deployed.', 'champions', '☆', 'set:champions_won', T(upTo([10, 25], CHAMPION_COUNT), R('uncommon', 'elite', 'epic')), 'sovereigns_played'),
  a('deploys', 'Call to Arms', 'Deploy {n} champions.', 'champions', '⚑', 'sum:deploys', T([50, 250, 1000, 5000], R('common', 'uncommon', 'elite', 'epic')), 'recruiter'),
  a('tier5', 'Legends Walk', 'Deploy Tier V Ascendant champions {n} times.', 'champions', '♆', 'sum:tier5_deploys', T([1, 25, 100], R('uncommon', 'elite', 'epic')), 'mythic_company'),
  a('tokens', 'Legion Caller', 'Summon {n} tokens.', 'champions', '✥', 'sum:tokens', T([10, 100, 500], R('common', 'uncommon', 'elite')), 'summons'),

  // ── Origins & Classes (breadth; one entry per Origin and Class is generated below) ──
  a('origins_wide', 'Many Banners', 'Deploy champions of {n} different Origins.', 'origins', '◈', 'set:origins_played', T(upTo([5, 10], ORIGINS.length), R('common', 'uncommon', 'elite')), 'origins_wide'),
  a('classes_wide', 'Every Discipline', 'Deploy champions of {n} different Classes.', 'classes', '⬡', 'set:classes_played', T(upTo([10, 18], CLASSES.length), R('common', 'uncommon', 'elite')), 'classes_wide'),

  // ── Decks ──
  a('deckwright', 'Deckwright', 'Have {n} decks of your own saved.', 'decks', '▤', 'prof:decks_saved', T([1, 3, 5, 10], R('common', 'uncommon', 'elite', 'epic')), 'full_house'),
  a('tinkerer', 'Tinkerer', 'Save changes to your decks {n} times.', 'decks', '⚒', 'sum:decks_saved', T([5, 25, 100], R('common', 'uncommon', 'elite')), 'decked_out'),
  a('custom_wins', 'My Own Design', 'Win {n} matches with a deck you built.', 'decks', '✎', 'sum:wins_custom', T([1, 10, 50, 100], R('uncommon', 'elite', 'epic', 'mythic'), { 2: 'Master Deckwright' }), 'forge_variety'),
  a('deck_variety', 'Many Strategies', 'Win with {n} different decks.', 'decks', '❖', 'set:decks_won', T([3, 6, 10], R('uncommon', 'elite', 'epic')), 'tapestry'),
  a('starters_played', 'Try Them All', 'Play a match with each of the {n} starter decks.', 'decks', '⚐', 'set:starters_played', T([4], R('uncommon')), 'explorer'),

  // ── Collection ──
  a('set1', 'Collector of the Shattered Crown', `Collect {n} of the ${BASE_PRINTS.length} Set 1 cards.`, 'collection', '❂', 'prof:set1_base',
    T(upTo([25, 62, 124, 186], BASE_PRINTS.length), R('common', 'uncommon', 'elite', 'epic', 'mythic'), { 4: 'Keeper of the Crown' }), 'cosmetics'),
  a('playsets', 'Full Playsets', 'Own 2 copies of {n} different Set 1 cards.', 'collection', '▣', 'prof:playsets', T(upTo([50, 124], BASE_PRINTS.length), R('uncommon', 'elite', 'epic')), 'titles'),
  a('mythics', 'Mythic Hoard', `Collect {n} of the ${MYTHIC_COUNT} Mythic cards.`, 'collection', '♆', 'prof:mythics', T(upTo([1, 5], MYTHIC_COUNT), R('uncommon', 'elite', 'epic')), 'pantheon'),
  a('alts', 'Alternate Visions', `Collect {n} of the ${ALT_COUNT} Alternate Arts.`, 'collection', '◎', 'prof:alts', T(upTo([1, 10, 26], ALT_COUNT), R('uncommon', 'elite', 'epic', 'mythic')), 'frame_gallery'),
  a('masterworks', 'Masterwork Gallery', `Collect {n} of the ${MW_COUNT} Masterworks.`, 'collection', '✠', 'prof:masterworks', T(upTo([1, 3], MW_COUNT), R('epic', 'epic', 'mythic')), 'artifact_set'),
  a('omegas', 'Omega', `Collect {n} of the ${OM_COUNT} Omega Masterworks.`, 'collection', 'Ω', 'prof:omegas', T(upTo([1, 3], OM_COUNT), R('mythic')), 'fourth_crown'),
  a('holo', 'Holo Shine', 'Own {n} Holo foils.', 'collection', '✧', 'prof:finish.holo', T([1, 25, 100], R('common', 'uncommon', 'elite')), 'shards'),
  a('prismatic', 'Prismatic Light', 'Own {n} Prismatic foils.', 'collection', '✦', 'prof:finish.prismatic', T([1, 10, 50], R('uncommon', 'elite', 'epic')), 'exalted'),
  a('rainbow', 'Sovereign Rainbow', 'Own {n} Sovereign Rainbow foils.', 'collection', '❋', 'prof:finish.rainbow', T([1, 5, 25], R('elite', 'epic', 'mythic')), 'artifact_first_realm_crown'),
  a('gilded', 'Gilded Glory', 'Own {n} Gilded cards.', 'collection', '♕', 'prof:finish.gilded', T([1, 5], R('epic', 'mythic')), 'hoard'),
  a('set2', 'Collector Beneath the Arena', 'Collect cards from Set 2 · Beneath the Arena.', 'collection', '❂', 'prof:set2', T([1], R('uncommon')), undefined, { future: 'Coming when Set 2 joins packs and the collection' }),

  // ── Packs & Shop ──
  a('packs', 'Pack Opener', 'Open {n} packs.', 'packs', '✉', 'prof:packs_opened', T([1, 10, 50, 100, 250], R('common', 'uncommon', 'elite', 'epic', 'mythic')), 'draft'),
  a('foils', 'Foil Finder', 'Pull {n} foils from packs.', 'packs', '✧', 'sum:foils_pulled', T([10, 100, 500], R('common', 'uncommon', 'elite')), 'draft_shards'),
  a('rainbow_pull', 'Chasing Rainbows', 'Pull {n} Sovereign Rainbow foils.', 'packs', '❋', 'sum:pulled.rainbow', T([1, 5, 20], R('elite', 'epic', 'mythic')), 'artifact_starless_tome'),
  a('alt_pull', 'Hidden Art', 'Pull {n} Alternate Arts.', 'packs', '◎', 'sum:alts_pulled', T([1, 10, 50], R('uncommon', 'elite', 'epic')), 'skin_equip'),
  a('mythic_pull', 'Mythic Pull', 'Pull {n} Mythic cards.', 'packs', '♆', 'sum:mythics_pulled', T([1, 10, 50], R('uncommon', 'elite', 'epic')), 'artifacts'),
  a('bundle', 'Grand Opening', 'Open a bundle of {n} packs at once.', 'packs', '⛁', 'max:bundle_size', T([5, 10, 25], R('common', 'uncommon', 'elite')), 'treasury'),

  // ── Economy ──
  a('valor', 'Valor Earned', 'Earn {n} Valor from matches, Bouts and salvage.', 'economy', '✧', 'sum:valor_earned', T([1000, 10000, 50000, 250000], R('common', 'uncommon', 'elite', 'epic')), 'income'),
  a('forge', 'Forgemaster', 'Forge {n} cards.', 'economy', '⚒', 'sum:forged', T([1, 10, 50, 200], R('common', 'uncommon', 'elite', 'epic')), 'forger'),
  a('salvage', 'Salvager', 'Salvage extra copies for {n} Valor.', 'economy', '⚖', 'sum:salvage_valor', T([100, 1000, 10000], R('common', 'uncommon', 'elite')), 'merchant'),
  a('first_wins', 'Daily Glory', 'Earn the first-win-of-the-day bonus {n} times.', 'economy', '☀', 'sum:first_wins', T([1, 7, 30, 100], R('common', 'uncommon', 'elite', 'epic')), 'interest'),
  a('treasury', 'Royal Treasury', 'Hold {n} Valor at once.', 'economy', '♛', 'prof:valor', T([3000, 10000, 25000], R('uncommon', 'elite', 'epic')), 'top_level'),

  // ── Combat ──
  a('shards', 'Shard Breaker', "Break {n} of your rivals' Crown Shards.", 'combat', '◆', 'sum:shards_broken', T([10, 100, 500, 2500], R('common', 'uncommon', 'elite', 'epic')), 'damage'),
  a('defeats', 'Reaper', 'Defeat {n} rival champions.', 'combat', '☠', 'sum:defeats', T([25, 250, 1000, 5000], R('common', 'uncommon', 'elite', 'epic')), 'kills'),
  a('defeats_match', 'Clean Sweep', 'Defeat {n} rival champions in one match.', 'combat', '✹', 'max:defeats_one_match', T([5, 8, 12], R('uncommon', 'elite', 'epic')), 'big_fight'),
  a('relics', 'Relic Bearer', 'Attach {n} Relics.', 'combat', '♜', 'sum:relics', T([5, 50, 250], R('common', 'uncommon', 'elite')), 'artifact_fallen_kings_blade'),
  a('tactics', 'Spellstorm', 'Cast {n} Tactics.', 'combat', '✺', 'sum:tactics', T([25, 250, 1000], R('common', 'uncommon', 'elite')), 'casts'),
  a('schemes', 'Schemer', 'Spring {n} Schemes.', 'combat', '☾', 'sum:schemes_sprung', T([5, 50, 250], R('common', 'uncommon', 'elite')), 'voidwalker'),
  a('edicts', 'Voice of the Crown', 'Proclaim {n} Edicts.', 'combat', '📜', 'sum:edicts', T([1, 25, 100], R('common', 'uncommon', 'elite')), 'oathbound'),

  // ── Difficulty ──
  a('contender', 'Contender Crowned', 'Win {n} Crownings on Contender difficulty.', 'difficulty', '♚', 'prof:crownings', T(upTo([1, 4], ACT_I.chapters.length), R('uncommon', 'elite', 'epic')), 'hard_victor'),
  a('survive', 'Hold the Line', 'Clear {n} survival Bouts.', 'difficulty', '⛨', 'prof:obj.survive', T(upTo([1, 5], SURVIVE_BOUTS), R('common', 'uncommon', 'elite')), 'tank'),
  a('keep_shards', 'Unbroken Crown', 'Clear {n} Bouts that require keeping your Crown Shards whole.', 'difficulty', '◆', 'prof:obj.keepShards', T(upTo([1, 5], KEEP_BOUTS), R('common', 'uncommon', 'elite')), 'shielder'),
  a('underdog', 'Underdog', 'Clear {n} Bouts that start you with fewer Crown Shards than your rival.', 'difficulty', '↺', 'prof:underdog', T(upTo([1, 5], UNDERDOG_BOUTS), R('uncommon', 'elite', 'epic')), 'comeback'),
  a('masterwork_crowning', 'Masterwork Crowning', 'Win a Crowning on Masterwork difficulty.', 'difficulty', '✠', 'prof:crowning_masterwork', T([1, 8], R('epic', 'mythic')), 'hard_top4', { future: 'Masterwork Crownings open after Act II' }),
  a('omega_crowning', 'Omega Crowning', 'Win a Crowning on Omega difficulty.', 'difficulty', 'Ω', 'prof:crowning_omega', T([1, 8], R('mythic')), 'mastery100', { future: 'Omega Crownings open after Act II' }),

  // ── Streaks ──
  a('win_streak', 'Unstoppable', 'Win {n} matches in a row.', 'streaks', '🔥', 'max:win_streak', T([3, 5, 10, 15], R('uncommon', 'elite', 'epic', 'mythic'), { 3: 'the Unstoppable' }), 'streak'),
  a('day_streak', 'Devotion', 'Play on {n} days in a row.', 'streaks', '☀', 'max:day_streak', T([3, 7, 14, 30], R('common', 'uncommon', 'elite', 'epic')), 'mastery_peak'),
  a('marathon', 'Marathon', 'Play {n} matches in one day.', 'streaks', '⌛', 'max:matches_one_day', T([5, 10, 20], R('common', 'uncommon', 'elite')), 'expressive'),

  // ── Secret ──
  a('by_a_thread', 'By a Thread', 'Win a match with exactly 1 Crown Shard left.', 'secret', '♥', 'sum:last_shard_wins', T([1], R('epic'), { 0: 'the Unbroken' }), 'unbroken', { hidden: true }),
  a('humble', 'Humble Beginnings', 'Win a match without Ascending or Awakening a single champion.', 'secret', '⚘', 'sum:humble_wins', T([1], R('epic')), 'humble', { hidden: true }),
  a('pantheon', 'Pantheon', 'Awaken 3 champions to ★★★ in one match.', 'secret', '♆', 'max:awaken_one_match', T([3], R('mythic'), { 0: 'the Starborn' }), 'pantheon', { hidden: true }),
  a('armoury', 'Armoury', 'Attach 3 Relics in one match.', 'secret', '⛨', 'max:relics_one_match', T([3], R('elite')), 'decked_out', { hidden: true }),
  a('mastermind', 'Mastermind', 'Spring 3 Schemes in one match.', 'secret', '☾', 'max:schemes_one_match', T([3], R('epic'), { 0: 'the Mastermind' }), 'last_laugh', { hidden: true }),
  a('lightning', 'Lightning Crown', 'Win a match by round 4.', 'secret', '⚡', 'sum:blitz_wins', T([1], R('mythic')), 'twin_peaks', { hidden: true }),

  // ── Arena of Ascension (future: online play) ──
  a('arena_debut', 'Arena Debut', 'Play a match in the Arena of Ascension.', 'arena', '✪', 'prof:arena_matches', T([1], R('common')), 'proud_display', { future: 'Coming with Arena of Ascension' }),
  a('arena_victor', 'Arena Victor', 'Win {n} matches in the Arena of Ascension.', 'arena', '♛', 'prof:arena_wins', T([1, 10, 50, 100], R('uncommon', 'elite', 'epic', 'mythic')), 'season0_win', { future: 'Coming with Arena of Ascension' }),
  a('arena_streak', 'Arena Streak', 'Win {n} Arena matches in a row.', 'arena', '🔥', 'prof:arena_streak', T([3, 5, 10], R('elite', 'epic', 'mythic')), 'account_level', { future: 'Coming with Arena of Ascension' }),
  a('arena_rank', 'Ascendant Rank', 'Reach a ranked tier in the Arena of Ascension.', 'arena', '⚜', 'prof:arena_rank', T([1], R('elite')), 'ranked', { future: 'Coming with Arena of Ascension' }),
];

// ── Per chapter and per Crowning (generated from the campaign) ──
const CHAPTER_RIBBON = ['trait_dawnforged', 'trait_wyrmblood', 'trait_gearbound', 'trait_verdant', 'trait_hollow', 'trait_umbral', 'trait_riftborn', 'trait_crownless'];
const CROWNING_RIBBON = ['boss_sentinel', 'boss_hydra', 'boss_golem', 'boss_treant', 'boss_guardian', 'boss_spiders', 'boss_variety', 'bosses'];
const CHAPTERS: AchievementDef[] = ACT_I.chapters.flatMap((c, i) => {
  const crowning = c.bouts.find((b) => b.crowning);
  const n = c.bouts.length;
  return [
    a(`chapter_${c.id}`, `Chapter ${c.numeral}: ${c.title}`, `Clear {n} of the ${n} Bouts of Chapter ${c.numeral}.`, 'campaign', '⚑', `prof:chapter.${c.id}`,
      T(upTo([5, 10], n), R('common', 'uncommon', 'elite')), CHAPTER_RIBBON[i]),
    ...(crowning ? [a(`crowning_${c.id}`, crowning.title, `Win the Crowning against ${crowning.rival}.`, 'campaign', '♔', `prof:crowning.${c.id}`, T([1], R('epic')), CROWNING_RIBBON[i])] : []),
  ];
});

// ── One entry per Origin and per Class (generated from the champion list) ──
const NEW_CLASS_RIBBON: Record<string, string> = {
  sapper: 'gambler', sharpshooter: 'carry', sentinel: 'shielder', restorer: 'healer', hunter: 'boss_variety', rogue: 'no_rerolls',
  channeler: 'casts', seer: 'scout', artificer: 'forger', delver: 'artifacts', gladiator: 'round_victor', binder: 'control',
};
const CROWNFALL_CLASSES = new Set(['vanguard', 'warden', 'bruiser', 'duelist', 'ranger', 'assassin', 'arcanist', 'mystic', 'summoner', 'artillerist', 'saboteur', 'commander', 'ascendant']);
const ORIGIN_ACHIEVEMENTS = ORIGINS.map((o) => a(`origin_${o}`, `Champion of ${cap(o)}`, `Deploy {n} ${cap(o)} champions.`, 'origins', '◈', `sum:origin.${o}`,
  T([10, 50, 200, 500], R('common', 'uncommon', 'elite', 'epic')), `trait_${o}`));
const CLASS_ACHIEVEMENTS = CLASSES.map((k) => a(`class_${k}`, `Way of the ${cap(k)}`, `Deploy {n} ${cap(k)} champions.`, 'classes', '⬡', `sum:class.${k}`,
  T([10, 50, 200], R('common', 'uncommon', 'elite')), CROWNFALL_CLASSES.has(k) ? `trait_${k}` : NEW_CLASS_RIBBON[k]));

export const ACHIEVEMENTS: AchievementDef[] = [...BASE, ...CHAPTERS, ...ORIGIN_ACHIEVEMENTS, ...CLASS_ACHIEVEMENTS]
  .sort((x, y) => CATEGORY_ORDER.indexOf(x.category) - CATEGORY_ORDER.indexOf(y.category));
export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((x) => [x.id, x]));

const SINGULAR: [RegExp, string][] = [[/\b1 matches\b/, '1 match'], [/\b1 times\b/, 'once'], [/\b1 Bouts\b/, '1 Bout'], [/\b1 decks\b/, '1 deck'], [/\b1 packs\b/, '1 pack'],
  [/\b1 cards\b/, '1 card'], [/\b1 foils\b/, '1 foil'], [/\b1 Edicts\b/, '1 Edict'], [/\b1 Relics\b/, '1 Relic'], [/\b1 Crownings\b/, '1 Crowning'], [/\b1 tokens\b/, '1 token'],
  [/\b1 Alternate Arts\b/, '1 Alternate Art'], [/\b1 Masterworks\b/, '1 Masterwork'], [/\b1 Omega Masterworks\b/, '1 Omega Masterwork'], [/\b1 Gilded cards\b/, '1 Gilded card'],
  [/\b1 Mythic cards\b/, '1 Mythic card'], [/\b1 (Holo|Prismatic|Sovereign Rainbow) foils\b/, '1 $1 foil'], [/\b1 survival Bouts\b/, '1 survival Bout'], [/\b1 Bouts that\b/, '1 Bout that'],
  [/ that require /, ' that requires '], [/\b1 days\b/, '1 day']];
/** Fill "{n}" in a description, with singular wording when n is 1. */
export function describe(desc: string, n: number): string {
  let s = desc.replace('{n}', n.toLocaleString('en-US'));
  if (n === 1) for (const [re, sg] of SINGULAR) s = s.replace(re, sg);
  return s;
}

// ─── Evaluation ──────────────────────────────────────────────────────────────

const PRINT: Record<string, Printing> = Object.fromEntries(SET1_PRINTINGS.map((p) => [p.id, p]));

/** Every "prof:" metric, read once from the profile. */
export function profileMetrics(profile: Pick<Profile, 'owned' | 'decks' | 'packsOpened' | 'valor' | 'campaign'>): Record<string, number> {
  const m: Record<string, number> = {};
  const base = new Set<string>(), alts = new Set<string>(), mws = new Set<string>(), oms = new Set<string>(), mythics = new Set<string>();
  const copies: Record<string, number> = {};
  for (const [k, n] of Object.entries(profile.owned ?? {})) {
    if (!(n > 0)) continue;
    const [id, finish] = k.split('|');
    const p = PRINT[id];
    if (!p) continue;
    m[`finish.${finish}`] = (m[`finish.${finish}`] ?? 0) + n;
    if (p.kind === 'base') { base.add(id); copies[id] = (copies[id] ?? 0) + n; if (p.rarity === 'mythic') mythics.add(id); }
    else if (p.kind === 'alt') alts.add(id);
    else if (p.kind === 'masterwork') mws.add(id);
    else if (p.kind === 'omega') oms.add(id);
  }
  m.set1_base = base.size;
  m.playsets = Object.values(copies).filter((n) => n >= 2).length;
  m.alts = alts.size; m.masterworks = mws.size; m.omegas = oms.size; m.mythics = mythics.size;
  m.decks_saved = profile.decks?.length ?? 0;
  m.packs_opened = profile.packsOpened ?? 0;
  m.valor = profile.valor ?? 0;
  const cleared = (id: string) => !!profile.campaign?.[id];
  m.bouts_cleared = ALL_BOUTS.filter((b) => cleared(b.id)).length;
  m.act1 = m.bouts_cleared === ALL_BOUTS.length ? 1 : 0;
  m.crownings = 0;
  for (const c of ACT_I.chapters) {
    m[`chapter.${c.id}`] = c.bouts.filter((b) => cleared(b.id)).length;
    const cr = c.bouts.find((b) => b.crowning);
    m[`crowning.${c.id}`] = cr && cleared(cr.id) ? 1 : 0;
    m.crownings += m[`crowning.${c.id}`];
  }
  m['obj.survive'] = ALL_BOUTS.filter((b) => b.objective.kind === 'survive' && cleared(b.id)).length;
  m['obj.keepShards'] = ALL_BOUTS.filter((b) => b.objective.kind === 'keepShards' && cleared(b.id)).length;
  m.underdog = ALL_BOUTS.filter((b) => isUnderdog(b) && cleared(b.id)).length;
  return m;
}

export function metricValue(metric: string, stats: Stats, prof: Record<string, number>): number {
  const i = metric.indexOf(':');
  const kind = metric.slice(0, i), key = metric.slice(i + 1);
  if (kind === 'sum') return stats.sum[key] ?? 0;
  if (kind === 'max') return stats.max[key] ?? 0;
  if (kind === 'set') return stats.set[key]?.length ?? 0;
  if (kind === 'prof') return prof[key] ?? 0;
  return 0;
}

export interface AchievementStatus {
  def: AchievementDef;
  value: number;
  /** Tiers unlocked. */
  done: number;
  claimed: number;
  /** Tiers unlocked but not yet claimed. */
  claimable: number;
  /** Valor waiting to be claimed. */
  pendingValor: number;
  next: AchievementTier | null;
  /** Secret and still locked: show "???". */
  secret: boolean;
}

export interface Evaluation {
  list: AchievementStatus[];
  score: number;
  maxScore: number;
  /** Tiers unlocked since `seen` (oldest first). */
  newly: { id: string; tier: number }[];
  claimable: number;
  titles: string[];
}

/** Pure: what is unlocked, what is claimable and what is new since the last check. */
export function evaluate(stats: Stats, profile: Pick<Profile, 'owned' | 'decks' | 'packsOpened' | 'valor' | 'campaign'>,
  marks: { claimed?: Record<string, number>; seen?: Record<string, number> } = {}): Evaluation {
  const prof = profileMetrics(profile);
  const doneOf = (def: AchievementDef, v: number) => (def.future ? 0 : def.tiers.filter((t) => v >= t.target).length);
  // The Achievement Score is computed first (without Hall of Fame) so Hall of Fame can read it.
  let score = 0;
  for (const def of ACHIEVEMENTS) {
    if (def.metric === 'prof:achievement_score') continue;
    const d = doneOf(def, metricValue(def.metric, stats, prof));
    for (let i = 0; i < d; i++) score += RARITY_SCORE[def.tiers[i].rarity];
  }
  prof.achievement_score = score;
  const list: AchievementStatus[] = [];
  const newly: { id: string; tier: number }[] = [];
  const titles: string[] = [];
  let claimable = 0, maxScore = 0;
  for (const def of ACHIEVEMENTS) {
    const value = metricValue(def.metric, stats, prof);
    const done = doneOf(def, value);
    if (def.metric === 'prof:achievement_score') for (let i = 0; i < done; i++) score += RARITY_SCORE[def.tiers[i].rarity];
    if (!def.future) for (const t of def.tiers) maxScore += RARITY_SCORE[t.rarity];
    const claimed = Math.min(marks.claimed?.[def.id] ?? 0, done);
    const pendingValor = def.tiers.slice(claimed, done).reduce((n, t) => n + t.valor, 0);
    for (let i = marks.seen?.[def.id] ?? 0; i < done; i++) newly.push({ id: def.id, tier: i });
    for (let i = 0; i < done; i++) if (def.tiers[i].title) titles.push(def.tiers[i].title!);
    claimable += done - claimed;
    list.push({ def, value, done, claimed, claimable: done - claimed, pendingValor, next: def.tiers[done] ?? null, secret: !!def.hidden && done === 0 });
  }
  return { list, score, maxScore, newly, claimable, titles };
}
