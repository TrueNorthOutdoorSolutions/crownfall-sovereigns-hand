// Set 2 — BENEATH THE ARENA. "Something stirs beneath the Arena." (canonical announcer line)
//  • 45 returning champions, each a NEW version: same canonical name, Origins, Classes and tier, a PROPOSED epithet,
//    new rules built on Set 2's mechanics (Relics, loot, Origin captains) and a PROPOSED art setting.
//  • Crownfall's monsters (with Loot) and its 6 bosses as Guardians (one per deck), using their canonical ability names.
//  • 58 Relics from Crownfall's items: 8 components, 36 completed items, 8 Emblems, the Sovereign Crown and the
//    5 Crown Artifacts (legendary: one copy per deck). The "Crown Shard" item is left out so it never clashes with the
//    game's Crown Shards. The Unbinding Charm is a Tactic.
//  • Tactics and Schemes named after Crownfall's Crown Hex, event names and announcer lines (flavour = the line itself).
//  • 3 Edicts. Names are canonical except epithets (marked). Rules and costs are DRAFT design.
import type { ChampionForm, ChampionLine, Effect, EdictDef, RelicDef, SpellDef } from './cards';

// ── effect shorthands ──
const sc = (n: number): Effect => ({ op: 'scorch', n, target: 'chooseRival' });
const scAll = (n: number): Effect => ({ op: 'scorchAll', n });
const scDef = (n: number): Effect => ({ op: 'scorch', n, target: 'defender' });
const scAtt = (n: number): Effect => ({ op: 'scorch', n, target: 'attacker' });
const weakenDef = (n: number): Effect => ({ op: 'buff', might: -n, guard: 0, target: 'defender' });
const weakenAtt = (n: number): Effect => ({ op: 'buff', might: -n, guard: 0, target: 'attacker' });
const weaken = (n: number): Effect => ({ op: 'buff', might: -n, guard: 0, target: 'chooseRival' });
const shSelf: Effect = { op: 'shield', target: 'self' };
const shOther: Effect = { op: 'shield', target: 'chooseOwnOther' };
const shOwn: Effect = { op: 'shield', target: 'chooseOwn' };
const shAll: Effect = { op: 'shieldAll' };
const draw = (n: number, who: 'self' | 'rival' = 'self'): Effect => ({ op: 'draw', n, who });
const cmd = (n: number, who: 'self' | 'rival' = 'self'): Effect => ({ op: 'command', n, who });
const relicBack: Effect = { op: 'returnFallen', optional: false, what: 'relic' };
const champBack: Effect = { op: 'returnFallen', optional: false };
const champBackOpt: Effect = { op: 'returnFallen', optional: true };
const equipFree = (maxCost: number): Effect => ({ op: 'equipFree', maxCost });
const fromFallen = (maxCost: number): Effect => ({ op: 'deployFromFallen', maxCost });
const sweep = (n: number): Effect => ({ op: 'defeatGuardAtMost', n });
const summon = (token: string, count = 1): Effect => ({ op: 'summon', token: `token-${token}`, count });
const ready: Effect = { op: 'readyOncePerTurn' };
const readyOther: Effect = { op: 'readyOther' };
const readySelf: Effect = { op: 'readySelf' };
const mend: Effect = { op: 'mend' };
const stop: Effect = { op: 'stopOthersAttacking' };
const again = (n: string) => `Once per turn, when ${n} defeats a champion on your turn, ready ${n}.`;
const loot = (n: string) => `When ${n} defeats a champion on your turn, draw a card.`;

type F = Omit<ChampionForm, 'star'>;
/** A returning champion: canonical identity + PROPOSED epithet and art setting + three new forms. */
const back = (canonId: string, name: string, epithet: string, tier: ChampionLine['tier'], origins: string[], classes: string[], scene: string, f1: F, f2: F, f3: F): ChampionLine => ({
  canonId, lineId: `${canonId}@2`, family: 'champion', set: 2, name, title: epithet, epithetProposed: true, tier, origins, classes, scene,
  forms: [{ star: 1, ...f1 }, { star: 2, ...f2 }, { star: 3, ...f3 }],
});
const f = (cost: number, might: number, guard: number, keywords: ChampionForm['keywords'], text: string, rest: Partial<ChampionForm> = {}): F =>
  ({ cost, might, guard, keywords, text, ...rest });

function monster(canonId: string, name: string, cost: number, might: number, guard: number, keywords: ChampionForm['keywords'], text: string, rest: Partial<ChampionForm>): ChampionLine {
  return { canonId, lineId: `monster-${canonId}`, family: 'monster', set: 2, name, title: 'Monster', tier: 1, origins: [], classes: [],
    forms: [{ star: 1, cost, might, guard, keywords, text, ...rest }] };
}
function guardian(canonId: string, name: string, ability: string, cost: number, might: number, guard: number, keywords: ChampionForm['keywords'], text: string, rest: Partial<ChampionForm>): ChampionLine {
  return { canonId, lineId: `guardian-${canonId}`, family: 'guardian', set: 2, name, title: 'Guardian', tier: 5, origins: [], classes: [],
    forms: [{ star: 1, cost, might, guard, keywords: ['Guardian', ...keywords], ability, text, ...rest }] };
}
function tok(canonId: string, name: string, might: number, guard: number, keywords: ChampionForm['keywords'] = []): ChampionLine {
  return { canonId, lineId: `token-${canonId}`, family: 'token', set: 2, name, title: 'Token', tier: 1, origins: [], classes: [],
    forms: [{ star: 1, cost: 0, might, guard, keywords, text: '' }] };
}

