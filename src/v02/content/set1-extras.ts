// Set 1 — THE SHATTERED CROWN, beyond the champions:
//  • summon tokens (Crownfall's own summons),
//  • Tactics and Schemes named after Crownfall's 67 Crown Powers (7 of them are the renamed starter-deck spells in cards.ts;
//    the other 60 are here), each keeping its school's identity:
//      War = combat boosts · Fortune = Command and cards · Evolution = Ascension · Chaos = coin flips ·
//      Creation = tokens and Crests · Void = break your own shards for power,
//  • the 6 Set 1 Edicts (Crownfall's Ascension Edicts, proclaimed by their canonical host champions).
// Names are canonical. Costs and rules text are DRAFT design (not yet balance-tested in a deck).
import type { ChampionLine, Effect, EdictDef, SpellDef } from './cards';

const token = (canonId: string, name: string, might: number, guard: number, keywords: ChampionLine['forms'][number]['keywords'] = [], text = ''): ChampionLine => ({
  canonId, lineId: `token-${canonId}`, family: 'token', set: 1, name, title: 'Token', tier: 1, origins: [], classes: [],
  forms: [{ star: 1, cost: 0, might, guard, keywords, text }],
});

export const SET1_TOKENS: ChampionLine[] = [
  token('starling', 'Starling', 1, 1, ['Flight']),
  token('turret', 'Arc Turret', 2, 2, ['Reach']),
  token('skeleton', 'Risen Soldier', 2, 1),
  token('shadow', 'Court Shade', 2, 1, ['Ambush']),
  token('grove_treant', 'Treant', 1, 4, ['Bulwark']),
  token('fallen', 'Fallen Warrior', 3, 2),
  token('crownling', 'Crownling', 1, 1, ['Charge']),
  token('dummy', 'Crown Dummy', 0, 5, ['Bulwark']),
];

const T = (id: string, name: string, cost: number, text: string, effects: Effect[], extra: Partial<SpellDef> = {}): SpellDef =>
  ({ id, canonId: id, set: 1, kind: 'tactic', name, cost, text, effects, ...extra });
const S = (id: string, name: string, cost: number, when: SpellDef['when'], text: string, effects: Effect[], extra: Partial<SpellDef> = {}): SpellDef =>
  ({ id, canonId: id, set: 1, kind: 'scheme', name, cost, when, text, effects, ...extra });
const tk = (t: string) => `token-${t}`;