export const SET2_LINES: ChampionLine[] = [
  // ───────────────────────────── returning champions: TIER I ─────────────────────────────
  back('kael', 'Kael', 'Relic Seeker', 1, ['kingdom'], ['duelist'], 'Torchlit vaults beneath the Arena; he reaches for a relic blade on a broken plinth.',
    f(2, 3, 2, [], 'Arrival: Attach a Relic costing 2 or less from your hand to Kael for free.', { arrive: [equipFree(2)] }),
    f(0, 5, 4, [], '+2 Might while Kael holds a Relic.', { statics: { mightIfRelic: 2 } }),
    f(1, 9, 7, [], `+2 Might while Kael holds a Relic. ${loot('Kael')}`, { statics: { mightIfRelic: 2 }, defeats: [draw(1)] })),
  back('fen', 'Fen', 'Pack Hunter', 1, ['wildkin'], ['duelist'], 'Running the dark tunnels under the Arena with the scent of a monster ahead.',
    f(1, 2, 1, ['Ambush'], loot('Fen'), { defeats: [draw(1)] }),
    f(0, 5, 4, ['Ambush'], `+1 Might while you have fewer shards than your rival. ${loot('Fen')}`, { statics: { mightIfBehind: 1 }, defeats: [draw(1)] }),
    f(1, 9, 7, ['Ambush'], `Your other Wildkin champions have +1 Might. ${loot('Fen')}`, { statics: { originAura: { origin: 'wildkin', might: 1 } }, defeats: [draw(1)] })),
  back('rowan', 'Rowan', 'Warden of the Deep Gate', 1, ['kingdom'], ['ranger'], 'Holding the great gate to the under-halls, bow drawn into the dark.',
    f(1, 2, 2, ['Reach'], 'Block: Scorch 1 the attacker.', { block: [scAtt(1)] }),
    f(0, 4, 5, ['Reach', 'Bulwark'], 'Block: Scorch 2 the attacker.', { block: [scAtt(2)] }),
    f(1, 8, 8, ['Reach', 'Bulwark'], 'Your other Kingdom champions have +1 Guard. Block: Scorch 2 the attacker.', { statics: { originAura: { origin: 'kingdom', guard: 1 } }, block: [scAtt(2)] })),
  back('nyx', 'Nyx', 'Vault Thief', 1, ['umbral'], ['assassin'], 'Slipping between treasure piles in a Guardian’s lair, a stolen relic in hand.',
    f(1, 2, 1, ['Ambush'], 'When Nyx defeats a champion on your turn, return a Relic from your Fallen pile to your hand.', { defeats: [relicBack] }),
    f(0, 6, 3, ['Ambush', 'Flight'], 'When Nyx defeats a champion on your turn, return a Relic from your Fallen pile to your hand.', { defeats: [relicBack] }),
    f(1, 10, 5, ['Ambush', 'Flight'], 'Attack: The defender gets −2 Might this turn. When Nyx defeats a champion on your turn, return a Relic from your Fallen pile to your hand.',
      { attack: [weakenDef(2)], defeats: [relicBack] })),
  back('grimm', 'Grimm', 'The Last Sentry', 1, ['hollow'], ['vanguard'], 'Still guarding a forgotten armoury deep under the Arena, centuries after the war.',
    f(2, 1, 4, ['Bulwark'], ''),
    f(0, 4, 7, ['Bulwark'], '+2 Guard while Grimm holds a Relic.', { statics: { guardIfRelic: 2 } }),
    f(1, 7, 11, ['Bulwark'], '+2 Guard while Grimm holds a Relic. When Grimm is defeated, Summon two Risen Soldiers.', { statics: { guardIfRelic: 2 }, defeated: [summon('skeleton', 2)] })),
  back('torren', 'Torren', 'Keeper of the Deep Vault', 1, ['titanborn'], ['warden'], 'Standing before a sealed vault door in the drowned halls of the Deep.',
    f(2, 1, 5, [], 'Arrival: Return a Relic from your Fallen pile to your hand.', { arrive: [relicBack] }),
    f(0, 3, 8, ['Bulwark'], 'Ascend: Return a Relic from your Fallen pile to your hand.', { ascend: [relicBack] }),
    f(1, 6, 12, ['Bulwark'], 'Ascend: Attach a Relic costing 3 or less from your hand to Torren for free. Your other champions have +1 Guard.', { ascend: [equipFree(3)], statics: { auraGuard: 1 } })),

  // ───────────────────────────── TIER II ─────────────────────────────
  back('solenne', 'Solenne Ash', 'Lantern of the Underways', 2, ['dawnforged'], ['vanguard'], 'Her blade lights the tunnels as shadows flee from the dawnfire.',
    f(3, 3, 3, ['Charge'], 'Attack: Scorch 1 each rival champion.', { attack: [scAll(1)] }),
    f(1, 6, 6, ['Charge'], 'Attack: Scorch 1 each rival champion. Your other Dawnforged champions have +1 Might.', { attack: [scAll(1)], statics: { originAura: { origin: 'dawnforged', might: 1 } } }),
    f(2, 10, 9, ['Charge'], 'Ascend: Shield each champion you control. Attack: Scorch 2 each rival champion.', { ascend: [shAll], attack: [scAll(2)] })),
  back('grizz', 'Grizz', 'Breaker of Beasts', 2, ['wildkin'], ['bruiser'], 'Wrestling a monster twice his size in a cavern beneath the Arena.',
    f(3, 4, 3, [], '+2 Might while Grizz holds a Relic.', { statics: { mightIfRelic: 2 } }),
    f(1, 7, 6, [], '+2 Might while Grizz holds a Relic. When Grizz defeats a champion on your turn, Shield Grizz.', { statics: { mightIfRelic: 2 }, defeats: [shSelf] }),
    f(2, 11, 9, [], '+3 Might while Grizz holds a Relic. When Grizz defeats a champion on your turn, Shield Grizz.', { statics: { mightIfRelic: 3 }, defeats: [shSelf] })),
  back('gearwick', 'Gearwick-9', 'Relic Engineer', 2, ['gearbound'], ['artillerist'], 'Bolting a recovered relic into its siege frame in an underground workshop.',
    f(2, 3, 3, ['Reach'], 'Arrival: Attach a Relic costing 2 or less from your hand to Gearwick-9 for free.', { arrive: [equipFree(2)] }),
    f(1, 5, 6, ['Reach'], '+2 Might while Gearwick-9 holds a Relic. Attack: Scorch 1 each rival champion.', { statics: { mightIfRelic: 2 }, attack: [scAll(1)] }),
    f(2, 8, 9, ['Reach'], 'Your other Gearbound champions have +1 Might and +1 Guard. Attack: Scorch 2 each rival champion.', { statics: { originAura: { origin: 'gearbound', might: 1, guard: 1 } }, attack: [scAll(2)] })),
  back('shade', 'Shade', 'Mask of the Depths', 2, ['umbral'], ['assassin'], 'A faceless mask hanging in the dark of the lowest halls, blades already drawn.',
    f(2, 3, 2, ['Ambush'], 'Attack: The defender gets −1 Might this turn.', { attack: [weakenDef(1)] }),
    f(1, 6, 4, ['Ambush'], 'Attack: The defender gets −2 Might this turn.', { attack: [weakenDef(2)] }),
    f(2, 10, 6, ['Ambush', 'Flight'], `Attack: The defender gets −3 Might this turn. ${loot('Shade')}`, { attack: [weakenDef(3)], defeats: [draw(1)] })),
  back('borin', 'Borin Ironbelly', 'Forgemaster of the Deep', 2, ['titanborn'], ['bruiser'], 'At a roaring forge beneath the Arena, reforging a Guardian’s broken relic.',
    f(3, 3, 4, [], 'Arrival: Return a Relic from your Fallen pile to your hand.', { arrive: [relicBack] }),
    f(1, 6, 7, [], 'Ascend: Attach a Relic costing 3 or less from your hand to Borin Ironbelly for free. +2 Might while Borin Ironbelly holds a Relic.', { ascend: [equipFree(3)], statics: { mightIfRelic: 2 } }),
    f(2, 10, 10, ['Bulwark'], '+2 Might while Borin Ironbelly holds a Relic. Your other Titanborn champions have +1 Guard.', { statics: { mightIfRelic: 2, originAura: { origin: 'titanborn', guard: 1 } } })),
  back('seren', 'Seren', 'Starlight in the Dark', 2, ['astral'], ['summoner'], 'Her Starlings light a vast underground cavern like a night sky.',
    f(2, 1, 3, ['Flight'], 'Arrival: Draw a card.', { arrive: [draw(1)] }),
    f(1, 3, 6, ['Flight'], 'Ascend: Summon two Starlings. Your other Astral champions have +1 Might.', { ascend: [summon('starling', 2)], statics: { originAura: { origin: 'astral', might: 1 } } }),
    f(2, 6, 9, ['Flight'], 'Ascend: Mend 1. Your other Astral champions have +1 Might.', { ascend: [mend], statics: { originAura: { origin: 'astral', might: 1 } } })),
  back('dax', 'Dax Meridian', 'Guardian Hunter', 2, ['riftborn'], ['ranger'], 'Taking aim at a towering Guardian through a rift in the cavern wall.',
    f(2, 3, 2, ['Reach'], 'Attack: Scorch 2 the defender.', { attack: [scDef(2)] }),
    f(1, 6, 4, ['Reach', 'Flight'], `Attack: Scorch 2 the defender. ${loot('Dax Meridian')}`, { attack: [scDef(2)], defeats: [draw(1)] }),
    f(2, 10, 7, ['Flight'], `Attack: Scorch 3 the defender. ${loot('Dax Meridian')}`, { attack: [scDef(3)], defeats: [draw(1)] })),
  back('elara', 'Elara', 'Healer of the Fallen Deep', 2, ['kingdom'], ['mystic'], 'Tending the wounded of the descent by lantern light in a collapsed hall.',
    f(3, 1, 4, [], 'Arrival: Shield another champion you control. Return a Relic from your Fallen pile to your hand.', { arrive: [shOther, relicBack] }),
    f(1, 3, 7, [], 'Ascend: Shield each champion you control.', { ascend: [shAll] }),
    f(2, 6, 10, [], 'Ascend: Shield each champion you control, then Mend 1.', { ascend: [shAll, mend] })),
  back('rask', 'Rask', 'Champion of the Underpits', 2, ['wildkin'], ['duelist'], 'Roaring in the blood-sand of the Underpits, a monster’s skull at his feet.',
    f(2, 3, 2, ['Charge'], ''),
    f(1, 6, 5, ['Charge'], 'When Rask defeats a champion on your turn, Shield Rask.', { defeats: [shSelf] }),
    f(2, 10, 8, ['Charge', 'Ambush'], again('Rask'), { defeats: [ready] })),

  // ───────────────────────────── TIER III ─────────────────────────────
  back('valkara', 'Valkara', 'Judge of the Depths', 3, ['astral'], ['duelist'], 'Diving from a cavern’s darkness, wings blazing, to pass judgment on a monster.',
    f(3, 4, 3, ['Flight'], 'Attack: Scorch 1 the defender.', { attack: [scDef(1)] }),
    f(1, 7, 6, ['Flight'], 'Ascend: Defeat each rival champion with Guard 1 or less.', { ascend: [sweep(1)] }),
    f(2, 11, 9, ['Flight'], 'Ascend: Defeat each rival champion with Guard 2 or less. Attack: Scorch 1 the defender.', { ascend: [sweep(2)], attack: [scDef(1)] })),
  back('dreadmouth', 'Dreadmouth', 'Devourer of Guardians', 3, ['hollow'], ['bruiser'], 'Rising from black water with a Guardian’s armour still in its teeth.',
    f(4, 5, 4, [], loot('Dreadmouth'), { defeats: [draw(1)] }),
    f(1, 8, 7, ['Ambush'], loot('Dreadmouth'), { defeats: [draw(1)] }),
    f(2, 12, 10, ['Ambush'], 'When Dreadmouth defeats a champion on your turn, draw a card and Shield Dreadmouth.', { defeats: [draw(1), shSelf] })),
  back('spark', 'Professor Spark', 'Relic Inventor', 3, ['gearbound'], ['summoner'], 'Wiring a crackling relic into a new turret in a lamp-lit underground lab.',
    f(3, 2, 3, [], 'Arrival: Attach a Relic costing 2 or less from your hand to Professor Spark for free.', { arrive: [equipFree(2)] }),
    f(1, 5, 6, [], 'Ascend: Summon an Arc Turret. +2 Might while Professor Spark holds a Relic.', { ascend: [summon('turret')], statics: { mightIfRelic: 2 } }),
    f(2, 8, 9, ['Bulwark'], 'Ascend: Summon two Arc Turrets. Your other Gearbound champions have +1 Might.', { ascend: [summon('turret', 2)], statics: { originAura: { origin: 'gearbound', might: 1 } } })),
  back('orion', 'Orion', 'Star-Charter of the Deep', 3, ['astral'], ['ranger'], 'Charting constellations painted on a cavern ceiling, bow resting on his shoulder.',
    f(3, 4, 2, ['Reach'], 'Arrival: Draw a card.', { arrive: [draw(1)] }),
    f(1, 7, 5, ['Reach'], 'Attack: Scorch 2 the defender. Your other Astral champions have +1 Guard.', { attack: [scDef(2)], statics: { originAura: { origin: 'astral', guard: 1 } } }),
    f(2, 11, 8, ['Reach', 'Flight'], 'Ascend: Scorch 3 each rival champion.', { ascend: [scAll(3)] })),
  back('maeve', 'Maeve', 'Broker of Relics', 3, ['verdant', 'hexbound'], ['mystic'], 'Weighing two glowing relics in the roots of an underground grove.',
    f(3, 2, 4, [], 'Arrival: Return a Relic from your Fallen pile to your hand. A rival champion gets −2 Might this turn.', { arrive: [relicBack, weaken(2)] }),
    f(1, 4, 7, [], 'Ascend: Return a Relic from your Fallen pile to your hand. Draw a card.', { ascend: [relicBack, draw(1)] }),
    f(2, 7, 10, [], 'Ascend: Attach a Relic costing 4 or less from your hand to Maeve for free. Shield each champion you control.', { ascend: [equipFree(4), shAll] })),
  back('ronin', 'Ronin Zero', 'Blade Beneath the Arena', 3, ['voltborn'], ['duelist'], 'A lone frame crackling with current in a flooded tunnel, a relic sword drawn.',
    f(3, 4, 3, ['Charge'], '+1 Might while Ronin Zero holds a Relic.', { statics: { mightIfRelic: 1 } }),
    f(1, 7, 6, ['Charge'], '+2 Might while Ronin Zero holds a Relic. Attack: Scorch 1 the defender.', { statics: { mightIfRelic: 2 }, attack: [scDef(1)] }),
    f(2, 11, 9, ['Charge', 'Ambush'], `+2 Might while Ronin Zero holds a Relic. ${again('Ronin Zero')}`, { statics: { mightIfRelic: 2 }, defeats: [ready] })),
  back('ignara', 'Ignara', 'Heart of the Forge', 3, ['elemental'], ['vanguard'], 'Burning at the heart of the deep forges, molten relics floating around her.',
    f(3, 3, 4, [], 'Arrival: Scorch 1 each rival champion.', { arrive: [scAll(1)] }),
    f(1, 6, 7, [], 'Your other Elemental champions have +1 Might. Block: Scorch 2 the attacker.', { statics: { originAura: { origin: 'elemental', might: 1 } }, block: [scAtt(2)] }),
    f(2, 9, 10, ['Bulwark'], 'Ascend: Scorch 2 each rival champion. Your other Elemental champions have +1 Might.', { ascend: [scAll(2)], statics: { originAura: { origin: 'elemental', might: 1 } } })),
  back('morrow', 'Morrow', 'Lord of the Buried Halls', 3, ['hollow'], ['summoner'], 'Raising the soldiers buried beneath the Arena from their stone tombs.',
    f(3, 2, 3, [], 'Arrival: Summon a Risen Soldier.', { arrive: [summon('skeleton')] }),
    f(1, 5, 6, [], 'Ascend: Summon two Risen Soldiers.', { ascend: [summon('skeleton', 2)] }),
    f(2, 8, 9, [], 'Ascend: Deploy a ★ champion costing 4 or less from your Fallen pile for free. Your other Hollow champions have +1 Might.', { ascend: [fromFallen(4)], statics: { originAura: { origin: 'hollow', might: 1 } } })),
  back('blacktide', 'Captain Blacktide', 'Plunderer of the Vault', 3, ['riftborn'], ['artillerist'], 'His ship wedged in a rift above a Guardian’s treasure hoard.',
    f(4, 4, 3, ['Reach'], 'When Captain Blacktide defeats a champion on your turn, return a Relic from your Fallen pile to your hand.', { defeats: [relicBack] }),
    f(1, 7, 6, ['Reach'], 'Attack: Scorch 1 each rival champion. When Captain Blacktide defeats a champion on your turn, return a Relic from your Fallen pile to your hand.', { attack: [scAll(1)], defeats: [relicBack] }),
    f(2, 10, 9, ['Reach'], 'Ascend: Attach a Relic costing 4 or less from your hand to Captain Blacktide for free. Attack: Scorch 2 each rival champion.', { ascend: [equipFree(4)], attack: [scAll(2)] })),
  back('aurelia', 'Aurelia', 'Commander of the Descent', 3, ['kingdom'], ['commander'], 'Leading the Kingdom’s banners down the great stair beneath the Arena.',
    f(4, 3, 5, [], 'Your other Kingdom champions have +1 Might.', { statics: { originAura: { origin: 'kingdom', might: 1 } } }),
    f(1, 6, 7, [], 'Your other Kingdom champions have +1 Might and +1 Guard.', { statics: { originAura: { origin: 'kingdom', might: 1, guard: 1 } } }),
    f(2, 9, 10, [], 'Ascend: Ready another champion you control. Your other Kingdom champions have +2 Might and +1 Guard.', { ascend: [readyOther], statics: { originAura: { origin: 'kingdom', might: 2, guard: 1 } } })),
  back('knuckle', 'Knuckle', 'King Under the Pit', 3, ['titanborn'], ['bruiser'], 'Seated on a throne of Guardian bones in the deepest fighting pit.',
    f(4, 5, 5, [], '+2 Guard while Knuckle holds a Relic.', { statics: { guardIfRelic: 2 } }),
    f(1, 8, 8, [], '+2 Might and +2 Guard while Knuckle holds a Relic.', { statics: { mightIfRelic: 2, guardIfRelic: 2 } }),
    f(2, 12, 11, ['Bulwark'], '+2 Might and +2 Guard while Knuckle holds a Relic. Block: The attacker gets −3 Might this turn.', { statics: { mightIfRelic: 2, guardIfRelic: 2 }, block: [weakenAtt(3)] })),
  back('zyrak', 'Zyrak', 'Shard of the Broken Vault', 3, ['riftborn'], ['arcanist'], 'Humming among shattered vault crystals, each one a piece of the Lattice.',
    f(4, 2, 3, ['Flight'], 'Arrival: Mend 1.', { arrive: [mend] }),
    f(1, 5, 6, ['Flight'], 'Ascend: Scorch 2 each rival champion.', { ascend: [scAll(2)] }),
    f(2, 8, 9, ['Flight'], 'Ascend: Scorch 3 each rival champion, then Mend 1.', { ascend: [scAll(3), mend] })),

  // ───────────────────────────── TIER IV ─────────────────────────────
  back('astryon', 'Astryon', 'Blade That Fell Beneath', 4, ['astral'], ['duelist'], 'Seven blades orbiting him in the dark like fallen stars.',
    f(5, 6, 4, ['Flight'], '+2 Might while Astryon holds a Relic.', { statics: { mightIfRelic: 2 } }),
    f(1, 9, 7, ['Flight'], `+2 Might while Astryon holds a Relic. ${loot('Astryon')}`, { statics: { mightIfRelic: 2 }, defeats: [draw(1)] }),
    f(2, 13, 10, ['Flight'], `+2 Might while Astryon holds a Relic. ${again('Astryon')}`, { statics: { mightIfRelic: 2 }, defeats: [ready] })),
  back('vespera', 'Queen Vespera', 'Empress of the Underhalls', 4, ['umbral'], ['summoner'], 'Holding court in a vast underground throne room of shadow.',
    f(4, 3, 4, [], 'Arrival: Summon a Court Shade. Your other Umbral champions have +1 Might.', { arrive: [summon('shadow')], statics: { originAura: { origin: 'umbral', might: 1 } } }),
    f(1, 6, 7, [], 'Ascend: Summon two Court Shades. Your other Umbral champions have +1 Might.', { ascend: [summon('shadow', 2)], statics: { originAura: { origin: 'umbral', might: 1 } } }),
    f(2, 9, 10, [], 'Ascend: Summon two Court Shades. Your other champions have +1 Might.', { ascend: [summon('shadow', 2)], statics: { auraMight: 1 } })),
  back('titanrho', 'Titan Rho', 'Vault Bastion', 4, ['gearbound'], ['warden'], 'Its fortress body sealing a vault gate deep beneath the Arena.',
    f(5, 3, 8, ['Bulwark'], 'Arrival: Attach a Relic costing 3 or less from your hand to Titan Rho for free.', { arrive: [equipFree(3)] }),
    f(1, 6, 11, ['Bulwark', 'Reach'], '+2 Guard while Titan Rho holds a Relic. Your other champions have +1 Guard.', { statics: { guardIfRelic: 2, auraGuard: 1 } }),
    f(2, 9, 14, ['Bulwark', 'Reach'], 'Ascend: Shield each champion you control. Your other champions have +1 Guard.', { ascend: [shAll], statics: { auraGuard: 1 } })),
  back('pyrax', 'Pyrax', 'Wyrm of the Deep Forge', 4, ['elemental'], ['bruiser'], 'Breathing fire across a molten forge-cavern, relic armour glowing on her scales.',
    f(4, 5, 4, [], 'Arrival: Scorch 1 each rival champion.', { arrive: [scAll(1)] }),
    f(1, 8, 8, [], '+2 Might while Pyrax holds a Relic. Attack: Scorch 1 each rival champion.', { statics: { mightIfRelic: 2 }, attack: [scAll(1)] }),
    f(2, 11, 11, [], 'Ascend: Scorch 2 each rival champion. Attack: Scorch 2 the defender.', { ascend: [scAll(2)], attack: [scDef(2)] })),
  back('elysian', 'Elysian', 'Light of the Lost Halls', 4, ['astral'], ['mystic'], 'Descending into the forgotten halls to lift the fallen back to their feet.',
    f(5, 3, 6, ['Flight'], 'Arrival: Return a ★ champion from your Fallen pile to your hand.', { arrive: [champBack] }),
    f(1, 6, 9, ['Flight'], 'Ascend: Deploy a ★ champion costing 3 or less from your Fallen pile for free.', { ascend: [fromFallen(3)] }),
    f(2, 9, 12, ['Flight'], 'Ascend: Deploy a ★ champion costing 4 or less from your Fallen pile for free. Shield each champion you control.', { ascend: [fromFallen(4), shAll] })),
  back('varr', 'General Varr', 'Holder of the Gate', 4, ['kingdom'], ['commander', 'vanguard'], 'Holding the last gate between the Arena and what lies beneath.',
    f(5, 4, 6, ['Bulwark'], 'Your other Kingdom champions have +1 Might.', { statics: { originAura: { origin: 'kingdom', might: 1 } } }),
    f(1, 7, 9, ['Bulwark'], 'Your other Kingdom champions have +1 Might and +1 Guard. Block: The attacker gets −2 Might this turn.', { statics: { originAura: { origin: 'kingdom', might: 1, guard: 1 } }, block: [weakenAtt(2)] }),
    f(2, 10, 12, ['Bulwark'], 'Ascend: Shield each champion you control. Your other Kingdom champions have +2 Might and +1 Guard.', { ascend: [shAll], statics: { originAura: { origin: 'kingdom', might: 2, guard: 1 } } })),
  back('veilwalker', 'Veilwalker', 'The Rift Below', 4, ['riftborn'], ['assassin'], 'Stepping out of a tear in the cavern air behind a Guardian.',
    f(4, 6, 3, ['Flight', 'Ambush'], 'Attack: Scorch 1 the defender.', { attack: [scDef(1)] }),
    f(1, 9, 6, ['Flight', 'Ambush'], `Attack: Scorch 2 the defender. ${loot('Veilwalker')}`, { attack: [scDef(2)], defeats: [draw(1)] }),
    f(2, 13, 8, ['Flight', 'Ambush'], `Attack: Scorch 2 the defender. ${again('Veilwalker')}`, { attack: [scDef(2)], defeats: [ready] })),
  back('gaia', 'Gaia Prime', 'Root of the Arena', 4, ['verdant'], ['warden'], 'Her roots wrapped around the Arena’s foundations far below the sand.',
    f(5, 3, 7, ['Bulwark'], 'Arrival: Summon two Treants.', { arrive: [summon('grove_treant', 2)] }),
    f(1, 6, 10, ['Bulwark'], 'Your other Verdant champions have +1 Might and +1 Guard.', { statics: { originAura: { origin: 'verdant', might: 1, guard: 1 } } }),
    f(2, 9, 13, ['Bulwark'], 'Ascend: Summon two Treants. Your other champions have +1 Guard.', { ascend: [summon('grove_treant', 2)], statics: { auraGuard: 1 } })),
  back('ladyvolt', 'Lady Volt', 'Storm in the Deep', 4, ['voltborn'], ['duelist'], 'Lightning arcing off flooded cavern walls as she duels in the dark.',
    f(4, 5, 3, ['Charge'], '+2 Might while Lady Volt holds a Relic.', { statics: { mightIfRelic: 2 } }),
    f(1, 8, 6, ['Charge'], 'Attack: Scorch 1 each rival champion. +2 Might while Lady Volt holds a Relic.', { attack: [scAll(1)], statics: { mightIfRelic: 2 } }),
    f(2, 12, 9, ['Charge'], `Your other Voltborn champions have +1 Might. ${again('Lady Volt')}`, { statics: { originAura: { origin: 'voltborn', might: 1 } }, defeats: [ready] })),
  back('vessimer', 'Vessimer', 'Alchemist of Relics', 4, ['hexbound'], ['saboteur'], 'Dissolving a relic into a bubbling tincture in a hidden laboratory.',
    f(4, 3, 4, [], 'Arrival: Return a Relic from your Fallen pile to your hand. Draw a card.', { arrive: [relicBack, draw(1)] }),
    f(1, 6, 7, [], 'Ascend: Attach a Relic costing 3 or less from your hand to Vessimer for free. Scorch 2 a rival champion.', { ascend: [equipFree(3), sc(2)] }),
    f(2, 9, 10, [], 'Ascend: Scorch 2 each rival champion. Return a Relic from your Fallen pile to your hand.', { ascend: [scAll(2), relicBack] })),

  // ───────────────────────────── TIER V (Ascendants) ─────────────────────────────
  back('aurex', 'Aurex', 'Bane of the Guardians', 5, ['wyrmblood'], ['ascendant', 'bruiser'], 'The last dragon in the Guardians’ lair, a fallen Guardian beneath his claws.',
    f(6, 7, 7, ['Ascendant'], 'Arrival: Scorch 2 each rival champion. +2 Might while Aurex holds a Relic.', { arrive: [scAll(2)], statics: { mightIfRelic: 2 } }),
    f(2, 9, 9, ['Ascendant', 'Flight'], 'Attack: Scorch 3 the defender. +2 Might while Aurex holds a Relic.', { attack: [scDef(3)], statics: { mightIfRelic: 2 } }),
    f(3, 13, 12, ['Ascendant', 'Flight'], 'Ascend: Scorch 4 each rival champion. Your other champions can’t attack this turn.', { ascend: [scAll(4), stop] })),
  back('noctara', 'Noctara', 'Shadow Beneath the Crown', 5, ['umbral'], ['ascendant', 'arcanist'], 'A black hole opening in the cavern ceiling directly beneath the Crown.',
    f(6, 6, 7, ['Ascendant'], 'Arrival: Each rival champion gets −2 Might this turn. Your other Umbral champions have +1 Might.', { arrive: [{ op: 'buffRivals', might: -2 }], statics: { originAura: { origin: 'umbral', might: 1 } } }),
    f(2, 8, 10, ['Ascendant', 'Flight'], 'Ascend: Defeat each rival champion with Guard 2 or less.', { ascend: [sweep(2)] }),
    f(3, 12, 13, ['Ascendant', 'Flight'], 'Ascend: Defeat each rival champion with Guard 3 or less. Your other Umbral champions have +2 Might.', { ascend: [sweep(3)], statics: { originAura: { origin: 'umbral', might: 2 } } })),
  back('atlas', 'ATLAS-Ω', 'The Vault Engine', 5, ['gearbound'], ['ascendant', 'warden'], 'Woken in a sealed vault, relic weapons locking into its frame.',
    f(6, 4, 10, ['Ascendant', 'Bulwark'], 'Arrival: Attach a Relic costing 4 or less from your hand to ATLAS-Ω for free.', { arrive: [equipFree(4)] }),
    f(2, 7, 13, ['Ascendant', 'Bulwark', 'Reach'], '+3 Might while ATLAS-Ω holds a Relic. Your other Gearbound champions have +1 Guard.', { statics: { mightIfRelic: 3, originAura: { origin: 'gearbound', guard: 1 } } }),
    f(3, 11, 16, ['Ascendant', 'Bulwark', 'Reach'], '+3 Might while ATLAS-Ω holds a Relic. Attack: Scorch 3 each rival champion.', { statics: { mightIfRelic: 3 }, attack: [scAll(3)] })),
  back('sol', 'Sol', 'Dawn Beneath the World', 5, ['dawnforged'], ['ascendant', 'mystic'], 'The first light rising inside the deepest cavern, turning the dark to gold.',
    f(6, 5, 7, ['Ascendant'], 'Arrival: Mend 1.', { arrive: [mend] }),
    f(2, 8, 10, ['Ascendant', 'Flight'], 'Ascend: Shield each champion you control. Your other Dawnforged champions have +1 Might.', { ascend: [shAll], statics: { originAura: { origin: 'dawnforged', might: 1 } } }),
    f(3, 12, 13, ['Ascendant', 'Flight'], 'Ascend: Shield each champion you control. Your champions get +3 Might this turn.', { ascend: [shAll, { op: 'buffAll', might: 3 }] })),
  back('unwritten', 'The Unwritten King', 'Lord of the Buried Crown', 5, ['hollow'], ['ascendant', 'summoner'], 'Enthroned in a buried throne room, an erased crown upon his head.',
    f(6, 5, 7, ['Ascendant'], 'Arrival: Deploy a ★ champion costing 3 or less from your Fallen pile for free.', { arrive: [fromFallen(3)] }),
    f(2, 8, 10, ['Ascendant'], 'Ascend: Summon two Fallen Warriors. Your other Hollow champions have +1 Might and +1 Guard.', { ascend: [summon('fallen', 2)], statics: { originAura: { origin: 'hollow', might: 1, guard: 1 } } }),
    f(3, 12, 13, ['Ascendant'], 'Ascend: Deploy up to two ★ champions costing 3 or less from your Fallen pile for free.', { ascend: [fromFallen(3), fromFallen(3)] })),
  back('veyra', 'Veyra Sol', 'Hunter of Guardians', 5, ['riftborn'], ['ascendant', 'assassin'], 'Stepping through a portal onto a Guardian’s back, blade raised.',
    f(6, 8, 5, ['Ascendant', 'Flight', 'Ambush'], 'Attack: Scorch 2 the defender.', { attack: [scDef(2)] }),
    f(2, 11, 8, ['Ascendant', 'Flight', 'Ambush'], loot('Veyra Sol'), { defeats: [draw(1)] }),
    f(3, 15, 11, ['Ascendant', 'Flight', 'Ambush'], `Attack: Scorch 3 the defender. ${again('Veyra Sol')}`, { attack: [scDef(3)], defeats: [ready] })),
  back('mother', 'Mother Verdant', 'Root of All Things', 5, ['verdant'], ['ascendant', 'summoner'], 'The forest growing upward through the Arena’s foundations around her.',
    f(6, 4, 9, ['Ascendant'], 'Arrival: Summon two Wild Saplings.', { arrive: [summon('sapling', 2)] }),
    f(2, 7, 12, ['Ascendant'], 'Ascend: Summon two Wild Saplings. Your other Verdant champions have +1 Might and +1 Guard.', { ascend: [summon('sapling', 2)], statics: { originAura: { origin: 'verdant', might: 1, guard: 1 } } }),
    f(3, 10, 15, ['Ascendant'], 'Ascend: Return up to two ★ champions from your Fallen pile to your hand. Shield each champion you control.', { ascend: [champBackOpt, champBackOpt, shAll] })),
  back('crownless', 'Crownless', 'The Unbound', 5, ['crownless'], ['ascendant'], 'Standing in the empty vault where the Crown once rested, refusing it still.',
    f(6, 7, 7, ['Ascendant', 'Charge'], 'Arrival: Each rival champion gets −2 Might this turn.', { arrive: [{ op: 'buffRivals', might: -2 }] }),
    f(2, 10, 10, ['Ascendant', 'Charge', 'Flight'], 'Ascend: Ready Crownless.', { ascend: [readySelf] }),
    f(3, 14, 13, ['Ascendant', 'Charge', 'Flight', 'Ambush'], 'Ascend: Ready Crownless. Attack: Scorch 3 the defender.', { ascend: [readySelf], attack: [scDef(3)] })),

  // ───────────────────────────── Monsters (with Loot) ─────────────────────────────
  monster('mite', 'Crystal Mite', 1, 1, 2, [], 'When Crystal Mite is defeated, its rival draws a card.', { defeated: [draw(1, 'rival')] }),
  monster('shardling', 'Shardling', 1, 2, 1, [], 'When Shardling is defeated, its rival gains 1 Command.', { defeated: [cmd(1, 'rival')] }),
  monster('hound', 'Rift Hound', 2, 2, 2, ['Charge'], 'When Rift Hound is defeated, its rival draws a card.', { defeated: [draw(1, 'rival')] }),
  monster('alpha', 'Rift Alpha', 3, 3, 3, ['Charge'], 'Your other Monsters have +1 Might. When Rift Alpha is defeated, its rival draws a card.',
    { statics: { originAura: { origin: 'monster', might: 1 } }, defeated: [draw(1, 'rival')] }),

  // ───────────────────────────── Guardians (one per deck) ─────────────────────────────
  guardian('golem', 'Crystal Golem', 'Shatter Slam', 7, 3, 11, ['Bulwark'], 'Block: Each rival champion gets −2 Might this turn. When Crystal Golem is defeated, its rival draws 2 cards.',
    { block: [{ op: 'buffRivals', might: -2 }], defeated: [draw(2, 'rival')] }),
  guardian('spiderqueen', 'Void Spider Queen', 'Brood Call', 6, 4, 7, [], 'Arrival: Summon two Void Spiders. At the start of your turn, Summon a Void Spider. When Void Spider Queen is defeated, its rival draws 2 cards.',
    { arrive: [summon('spiderling', 2)], rise: [summon('spiderling')], defeated: [draw(2, 'rival')] }),
  guardian('hydra', 'Clockwork Hydra', 'Steam Gout', 7, 6, 8, [], 'Attack: Scorch 2 each rival champion. When Clockwork Hydra is defeated, Summon four Hydra Hatchlings.',
    { attack: [scAll(2)], defeated: [summon('hydralet', 4)] }),
  guardian('treant', 'Ancient Treant', 'Forest Wrath', 6, 3, 10, ['Bulwark'], 'Block: The attacker gets −3 Might this turn. At the start of your turn, Shield Ancient Treant. When Ancient Treant is defeated, its rival draws 2 cards.',
    { block: [weakenAtt(3)], rise: [shSelf], defeated: [draw(2, 'rival')] }),
  guardian('sentinel', 'Celestial Sentinel', 'Judgment Ray', 7, 6, 9, ['Flight'], 'Arrival: Shield Celestial Sentinel. Attack: Scorch 3 the defender. When Celestial Sentinel is defeated, its rival draws 2 cards.',
    { arrive: [shSelf], attack: [scDef(3)], defeated: [draw(2, 'rival')] }),
  guardian('guardian', 'Crown Guardian', 'Crownbreaker', 8, 8, 10, [], '+4 Might while you have fewer shards than your rival. Attack: Scorch 2 each rival champion. When Crown Guardian is defeated, its rival draws 2 cards.',
    { statics: { mightIfBehind: 4 }, attack: [scAll(2)], defeated: [draw(2, 'rival')] }),

  // ───────────────────────────── Set 2 tokens ─────────────────────────────
  tok('spiderling', 'Void Spider', 1, 1, ['Ambush']),
  tok('hydralet', 'Hydra Hatchling', 2, 2),
  tok('sapling', 'Wild Sapling', 1, 3, ['Bulwark']),
  tok('construct', 'Guardian Construct', 3, 4),
];

// ───────────────────────────── Relics ─────────────────────────────
const R = (canonId: string, name: string, cost: number, relicType: RelicDef['relicType'], text: string, art: string, rest: Partial<RelicDef> = {}): RelicDef =>
  ({ id: `relic-${canonId}`, kind: 'relic', set: 2, canonId, name, cost, relicType, text, art, ...rest });
const emblem = (origin: string, Name: string, art: string): RelicDef =>
  R(`${origin}_emblem`, `${Name} Emblem`, 1, 'emblem', `+1 Might. The holder is also ${Name}.`, art, { might: 1, origin });

export const SET2_RELICS: RelicDef[] = [
  // Components
  R('blade', 'Royal Blade', 1, 'component', '+2 Might.', 'A plain royal longsword on a velvet cushion in a vault.', { might: 2 }),
  R('feather', 'Quicksteel Bow', 1, 'component', 'Charge.', 'A light silver bow that seems to hum in the hand.', { keywords: ['Charge'] }),
  R('crystal', 'Arcane Ember', 1, 'component', 'Attack: Scorch 1 the defender.', 'A floating ember of violet arcane fire.', { attack: [scDef(1)] }),
  R('tear', 'Crown Tear', 2, 'component', 'At the start of your turn, gain 1 Command.', 'A single crystal tear fallen from the Crown, glowing gold.', { rise: [cmd(1)] }),
  R('plate', 'Iron Plate', 1, 'component', '+2 Guard.', 'A dented iron breastplate on an armour stand.', { guard: 2 }),
  R('cloak', 'Warding Cloak', 1, 'component', '+1 Guard. Block: Scorch 1 the attacker.', 'A deep blue cloak stitched with warding runes.', { guard: 1, block: [scAtt(1)] }),
  R('core', 'Titan Heart', 2, 'component', '+3 Guard.', 'A slow-beating stone heart the size of a shield.', { guard: 3 }),
  R('lens', 'Fate Gauntlet', 1, 'component', '+1 Might. Ambush.', 'A clawed gauntlet with a glowing lens set in the palm.', { might: 1, keywords: ['Ambush'] }),
  // Completed items
  R('colossus_edge', 'Colossus Edge', 2, 'completed', '+3 Might.', 'A greatsword taller than its wielder, notched from felling giants.', { might: 3 }),
  R('frenzy_fang', 'Crownreaper', 3, 'completed', '+1 Might. Once per turn, when the holder defeats a champion on your turn, ready it.', 'A curved crimson blade that drinks the light around it.', { might: 1, defeats: [ready] }),
  R('spellforged', 'Spellforged Saber', 2, 'completed', '+1 Might. Attack: Scorch 1 each rival champion.', 'A saber with runes burning along the edge.', { might: 1, attack: [scAll(1)] }),
  R('crownsworn', 'Crownsworn Blade', 2, 'completed', '+2 Might. When the holder defeats a champion on your turn, gain 1 Command.', 'A knight’s blade engraved with an oath to the Crown.', { might: 2, defeats: [cmd(1)] }),
  R('oathkeeper', 'Kingsblood Edge', 2, 'completed', '+2 Guard. Block: Shield the holder.', 'A royal sword whose blade bleeds a protective red light.', { guard: 2, block: [shSelf] }),
  R('veilpiercer', 'Veilpiercer', 2, 'completed', '+1 Might. Attack: Scorch 2 the defender.', 'A needle-thin rapier that cuts through enchantments.', { might: 1, attack: [scDef(2)] }),
  R('bloodoath', 'Bloodoath Blade', 3, 'completed', '+2 Might. When the holder defeats a champion on your turn, Shield it.', 'A black blade wrapped in red cloth soaked in an old oath.', { might: 2, defeats: [shSelf] }),
  R('deadeye', 'Deadeye Edge', 2, 'completed', '+2 Might. Ambush.', 'A sniper’s dagger with a crosshair etched on the blade.', { might: 2, keywords: ['Ambush'] }),
  R('gale_talons', 'Tempest Engine', 3, 'completed', '+1 Might. Charge. Ambush.', 'A whirring clockwork bracer spinning with storm wind.', { might: 1, keywords: ['Charge', 'Ambush'] }),
  R('storm_engine', 'Storm Engine', 3, 'completed', '+1 Might. Attack: Scorch 1 each rival champion.', 'A brass engine crackling with chained lightning.', { might: 1, attack: [scAll(1)] }),
  R('chrono_band', 'Chrono Band', 2, 'completed', '+1 Might. Charge.', 'A wristband of turning hourglass gears.', { might: 1, keywords: ['Charge'] }),
  R('resolute_buckler', 'Resolute Buckler', 2, 'completed', '+2 Guard. +2 Might while blocking.', 'A battered buckler covered in the marks of every blow it stopped.', { guard: 2, statics: { mightWhileBlocking: 2 } }),
  R('phase_mantle', 'Phase Mantle', 2, 'completed', '+1 Guard. Flight.', 'A shimmering mantle that blurs in and out of sight.', { guard: 1, keywords: ['Flight'] }),
  R('quickened_heart', 'Quickened Heart', 2, 'completed', '+1 Might and +2 Guard.', 'A glowing heart-shaped amulet with a racing pulse.', { might: 1, guard: 2 }),
  R('falconeye', 'Falconeye Bow', 2, 'completed', 'Reach. Attack: Scorch 2 a rival champion.', 'A longbow with a falcon’s eye set in its grip.', { keywords: ['Reach'], attack: [sc(2)] }),
  R('astral_diadem', 'Astral Diadem', 3, 'completed', '+2 Might. Flight.', 'A diadem of floating star fragments.', { might: 2, keywords: ['Flight'] }),
  R('tidecaller', 'Starfire Codex', 3, 'completed', 'At the start of your turn, draw a card.', 'A spellbook whose pages burn with starfire.', { rise: [draw(1)] }),
  R('aegis_codex', 'Aegis Codex', 3, 'completed', '+1 Guard. Your other champions have +1 Guard.', 'A shield-shaped tome radiating a protective dome.', { guard: 1, statics: { auraGuard: 1 } }),
  R('hexflame_orb', 'Hexflame Orb', 2, 'completed', 'Attack: Scorch 2 the defender. The defender gets −1 Might this turn.', 'An orb of green hexfire caged in black iron.', { attack: [scDef(2), weakenDef(1)] }),
  R('verdant_chalice', 'Verdant Chalice', 3, 'completed', 'At the start of your turn, Shield a champion you control.', 'A living wooden chalice overflowing with healing sap.', { rise: [shOwn] }),
  R('seers_prism', "Seer's Prism", 2, 'completed', '+2 Might. Attack: Scorch 1 the defender.', 'A prism throwing rainbow light into a seer’s eyes.', { might: 2, attack: [scDef(1)] }),
  R('wellspring', 'Wellspring Circlet', 4, 'completed', 'At the start of your turn, gain 2 Command.', 'A circlet with a spring of clear water at its centre.', { rise: [cmd(2)] }),
  R('rally_standard', 'Rallying Standard', 3, 'completed', 'Your other champions have +1 Might.', 'A war banner that seems to stand taller in battle.', { statics: { auraMight: 1 } }),
  R('spell_shroud', 'Spell Shroud', 2, 'completed', '+3 Guard.', 'A veil that turns spells aside like rain off glass.', { guard: 3 }),
  R('phoenix_crown', 'Phoenix Plume', 2, 'completed', 'When the holder is defeated, return a ★ champion from your Fallen pile to your hand.', 'A burning feather that never stops glowing.', { defeated: [champBack] }),
  R('fatebinder', 'Fatebinder', 2, 'completed', '+2 Might. Attack: The defender gets −2 Might this turn.', 'Golden chains of fate wrapped around a fist.', { might: 2, attack: [weakenDef(2)] }),
  R('thornward', 'Thornward Mail', 2, 'completed', '+2 Guard. Block: Scorch 2 the attacker.', 'Armour bristling with iron thorns.', { guard: 2, block: [scAtt(2)] }),
  R('twin_aegis', 'Twin Aegis', 2, 'completed', '+2 Guard. Bulwark.', 'Two interlocking shields bearing the same crest.', { guard: 2, keywords: ['Bulwark'] }),
  R('bastion_heart', 'Bastion of the Deep', 3, 'completed', '+4 Guard.', 'A tower shield carved from the rock of the Deep.', { guard: 4 }),
  R('watchward', 'Watchward Visor', 2, 'completed', '+2 Guard. Reach.', 'A visored helm with a watchful eye painted above the slit.', { guard: 2, keywords: ['Reach'] }),
  R('starveil', 'Starveil Cloak', 2, 'completed', '+2 Guard. Flight.', 'A cloak woven from the night sky.', { guard: 2, keywords: ['Flight'] }),
  R('sanctified_mantle', 'Sanctified Mantle', 2, 'completed', 'At the start of your turn, Shield the holder.', 'A white mantle glowing with holy light.', { rise: [shSelf] }),
  R('nullifier', 'Nullifier Grip', 2, 'completed', 'Attack: The defender gets −3 Might this turn.', 'A heavy gauntlet that drains the magic from whatever it grips.', { attack: [weakenDef(3)] }),
  R('giant_heartstone', 'Mountainheart', 3, 'completed', '+4 Guard.', 'A stone heart carved from a mountain’s core.', { guard: 4 }),
  R('reapers_lens', "Reaper's Grasp", 3, 'completed', 'Attack: Defeat each rival champion with Guard 1 or less.', 'A skeletal hand clutching a cold lens.', { attack: [sweep(1)] }),
  R('true_sight', "Fate's Edge", 3, 'completed', '+3 Might. Attack: Scorch 1 the defender.', 'A blade whose edge follows the thread of fate.', { might: 3, attack: [scDef(1)] }),
  // Emblems
  emblem('kingdom', 'Kingdom', 'A royal blue emblem stamped with the Kingdom crest.'),
  emblem('wildkin', 'Wildkin', 'A claw-marked emblem strung on a leather cord.'),
  emblem('astral', 'Astral', 'A star-shaped emblem glowing with soft silver light.'),
  emblem('hollow', 'Hollow', 'A pale bone emblem with ghost-light in its hollows.'),
  emblem('gearbound', 'Gearbound', 'A brass cog emblem that slowly turns on its own.'),
  emblem('umbral', 'Umbral', 'A crescent emblem of polished shadow.'),
  emblem('verdant', 'Verdant', 'A living leaf emblem with roots curling from its edge.'),
  emblem('riftborn', 'Riftborn', 'An emblem with a tiny tear in reality at its centre.'),
  // The Sovereign Crown
  R('sovereign_crown', 'Sovereign Crown', 3, 'crown', '+1 Might and +1 Guard. You have one more Champion Zone while it is in play.', 'A small golden crown forged from two Crown Shards.',
    { might: 1, guard: 1, extraZone: true }),
  // Crown Artifacts (legendary)
  R('fallen_kings_blade', "The Fallen King's Blade", 4, 'artifact', '+2 Might. Once per turn, when the holder defeats a champion on your turn, ready it and draw a card.',
    'The blade of a forgotten king, still sharp, still hungry.', { might: 2, defeats: [ready, draw(1)], legendary: true }),
  R('first_realm_crown', 'Crown of the First Realm', 4, 'artifact', '+1 Might and +1 Guard. The holder counts as every Origin.', 'An ancient crown of the first realm, older than the Crownfall.',
    { might: 1, guard: 1, allOrigins: true, legendary: true }),
  R('hourglass_of_ash', 'Hourglass of Ash', 4, 'artifact', '+2 Guard. At the start of your turn, Shield the holder.', 'An hourglass of grey ash that flows upward.',
    { guard: 2, rise: [shSelf], legendary: true }),
  R('titans_last_heart', "Titan's Last Heart", 4, 'artifact', '+4 Guard. When the holder is defeated, Shield each champion you control.', 'The final heart of the last titan, cracked but still beating.',
    { guard: 4, defeated: [shAll], legendary: true }),
  R('starless_tome', 'The Starless Tome', 4, 'artifact', 'At the start of your turn, draw a card and gain 1 Command.', 'A black book whose pages hold no stars at all.',
    { rise: [draw(1), cmd(1)], legendary: true }),
];