export const SET1_SPELLS: SpellDef[] = [
  // ── War Crown: combat power ──
  T('empty_throne', 'The Empty Throne', 2, 'If you control 3 or fewer champions, your champions get +2 Might and +1 Guard this turn.',
    [{ op: 'buffAll', might: 2, guard: 1, maxField: 3 }]),
  T('battle_hymn', 'Battle Hymn', 2, 'Ready another champion you control.', [{ op: 'readyOther' }]),
  T('back_doctrine', 'Backline Doctrine', 1, 'A champion gets +3 Might this turn.', [{ op: 'buff', might: 3, guard: 0, target: 'chooseAny' }], { swift: true }),
  T('executioner', "Executioner's Oath", 2, 'Defeat each rival champion with Guard 1 or less.', [{ op: 'defeatGuardAtMost', n: 1 }]),
  T('opening_salvo', 'Opening Salvo', 1, 'Your champions get +1 Might this turn. Draw a card.', [{ op: 'buffAll', might: 1 }, { op: 'draw', n: 1 }]),
  T('fallen_crown', 'Crown of the Fallen', 1, 'Your champions get +1 Might this turn, or +3 if you have fewer shards than your rival.',
    [{ op: 'buffAll', might: 1, extraIfBehind: 2 }]),
  S('last_stand', 'Last Stand', 0, 'clash', 'Spring when one of your champions is attacked or blocks: it gets +3 Might this turn.',
    [{ op: 'buff', might: 3, guard: 0, target: 'defender' }]),
  T('crown_of_war', 'Crown of War', 4, 'Your champions get +2 Might and +1 Guard this turn.', [{ op: 'buffAll', might: 2, guard: 1 }]),

  // ── Fortune Crown: Command and cards ──
  T('royal_treasury', 'Royal Treasury', 1, 'Gain 2 Command. Draw a card.', [{ op: 'command', n: 2 }, { op: 'draw', n: 1 }]),
  T('golden_parting', 'Golden Parting', 1, 'Draw a card. Gain 1 Command.', [{ op: 'draw', n: 1 }, { op: 'command', n: 1 }]),
  T('steady_coffers', 'Steady Coffers', 0, 'Gain 1 Command.', [{ op: 'command', n: 1 }], { shardfall: true }),
  T('crown_bond', 'Crown Bond', 2, 'Draw 3 cards.', [{ op: 'draw', n: 3 }]),
  T('deep_vault', 'Deep Vault', 2, 'Gain 2 Command. Draw a card.', [{ op: 'command', n: 2 }, { op: 'draw', n: 1 }]),
  T('free_rolls', 'Free Rolls', 0, 'Put a card from your hand on the bottom of your deck, then draw a card.', [{ op: 'tuck' }, { op: 'draw', n: 1 }]),
  T('victors_spoils', "Victor's Spoils", 1, 'Draw a card. If you have more shards than your rival, draw another.',
    [{ op: 'draw', n: 1 }, { op: 'draw', n: 1, when: 'ahead' }]),
  T('windfall', 'Windfall', 1, 'Gain 4 Command.', [{ op: 'command', n: 4 }]),
  T('merchant_prince', 'Merchant Prince', 1, 'Draw 2 cards, then put a card from your hand on the bottom of your deck.',
    [{ op: 'draw', n: 2 }, { op: 'tuck' }]),
  T('consolation', 'Consolation Prize', 1, 'If you have fewer shards than your rival, draw 2 cards and gain 1 Command.',
    [{ op: 'draw', n: 2, when: 'behind' }, { op: 'command', n: 1, when: 'behind' }], { shardfall: true }),
  T('golden_crown', 'Golden Crown', 2, 'Gain 2 Command. Draw 2 cards.', [{ op: 'command', n: 2 }, { op: 'draw', n: 2 }]),

  // ── Evolution Crown: Ascension ──
  T('forge_masters_favor', "Forge Master's Favor", 1, 'Return a ★ champion from your Fallen pile to your hand.', [{ op: 'returnFallen', optional: false }]),
  T('overflowing_bench', 'Overflowing Bench', 1, 'Deploy a ★ champion costing 1 or less from your hand for free. Draw a card.',
    [{ op: 'deployFree', maxCost: 1 }, { op: 'draw', n: 1 }]),
  T('tempered_victory', 'Tempered by Victory', 1, 'Your ★★ and ★★★ champions get +1 Might this turn. Draw a card.',
    [{ op: 'buffTrait', trait: 'ascended', might: 1 }, { op: 'draw', n: 1 }]),
  T('lucky_draw', 'Lucky Draw', 1, 'Draw a card. Gain 1 Command.', [{ op: 'draw', n: 1 }, { op: 'command', n: 1 }], { shardfall: true }),
  T('mirror_shard', 'Mirror Shard', 2, 'Return a ★ champion from your Fallen pile to your hand. Draw a card.',
    [{ op: 'returnFallen', optional: false }, { op: 'draw', n: 1 }]),
  S('studious', 'Studious', 0, 'rivalAttacks', 'Spring when a rival champion attacks: draw a card.', [{ op: 'draw', n: 1 }]),
  T('twin_blessing', 'Twin Blessing', 3, 'Deploy up to two ★ champions costing 2 or less from your hand for free.',
    [{ op: 'deployFree', maxCost: 2 }, { op: 'deployFree', maxCost: 2 }]),
  T('higher_calling', 'Higher Calling', 2, 'Draw 2 cards. Gain 1 Command.', [{ op: 'draw', n: 2 }, { op: 'command', n: 1 }]),
  T('fourth_crown', 'Oath of the Fourth Crown', 3, 'Ascend one of your champions for free. It stays standing.',
    [{ op: 'ascendNow', stayReady: true }]),
  T('ascension_rite', 'Ascension Rite', 2, 'Ascend one of your ★ champions to ★★ for free.', [{ op: 'ascendNow', maxStar: 1 }]),
  T('star_touched', 'Star-Touched', 1, 'Your ★★ and ★★★ champions get +2 Might and +2 Guard this turn.',
    [{ op: 'buffTrait', trait: 'ascended', might: 2, guard: 2 }]),
  T('prodigy_path', "Prodigy's Path", 2, 'You have one more Champion Zone for the rest of the game.', [{ op: 'extraZone', n: 1 }]),
  T('apex_ascension', 'Apex Ascension', 4, 'You have one more Champion Zone for the rest of the game. Ascend one of your champions for free.',
    [{ op: 'extraZone', n: 1 }, { op: 'ascendNow' }]),

  // ── Chaos Crown: coin flips ──
  T('pandora', "Pandora's Satchel", 1, 'Draw 2 cards, then put a card from your hand on the bottom of your deck.',
    [{ op: 'draw', n: 2 }, { op: 'tuck' }], { shardfall: true }),
  T('wild_gift', 'Wild Gift', 2, 'Deploy a ★ champion costing 3 or less from your hand for free.', [{ op: 'deployFree', maxCost: 3 }]),
  T('coin_flip', 'Coin Flip', 0, 'Flip a coin. Heads: gain 2 Command. Tails: draw a card.',
    [{ op: 'coinFlip', heads: [{ op: 'command', n: 2 }], tails: [{ op: 'draw', n: 1 }] }]),
  T('roll_of_fate', 'Roll of Fate', 1, 'Flip a coin. Heads: draw 2 cards. Tails: gain 2 Command.',
    [{ op: 'coinFlip', heads: [{ op: 'draw', n: 2 }], tails: [{ op: 'command', n: 2 }] }]),
  T('grand_convergence', 'Grand Convergence', 3, 'Your champions get +2 Might and +2 Guard this turn. Draw a card.',
    [{ op: 'buffAll', might: 2, guard: 2 }, { op: 'draw', n: 1 }]),
  T('mystery_box', 'Mystery Box', 1, 'Flip a coin. Heads: draw 2 cards. Tails: return a ★ champion from your Fallen pile to your hand.',
    [{ op: 'coinFlip', heads: [{ op: 'draw', n: 2 }], tails: [{ op: 'returnFallen', optional: false }] }]),
  T('crownfall_dice', 'Dice of the Crownfall', 2, 'Flip a coin. Heads: your champions get +2 Might this turn. Tails: your champions get +2 Guard this turn.',
    [{ op: 'coinFlip', heads: [{ op: 'buffAll', might: 2 }], tails: [{ op: 'buffAll', might: 0, guard: 2 }] }]),
  T('crown_of_chaos', 'Crown of Chaos', 3, 'Flip a coin. Heads: Scorch 3 each rival champion. Tails: draw 3 cards.',
    [{ op: 'coinFlip', heads: [{ op: 'scorchAll', n: 3 }], tails: [{ op: 'draw', n: 3 }] }]),

  // ── Creation Crown: tokens and Crests ──
  T('crowns_favor', "Crown's Favor", 2, 'Mend 1.', [{ op: 'mend' }]),
  T('training_dummy', 'Crown Dummy', 1, 'Summon a Crown Dummy.', [{ op: 'summon', token: tk('dummy'), count: 1 }]),
  T('crest_kingdom', 'Crest of the Kingdom', 1, 'Your Kingdom champions get +2 Might and +2 Guard this turn.', [{ op: 'buffTrait', trait: 'kingdom', might: 2, guard: 2 }]),
  T('crest_gearbound', 'Crest of Gears', 1, 'Your Gearbound champions get +2 Might and +2 Guard this turn.', [{ op: 'buffTrait', trait: 'gearbound', might: 2, guard: 2 }]),
  T('crest_astral', 'Crest of the Stars', 1, 'Your Astral champions get +2 Might and +2 Guard this turn.', [{ op: 'buffTrait', trait: 'astral', might: 2, guard: 2 }]),
  T('crest_verdant', 'Crest of the Grove', 1, 'Your Verdant champions get +2 Might and +2 Guard this turn.', [{ op: 'buffTrait', trait: 'verdant', might: 2, guard: 2 }]),
  T('crest_riftborn', 'Crest of the Rift', 1, 'Your Riftborn champions get +2 Might and +2 Guard this turn.', [{ op: 'buffTrait', trait: 'riftborn', might: 2, guard: 2 }]),
  T('crest_duelist', 'Crest of Blades', 1, 'Your Duelist champions get +2 Might and +2 Guard this turn.', [{ op: 'buffTrait', trait: 'duelist', might: 2, guard: 2 }]),
  T('summoners_pact', "Summoner's Pact", 1, 'Summon a Crownling. Your tokens get +2 Might and +2 Guard this turn.',
    [{ op: 'summon', token: tk('crownling'), count: 1 }, { op: 'buffTrait', trait: 'token', might: 2, guard: 2 }]),
  T('living_arena', 'Living Arena', 4, 'Summon two Treants. Your champions get +1 Guard this turn.',
    [{ op: 'summon', token: tk('grove_treant'), count: 2 }, { op: 'buffAll', might: 0, guard: 1 }]),

  // ── Void Crown: break your own shards for power ──
  T('blood_price', 'Blood Price', 0, 'Break one of your own shards. Gain 3 Command.', [{ op: 'selfShard', n: 1 }, { op: 'command', n: 3 }]),
  T('crimson_augury', 'Crimson Augury', 0, 'Break one of your own shards. Draw 2 cards.', [{ op: 'selfShard', n: 1 }, { op: 'draw', n: 2 }]),
  T('dark_bargain', 'Dark Bargain', 1, 'Break one of your own shards. Deploy a ★ champion costing 5 or less from your hand for free.',
    [{ op: 'selfShard', n: 1 }, { op: 'deployFree', maxCost: 5 }]),
  T('soul_tax', 'Soul Tax', 0, 'Break one of your own shards. Your champions get +2 Might this turn.', [{ op: 'selfShard', n: 1 }, { op: 'buffAll', might: 2 }]),
  T('sacrificial_rite', 'Sacrificial Rite', 0, 'Break one of your own shards. Ascend one of your champions for free.',
    [{ op: 'selfShard', n: 1 }, { op: 'ascendNow' }]),
  T('void_pact', 'Void Pact', 1, 'Your champions get +3 Might and −1 Guard this turn.', [{ op: 'buffAll', might: 3, guard: -1 }]),
  T('glass_crown', 'Glass Crown', 1, 'A champion gets +5 Might and −2 Guard this turn.', [{ op: 'buff', might: 5, guard: -2, target: 'chooseAny' }]),
  S('abyssal_hunger', 'Abyssal Hunger', 0, 'clash', 'Spring when one of your champions is attacked or blocks: break one of your own shards and Shield one of your champions.',
    [{ op: 'selfShard', n: 1 }, { op: 'shield', target: 'chooseOwn' }]),
  T('crown_of_nothing', 'Crown of Nothing', 2, 'Break two of your own shards. Your champions get +4 Might this turn.',
    [{ op: 'selfShard', n: 2 }, { op: 'buffAll', might: 4 }]),
  T('unmaking_pact', 'Unmaking Pact', 1, 'Break two of your own shards. You have two more Champion Zones for the rest of the game.',
    [{ op: 'selfShard', n: 2 }, { op: 'extraZone', n: 2 }]),
];

const E = (canonId: string, name: string, host: string, text: string, rule: EdictDef['rule']): EdictDef =>
  ({ id: `edict-${canonId.replace(/^edict_/, '')}`, kind: 'edict', set: 1, canonId, name, cost: 2, host, text, rule });

export const SET1_EDICTS: EdictDef[] = [
  E('edict_crowns_bounty', "Crown's Bounty", 'aurelia', 'Each player gains 1 extra Command at the start of their turn.', { commandBonus: 1 }),
  E('edict_open_market', 'The Open Market', 'maeve', 'Once per turn, a player may pay 1 Command to put a card from their hand on the bottom of their deck and draw a card.', { cycle: true }),
  E('edict_scholars_ascent', "Scholar's Ascent", 'elysian', 'Ascend costs are 1 lower (minimum 0).', { ascendDiscount: 1 }),
  E('edict_shard_season', 'Shard Season', 'zyrak', 'Whenever a Crown Shard breaks, its owner also draws a card.', { shardDraw: true }),
  E('edict_war_banners', 'War Banners', 'varr', 'The first time each turn a player breaks a rival’s shard with an attack, that player gains 1 Command.', { attackShardCommand: true }),
  E('edict_exalted_dawn', 'Exalted Dawn', 'sol', '★★★ Ascend costs are 1 lower (minimum 0).', { star3Discount: 1 }),
];