// ───────────────────────────── Tactics and Schemes ─────────────────────────────
const T = (id: string, name: string, cost: number, text: string, effects: Effect[], art: string, extra: Partial<SpellDef> = {}): SpellDef =>
  ({ id, set: 2, kind: 'tactic', name, cost, text, effects, art, ...extra });
const S = (id: string, name: string, cost: number, when: SpellDef['when'], text: string, effects: Effect[], art: string, extra: Partial<SpellDef> = {}): SpellDef =>
  ({ id, set: 2, kind: 'scheme', name, cost, when, text, effects, art, ...extra });

export const SET2_SPELLS: SpellDef[] = [
  // The Unbinding Charm (Crownfall consumable)
  T('unbinding_charm', 'Unbinding Charm', 0, 'Return a Relic to its owner’s hand.', [{ op: 'unequip' }], 'A silver charm unpicking the bindings of a relic.', { canonId: 'unbinding_charm' }),
  // Crown Hex boons (Crownfall: the golden hex grants a boon from your strongest Crown school)
  T('hex_war', 'Crown Hex: War', 2, 'Your champions get +2 Might this turn.', [{ op: 'buffAll', might: 2 }], 'A golden hex blazing red beneath an army’s feet.', { canonId: 'crown_hex' }),
  T('hex_fortune', 'Crown Hex: Fortune', 1, 'Shield a champion you control. Gain 2 Command.', [shOwn, cmd(2)], 'A golden hex scattering coins and a glowing shield.', { canonId: 'crown_hex' }),
  T('hex_creation', 'Crown Hex: Creation', 2, 'Summon two Crownlings.', [summon('crownling', 2)], 'A golden hex from which small crowned creatures spring.', { canonId: 'crown_hex' }),
  T('hex_void', 'Crown Hex: Void', 0, 'Break one of your own shards. Your champions get +3 Might this turn.', [{ op: 'selfShard', n: 1 }, { op: 'buffAll', might: 3 }], 'A golden hex cracking into violet void.', { canonId: 'crown_hex' }),
  T('hex_evolution', 'Crown Hex: Evolution', 2, 'Ascend one of your ★ champions to ★★ for free.', [{ op: 'ascendNow', maxStar: 1 }], 'A golden hex lifting a champion into its next form.', { canonId: 'crown_hex' }),
  // Crownfall events
  T('wild_encounter', 'Wild Encounter', 2, 'Deploy a Monster costing 3 or less from your hand for free.', [{ op: 'deployFree', maxCost: 3, family: 'monster' }], 'Wild monsters bursting from a cavern into the Arena.', { canonId: 'wild_encounter' }),
  T('boss_encounter', 'Boss Encounter', 2, 'Your Monsters and Guardians get +2 Might and +2 Guard this turn. Draw a card.', [{ op: 'buffTrait', trait: 'monster', might: 2, guard: 2 }, draw(1)], 'A Guardian rising through the Arena floor as Sovereigns brace.', { canonId: 'boss_encounter' }),
  T('pack_leader', 'Pack Leader', 1, 'Your Wildkin champions and Monsters get +2 Might this turn.', [{ op: 'buffTrait', trait: 'wildkin', might: 2 }, { op: 'buffTrait', trait: 'monster', might: 2 }], 'A Rift Alpha howling at the head of its pack.', { canonId: 'pack_leader' }),
  T('clash_of_sovereigns', 'Clash of Sovereigns', 2, 'Ready another champion you control. Your champions get +1 Might this turn.', [readyOther, { op: 'buffAll', might: 1 }], 'Two Sovereigns’ banners crashing together over the Arena.', { canonId: 'clash_of_sovereigns', flavour: 'The Clash of Sovereigns begins.' }),
  // Announcer lines (the card name and flavour are the canonical line)
  T('stirs_beneath', 'Something Stirs Beneath the Arena', 1, 'Return a ★ champion from your Fallen pile to your hand. Draw a card.', [champBack, draw(1)], 'Cracks spreading across the Arena sand as something huge moves below.', { flavour: 'Something stirs beneath the Arena.' }),
  T('guardian_approaches', 'A Guardian Approaches', 2, 'Summon a Guardian Construct.', [summon('construct')], 'The silhouette of a Guardian Construct stepping out of a dark tunnel.', { flavour: 'A guardian approaches.' }),
  T('guardian_falls', 'The Guardian Falls', 3, 'Defeat each rival champion with Guard 3 or less.', [sweep(3)], 'A colossal Guardian toppling onto the Arena sand.', { flavour: 'The guardian falls.' }),
  T('treasure_is_yours', 'Its Treasure Is Yours', 1, 'Return a Relic from your Fallen pile to your hand. Draw a card.', [relicBack, draw(1)], 'A heap of relics spilling from a fallen Guardian’s chest.', { flavour: 'Its treasure is yours.' }),
  T('arena_yields', 'The Arena Yields Its Prize', 2, 'Draw 2 cards. Gain 1 Command.', [draw(2), cmd(1)], 'A golden chest rising from the Arena floor.', { flavour: 'The Arena yields its prize.' }),
  T('vault_remembers', 'The Vault Remembers', 1, 'Return a Relic from your Fallen pile to your hand.', [relicBack], 'Relics re-forming on their pedestals in the Ascension Vault.', { flavour: 'The Vault remembers this relic.', shardfall: true }),
  T('old_power', 'Old Power, Newly Yours', 1, 'Return a Relic from your Fallen pile to your hand. Gain 2 Command.', [relicBack, cmd(2)], 'A champion lifting an ancient artifact, light pouring from it.', { flavour: 'A Crown Artifact. Old power, newly yours.' }),
  T('vault_opens', 'The Ascension Vault Opens', 2, 'Draw 3 cards, then put a card from your hand on the bottom of your deck.', [draw(3), { op: 'tuck' }], 'The great doors of the Ascension Vault swinging open.', { flavour: 'The Ascension Vault opens.' }),
  T('wounded_choose', 'The Wounded Choose First', 1, 'If you have fewer shards than your rival, draw 2 cards.', [{ op: 'draw', n: 2, when: 'behind' }], 'A battered Sovereign reaching first into the Vault.', { flavour: 'The Crown Draft begins. The wounded choose first.', shardfall: true }),
  T('crown_divided', 'The Crown Is Divided', 2, 'Mend 1. Draw a card.', [mend, draw(1)], 'Shards of the Crown hanging in the air above the Arena.', { flavour: 'The Crown is divided. Come and claim your share.' }),
  T('guardian_enrages', 'The Guardian Enrages', 1, 'A champion gets +4 Might this turn.', [{ op: 'buff', might: 4, guard: 0, target: 'chooseAny' }], 'The Crown Guardian’s eyes burning red as it enrages.', { flavour: 'The Guardian enrages.', swift: true }),
  T('head_splits', 'A Head Splits', 2, 'Summon two Hydra Hatchlings.', [summon('hydralet', 2)], 'A clockwork hydra head splitting into snapping hatchlings.', { flavour: 'A head splits.' }),
  T('forged_in_fire', 'Even Crowns Are Forged in Fire', 2, 'Return a ★ champion and a Relic from your Fallen pile to your hand.', [champBack, relicBack], 'A crown glowing white-hot on an anvil.', { flavour: 'Even crowns are forged in fire.' }),
  T('tide_will_turn', 'The Tide Will Turn', 0, 'If you have fewer shards than your rival, draw 2 cards.', [{ op: 'draw', n: 2, when: 'behind' }], 'A wave of light rolling back across a losing battlefield.', { flavour: 'The tide will turn.' }),
  T('crown_in_danger', 'Your Crown Is in Danger', 2, 'If you have fewer shards than your rival, Mend 1.', [{ ...mend, when: 'behind' }], 'A cracked Crown Shard glowing as it begins to mend.', { flavour: 'Your Crown is in danger.' }),
  S('steel_will_answer', 'Steel Will Answer', 1, 'rivalAttacks', 'Spring when a rival champion attacks: it gets −3 Might this turn.', [weakenAtt(3)], 'A wall of raised steel meeting a charge.', { flavour: 'Steel will answer.' }),
  S('cannot_be_touched', 'It Cannot Be Touched', 1, 'clash', 'Spring when one of your champions is attacked or blocks: Shield one of your champions.', [shOwn], 'A Celestial Sentinel wrapped in an untouchable golden shell.', { flavour: 'It cannot be touched. Wait.' }),
  S('one_still_stands', 'One Still Stands', 1, 'clash', 'Spring when one of your champions is attacked or blocks: it gets +2 Might and +2 Guard this turn.', [{ op: 'buff', might: 2, guard: 2, target: 'defender' }], 'A lone champion standing amid the fallen.', { flavour: 'One still stands.' }),
  S('keeps_treasure', 'The Guardian Keeps Its Treasure', 1, 'clash', 'Spring when one of your champions is attacked or blocks: it gets +3 Guard this turn.', [{ op: 'buff', might: 0, guard: 3, target: 'defender' }], 'A Guardian curled around its hoard, refusing to yield.', { flavour: 'The guardian keeps its treasure.' }),
  S('not_yet', 'Steady, Sovereign. Not Yet.', 1, 'crownUnblocked', 'Spring when a rival champion attacks your Crown and is not blocked: that attack ends. No shards break.', [{ op: 'cancelAttack' }], 'A Sovereign’s hand raised as an attack freezes mid-air.', { flavour: 'Steady, Sovereign. Not yet.' }),
];

// ───────────────────────────── Edicts ─────────────────────────────
const E = (canonId: string, name: string, host: string, text: string, rule: EdictDef['rule']): EdictDef =>
  ({ id: `edict-${canonId.replace(/^edict_/, '')}`, kind: 'edict', set: 2, canonId, name, cost: 2, host, text, rule });

export const SET2_EDICTS: EdictDef[] = [
  E('edict_relic_tide', 'Relic Tide', 'unwritten', 'When a champion holding a Relic is defeated, the Relic returns to its owner’s hand.', { relicReturn: true }),
  E('edict_monster_tithe', 'Monster Tithe', 'dreadmouth', 'Whenever a Monster or Guardian is defeated, its rival draws a card.', { monsterDraw: true }),
  E('edict_first_armoury', 'The First Armoury', 'borin', 'Relics cost 1 less (minimum 0).', { relicDiscount: 1 }),
];
