// Set 2 — BENEATH THE ARENA. "Something stirs beneath the Arena." (canonical announcer line)
//  • Season 1 mid-season remix (owner direction 2026-10-11, see prototype-v0.2/SET2_SEASON_REMIX.md): all 55 champions,
//    same Origin and tier, a NEW Season 1.5 class (Sharpshooter, Hunter, Artificer, Sentinel, Delver, Gladiator, Seer,
//    Binder, Channeler, Restorer, Sapper, Rogue; Ascendant stays), a PROPOSED title, new rules on the Set 1 stat budget,
//    a rarity chosen by role (not tier) and a PROPOSED art setting.
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
// Season 1.5 class mechanics (owner-approved 2026-10-11)
const tuck: Effect = { op: 'tuck' };
const breakRelic: Effect = { op: 'breakRelic' };
const breakScheme: Effect = { op: 'breakScheme' };
const stealRelic: Effect = { op: 'stealRelic' };
const discard = (n: number): Effect => ({ op: 'rivalDiscard', n });
const hunt = (n: number) => `+${n} Might while fighting a Monster, a Guardian or a ★★/★★★ champion.`;
const duel = (n: number) => `+${n} Might while attacking a champion.`;
const seer = (n: number) => `Your Schemes cost ${n} less to spring.`;
const artif = (n: number) => `Your Relics cost ${n} less.`;
const tokens = (m: number, g: number) => `Your tokens have ${[m ? `+${m} Might` : '', g ? `+${g} Guard` : ''].filter(Boolean).join(' and ')}.`;
const channel = (what: string) => `Whenever you cast a Tactic, ${what}.`;
const stealText = (n: string) => `Take a Relic from a rival champion and attach it to ${n}.`;
const steal = (n: string) => `Attack: ${stealOrText(n, 1)}`;
const rob = (n: string) => `When ${n} defeats a champion on your turn, your rival discards a card at random.`;
// Audit fixes (2026-10-12, PROPOSED): breakers and stealers get a fallback so they are never blank (Set 1 has no Relics
// and few Schemes). Tier I–III fall back to Scorch 1, Tier IV–V to Scorch 2. Printed cards keep their old text.
const orElse = (n: number) => `If you can’t, Scorch ${n} a rival champion.`;
const breakRelicOr = (n: number): Effect => ({ op: 'breakRelic', orElse: [sc(n)] });
const breakSchemeOr = (n: number): Effect => ({ op: 'breakScheme', orElse: [sc(n)] });
const stealOr = (n: number): Effect => ({ op: 'stealRelic', orElse: [sc(n)] });
const stealOrText = (name: string, n: number) => `${stealText(name)} ${orElse(n)}`;
const randomScheme = 'Break one of your rival’s face-down Schemes at random.';
const ward1Text = 'Rival champions attacking your Crown get −1 Might.';
const ward2Text = 'Rival champions attacking your Crown get −2 Might.';

type F = Omit<ChampionForm, 'star'>;
/** A returning champion: canonical identity + PROPOSED epithet and art setting + three new forms. */
/** PROPOSED Set 2 ability names (2026-10-11): each previews the champion's reworked ability in Crownfall's mid-season patch.
 *  Every form with rules text prints it, as in Set 1. */
/** PROPOSED Set 2 art (owner feedback 2026-10-11): the character keeps its Crownfall appearance; each card gets a NEW pose,
 *  action and composition (never the Set 1 one) that shows the new class through what they are doing, not costume props. */
const LOOK: Record<string, string> = {
  bramble: 'kneeling with both fists driven into the stone floor, roots erupting outward and splitting the tunnel floor and walls apart; low camera angle looking up at him',
  kira: 'lying prone on a high girder, steadying her arm for one precise long-range shot at a target far below in a dark flooded cavern; side profile, one eye on her sights',
  grimm: 'standing motionless guard before a sealed iron vault door, shield planted, his head just turning toward something approaching out of the dark',
  pip: 'sprinting toward the viewer as her own charge blows a tunnel wall apart behind her, grinning, rubble flying',
  solara: 'kneeling beside a cracked glowing crystal in a dim tunnel, golden light flowing from her hands to mend the crack',
  fen: 'crouched low on a rock ledge, stalking a huge monster shape in the darkness below, about to pounce',
  torren: 'his back against a massive vault door, arms spread, bracing it shut while something pounds on the other side',
  nyx: 'mid-leap between treasure piles, snatching a glowing relic from beside a sleeping Guardian',
  emberling: 'hovering over an unrolled spell scroll, drinking streams of fire from its glowing script and growing brighter',
  rowan: 'on top of a gate tower, drawing a long shot down a torchlit tunnel, his arrow glowing white',
  hexie: 'sitting cross-legged over a bowl of glowing water, ghostly images of hidden traps rising from it',
  bolt: 'sitting at a cave workbench, welding a recovered relic plate onto its own arm in a shower of sparks',
  kael: 'descending a crumbling stair into darkness, torch raised, an old map in his other hand',
  solenne: 'leading the way down a pitch-black tunnel, her burning sword held high like a torch as shadows flee',
  grizz: 'wrestling a cave monster by its jaws, muscles straining, mid-struggle',
  gearwick: 'its many arms assembling a relic weapon onto its own frame in a cluttered underground workshop',
  mirella: 'rising out of a still underground lake, the water gently lifting wounded allies around her',
  shade: 'stepping out of the shadow behind an unaware guard, lifting a relic from his belt',
  borin: 'hammering a glowing relic on an anvil, the sparks lighting his face',
  seren: 'guiding a line of lost explorers through a vast cavern, her starlings flying ahead lighting the path',
  thorn: 'his vines forcing their way through a cracked vault wall from inside, the stone crumbling around him',
  dax: 'down on one knee at the mouth of a rift portal, taking aim at a towering Guardian',
  elara: 'tending wounded explorers in a collapsed hall by lantern light, her hands glowing as she heals',
  rask: 'roaring in the centre of an underground fighting pit, a defeated monster at his feet, the crowd on the ledges above',
  hex3: 'floating in a dark vault, pulling lines of light from spell glyphs that swirl around it',
  valkara: 'hovering with eyes closed, glowing visions of what is about to happen orbiting her',
  dreadmouth: 'bursting up out of black water to seize the armoured leg of a Guardian',
  spark: 'fixing a crackling relic onto a half-built turret, goggles down, tongue out in concentration',
  orion: 'standing on a cavern ledge under painted constellations, loosing an arrow at a distant target in the dark',
  maeve: 'in a hidden underground market, swapping a fake relic for a real one behind her back with a sly smile',
  ronin: 'locked blade-to-blade with an opponent in a flooded arena pit, sparks flying where the blades meet',
  ignara: 'drawing flame out of floating runes into her open hands in a deep forge cavern',
  morrow: 'raising soldiers from open stone tombs, ghostly chains of light binding them to his will',
  blacktide: 'swinging down on a rope from his rift-wedged ship into a treasure hoard, grabbing a relic mid-swing',
  aurelia: 'at the head of a column of soldiers descending the great stair, pointing the way down with her banner',
  knuckle: 'standing in the middle of a pit arena, fists raised, challenging all comers',
  zyrak: 'its shattered crystals reassembling around a burst of light as it gathers power',
  astryon: 'leaping at an opponent in a fighting pit, his seven blades circling him',
  vespera: 'seated on a shadow throne as shades kneel before her, bound to her by threads of darkness',
  titanrho: 'planted in front of a vault gate, deflecting incoming fire with its body',
  pyrax: 'bursting up through the floor of a forge cavern, the rock collapsing around her',
  elysian: 'raising one hand to stop a trap just before it springs, her eyes glowing with foresight',
  varr: 'holding a gate shut with his shield as monsters press against it from the other side',
  veilwalker: 'half-stepping out of a rift behind a Guardian, reaching for the relic on its back',
  gaia: 'her roots knitting cracked stone pillars back together, the hall mending around her',
  ladyvolt: 'striking a distant target with a bolt of lightning across a flooded cavern',
  vessimer: 'pouring a glowing tincture over a relic on his alchemy table, transforming it',
  aurex: 'pinning a fallen Guardian beneath his claws in its lair, roaring',
  noctara: 'an eclipse opening above her as she sees every hidden plot as glowing threads in the dark',
  atlas: 'standing as a living vault door, shielding the treasure behind it from attackers',
  sol: 'rising like a new sun inside the deepest cavern, her light mending cracked stone and wounded allies',
  unwritten: 'on his buried throne as a legion of bound spirits rises behind him',
  veyra: 'leaping out of a portal onto a Guardian’s back, blade raised',
  mother: 'growing up through the Arena’s foundations, forest spirits bound and glowing in her branches',
  crownless: 'standing alone in the empty vault where the Crown once rested, turning his back on the empty pedestal',
};
/** PROPOSED Set 2 flavour (2026-10-11) for the forms with no unused Crownfall line, so no Set 2 card repeats Set 1. [★★, ★★★] */
const FLAVOUR: Record<string, [string | undefined, string]> = {
  bramble: ['Stone cracks. I don’t.', 'Every wall has a root in it somewhere.'],
  kira: ['Hold still. Thank you.', 'One shot. One spark. One less problem.'],
  grimm: ['Nobody gets past. That’s the job.', 'Still on watch. Always on watch.'],
  pip: ['Was that the wall? It was the wall!', 'Bigger tunnel! You’re welcome!'],
  solara: ['Hold on. The light’s coming.', 'Nothing down here stays broken.'],
  fen: ['It’s big. Good.', 'The deeper the dark, the better the hunt.'],
  torren: ['This door stays shut.', 'Knock all you like.'],
  nyx: ['Finders keepers.', 'Guardians sleep. I don’t.'],
  emberling: ['More! Read me more!', 'Every spell is kindling.'],
  rowan: ['The next arrow’s already flying.', 'From the gate to the target. Easy shot.'],
  hexie: ['The bones never lie. Mostly.', 'I saw your trap coming last week.'],
  bolt: ['New part. New Bolt.', 'Spare parts? I’m all spare parts.'],
  kael: ['This way. Probably.', 'Whatever’s down there, I find it first.'],
  solenne: ['Stay close to the light.', 'Where I walk, the dark ends.'],
  grizz: ['Big one. Even better.', 'Monsters wrestle. I win.'],
  gearwick: ['Upgrade installed.', 'Every relic fits somewhere.'],
  mirella: ['The lake remembers who it saves.', 'Rest. The water has you.'],
  shade: ['Lose something?', 'No face. No name. No witnesses.'],
  borin: ['Heat it. Hit it. Done.', 'The deep forge never cools.'],
  seren: ['Follow the stars, even down here.', 'No one gets lost on my watch.'],
  thorn: ['Your walls are already rotting.', 'I grow in the cracks you can’t see.'],
  dax: ['Big target. Easy shot.', 'I hunt the things that hunt you.'],
  elara: ['Breathe. I’ve got you.', 'No one gets left in the dark.'],
  rask: ['The sand wants another one.', 'The pit chooses its king.'],
  hex3: ['Power accepted.', 'Every spell makes me stronger.'],
  valkara: ['I’ve already seen how this ends.', 'Judgement was passed before you arrived.'],
  dreadmouth: ['The water is hungry.', 'Even Guardians sink.'],
  spark: ['It works! Mostly!', 'Science, applied loudly!'],
  orion: ['The stars have marked you.', 'No dark is deep enough to hide from the sky.'],
  maeve: ['A fair trade. For me.', 'Everything has a price. I set it.'],
  ronin: ['Again.', 'Steel remembers every duel.'],
  ignara: ['Feed the fire.', 'The forge answers only me.'],
  morrow: ['Rise. There’s work to do.', 'The buried halls are never empty.'],
  blacktide: ['Mine now!', 'Every vault is just a treasure chest with a door.'],
  aurelia: ['Down we go. Together.', 'The Kingdom goes where I lead.'],
  knuckle: ['Who’s next?', 'Kneel, or get knocked down.'],
  zyrak: ['Pieces become power.', 'Shatter me. I come back sharper.'],
  astryon: [undefined, 'Seven blades. One winner.'],
  vespera: [undefined, 'The shadows bow. So will you.'],
  titanrho: [undefined, 'Bastion holds.'],
  pyrax: [undefined, 'Collapse the deep.'],
  elysian: [undefined, 'I saw your move before you made it.'],
  varr: [undefined, 'This gate does not open.'],
  veilwalker: [undefined, 'I was never here. Neither was your relic.'],
  gaia: [undefined, 'What breaks, I mend.'],
  ladyvolt: [undefined, 'Lightning never needs a second shot.'],
  vessimer: [undefined, 'Everything transmutes.'],
  aurex: [undefined, 'No Guardian outlives the last dragon.'],
  noctara: [undefined, 'I see every shadow you hide in.'],
  atlas: [undefined, 'Vault sealed. Threat denied.'],
  sol: [undefined, 'A second dawn, beneath the world.'],
  unwritten: [undefined, 'Even the forgotten answer my call.'],
  veyra: [undefined, 'The bigger they are, the longer the fall.'],
  mother: [undefined, 'Everything grows back.'],
  crownless: [undefined, 'No crown. No chains. No rules.'],
};
/** PROPOSED Set 2 card scenes (owner-approved approach, Bramble v4, 2026-10-11): one cinematic scene per form, off-centre,
 *  new camera and mood, never the Set 1 composition. Champions without scenes yet fall back to LOOK. [★, ★★, ★★★] */
const SCENES: Record<string, [string, string, string]> = {
  solara: [
    'three-quarter rear view in a pitch-dark flooded tunnel: Solara walks ahead on a line of stepping stones, holding her brass staff high so its tip glows like a small lantern, a few lost explorers following close behind her through the dark; the warm gold light falls only around them, everything beyond is cold blue shadow (standing and walking, NOT kneeling, NOT healing)',
    'high angle looking down a flooded stair: Solara wades down the steps holding her light above her head, the glow spreading across the water and lifting the fallen around her',
    'low wide shot of a vast dark cathedral-like cavern: Solara small in the centre-left as a dome of dawn light blooms outward from her, cracked pillars knitting back together, every shadow pushed to the edges',
  ],
  fen: [
    'ground-level view through tall cave fungus: Fen crouched low and motionless, ears forward, eyes fixed on the huge shadow of a monster moving across the cavern beyond; cool teal light, one warm glint in his eyes',
    'dynamic side view mid-leap: Fen springing off a rock ledge across a chasm toward an unseen beast, claws out, his shadow stretched long on the wall by a warm torch below',
    'over-the-shoulder from behind Fen’s pack on a ridge at night underground: Fen at the front howling, a giant fallen monster below them, a red moon-like crystal glowing in the cavern roof',
  ],
  torren: [
    'low angle from beside a gigantic sealed vault door: Torren stands with his back to it, arms folded, small against the door’s scale, a single lantern above, the corridor fading into cold blue dark',
    'tight side view: Torren braces both hands and shoulder against the vault door as it bulges and cracks from blows on the other side, dust shaking from the hinges, warm light leaking through the seams',
    'wide shot from the far end of a great hall: colossal Torren has become part of the vault wall itself, stone fused to his body, the whole door glowing with locking runes as an army halts before him',
  ],
  rowan: [
    'low angle beneath the great iron portcullis of the Deep Gate: Rowan kneels on one knee in the archway, bow half-drawn, scanning the black tunnel ahead for movement; a single brazier warms the stone behind him, cold blue mist creeping in from the dark',
    'side view along the top of the gate wall: Rowan mid-stride, loosing one arrow while already reaching back for the next, a second arrow still in the air streaking into the dark tunnel below; torchlight on his face, cool blue depth beyond',
    'heroic low-angle hero shot: Rowan large in frame standing on the gatehouse battlement, bow drawn to full, a volley of white-tipped arrows arcing out over a vast underground hall toward a charging horde far below; banners snapping, firelight behind him, glorious and unbreakable',
  ],
  bolt: [
    'close three-quarter view at a cluttered cave workbench: small Bolt hunches over its own forearm, welding a scavenged relic plate onto it, a fountain of orange sparks lighting its single amber eye; scrap piles and hanging chains fade into cool blue dark behind',
    'low angle in a scrapyard cavern: bigger, reforged Bolt strides out of the smoke and sparks of its forge, a freshly fitted relic plate glowing on its chest and piston fists clenched, loose parts still clattering to the floor around it',
    'heroic wide shot of a vast underground foundry: Bolt towering and fully rebuilt from dozens of mismatched relic plates, gear core blazing, raising one enormous piston fist as the forge erupts behind it; tiny workers below for scale',
  ],
  kael: [
    'over-the-shoulder view from behind Kael as he descends a crumbling spiral stair into darkness, torch raised in one hand and an old map in the other, the torchlight catching carved runes on the wall; the stair drops away into cool blue black',
    'low side angle in a flooded relic vault: Kael wades waist-deep through dark water toward a broken plinth, sword drawn, his torch held high and reflecting in the ripples; a faint teal glow from the relic ahead',
    'heroic low-angle hero shot: Kael large in frame at the top of a mountain of treasure in a vast collapsed vault, lifting an ancient relic blade high as its light floods the cavern, his torch cast aside, broken pillars and gold spilling around him',
  ],
  solenne: [
    'low side angle in a pitch-black underway: Solenne strides forward with her flaming blade held low like a lantern, its fire throwing her long shadow behind her and lighting wet stone walls, shadowy shapes recoiling from the edge of the light',
    'three-quarter view from below on a narrow bridge over a dark chasm: Solenne lifts her white-hot blade overhead, her fiery plume streaming, and a wave of dawnfire rolls ahead of her down the tunnel, burning the shadows away',
    'heroic wide shot of a vast underground hall plunged in darkness: Solenne large in frame driving her blazing sword into the stone floor as a sunrise of fire spreads outward from it, lighting every arch and pillar at once; glorious and unstoppable',
  ],
  grizz: [
    'ground-level view in a fungus-lit cavern: Grizz crouched on all fours behind a boulder, iron-shod claws digging into the rock, nose lifted to the scent of a monster lumbering past in the teal gloom beyond',
    'close dynamic side view: Grizz locked in a wrestling hold with a cave monster twice his size, claws braced, shoulders heaving, dust and loose stones exploding around them under a single warm lantern',
    'heroic low angle: Grizz rearing up to full height on top of a defeated cave beast, roaring at the cavern ceiling, iron claws raised, torchlight blazing behind him and scattered warriors cheering far below',
  ],
  gearwick: [
    'three-quarter view in a cluttered underground workshop: Gearwick-9 kneels on its stubby legs while its mechanical arms bolt a recovered relic barrel onto its brass mortar, rivets popping and steam hissing, a single hanging work lamp the only warm light against cool blue shadows',
    'low angle in a vaulted cavern armoury: bigger Gearwick-9 swings its twin barrels toward a target off the card, targeting monocle glowing and clicking into focus, relic parts welded across its frame and smoke curling from the muzzles',
    'heroic wide shot of a vast forge-hall: Gearwick-9 rebuilt into a towering walking siege tower, rotary mortar crown blazing as it fires a full volley into the dark, shell casings raining down and tiny engineers cheering at its feet',
  ],
  mirella: [
    'low side angle at the shore of a still black underground lake: Mirella rises waist-deep from the water, her swirling orb of seawater cupped in both hands, its soft teal glow lifting a wounded soldier gently onto the stone steps; one warm lantern on the stair above',
    'three-quarter view on flooded stone stairs: Mirella walks up out of the lake in robes of living foam, a wave rising behind her and carrying fallen allies safely up the steps, droplets glittering in amber torchlight',
    'heroic low-angle hero shot of a vast drowned hall: Mirella large in frame floating above the lake, a great ring of water orbiting her with fish of light swimming through it, the whole cavern lit teal and gold as the water lifts every fallen ally at once; serene and overwhelming',
  ],
  shade: [
    'high angle looking down a black stone corridor in the lowest halls: Shade hangs upside-down from a ceiling beam above an unaware sentry carrying a lantern, red-lacquered blade drawn, only its white mask catching the lantern glow',
    'low tilted angle in a narrow vault passage: Shade drops into a crouch behind a fallen rival champion, its cracked mask leaking a crimson glow, red blade flicked clean, a stolen pouch already in its other hand; cold teal shadows, one guttering torch',
    'heroic wide shot of a vast dark treasure vault: Shade unfurled as a wraith of black ribbons and spinning knives filling the frame, the mask floating before an empty hood, a storm of blades cutting every torch to darkness except one; terrifying and unstoppable',
  ],
  borin: [
    'side view in a collapsed, half-flooded ancient forge deep underground: Borin wades waist-deep through dark water, hauling a huge broken relic blade out of the rubble with both hands, steam hissing where its still-glowing edge touches the water; his lantern hangs from his belt, cold teal shadows all around (NOT at an anvil, NOT hammering)',
    'low angle in a vast forge cavern: Borin lifts a freshly reforged Guardian relic from the quenching trough in a burst of steam, magma veins glowing along his arms, his live-forge hammer resting on his shoulder',
    'heroic wide shot of the great forge beneath the Arena: Borin as a walking furnace, beard of molten metal, bringing his hammer down on a colossal anvil as a shockwave of sparks and slag lights every chain and pillar; dwarf smiths shield their eyes far below',
  ],
  seren: [
    'high angle looking straight down a deep vertical mine shaft: small Seren drifts gently downward into the dark on starlight, her cloak flaring upward, a spiral of tiny glowing light-birds circling around her and lighting the rough shaft walls as she descends; her staff held at her side, not raised (NOT holding the lantern up, NOT facing the camera)',
    'over-the-shoulder view from behind Seren on a rock spire above a vast underground chasm: her night-sky cloak billowing as she lifts her lantern and a real star inside it flares, revealing a hidden city of ruins far below',
    'heroic wide shot of an enormous cavern turned into a night sky: Seren floating at centre-left, constellations drawing themselves across the cave roof around her and a great flock of light-birds circling overhead, the whole underworld lit silver-blue; wondrous and vast',
  ],
  thorn: [
    'close low angle at the base of an old vault wall: Thorn presses one thorned hand to a crack, violet blight creeping out from his fingers through the mortar as the stone crumbles to green dust; one warm torch above, cold shadows below',
    'three-quarter view inside a collapsing treasure vault: Thorn strides through a wall that is rotting apart around him, poison dripping from his purple petals and thorny spine raised, guards backing away through the green haze',
    'heroic low angle of a vast vault hall overrun: Thorn as a towering carnivorous bloom colossus bursting up through the cracked floor, giant petals exhaling clouds of toxic spores that rot the stone pillars around him; tiny soldiers flee below',
  ],
  dax: [
    'low angle through a glowing violet rift torn in a cavern wall: Dax Meridian steps half through it, dusty long coat swirling, revolver raised in one hand and aimed at the huge silhouette of a Guardian in the dark cavern beyond; one warm lantern behind him',
    'dramatic side view in a collapsing cavern: Dax fans the hammer of his rift-cracked revolver mid-run, glowing shots streaking toward a charging Guardian, his coat flaring open to show another sky inside it',
    'heroic wide shot of a vast cavern split by rifts: Dax large in frame standing on a fallen Guardian, revolver smoking, a dozen ghostly copies of himself from other timelines firing all at once around him; violet rift light and amber muzzle flashes everywhere',
  ],
  elara: [
    'low angle looking up a dark vertical shaft: Elara braced on a rope, hauling a wounded delver up out of the pit over her shoulder, her salve satchel swinging, one lantern tied to the rope lighting her determined face against cold blue rock (never kneeling over a patient)',
    'side view in a collapsing tunnel: Elara sprints through falling rubble with her tome held open ahead of her like a shield, its light forming a protective dome over the wounded being carried out behind her; dust, sparks and torchlight',
    'heroic wide shot of a cave-in: Elara stands alone in the breach of a collapsing hall, both arms raised as a vast wall of light from her open tome holds back a falling ceiling of stone while the last of the wounded escape behind her; no wings, no halo',
  ],
  rask: [
    'low angle in the blood-sand pit of the Underpits: Rask circles his opponent with notched gladius raised and tail low, torchlit crowds in the stone tiers above, a fallen monster skull half-buried in the sand',
    'dynamic side view: Rask in gilded arena armour leaps over a charging cave beast, gladius flashing down, his trophy belt swinging, sand and sparks spraying in the torchlight of the pit',
    'heroic low-angle hero shot of the packed Underpits arena: golden-scaled Rask large in frame raising his gladius in triumph on top of a defeated Guardian, cloak of fallen champions streaming behind him, the roaring crowd lit by a ring of fire; glorious and undefeated',
  ],
  hex3: [
    'three-quarter view in a cable-strung vault: HEX-3 hangs in a cradle of thick cables, its glass mana chamber humming, a single arc of blue-white power crawling from a wall conduit into its shell; dust motes in the beam of one warm work lamp',
    'low angle inside a reactor chamber: HEX-3 rises free of its cables, rune-etched plating glowing, its violet reactor flaring as spells spill from the conduits around it and are drawn into its core in bright ribbons',
    'heroic wide shot of a vast arcane engine hall: HEX-3 levitating at centre-left as a towering engine, three reactor cores orbiting it and every conduit in the cavern pouring power into it at once, lightning-white and violet light filling the frame',
  ],
  valkara: [
    'low angle from a cavern floor: Valkara dives out of the darkness above, wings spread and spear-sword levelled at a huge monster below, her light cutting a bright line through the dust',
    'side view on a broken stone bridge: Valkara lands in a crouch before a kneeling monster, wings of starlight half-folded, gilded war-helm lit by the glow of her spear-sword raised in judgment',
    'heroic wide shot of a vast cavern: six-winged Valkara large in frame with a halo of blades, diving straight down through the cavern roof so the rock splits open and daylight pours in behind her; awe-inspiring and terrible',
  ],
  dreadmouth: [
    'side view in a dry stone vault: Dreadmouth erupts up through the cracking flagstone floor, its enormous jaw clamping onto the armoured leg of a staggering Guardian, broken slabs and dust flying, one warm lantern swinging from the Guardian belt (no water, NOT a lake)',
    'side view in a flooded vault: Dreadmouth drags a thrashing Guardian down beneath the dark water, only its gaping jaw and the Guardian reaching arm breaking the surface, ripples catching amber torchlight',
    'heroic wide shot of a vast sunken hall: Dreadmouth rising from the lake larger than the hall pillars, jaw opened wide enough to swallow a Guardian whole as torches gutter and tiny delvers flee along the walkways; terrifying and unstoppable',
  ],
  spark: [
    'over-the-shoulder view from behind Professor Spark crouched inside the open belly of a half-built turret in a cramped underground workshop, wrench in one hand, sparks spraying from a crackling relic he is wiring in; his goggles glow orange in the dark, cables everywhere',
    'low angle in a flooded workshop: Spark rides on top of his finished clanking turret as it wades forward, steering it with a lever while it fires a relic-charged bolt down the tunnel, his wild hair lit by the blast',
    'heroic wide shot of a vast cavern foundry: Spark on a gantry at centre-left conducting a whole army of relic turrets with a glowing wrench like a baton, every barrel firing in a storm of light while tiny engineers cheer below',
  ],
  orion: [
    'low angle inside a narrow flooded tunnel lit only by his own glowing arrow: Orion wades thigh-deep, crescent longbow lowered, holding a single star-arrow up like a torch to read faint star maps carved into the tunnel ceiling (no open sky, no rocks against stars)',
    'side view across a dark underground chasm: Orion braced against a stalactite, drawing a star-arrow whose light reveals a hidden Guardian clinging to the far wall, his cloak streaming in the updraft',
    'heroic low angle in a vast cavern: Orion fires straight up and the arrow bursts into a ceiling of new constellations across the cave roof, lighting the whole underworld silver-blue while he stands on a broken bridge below',
  ],
  maeve: [
    'eye-level view in a crowded, lantern-lit underground black market: Maeve in a hooded cloak of moss leans over a merchant stall, palming a real glowing relic while sliding a fake one carved from living wood into its place; the merchant looks away',
    'high angle on a rope bridge over a fungus-lit cavern: Maeve escapes with a sack of stolen relics as living roots from her staff tangle the guards chasing her, green witch-light flaring',
    'heroic wide shot of a hidden thieves hall grown from roots: Maeve on a throne of living wood surrounded by stolen relics, every root in the cavern reaching out to snatch more treasure toward her; sly and overwhelming',
  ],
  ronin: [
    'low side angle in a flooded underground dueling pit: Ronin Zero locked blade-to-blade with a masked rival, both knee-deep in dark water, sparks bursting where the katanas meet and lighting his straw visor; torchlit crowd silhouettes on the ledges above (no petals, no open sky)',
    'top-down view onto the flooded pit: Ronin Zero mid-spin between three fallen opponents, his katana leaving a bright arc of rippling water around him, one warm lantern swinging overhead',
    'heroic low angle in a vast cavern arena: Ronin Zero alone at the centre of a ring of broken blades stuck in the stone, katana raised as a single lightning-white slash splits the darkness behind him; cold teal air, one amber brazier',
  ],
  ignara: [
    'close three-quarter view in a dark forge cavern: Ignara kneels at a cold, dead forge and breathes fire into its heart from her cupped hands, the coals catching orange around her obsidian gauntlets; the rest of the cavern is cool blue shadow (not standing in a burning ruin)',
    'low angle at a great underground smelter: Ignara pulls a river of molten metal up out of a crucible with both hands, shaping it into a burning blade in mid-air, her armour cracked and glowing',
    'heroic wide shot of a vast forge-hall: Ignara as a towering living furnace, every forge in the cavern roaring to life at once around her as she raises both arms, rivers of molten metal lighting the chains and pillars',
  ],
  knuckle: [
    'low angle in a cramped torchlit tunnel below the pits: Knuckle squeezes his enormous stone body through a too-small archway into the underground fight cellar, taped fists braced on the walls, rubble cracking around his shoulders, a ring of shadowy brawlers waiting in the amber light beyond (not a sunny open arena)',
    'side view in a flooded fight cellar: Knuckle catches an incoming iron mace with one taped fist, the shockwave splashing the dark water outward in a ring, the attacker thrown off balance',
    'heroic low angle in the vast Underpits: Knuckle smashes both fists down and the whole pit floor splits into glowing cracks, opponents flung back, the crowd on the cave ledges roaring under a ring of fire',
  ],
  astryon: [
    'high angle down into a deep stone fighting pit lit by torches: Astryon descends feet-first into the pit like a falling star, cloak and silver hair streaming upward, his seven blades trailing behind him in a slow arc; cold teal shadows, one warm torch ring (no open night sky, no floating ruins)',
    'close side view on a narrow underground bridge: Astryon parries three attackers at once, his seven blades orbiting him as a spinning wall of steel, sparks frozen in the air',
    'heroic wide shot of a cavern ceiling cracked open to reveal a single star: Astryon rises into the shaft of starlight with all seven blades fanned behind him like wings, the fallen Guardian below him; glorious and unstoppable',
  ],
  vespera: [
    'over-the-shoulder view from behind Queen Vespera walking down a dark underground processional hall: her long shadow stretches ahead of her and from it new shades rise and bow, bound to her by thin threads of darkness; one cold lantern lights the far end (she is walking, NOT seated on a throne)',
    'low angle in a flooded crypt: Vespera raises one hand and a dozen shades pull themselves up out of the black water on her threads, all turning toward an unseen intruder',
    'heroic wide shot of a vast underhall turned into her court: Vespera stands on a staircase of shadow above a sea of kneeling shades, every thread of darkness in the cavern gathered into her raised fist; regal and terrifying',
  ],
  titanrho: [
    'side view down a long vault tunnel: Titan Rho braces its massive tread-legs in front of a round bronze vault gate, one armoured shoulder turned into a storm of incoming crossbow bolts and fire that shatter against its plating, sparks and smoke filling the dim teal tunnel, small defenders sheltering behind its legs (not facing the camera, no open sky)',
    'low rear three-quarter view in a collapsing deep vault: Titan Rho unfolds its cannon towers for the first time, reactor crown flaring amber, holding a fallen stone ceiling slab on its back while the defenders escape through the gate below it',
    'heroic wide shot of the deepest vault hall: Titan Rho fully unfolded into a walking fortress, every cannon tower firing at once up a vast stone stairwell, its reactor crown blazing, the whole underground army advancing in its shadow',
  ],
  ladyvolt: [
    'rear three-quarter view across a flooded black cavern: Lady Volt balances on a fallen pillar, rapier pointed far across the water as a single bolt of lightning leaps from its tip to a distant target, the bolt lighting the dripping stalactites and its reflection splitting across the dark water (not facing the camera, no castle, no open sky)',
    'side view mid-lunge on a narrow wet walkway: Lady Volt dashes between two armoured foes, her rapier trailing a thin line of lightning that arcs from one to the other, spray kicked up from the puddles',
    'heroic low angle in a vast flooded cathedral cavern: Lady Volt raises her rapier overhead and every pool in the cavern erupts with branching lightning toward her blade, her coat whipping in the storm, foes thrown back across the water',
  ],
  vessimer: [
    'side view in a flooded underground vault: Vessimer kneels on a half-sunken stone ledge, pouring a thin stream of glowing green tincture onto a corroded relic pulled from the dark water, the rust peeling away into fresh gold where the liquid touches it, his lantern hung on a hook above (not facing the camera, no laboratory table, no shelves of bottles)',
    'high angle down a spiral vault stair: Vessimer hurls a cracked violet flask down into the dark below, the burst lighting every relic on the walls as they transmute at once, his coat flaring as he leans over the rail',
    'heroic wide shot of a vast relic vault: Vessimer stands in a ring of floating relics that melt and reforge in mid-air into one shining artefact above his raised gloved hand, rivers of glowing tincture running across the floor runes',
  ],
  atlas: [
    'low rear three-quarter view in a deep vault corridor: ATLAS-Ω kneels and presses its whole huge stone back against a round vault door to seal it, its glowing core shining through the cracks, while shadowy raiders hammer at its shoulders (not walking toward the camera, no open sky, no city)',
    'side view in a collapsing treasure hall: ATLAS-Ω catches a falling stone pillar in one giant hand while the other fist slams the floor, a shockwave throwing raiders back from the treasure heaped behind it',
    'heroic low angle in the deepest vault: ATLAS-Ω stands fully upright and blazing, its chest opening like a vault door to reveal a blinding golden core, every vault seal in the hall locking shut around it in rings of light',
  ],
  nyx: [
    'top-down view onto a Guardian’s treasure hoard: Nyx tiptoes between the coins and gems toward a glowing relic, the sleeping Guardian’s huge claw in the corner of the frame; cool shadow, warm gold glint',
    'fast diagonal motion shot: Nyx mid-leap from treasure pile to pillar with the relic in hand, coins spraying into the air, the Guardian’s eye just opening behind her',
    'wide shot of a vault ceiling: Nyx upside-down on a chain high above, silhouetted against a glowing skylight, a bag of stolen relics over her shoulder, the guards far below searching the wrong way',
  ],
  emberling: [
    'extreme close-up: tiny Emberling hovering over an unrolled glowing spell scroll in a dark forge, drinking a ribbon of fire from the script, its face lit from below',
    'side view in a forge library: Emberling swirling through floating open spellbooks, each page catching fire and feeding it, sparks trailing like a comet tail, cool blue stacks behind',
    'low wide shot of a deep forge cavern: a towering pillar of flame rising from Emberling as dozens of floating spell scrolls burn around it in a ring, the whole cavern lit orange against a cold blue ceiling',
  ],
  bramble: [
    'a narrow ancient brick tunnel seen from a low side angle; small Bramble squeezes out through a crack in the wall, his roots prising the bricks apart, mortar dust drifting in a single beam of amber light from above; small, sneaky and determined',
    'three-quarter rear view: Bramble shoulder-charges through a crumbling stone wall into a hidden treasure vault beyond, bricks bursting outward toward the viewer; the vault glows warm amber inside while the tunnel behind him is cool blue',
    'extreme low angle from far below: towering Bramble wraps thick roots around a massive carved stone pillar in a vast underground hall and tears it apart; the ceiling cracks open and a shaft of daylight pours down through the dust; tiny soldiers scatter at his feet for scale',
  ],
  kira: [
    'over-the-shoulder view from just behind Kira lying prone on a rusted iron girder high above a flooded cavern, her compact energy pistol braced on her forearm, aiming at a tiny target far below; cool blue mist, one distant warm lantern',
    'low tilted (Dutch) angle: Kira slides along a wet stone walkway on one knee, both energised pistols firing across the frame at a target off the card, bright tracer lines crossing the dark and reflecting in the flood water; her coat’s arc coil glowing',
    'heroic low-angle hero shot: Kira large in frame on the lip of a high ledge, coat whipping in the wind, arm raised with her pistol, the ring of arc batteries blazing around her, a lightning-trail shot tearing across the cavern behind her and lighting the whole place up at once; glorious and unstoppable',
  ],
  grimm: [
    'a long lantern-lit corridor in deep perspective, Grimm small at the far end standing guard before a sealed iron vault door, seen as an intruder would see him; cold teal light, one warm lantern above the door',
    'close, low angle at Grimm’s side as he braces behind his shield in a narrow doorway, sparks and arrows glancing off it; the reforged plate and tattered banner lit by torchlight, the corridor beyond in cool shadow',
    'high angle looking down a grand stair into a vault: Grimm alone on the bottom step holding the line against a tide of shadowy invaders, spectral light pouring from his ribs and banner, the treasure door glowing amber behind him',
  ],
  pip: [
    'fish-eye view from inside a mine tunnel as Pip lights a fuse with a grin, his face lit orange by the spark, the tunnel stretching away into cool blue darkness behind him',
    'side-on action shot: Pip leaping away from a wall at the moment it blows apart, debris and dust filling the frame, warm blast light against a cold blue tunnel',
    'aerial view straight down into a huge cavern: Pip on a ledge at the edge of a massive blast crater she has just made, a crowd of tiny figures staring up, dust clouds rolling outward in rings, warm firelight in the crater',
  ],
};
/** Set 2 rarity PER CARD [★, ★★, ★★★] (owner rule 2026-10-11): rarity is how much a card does in play, not its tier.
 *  Set by the rarity rubric (prototype-v0.2/RARITY_RUBRIC.md, adopted 2026-10-12); every move from the 2026-10-11 table is
 *  listed in prototype-v0.2/AUDIT_CHANGES.md. Printed cards (001–033, 118, 251, 252) keep their rarity. */
type R = NonNullable<ChampionForm['rarity']>;
const CARD_RARITY: Record<string, [R, R, R]> = {
  bramble: ['common', 'common', 'mythic'],
  kira: ['common', 'uncommon', 'mythic'],
  grimm: ['common', 'common', 'uncommon'],
  pip: ['common', 'common', 'uncommon'],
  solara: ['common', 'uncommon', 'elite'],
  fen: ['common', 'common', 'elite'],
  torren: ['common', 'common', 'uncommon'],
  nyx: ['uncommon', 'elite', 'epic'],
  emberling: ['uncommon', 'elite', 'epic'],
  rowan: ['common', 'common', 'common'],
  hexie: ['uncommon', 'elite', 'mythic'],
  bolt: ['common', 'common', 'uncommon'],
  kael: ['common', 'uncommon', 'elite'],
  solenne: ['common', 'common', 'uncommon'],
  grizz: ['common', 'common', 'uncommon'],
  gearwick: ['common', 'uncommon', 'epic'],
  mirella: ['common', 'common', 'elite'],
  shade: ['common', 'uncommon', 'elite'],
  borin: ['common', 'common', 'uncommon'],
  seren: ['common', 'uncommon', 'elite'],
  thorn: ['common', 'uncommon', 'elite'],
  dax: ['common', 'elite', 'epic'],
  elara: ['common', 'uncommon', 'elite'],
  rask: ['common', 'uncommon', 'elite'],
  hex3: ['common', 'uncommon', 'epic'],
  valkara: ['common', 'uncommon', 'epic'],
  dreadmouth: ['common', 'uncommon', 'elite'],
  spark: ['common', 'uncommon', 'elite'],
  orion: ['common', 'uncommon', 'elite'],
  maeve: ['common', 'uncommon', 'elite'],
  ronin: ['common', 'uncommon', 'epic'],
  ignara: ['common', 'common', 'elite'],
  morrow: ['uncommon', 'elite', 'mythic'],
  blacktide: ['uncommon', 'elite', 'elite'],
  aurelia: ['uncommon', 'uncommon', 'elite'],
  knuckle: ['common', 'uncommon', 'elite'],
  zyrak: ['elite', 'epic', 'mythic'],
  astryon: ['common', 'elite', 'elite'],
  vespera: ['common', 'uncommon', 'elite'],
  titanrho: ['common', 'common', 'elite'],
  pyrax: ['uncommon', 'uncommon', 'elite'],
  elysian: ['uncommon', 'elite', 'epic'],
  varr: ['uncommon', 'uncommon', 'elite'],
  veilwalker: ['elite', 'elite', 'epic'],
  gaia: ['uncommon', 'uncommon', 'elite'],
  ladyvolt: ['common', 'uncommon', 'elite'],
  vessimer: ['common', 'uncommon', 'elite'],
  aurex: ['uncommon', 'elite', 'mythic'],
  noctara: ['uncommon', 'elite', 'mythic'],
  atlas: ['common', 'elite', 'mythic'],
  sol: ['uncommon', 'epic', 'mythic'],
  unwritten: ['elite', 'elite', 'mythic'],
  veyra: ['uncommon', 'elite', 'epic'],
  mother: ['uncommon', 'elite', 'mythic'],
  crownless: ['uncommon', 'epic', 'mythic'],
};
const ABILITY: Record<string, string> = {
  bramble: 'Rootbreak',
  kira: 'Railshot',
  grimm: 'Last Watch',
  pip: 'Tunnel Charge',
  solara: 'Lamplight',
  fen: 'Scent of Prey',
  torren: 'Vault Ward',
  nyx: 'Light Fingers',
  emberling: 'Ember Echo',
  rowan: 'Gatewatch Volley',
  hexie: 'Bone Reading',
  bolt: 'Scrapforge',
  kael: 'Delve',
  solenne: 'Lantern Path',
  grizz: 'Beastbreaker',
  gearwick: 'Relic Rig',
  mirella: 'Sunken Tide',
  shade: 'Masked Theft',
  borin: 'Deep Forge',
  seren: 'Starlit Path',
  thorn: 'Creeping Rot',
  dax: 'Rift Hunt',
  elara: 'Field Mending',
  rask: 'Pit Fighter',
  hex3: 'Core Surge',
  valkara: 'Foresight Verdict',
  dreadmouth: 'Guardian Feast',
  spark: 'Prototype',
  orion: 'Charted Shot',
  maeve: 'Sleight of Thorns',
  ronin: 'Arena Draw',
  ignara: 'Forgefire',
  morrow: 'Call of the Buried',
  blacktide: 'Plunder',
  aurelia: 'Banner of the Descent',
  knuckle: 'Pit King’s Right',
  zyrak: 'Shard Resonance',
  astryon: 'Starfall Duel',
  vespera: 'Underhall Court', // PROPOSED rename 2026-10-12 (was Set 1's "Court of Shadows")
  titanrho: 'Bastion Protocol',
  pyrax: 'Undermine',
  elysian: 'Prophecy',
  varr: 'Last Gate',
  veilwalker: 'Between the Veils',
  gaia: 'Deep Roots',
  ladyvolt: 'Chain Lightning',
  vessimer: 'Transmute',
  aurex: 'GUARDIAN’S BANE',
  noctara: 'ECLIPSE SIGHT',
  atlas: 'VAULT PROTOCOL',
  sol: 'SECOND DAWN',
  unwritten: 'BURIED LEGION',
  veyra: 'THE HUNT ETERNAL',
  mother: 'EVERGROWTH',
  crownless: 'UNBOUND',
};
const back = (canonId: string, name: string, epithet: string, tier: ChampionLine['tier'], origins: string[], classes: string[], scene: string, f1: F, f2: F, f3: F): ChampionLine => ({
  canonId, lineId: `${canonId}@2`, family: 'champion', set: 2, name, title: epithet, epithetProposed: true, abilityProposed: true, tier, origins, classes, scene, look: LOOK[canonId], scenes: SCENES[canonId], flavour: { 2: FLAVOUR[canonId]?.[0], 3: FLAVOUR[canonId]?.[1] },
  forms: [f1, f2, f3].map((f, i) => ({ star: (i + 1) as 1 | 2 | 3, ...f, rarity: CARD_RARITY[canonId][i], ...(f.text ? { ability: ABILITY[canonId] } : {}) })),
});
const f = (cost: number, might: number, guard: number, keywords: ChampionForm['keywords'], text: string, rest: Partial<ChampionForm> = {}): F =>
  ({ cost, might, guard, keywords, text, ...rest });

function monster(canonId: string, name: string, cost: number, might: number, guard: number, keywords: ChampionForm['keywords'], text: string, rest: Partial<ChampionForm>): ChampionLine {
  return { canonId, lineId: `monster-${canonId}`, family: 'monster', set: 2, name, title: 'Monster', tier: 1, origins: [], classes: [],
    forms: [{ star: 1, cost, might, guard, keywords, text, ...rest }] };
}
function guardian(canonId: string, name: string, ability: string, cost: number, might: number, guard: number, keywords: ChampionForm['keywords'], text: string, rest: Partial<ChampionForm>): ChampionLine {
  return { canonId, lineId: `guardian-${canonId}`, family: 'guardian', set: 2, name, title: 'Guardian', tier: 5, origins: [], classes: [],
    forms: [{ star: 1, cost, might, guard, keywords: ['Guardian', ...keywords], ability, text, rarity: 'epic', ...rest }] };
}
function tok(canonId: string, name: string, might: number, guard: number, keywords: ChampionForm['keywords'] = []): ChampionLine {
  return { canonId, lineId: `token-${canonId}`, family: 'token', set: 2, name, title: 'Token', tier: 1, origins: [], classes: [],
    forms: [{ star: 1, cost: 0, might, guard, keywords, text: '' }] };
}

export const SET2_LINES: ChampionLine[] = [
  // Season 1 mid-season remix (owner-approved 2026-10-11, PROPOSED titles/rules): all 55 champions, same Origin,
  // a new Season 1.5 class, new rules on the Set 1 stat budget, and a rarity chosen by role rather than tier.
  // ───────────────────────────── TIER I ─────────────────────────────
  back('bramble', 'Bramble', 'The Rootbreaker', 1, ['verdant'], ['sapper'], 'Roots splitting the flagstones of a buried tunnel, rubble raining around him.',
    f(2, 1, 3, [], 'Arrival: Break one of your rival’s face-down Schemes.', { arrive: [breakScheme] }),
    f(0, 4, 5, [], 'Attack: Break a rival champion’s Relic.', { attack: [breakRelic] }),
    f(1, 7, 9, [], 'Ascend: Scorch 2 each rival champion. Break every rival champion’s Relic and every face-down Scheme your rival has. Block: Scorch 2 the attacker.', { ascend: [scAll(2), { op: 'breakAllRelics' }, { op: 'breakAllSchemes' }], block: [scAtt(2)] })),
  back('kira', 'Kira Volt', 'The Long Shot', 1, ['voltborn'], ['sharpshooter'], 'Perched on a girder high above a flooded cavern, rifle charged and sighting far below.',
    f(1, 2, 1, [], 'Attack: Scorch 1 a rival champion.', { attack: [sc(1)] }),
    f(0, 4, 3, [], 'Attack: Scorch 2 a rival champion.', { attack: [sc(2)] }),
    f(1, 7, 6, ['Charge', 'Reach'], 'Attack: Defeat a rival champion with Guard 4 or less.', { attack: [{ op: 'defeatOne', n: 4 }] })),
  back('grimm', 'Grimm', 'The Last Sentry', 1, ['hollow'], ['sentinel'], 'Still guarding a forgotten armoury deep under the Arena, centuries after the war.',
    f(2, 1, 4, ['Bulwark'], ''),
    f(0, 4, 7, ['Bulwark'], ward1Text, { statics: { crownWard: 1 } }),
    f(1, 7, 10, ['Bulwark'], `${ward1Text} When Grimm is defeated, Summon two Risen Soldiers.`, { statics: { crownWard: 1 }, defeated: [summon('skeleton', 2)] })),
  back('pip', 'Pip', 'Tunnel Blaster', 1, ['gearbound'], ['sapper'], 'Lighting a fuse in a narrow mine tunnel, grinning, barrels stacked behind him.',
    f(1, 2, 1, [], 'Arrival: Break a rival champion’s Relic.', { arrive: [breakRelic] }),
    f(0, 5, 4, [], 'Attack: Scorch 1 each rival champion.', { attack: [scAll(1)] }),
    f(1, 8, 7, [], 'Ascend: Scorch 2 each rival champion. Break a rival champion’s Relic.', { ascend: [scAll(2), breakRelic] })),
  back('solara', 'Solara', 'Lamp of the Lost', 1, ['dawnforged'], ['restorer'], 'Holding a dawn-lamp over wounded explorers in a dark side-passage.',
    f(2, 1, 3, [], 'Arrival: Shield another champion you control.', { arrive: [shOther] }),
    f(1, 3, 6, [], 'Ascend: Mend 1.', { ascend: [mend] }),
    f(1, 6, 9, [], 'Ascend: Mend 1. At the start of your turn, Shield a champion you control.', { ascend: [mend], rise: [shOwn] })),
  back('fen', 'Fen', 'Pack Hunter', 1, ['wildkin'], ['hunter'], 'Running the dark tunnels under the Arena with the scent of a monster ahead.',
    f(1, 2, 1, ['Ambush'], hunt(1), { statics: { huntMight: 1 } }),
    f(0, 5, 4, ['Ambush'], hunt(2), { statics: { huntMight: 2 } }),
    f(1, 9, 7, ['Ambush'], `${hunt(2)} ${loot('Fen')}`, { statics: { huntMight: 2 }, defeats: [draw(1)] })),
  back('torren', 'Torren', 'Keeper of the Deep Vault', 1, ['titanborn'], ['sentinel'], 'Standing before a sealed vault door in the drowned halls of the Deep.',
    f(2, 1, 5, [], ward1Text, { statics: { crownWard: 1 } }),
    f(0, 3, 8, ['Bulwark'], ward1Text, { statics: { crownWard: 1 } }),
    f(1, 6, 11, ['Bulwark'], ward2Text, { statics: { crownWard: 2 } })),
  back('nyx', 'Nyx', 'Vault Thief', 1, ['umbral'], ['rogue'], 'Slipping between treasure piles in a Guardian’s lair, a stolen relic in hand.',
    f(1, 2, 1, ['Ambush'], steal('Nyx'), { attack: [stealOr(1)] }),
    f(0, 5, 3, ['Ambush', 'Flight'], steal('Nyx'), { attack: [stealOr(1)] }),
    f(1, 9, 5, ['Ambush', 'Flight'], `${steal('Nyx')} ${rob('Nyx')}`, { attack: [stealOr(1)], defeats: [discard(1)] })),
  back('emberling', 'Emberling', 'Ember Conduit', 1, ['elemental'], ['channeler'], 'A living spark drifting through a forge-vent, sparks spiralling up into it.',
    f(1, 1, 2, [], channel('Scorch 1 a rival champion'), { cast: [sc(1)] }),
    f(0, 4, 4, [], channel('Scorch 1 a rival champion'), { cast: [sc(1)] }),
    f(1, 7, 7, [], channel('Scorch 1 each rival champion'), { cast: [scAll(1)] })),
  back('rowan', 'Rowan', 'Archer of the Deep Gate', 1, ['kingdom'], ['sharpshooter'], 'Holding the great gate to the under-halls, bow drawn into the dark.',
    f(1, 2, 2, ['Reach'], 'Attack: Scorch 1 a rival champion.', { attack: [sc(1)] }),
    f(0, 4, 5, ['Reach'], 'Attack: Scorch 1 a rival champion.', { attack: [sc(1)] }),
    f(1, 8, 8, ['Reach'], 'Attack: Scorch 2 a rival champion.', { attack: [sc(2)] })),
  back('hexie', 'Hexie', 'Reader of Bones', 1, ['hexbound'], ['seer'], 'Casting knucklebones across a cave floor; the bones glow with the rival’s next move.',
    f(1, 1, 2, [], seer(1), { statics: { schemeDiscount: 1 } }),
    f(0, 3, 5, [], `${seer(1)} Ascend: Draw a card.`, { statics: { schemeDiscount: 1 }, ascend: [draw(1)] }),
    f(1, 6, 8, [], 'Your Schemes cost nothing to spring, and you can spring them on the turn you set them. Ascend: Draw 2 cards.', { statics: { schemeDiscount: 9, schemeHaste: true }, ascend: [draw(2)] })),
  back('bolt', 'Bolt', 'Scrap Smith', 1, ['gearbound'], ['artificer'], 'Welding salvaged relic plates onto its own chassis in a scrapyard cave.',
    f(2, 1, 3, [], artif(1), { statics: { relicDiscount: 1 } }),
    f(0, 3, 6, ['Bulwark'], `${artif(1)} +2 Guard while Bolt holds a Relic.`, { statics: { relicDiscount: 1, guardIfRelic: 2 } }),
    f(1, 6, 9, ['Bulwark'], 'Ascend: Attach a Relic costing 3 or less from your hand to Bolt for free. +2 Guard while Bolt holds a Relic.', { ascend: [equipFree(3)], statics: { guardIfRelic: 2 } })),
  back('kael', 'Kael', 'Relic Seeker', 1, ['kingdom'], ['delver'], 'Torchlit vaults beneath the Arena; he reaches for a relic blade on a broken plinth.',
    f(2, 3, 2, [], 'Arrival: Draw a card, then put a card from your hand on the bottom of your deck.', { arrive: [draw(1), tuck] }),
    f(0, 5, 4, [], 'Ascend: Return a Relic from your Fallen pile to your hand.', { ascend: [relicBack] }),
    f(1, 8, 7, [], 'Ascend: Draw 2 cards.', { ascend: [draw(2)] })),

  // ───────────────────────────── TIER II ─────────────────────────────
  back('solenne', 'Solenne Ash', 'Lantern of the Underways', 2, ['dawnforged'], ['delver'], 'Her blade lights the tunnels as shadows flee from the dawnfire.',
    f(3, 3, 3, ['Charge'], 'Arrival: Draw a card.', { arrive: [draw(1)] }),
    f(1, 6, 5, ['Charge'], 'Ascend: Draw a card.', { ascend: [draw(1)] }),
    f(2, 9, 8, ['Charge'], 'Ascend: Draw a card. Shield each champion you control.', { ascend: [draw(1), shAll] })),
  back('grizz', 'Grizz', 'Breaker of Beasts', 2, ['wildkin'], ['hunter'], 'Wrestling a monster twice his size in a cavern beneath the Arena.',
    f(3, 4, 3, [], hunt(2), { statics: { huntMight: 2 } }),
    f(1, 7, 5, [], `${hunt(2)} When Grizz defeats a champion on your turn, Shield Grizz.`, { statics: { huntMight: 2 }, defeats: [shSelf] }),
    f(2, 10, 8, [], `${hunt(3)} When Grizz defeats a champion on your turn, Shield Grizz.`, { statics: { huntMight: 3 }, defeats: [shSelf] })),
  back('gearwick', 'Gearwick-9', 'Relic Engineer', 2, ['gearbound'], ['artificer'], 'Bolting a recovered relic into its siege frame in an underground workshop.',
    f(2, 2, 3, ['Reach'], 'Arrival: Attach a Relic costing 2 or less from your hand to Gearwick-9 for free.', { arrive: [equipFree(2)] }),
    f(1, 5, 5, ['Reach'], `${artif(1)} +2 Might while Gearwick-9 holds a Relic.`, { statics: { relicDiscount: 1, mightIfRelic: 2 } }),
    f(2, 8, 8, ['Reach'], `${artif(1)} Ascend: Return a Relic from your Fallen pile to your hand. Attach a Relic costing 3 or less from your hand to Gearwick-9 for free.`,
      { statics: { relicDiscount: 1 }, ascend: [relicBack, equipFree(3)] })),
  back('mirella', 'Mirella', 'Tide of the Sunken Halls', 2, ['elemental'], ['restorer'], 'Rising from an underground lake, healing water spilling up the stone stairs.',
    f(3, 2, 4, [], 'Arrival: Shield another champion you control.', { arrive: [shOther] }),
    f(1, 4, 7, [], 'Ascend: Shield each champion you control.', { ascend: [shAll] }),
    f(2, 7, 10, [], 'Ascend: Mend 1. Block: Shield another champion you control.', { ascend: [mend], block: [shOther] })),
  back('shade', 'Shade', 'Mask of the Depths', 2, ['umbral'], ['rogue'], 'A faceless mask hanging in the dark of the lowest halls, blades already drawn.',
    f(2, 3, 2, ['Ambush'], rob('Shade'), { defeats: [discard(1)] }),
    f(1, 6, 4, ['Ambush'], rob('Shade'), { defeats: [discard(1)] }),
    f(2, 9, 6, ['Ambush', 'Flight'], `${steal('Shade')} ${rob('Shade')}`, { attack: [stealOr(1)], defeats: [discard(1)] })),
  back('borin', 'Borin Ironbelly', 'Forgemaster of the Deep', 2, ['titanborn'], ['artificer'], 'At a roaring forge beneath the Arena, reforging a Guardian’s broken relic.',
    f(3, 3, 4, [], 'Arrival: Return a Relic from your Fallen pile to your hand.', { arrive: [relicBack] }),
    f(1, 6, 7, [], '+2 Might while Borin Ironbelly holds a Relic.', { statics: { mightIfRelic: 2 } }),
    f(2, 9, 10, ['Bulwark'], '+2 Might and +2 Guard while Borin Ironbelly holds a Relic.', { statics: { mightIfRelic: 2, guardIfRelic: 2 } })),
  back('seren', 'Seren', 'Starlight in the Dark', 2, ['astral'], ['delver'], 'Her Starlings light a vast underground cavern like a night sky.',
    f(2, 1, 3, ['Flight'], 'Arrival: Draw a card.', { arrive: [draw(1)] }),
    f(1, 4, 6, ['Flight'], 'Ascend: Draw 2 cards, then put a card from your hand on the bottom of your deck.', { ascend: [draw(2), tuck] }),
    f(2, 7, 9, ['Flight'], 'Ascend: Draw a card. At the start of your turn, draw a card, then put a card from your hand on the bottom of your deck.', { ascend: [draw(1)], rise: [draw(1), tuck] })),
  back('thorn', 'Thorn', 'Rot Beneath the Stone', 2, ['verdant'], ['sapper'], 'Blight creeping through cracks in a vault wall, the stone crumbling to green dust.',
    f(2, 2, 3, [], 'Arrival: Break one of your rival’s face-down Schemes.', { arrive: [breakScheme] }),
    f(1, 5, 5, [], `Ascend: Break a rival champion’s Relic. ${orElse(1)} Block: Scorch 2 the attacker.`, { ascend: [breakRelicOr(1)], block: [scAtt(2)] }),
    f(2, 8, 8, [], `Ascend: ${randomScheme} Break a rival champion’s Relic. Scorch 2 each rival champion.`, { ascend: [breakScheme, breakRelic, scAll(2)] })),
  back('dax', 'Dax Meridian', 'Guardian Hunter', 2, ['riftborn'], ['hunter'], 'Taking aim at a towering Guardian through a rift in the cavern wall.',
    f(2, 3, 2, ['Reach'], `${hunt(1)} Attack: Scorch 1 the defender.`, { statics: { huntMight: 1 }, attack: [scDef(1)] }),
    f(1, 6, 4, ['Reach', 'Flight'], `${hunt(2)} ${loot('Dax Meridian')}`, { statics: { huntMight: 2 }, defeats: [draw(1)] }),
    f(2, 9, 7, ['Flight'], `${hunt(3)} Attack: Scorch 2 the defender. ${loot('Dax Meridian')}`, { statics: { huntMight: 3 }, attack: [scDef(2)], defeats: [draw(1)] })),
  back('elara', 'Elara', 'Healer of the Fallen Deep', 2, ['kingdom'], ['restorer'], 'Tending the wounded of the descent by lantern light in a collapsed hall.',
    f(3, 1, 4, [], 'Arrival: Shield another champion you control.', { arrive: [shOther] }),
    f(1, 3, 7, [], 'Ascend: Mend 1.', { ascend: [mend] }),
    f(2, 6, 10, [], 'Ascend: Mend 1. Return a ★ champion from your Fallen pile to your hand.', { ascend: [mend, champBack] })),
  back('rask', 'Rask', 'Champion of the Underpits', 2, ['wildkin'], ['gladiator'], 'Roaring in the blood-sand of the Underpits, a monster’s skull at his feet.',
    f(2, 3, 2, ['Charge'], duel(1), { statics: { duelMight: 1 } }),
    f(1, 6, 5, ['Charge'], `${duel(2)} When Rask defeats a champion on your turn, Shield Rask.`, { statics: { duelMight: 2 }, defeats: [shSelf] }),
    f(2, 10, 8, ['Charge', 'Ambush'], `${duel(2)} ${again('Rask')}`, { statics: { duelMight: 2 }, defeats: [ready] })),
  back('hex3', 'HEX-3', 'Core Conduit', 2, ['gearbound'], ['channeler'], 'A humming core hanging in a cable-strung vault, arcs of power feeding its shell.',
    f(3, 2, 3, [], channel('Shield HEX-3'), { cast: [shSelf] }),
    f(1, 5, 6, [], channel('Shield HEX-3'), { cast: [shSelf] }),
    f(2, 8, 9, [], channel('Shield HEX-3 and gain 1 Command'), { cast: [shSelf, cmd(1)] })),

  // ───────────────────────────── TIER III ─────────────────────────────
  back('valkara', 'Valkara', 'Judge of the Depths', 3, ['astral'], ['seer'], 'Diving from a cavern’s darkness, wings blazing, to pass judgment on a monster.',
    f(3, 3, 3, ['Flight'], seer(1), { statics: { schemeDiscount: 1 } }),
    f(1, 7, 6, ['Flight'], `${seer(1)} Ascend: Defeat each rival champion with Guard 1 or less.`, { statics: { schemeDiscount: 1 }, ascend: [sweep(1)] }),
    f(2, 10, 9, ['Flight'], `${seer(1)} Ascend: Defeat each rival champion with Guard 2 or less.`, { statics: { schemeDiscount: 1 }, ascend: [sweep(2)] })),
  back('dreadmouth', 'Dreadmouth', 'Devourer of Guardians', 3, ['hollow'], ['hunter'], 'Rising from black water with a Guardian’s armour still in its teeth.',
    f(4, 5, 4, [], hunt(2), { statics: { huntMight: 2 } }),
    f(1, 8, 6, ['Ambush'], hunt(2), { statics: { huntMight: 2 } }),
    f(2, 11, 9, ['Ambush'], `${hunt(3)} ${loot('Dreadmouth')}`, { statics: { huntMight: 3 }, defeats: [draw(1)] })),
  back('spark', 'Professor Spark', 'Relic Inventor', 3, ['gearbound'], ['artificer'], 'Wiring a crackling relic into a new turret in a lamp-lit underground lab.',
    f(3, 2, 3, [], 'Arrival: Attach a Relic costing 2 or less from your hand to Professor Spark for free.', { arrive: [equipFree(2)] }),
    f(1, 5, 6, [], `${artif(1)} Ascend: Summon an Arc Turret.`, { statics: { relicDiscount: 1 }, ascend: [summon('turret')] }),
    f(2, 8, 9, ['Bulwark'], `${artif(1)} Ascend: Summon two Arc Turrets.`, { statics: { relicDiscount: 1 }, ascend: [summon('turret', 2)] })),
  back('orion', 'Orion', 'Star-Charter of the Deep', 3, ['astral'], ['sharpshooter'], 'Charting constellations painted on a cavern ceiling, bow resting on his shoulder.',
    f(3, 4, 2, ['Reach'], 'Attack: Scorch 1 a rival champion.', { attack: [sc(1)] }),
    f(1, 7, 5, ['Reach'], 'Attack: Scorch 1 a rival champion. Scorch 2 each rival champion with Flight.', { attack: [sc(1), { op: 'scorchAll', n: 2, trait: 'flight' }] }),
    f(2, 10, 8, ['Reach', 'Flight'], 'Ascend: Scorch 2 each rival champion. Attack: Scorch 1 a rival champion. Scorch 3 each rival champion with Flight.', { ascend: [scAll(2)], attack: [sc(1), { op: 'scorchAll', n: 3, trait: 'flight' }] })),
  back('maeve', 'Maeve', 'Broker of Relics', 3, ['verdant', 'hexbound'], ['rogue'], 'Weighing two glowing relics in the roots of an underground grove.',
    f(3, 2, 4, [], `Arrival: ${stealOrText('Maeve', 1)}`, { arrive: [stealOr(1)] }),
    f(1, 5, 7, [], 'Ascend: Your rival discards a card at random. Draw a card.', { ascend: [discard(1), draw(1)] }),
    f(2, 8, 10, [], `Ascend: ${stealOrText('Maeve', 1)} Your rival discards a card at random.`, { ascend: [stealOr(1), discard(1)] })),
  back('ronin', 'Ronin Zero', 'Blade Beneath the Arena', 3, ['voltborn'], ['gladiator'], 'A lone frame crackling with current in a flooded tunnel, a relic sword drawn.',
    f(3, 4, 2, ['Charge'], duel(1), { statics: { duelMight: 1 } }),
    f(1, 7, 6, ['Charge'], `${duel(2)} ${again('Ronin Zero')}`, { statics: { duelMight: 2 }, defeats: [ready] }),
    f(2, 10, 9, ['Charge', 'Ambush'], `${duel(2)} Attack: Scorch 1 the defender. ${again('Ronin Zero')}`, { statics: { duelMight: 2 }, attack: [scDef(1)], defeats: [ready] })),
  back('ignara', 'Ignara', 'Heart of the Forge', 3, ['elemental'], ['channeler'], 'Burning at the heart of the deep forges, molten relics floating around her.',
    f(3, 3, 4, [], channel('Scorch 1 a rival champion'), { cast: [sc(1)] }),
    f(1, 6, 7, [], channel('Scorch 1 a rival champion'), { cast: [sc(1)] }),
    f(2, 9, 10, ['Bulwark'], channel('Scorch 2 a rival champion'), { cast: [sc(2)] })),
  back('morrow', 'Morrow', 'Lord of the Buried Halls', 3, ['hollow'], ['binder'], 'Raising the soldiers buried beneath the Arena from their stone tombs.',
    f(3, 2, 3, [], `Arrival: Summon a Risen Soldier. ${tokens(1, 0)}`, { arrive: [summon('skeleton')], statics: { tokenAura: { might: 1 } } }),
    f(1, 5, 6, [], `${tokens(1, 1)} Ascend: Summon two Risen Soldiers.`, { statics: { tokenAura: { might: 1, guard: 1 } }, ascend: [summon('skeleton', 2)] }),
    f(2, 8, 9, [], `${tokens(2, 2)} Ascend: Deploy up to two ★ champions costing 4 or less from your Fallen pile for free.`, { statics: { tokenAura: { might: 2, guard: 2 } }, ascend: [fromFallen(4), fromFallen(4)] })),
  back('blacktide', 'Captain Blacktide', 'Plunderer of the Vault', 3, ['riftborn'], ['rogue'], 'His ship wedged in a rift above a Guardian’s treasure hoard.',
    f(4, 4, 3, ['Reach'], steal('Captain Blacktide'), { attack: [stealOr(1)] }),
    f(1, 7, 6, ['Reach'], `${steal('Captain Blacktide')} ${loot('Captain Blacktide')}`, { attack: [stealOr(1)], defeats: [draw(1)] }),
    f(2, 10, 9, ['Reach'], `Ascend: ${stealOrText('Captain Blacktide', 1)} Attack: Scorch 2 each rival champion.`, { ascend: [stealOr(1)], attack: [scAll(2)] })),
  back('aurelia', 'Aurelia', 'Leader of the Descent', 3, ['kingdom'], ['delver'], 'Leading the Kingdom’s banners down the great stair beneath the Arena.',
    f(4, 3, 5, [], 'Arrival: Draw a card. Your other Kingdom champions have +1 Might.', { arrive: [draw(1)], statics: { originAura: { origin: 'kingdom', might: 1 } } }),
    f(1, 6, 7, [], 'Ascend: Draw 2 cards.', { ascend: [draw(2)] }),
    f(2, 9, 10, [], 'Ascend: Draw 2 cards. Ready another champion you control.', { ascend: [draw(2), readyOther] })),
  back('knuckle', 'Knuckle', 'King Under the Pit', 3, ['titanborn'], ['gladiator'], 'Seated on a throne of Guardian bones in the deepest fighting pit.',
    f(4, 5, 5, [], duel(2), { statics: { duelMight: 2 } }),
    f(1, 8, 7, [], duel(2), { statics: { duelMight: 2 } }),
    f(2, 11, 10, ['Bulwark'], `${duel(3)} Block: The attacker gets −3 Might this turn.`, { statics: { duelMight: 3 }, block: [weakenAtt(3)] })),
  back('zyrak', 'Zyrak', 'Shard of the Broken Vault', 3, ['riftborn'], ['channeler'], 'Humming among shattered vault crystals, each one a piece of the Lattice.',
    f(4, 2, 3, ['Flight'], channel('draw a card'), { cast: [draw(1)] }),
    f(1, 5, 6, ['Flight'], channel('draw a card'), { cast: [draw(1)] }),
    f(2, 8, 9, ['Flight'], `${channel('draw a card and Scorch 1 each rival champion')} Ascend: Scorch 2 each rival champion.`, { cast: [draw(1), scAll(1)], ascend: [scAll(2)] })),

  // ───────────────────────────── TIER IV ─────────────────────────────
  back('astryon', 'Astryon', 'Blade That Fell Beneath', 4, ['astral'], ['gladiator'], 'Seven blades orbiting him in the dark like fallen stars.',
    f(5, 6, 4, ['Flight'], duel(2), { statics: { duelMight: 2 } }),
    f(1, 9, 6, ['Flight'], `${duel(2)} ${loot('Astryon')}`, { statics: { duelMight: 2 }, defeats: [draw(1)] }),
    f(2, 12, 9, ['Flight'], `${duel(3)} ${again('Astryon')}`, { statics: { duelMight: 3 }, defeats: [ready] })),
  back('vespera', 'Queen Vespera', 'Empress of the Underhalls', 4, ['umbral'], ['binder'], 'Holding court in a vast underground throne room of shadow.',
    f(4, 3, 4, [], `Arrival: Summon a Court Shade. ${tokens(1, 0)}`, { arrive: [summon('shadow')], statics: { tokenAura: { might: 1 } } }),
    f(1, 6, 7, [], `${tokens(1, 1)} Ascend: Summon two Court Shades.`, { statics: { tokenAura: { might: 1, guard: 1 } }, ascend: [summon('shadow', 2)] }),
    f(2, 9, 10, [], `${tokens(2, 1)} Ascend: Summon two Court Shades.`, { statics: { tokenAura: { might: 2, guard: 1 } }, ascend: [summon('shadow', 2)] })),
  back('titanrho', 'Titan Rho', 'Vault Bastion', 4, ['gearbound'], ['sentinel'], 'Its fortress body sealing a vault gate deep beneath the Arena.',
    f(5, 3, 8, ['Bulwark'], ward1Text, { statics: { crownWard: 1 } }),
    f(1, 6, 10, ['Bulwark', 'Reach'], ward1Text, { statics: { crownWard: 1 } }),
    f(2, 9, 13, ['Bulwark', 'Reach'], `${ward2Text} Block: Shield Titan Rho.`, { statics: { crownWard: 2 }, block: [shSelf] })),
  back('pyrax', 'Pyrax', 'Wyrm of the Deep Forge', 4, ['elemental'], ['sapper'], 'Burrowing through a molten forge-cavern, the walls collapsing in her wake.',
    f(4, 5, 3, [], `Arrival: Break a rival champion’s Relic. ${orElse(2)}`, { arrive: [breakRelicOr(2)] }),
    f(1, 8, 7, [], `Attack: Scorch 1 each rival champion. ${randomScheme}`, { attack: [scAll(1), breakScheme] }),
    f(2, 11, 10, [], `Ascend: Scorch 2 each rival champion. Break a rival champion’s Relic. ${randomScheme}`, { ascend: [scAll(2), breakRelic, breakScheme] })),
  back('elysian', 'Elysian', 'Light of the Lost Halls', 4, ['astral'], ['seer'], 'Descending into the forgotten halls, foreseeing every trap before it springs.',
    f(5, 3, 6, ['Flight'], `${seer(1)} Arrival: Draw a card.`, { statics: { schemeDiscount: 1 }, arrive: [draw(1)] }),
    f(1, 6, 9, ['Flight'], `${seer(1)} Ascend: Shield each champion you control.`, { statics: { schemeDiscount: 1 }, ascend: [shAll] }),
    f(2, 9, 12, ['Flight'], `${seer(2)} Ascend: Shield each champion you control.`, { statics: { schemeDiscount: 2 }, ascend: [shAll] })),
  back('varr', 'General Varr', 'Holder of the Gate', 4, ['kingdom'], ['sentinel'], 'Holding the last gate between the Arena and what lies beneath.',
    f(5, 4, 6, ['Bulwark'], `${ward1Text} Your other Kingdom champions have +1 Guard.`, { statics: { crownWard: 1, originAura: { origin: 'kingdom', guard: 1 } } }),
    f(1, 7, 9, ['Bulwark'], `${ward1Text} Block: The attacker gets −2 Might this turn.`, { statics: { crownWard: 1 }, block: [weakenAtt(2)] }),
    f(2, 10, 12, ['Bulwark'], `${ward2Text} Ascend: Shield each champion you control.`, { statics: { crownWard: 2 }, ascend: [shAll] })),
  back('veilwalker', 'Veilwalker', 'The Rift Below', 4, ['riftborn'], ['rogue'], 'Stepping out of a tear in the cavern air behind a Guardian.',
    f(4, 5, 3, ['Flight', 'Ambush'], 'Attack: Your rival discards a card at random.', { attack: [discard(1)] }),
    f(1, 9, 5, ['Flight', 'Ambush'], 'Attack: Your rival discards a card at random.', { attack: [discard(1)] }),
    f(2, 12, 8, ['Flight', 'Ambush'], `Attack: Your rival discards a card at random. ${stealOrText('Veilwalker', 2)}`, { attack: [discard(1), stealOr(2)] })),
  back('gaia', 'Gaia Prime', 'Root of the Arena', 4, ['verdant'], ['restorer'], 'Her roots wrapped around the Arena’s foundations, mending the cracked stone.',
    f(5, 3, 7, ['Bulwark'], 'Arrival: Mend 1.', { arrive: [mend] }),
    f(1, 6, 10, ['Bulwark'], 'Ascend: Shield each champion you control.', { ascend: [shAll] }),
    f(2, 9, 13, ['Bulwark'], 'Ascend: Mend 1. Summon two Wild Saplings.', { ascend: [mend, summon('sapling', 2)] })),
  back('ladyvolt', 'Lady Volt', 'Storm in the Deep', 4, ['voltborn'], ['sharpshooter'], 'Lightning arcing off flooded cavern walls as she strikes from across the dark.',
    f(4, 5, 3, ['Charge'], 'Attack: Scorch 1 a rival champion, then Scorch 1 a rival champion.', { attack: [sc(1), sc(1)] }),
    f(1, 8, 6, ['Charge'], 'Attack: Scorch 2 a rival champion, then Scorch 1 a rival champion.', { attack: [sc(2), sc(1)] }),
    f(2, 11, 9, ['Charge'], 'Attack: Scorch 3 a rival champion, then Scorch 2 a rival champion, then Scorch 1 a rival champion.', { attack: [sc(3), sc(2), sc(1)] })),
  back('vessimer', 'Vessimer', 'Alchemist of Relics', 4, ['hexbound'], ['artificer'], 'Dissolving a relic into a bubbling tincture in a hidden laboratory.',
    f(4, 3, 4, [], `${artif(1)} Arrival: Return a Relic from your Fallen pile to your hand.`, { statics: { relicDiscount: 1 }, arrive: [relicBack] }),
    f(1, 6, 7, [], `${artif(1)} Ascend: Attach a Relic costing 3 or less from your hand to Vessimer for free.`, { statics: { relicDiscount: 1 }, ascend: [equipFree(3)] }),
    f(2, 9, 10, [], `${artif(2)} Ascend: Return a Relic from your Fallen pile to your hand. Draw a card.`, { statics: { relicDiscount: 2 }, ascend: [relicBack, draw(1)] })),

  // ───────────────────────────── TIER V (Ascendants) ─────────────────────────────
  back('aurex', 'Aurex', 'Bane of the Guardians', 5, ['wyrmblood'], ['ascendant', 'hunter'], 'The last dragon in the Guardians’ lair, a fallen Guardian beneath his claws.',
    f(6, 7, 7, ['Ascendant'], `Arrival: Scorch 3 each rival Monster, Guardian and ★★/★★★ champion. ${hunt(2)}`, { arrive: [{ op: 'scorchAll', n: 3, trait: 'prey' }], statics: { huntMight: 2 } }),
    f(2, 9, 9, ['Ascendant', 'Flight'], `${hunt(3)} When Aurex defeats a champion on your turn, Scorch 2 each rival champion.`, { statics: { huntMight: 3 }, defeats: [scAll(2)] }),
    f(3, 13, 12, ['Ascendant', 'Flight'], `${hunt(3)} Ascend: Scorch 2 each rival champion, then defeat each rival Monster, Guardian and ★★/★★★ champion with Guard 6 or less.`, { statics: { huntMight: 3 }, ascend: [scAll(2), { op: 'defeatGuardAtMost', n: 6, trait: 'prey' }] })),
  back('noctara', 'Noctara', 'Shadow Beneath the Crown', 5, ['umbral'], ['ascendant', 'seer'], 'A black hole opening in the cavern ceiling directly beneath the Crown.',
    f(6, 6, 7, ['Ascendant'], `${seer(1)} Arrival: ${randomScheme} ${orElse(2)}`, { statics: { schemeDiscount: 1 }, arrive: [breakSchemeOr(2)] }),
    f(2, 8, 10, ['Ascendant', 'Flight'], `${seer(1)} Ascend: Defeat each rival champion with Guard 2 or less.`, { statics: { schemeDiscount: 1 }, ascend: [sweep(2)] }),
    f(3, 12, 13, ['Ascendant', 'Flight'], 'Your Schemes cost nothing to spring. Ascend: Defeat each rival champion with Guard 4 or less. Break every face-down Scheme your rival has.', { statics: { schemeDiscount: 9 }, ascend: [sweep(4), { op: 'breakAllSchemes' }] })),
  back('atlas', 'ATLAS-Ω', 'The Vault Engine', 5, ['gearbound'], ['ascendant', 'sentinel'], 'Woken in a sealed vault, its frame locking across the vault door.',
    f(6, 4, 10, ['Ascendant', 'Bulwark'], ward1Text, { statics: { crownWard: 1 } }),
    f(2, 7, 13, ['Ascendant', 'Bulwark', 'Reach'], `${ward2Text} Your other Gearbound champions have +1 Guard.`, { statics: { crownWard: 2, originAura: { origin: 'gearbound', guard: 1 } } }),
    f(3, 11, 15, ['Ascendant', 'Bulwark', 'Reach'], `${ward2Text} Attack: Scorch 3 each rival champion.`, { statics: { crownWard: 2 }, attack: [scAll(3)] })),
  back('sol', 'Sol', 'Dawn Beneath the World', 5, ['dawnforged'], ['ascendant', 'restorer'], 'The first light rising inside the deepest cavern, turning the dark to gold.',
    f(6, 5, 7, ['Ascendant'], 'Arrival: Mend 1.', { arrive: [mend] }),
    f(2, 8, 10, ['Ascendant', 'Flight'], 'Ascend: Mend 1. Shield each champion you control.', { ascend: [mend, shAll] }),
    f(3, 12, 13, ['Ascendant', 'Flight'], 'Ascend: Mend 1, then Mend 1. Shield each champion you control. Your champions get +3 Might this turn.', { ascend: [mend, mend, shAll, { op: 'buffAll', might: 3 }] })),
  back('unwritten', 'The Unwritten King', 'Lord of the Buried Crown', 5, ['hollow'], ['ascendant', 'binder'], 'Enthroned in a buried throne room, an erased crown upon his head.',
    f(6, 5, 7, ['Ascendant'], `Arrival: Summon a Fallen Warrior. ${tokens(1, 0)} At the start of your turn, Summon a Fallen Warrior.`, { arrive: [summon('fallen')], rise: [summon('fallen')], statics: { tokenAura: { might: 1 } } }),
    f(2, 8, 10, ['Ascendant'], `${tokens(1, 1)} Ascend: Return up to two ★ champions from your Fallen pile to your hand.`, { statics: { tokenAura: { might: 1, guard: 1 } }, ascend: [champBackOpt, champBackOpt] }),
    f(3, 12, 13, ['Ascendant'], `${tokens(2, 2)} Ascend: Summon Fallen Warriors until your Champion Zones are full.`,
      { statics: { tokenAura: { might: 2, guard: 2 } }, ascend: [summon('fallen', 9)] })),
  back('veyra', 'Veyra Sol', 'Hunter of Guardians', 5, ['riftborn'], ['ascendant', 'hunter'], 'Stepping through a portal onto a Guardian’s back, blade raised.',
    f(6, 7, 5, ['Ascendant', 'Flight', 'Ambush'], hunt(2), { statics: { huntMight: 2 } }),
    f(2, 11, 8, ['Ascendant', 'Flight', 'Ambush'], `${hunt(2)} ${loot('Veyra Sol')}`, { statics: { huntMight: 2 }, defeats: [draw(1)] }),
    f(3, 15, 10, ['Ascendant', 'Flight', 'Ambush'], `${hunt(3)} ${again('Veyra Sol')}`, { statics: { huntMight: 3 }, defeats: [ready] })),
  back('mother', 'Mother Verdant', 'Root of All Things', 5, ['verdant'], ['ascendant', 'binder'], 'The forest growing upward through the Arena’s foundations around her.',
    f(6, 4, 9, ['Ascendant'], `Arrival: Summon two Wild Saplings. ${tokens(0, 1)}`, { arrive: [summon('sapling', 2)], statics: { tokenAura: { guard: 1 } } }),
    f(2, 7, 12, ['Ascendant'], `${tokens(1, 1)} Ascend: Summon two Wild Saplings.`, { statics: { tokenAura: { might: 1, guard: 1 } }, ascend: [summon('sapling', 2)] }),
    f(3, 10, 15, ['Ascendant'], `${tokens(2, 2)} Ascend: Summon two Treants. Shield each champion you control, then Mend 1.`, { statics: { tokenAura: { might: 2, guard: 2 } }, ascend: [summon('grove_treant', 2), shAll, mend] })),
  back('crownless', 'Crownless', 'The Unbound', 5, ['crownless'], ['ascendant'], 'Standing in the empty vault where the Crown once rested, refusing it still.',
    f(6, 6, 7, ['Ascendant', 'Charge'], 'Arrival: Each rival champion gets −2 Might this turn.', { arrive: [{ op: 'buffRivals', might: -2 }] }),
    f(2, 10, 10, ['Ascendant', 'Charge', 'Flight'], 'Ascend: Ready Crownless.', { ascend: [readySelf] }),
    f(3, 14, 13, ['Ascendant', 'Charge', 'Flight', 'Ambush'], 'Ascend: Ready Crownless. Your other champions get +2 Might this turn. Attack: Scorch 3 the defender.', { ascend: [readySelf, { op: 'buffOthers', might: 2 }], attack: [scDef(3)] })),

  // ───────────────────────────── Monsters (with Loot) ─────────────────────────────
  monster('mite', 'Crystal Mite', 1, 1, 3, [], 'When Crystal Mite is defeated, its rival draws a card.', { defeated: [draw(1, 'rival')], rarity: 'common' }),
  monster('shardling', 'Shardling', 1, 2, 1, [], 'When Shardling is defeated, its rival gains 1 Command.', { defeated: [cmd(1, 'rival')], rarity: 'common' }),
  monster('hound', 'Rift Hound', 2, 2, 2, ['Charge'], 'When Rift Hound is defeated, its rival draws a card.', { defeated: [draw(1, 'rival')], rarity: 'common' }),
  monster('alpha', 'Rift Alpha', 3, 3, 3, ['Charge'], 'Your other Monsters have +1 Might. When Rift Alpha is defeated, its rival draws a card.',
    { statics: { originAura: { origin: 'monster', might: 1 } }, defeated: [draw(1, 'rival')], rarity: 'uncommon' }),

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
/** Relic rarity (set by the rarity rubric 2026-10-12; Emblems are Common). */
const RELIC_RARITY: Record<string, NonNullable<RelicDef['rarity']>> = {
  blade: 'common',
  feather: 'common',
  crystal: 'common',
  tear: 'uncommon',
  plate: 'common',
  cloak: 'common',
  core: 'common',
  lens: 'common',
  colossus_edge: 'common',
  frenzy_fang: 'elite',
  spellforged: 'common',
  crownsworn: 'common',
  oathkeeper: 'common',
  veilpiercer: 'common',
  bloodoath: 'uncommon',
  deadeye: 'common',
  gale_talons: 'uncommon',
  storm_engine: 'elite',
  chrono_band: 'common',
  resolute_buckler: 'common',
  phase_mantle: 'common',
  quickened_heart: 'common',
  falconeye: 'common',
  astral_diadem: 'uncommon',
  tidecaller: 'epic',
  aegis_codex: 'elite',
  hexflame_orb: 'common',
  verdant_chalice: 'elite',
  seers_prism: 'common',
  wellspring: 'elite',
  rally_standard: 'elite',
  spell_shroud: 'uncommon',
  phoenix_crown: 'common',
  fatebinder: 'common',
  thornward: 'common',
  twin_aegis: 'common',
  bastion_heart: 'uncommon',
  watchward: 'common',
  starveil: 'common',
  sanctified_mantle: 'uncommon',
  nullifier: 'common',
  giant_heartstone: 'uncommon',
  reapers_lens: 'elite',
  true_sight: 'uncommon',
  sovereign_crown: 'epic',
  fallen_kings_blade: 'mythic',
  first_realm_crown: 'mythic',
  hourglass_of_ash: 'mythic',
  titans_last_heart: 'mythic',
  starless_tome: 'mythic',
};
const R = (canonId: string, name: string, cost: number, relicType: RelicDef['relicType'], text: string, art: string, rest: Partial<RelicDef> = {}): RelicDef =>
  ({ id: `relic-${canonId}`, kind: 'relic', set: 2, canonId, name, cost, relicType, text, art, rarity: RELIC_RARITY[canonId] ?? 'common', ...rest });
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
  // PROPOSED 2026-10-12: was the same card as Spellforged Saber at 1 more Command; now a Channeler engine on a Relic.
  R('storm_engine', 'Storm Engine', 3, 'completed', '+2 Might. Whenever you cast a Tactic, Scorch 1 a rival champion.', 'A brass engine crackling with chained lightning.', { might: 2, cast: [sc(1)] }),
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
  // PROPOSED 2026-10-12: was "+3 Guard", the same card as Titan Heart.
  R('spell_shroud', 'Spell Shroud', 2, 'completed', '+2 Guard. Scorch has no effect on the holder.', 'A veil that turns spells aside like rain off glass.', { guard: 2, scorchProof: true }),
  R('phoenix_crown', 'Phoenix Plume', 2, 'completed', 'When the holder is defeated, return a ★ champion from your Fallen pile to your hand.', 'A burning feather that never stops glowing.', { defeated: [champBack] }),
  R('fatebinder', 'Fatebinder', 2, 'completed', '+2 Might. Attack: The defender gets −2 Might this turn.', 'Golden chains of fate wrapped around a fist.', { might: 2, attack: [weakenDef(2)] }),
  R('thornward', 'Thornward Mail', 2, 'completed', '+2 Guard. Block: Scorch 2 the attacker.', 'Armour bristling with iron thorns.', { guard: 2, block: [scAtt(2)] }),
  R('twin_aegis', 'Twin Aegis', 2, 'completed', '+2 Guard. Bulwark.', 'Two interlocking shields bearing the same crest.', { guard: 2, keywords: ['Bulwark'] }),
  R('bastion_heart', 'Bastion of the Deep', 3, 'completed', '+4 Guard.', 'A tower shield carved from the rock of the Deep.', { guard: 4 }),
  R('watchward', 'Watchward Visor', 2, 'completed', '+2 Guard. Reach.', 'A visored helm with a watchful eye painted above the slit.', { guard: 2, keywords: ['Reach'] }),
  R('starveil', 'Starveil Cloak', 2, 'completed', '+2 Guard. Flight.', 'A cloak woven from the night sky.', { guard: 2, keywords: ['Flight'] }),
  R('sanctified_mantle', 'Sanctified Mantle', 2, 'completed', 'At the start of your turn, Shield the holder.', 'A white mantle glowing with holy light.', { rise: [shSelf] }),
  R('nullifier', 'Nullifier Grip', 2, 'completed', 'Attack: The defender gets −3 Might this turn.', 'A heavy gauntlet that drains the magic from whatever it grips.', { attack: [weakenDef(3)] }),
  // PROPOSED 2026-10-12: was "+4 Guard", the same card as Bastion of the Deep. Its ward counts toward the Sentinel cap.
  R('giant_heartstone', 'Mountainheart', 3, 'completed', `+3 Guard. ${ward1Text}`, 'A stone heart carved from a mountain’s core.', { guard: 3, statics: { crownWard: 1 } }),
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
  // PROPOSED 2026-10-12: 2 Command (was 3) and it comes back when its holder falls, so it earns its Epic rarity.
  R('sovereign_crown', 'Sovereign Crown', 2, 'crown', '+1 Might and +1 Guard. You have one more Champion Zone while it is in play. When the holder is defeated, the Sovereign Crown returns to its owner’s hand.', 'A small golden crown forged from two Crown Shards.',
    { might: 1, guard: 1, extraZone: true, returnsToHand: true }),
  // Crown Artifacts (legendary). PROPOSED redesign 2026-10-12: each Mythic Artifact now changes a rule of the game.
  R('fallen_kings_blade', "The Fallen King's Blade", 4, 'artifact', '+3 Might. When the holder’s attack on your rival’s Crown isn’t blocked, it breaks 1 more shard.',
    'The blade of a forgotten king, still sharp, still hungry.', { might: 3, extraCrown: 1, legendary: true }),
  R('first_realm_crown', 'Crown of the First Realm', 4, 'artifact', '+1 Might and +1 Guard. The holder counts as every Origin. You may Ascend twice each turn.', 'An ancient crown of the first realm, older than the Crownfall.',
    { might: 1, guard: 1, allOrigins: true, extraAscend: true, legendary: true }),
  R('hourglass_of_ash', 'Hourglass of Ash', 4, 'artifact', '+2 Guard. Attack: If the holder is attacking a champion, ready it (once per turn).', 'An hourglass of grey ash that flows upward.',
    { guard: 2, attack: [{ op: 'readyOncePerTurn', when: 'vsChampion' }], legendary: true }),
  R('titans_last_heart', "Titan's Last Heart", 4, 'artifact', '+3 Guard. An unblocked attack on your Crown breaks only 1 shard.', 'The final heart of the last titan, cracked but still beating.',
    { guard: 3, crownCap: 1, legendary: true }),
  R('starless_tome', 'The Starless Tome', 4, 'artifact', 'At the start of your turn, draw a card and gain 1 Command.', 'A black book whose pages hold no stars at all.',
    { rise: [draw(1), cmd(1)], legendary: true }),
];

// ───────────────────────────── Tactics and Schemes ─────────────────────────────
/** Tactic and Scheme rarity (set by the rarity rubric 2026-10-12). */
const SPELL_RARITY: Record<string, NonNullable<SpellDef['rarity']>> = {
  unbinding_charm: 'uncommon',
  hex_war: 'common',
  hex_fortune: 'uncommon',
  hex_creation: 'common',
  hex_void: 'uncommon',
  hex_evolution: 'elite',
  wild_encounter: 'uncommon',
  boss_encounter: 'uncommon',
  pack_leader: 'uncommon',
  clash_of_sovereigns: 'uncommon',
  stirs_beneath: 'common',
  guardian_approaches: 'uncommon',
  guardian_falls: 'epic',
  treasure_is_yours: 'common',
  arena_yields: 'elite',
  vault_remembers: 'common',
  old_power: 'elite',
  vault_opens: 'elite',
  wounded_choose: 'common',
  crown_divided: 'elite',
  guardian_enrages: 'uncommon',
  head_splits: 'uncommon',
  forged_in_fire: 'uncommon',
  tide_will_turn: 'common',
  crown_in_danger: 'elite',
  steel_will_answer: 'common',
  cannot_be_touched: 'common',
  one_still_stands: 'common',
  keeps_treasure: 'uncommon',
  not_yet: 'common',
};
const T = (id: string, name: string, cost: number, text: string, effects: Effect[], art: string, extra: Partial<SpellDef> = {}): SpellDef =>
  ({ id, set: 2, kind: 'tactic', name, cost, text, effects, art, rarity: SPELL_RARITY[id], ...extra });
const S = (id: string, name: string, cost: number, when: SpellDef['when'], text: string, effects: Effect[], art: string, extra: Partial<SpellDef> = {}): SpellDef =>
  ({ id, set: 2, kind: 'scheme', name, cost, when, text, effects, art, rarity: SPELL_RARITY[id], ...extra });

export const SET2_SPELLS: SpellDef[] = [
  // The Unbinding Charm (Crownfall consumable)
  T('unbinding_charm', 'Unbinding Charm', 0, 'Return a Relic to its owner’s hand.', [{ op: 'unequip' }], 'A silver charm unpicking the bindings of a relic.', { canonId: 'unbinding_charm' }),
  // Crown Hex boons (Crownfall: the golden hex grants a boon from your strongest Crown school)
  T('hex_war', 'Crown Hex: War', 2, 'Your champions get +2 Might this turn.', [{ op: 'buffAll', might: 2 }], 'A golden hex blazing red beneath an army’s feet.', { canonId: 'crown_hex' }),
  T('hex_fortune', 'Crown Hex: Fortune', 1, 'Shield a champion you control. Gain 2 Command.', [shOwn, cmd(2)], 'A golden hex scattering coins and a glowing shield.', { canonId: 'crown_hex' }),
  T('hex_creation', 'Crown Hex: Creation', 2, 'Summon two Crownlings.', [summon('crownling', 2)], 'A golden hex from which small crowned creatures spring.', { canonId: 'crown_hex' }),
  T('hex_void', 'Crown Hex: Void', 0, 'Break one of your own shards. Your champions get +3 Might this turn.', [{ op: 'selfShard', n: 1 }, { op: 'buffAll', might: 3 }], 'A golden hex cracking into violet void.', { canonId: 'crown_hex' }),
  // PROPOSED 2026-10-12: was the same card as Set 1's Ascension Rite (★ to ★★ for 2); now the ★★ to ★★★ step.
  T('hex_evolution', 'Crown Hex: Evolution', 3, 'Ascend one of your ★★ champions to ★★★ for free.', [{ op: 'ascendNow', minStar: 2 }], 'A golden hex lifting a champion into its next form.', { canonId: 'crown_hex' }),
  // Crownfall events
  T('wild_encounter', 'Wild Encounter', 2, 'Deploy a Monster costing 3 or less from your hand for free.', [{ op: 'deployFree', maxCost: 3, family: 'monster' }], 'Wild monsters bursting from a cavern into the Arena.', { canonId: 'wild_encounter' }),
  T('boss_encounter', 'Boss Encounter', 2, 'Your Monsters and Guardians get +2 Might and +2 Guard this turn. Draw a card.', [{ op: 'buffTrait', trait: 'monster', might: 2, guard: 2 }, draw(1)], 'A Guardian rising through the Arena floor as Sovereigns brace.', { canonId: 'boss_encounter' }),
  T('pack_leader', 'Pack Leader', 1, 'Your Wildkin champions and Monsters get +2 Might this turn.', [{ op: 'buffTrait', trait: 'wildkin', might: 2 }, { op: 'buffTrait', trait: 'monster', might: 2 }], 'A Rift Alpha howling at the head of its pack.', { canonId: 'pack_leader' }),
  T('clash_of_sovereigns', 'Clash of Sovereigns', 2, 'Ready another champion you control. Your champions get +1 Might this turn.', [readyOther, { op: 'buffAll', might: 1 }], 'Two Sovereigns’ banners crashing together over the Arena.', { canonId: 'clash_of_sovereigns', flavour: 'The Clash of Sovereigns begins.' }),
  // Announcer lines (the card name and flavour are the canonical line)
  T('stirs_beneath', 'Something Stirs Beneath the Arena', 1, 'Return a ★ champion from your Fallen pile to your hand. Draw a card.', [champBack, draw(1)], 'Cracks spreading across the Arena sand as something huge moves below.', { flavour: 'Something stirs beneath the Arena.' }),
  T('guardian_falls', 'The Guardian Falls', 3, 'Defeat each rival champion with Guard 3 or less.', [sweep(3)], 'A colossal Guardian toppling onto the Arena sand.', { flavour: 'The guardian falls.' }),
  T('treasure_is_yours', 'Its Treasure Is Yours', 1, 'Return a Relic from your Fallen pile to your hand. Draw a card.', [relicBack, draw(1)], 'A heap of relics spilling from a fallen Guardian’s chest.', { flavour: 'Its treasure is yours.' }),
  T('arena_yields', 'The Arena Yields Its Prize', 2, 'Draw 2 cards. Gain 1 Command.', [draw(2), cmd(1)], 'A golden chest rising from the Arena floor.', { flavour: 'The Arena yields its prize.' }),
  T('vault_remembers', 'The Vault Remembers', 1, 'Return a Relic from your Fallen pile to your hand.', [relicBack], 'Relics re-forming on their pedestals in the Ascension Vault.', { flavour: 'The Vault remembers this relic.', shardfall: true }),
  T('vault_opens', 'The Ascension Vault Opens', 2, 'Draw 3 cards, then put a card from your hand on the bottom of your deck.', [draw(3), { op: 'tuck' }], 'The great doors of the Ascension Vault swinging open.', { flavour: 'The Ascension Vault opens.' }),
  T('wounded_choose', 'The Wounded Choose First', 1, 'If you have fewer shards than your rival, draw 2 cards.', [{ op: 'draw', n: 2, when: 'behind' }], 'A battered Sovereign reaching first into the Vault.', { flavour: 'The Crown Draft begins. The wounded choose first.', shardfall: true }),
  T('crown_divided', 'The Crown Is Divided', 2, 'Mend 1. Draw a card.', [mend, draw(1)], 'Shards of the Crown hanging in the air above the Arena.', { flavour: 'The Crown is divided. Come and claim your share.' }),
  T('guardian_enrages', 'The Guardian Enrages', 1, 'A champion gets +4 Might this turn.', [{ op: 'buff', might: 4, guard: 0, target: 'chooseAny' }], 'The Crown Guardian’s eyes burning red as it enrages.', { flavour: 'The Guardian enrages.', swift: true }),
  T('forged_in_fire', 'Even Crowns Are Forged in Fire', 2, 'Return a ★ champion and a Relic from your Fallen pile to your hand.', [champBack, relicBack], 'A crown glowing white-hot on an anvil.', { flavour: 'Even crowns are forged in fire.' }),
  S('steel_will_answer', 'Steel Will Answer', 1, 'rivalAttacks', 'Spring when a rival champion attacks: it gets −3 Might this turn.', [weakenAtt(3)], 'A wall of raised steel meeting a charge.', { flavour: 'Steel will answer.' }),
  S('cannot_be_touched', 'It Cannot Be Touched', 1, 'clash', 'Spring when one of your champions is attacked or blocks: Shield a champion you control.', [shOwn], 'A Celestial Sentinel wrapped in an untouchable golden shell.', { flavour: 'It cannot be touched. Wait.' }),
  S('one_still_stands', 'One Still Stands', 1, 'clash', 'Spring when one of your champions is attacked or blocks: it gets +2 Might and +2 Guard this turn.', [{ op: 'buff', might: 2, guard: 2, target: 'defender' }], 'A lone champion standing amid the fallen.', { flavour: 'One still stands.' }),
  // PROPOSED 2026-10-12: was strictly worse than Set 1's Bloodscent; now it also recovers a Relic.
  S('keeps_treasure', 'The Guardian Keeps Its Treasure', 1, 'clash', 'Spring when one of your champions is attacked or blocks: it gets +3 Guard this turn. Return a Relic from your Fallen pile to your hand.', [{ op: 'buff', might: 0, guard: 3, target: 'defender' }, relicBack], 'A Guardian curled around its hoard, refusing to yield.', { flavour: 'The guardian keeps its treasure.' }),
  // PROPOSED 2026-10-12: was strictly worse than Set 1's Cinder Veil; now it also draws a card.
  S('not_yet', 'Steady, Sovereign. Not Yet.', 1, 'crownUnblocked', 'Spring when a rival champion attacks your Crown and is not blocked: that attack ends. No shards break. Draw a card.', [{ op: 'cancelAttack' }, draw(1)], 'A Sovereign’s hand raised as an attack freezes mid-air.', { flavour: 'Steady, Sovereign. Not yet.' }),
  // ── New Schemes (PROPOSED 2026-10-12) for the Seers. Each replaces a redundant Tactic of the same name, keeping its
  //    announcer line, so the set stays at 266 cards: The Tide Will Turn (≈ The Wounded Choose First), Your Crown Is in
  //    Danger (strictly worse than The Crown Is Divided), A Head Splits and A Guardian Approaches (two more "Summon a
  //    token" Tactics beside Crown Hex: Creation) and Old Power, Newly Yours (a third "return a Relic" Tactic).
  S('tide_will_turn', 'The Tide Will Turn', 1, 'crownAttacked', 'Spring when a rival champion attacks your Crown: if you have fewer shards than your rival, draw 2 cards.', [{ op: 'draw', n: 2, when: 'behind' }], 'A wave of light rolling back across a losing battlefield.', { flavour: 'The tide will turn.' }),
  S('crown_in_danger', 'Your Crown Is in Danger', 2, 'crownUnblocked', 'Spring when a rival champion attacks your Crown and is not blocked: Mend 1.', [mend], 'A cracked Crown Shard glowing as it begins to mend.', { flavour: 'Your Crown is in danger.' }),
  S('head_splits', 'A Head Splits', 1, 'rivalAttacks', 'Spring when a rival champion attacks: Summon two Hydra Hatchlings.', [summon('hydralet', 2)], 'A clockwork hydra head splitting into snapping hatchlings.', { flavour: 'A head splits.' }),
  S('guardian_approaches', 'A Guardian Approaches', 2, 'crownUnblocked', 'Spring when a rival champion attacks your Crown and is not blocked: Summon a Guardian Construct. It blocks that attack.', [{ op: 'summon', token: 'token-construct', count: 1, block: true }], 'The silhouette of a Guardian Construct stepping out of a dark tunnel.', { flavour: 'A guardian approaches.' }),
  S('old_power', 'Old Power, Newly Yours', 1, 'rivalAttacks', 'Spring when a rival champion attacks: take its Relic and attach it to one of your champions. If you can’t, Scorch 2 it.', [{ op: 'seizeRelic', orElse: [scAtt(2)] }], 'A champion lifting an ancient artifact, light pouring from it.', { flavour: 'A Crown Artifact. Old power, newly yours.' }),
];

// ───────────────────────────── Edicts ─────────────────────────────
const E = (canonId: string, name: string, host: string, text: string, rule: EdictDef['rule']): EdictDef =>
  ({ id: `edict-${canonId.replace(/^edict_/, '')}`, kind: 'edict', set: 2, canonId, name, cost: 2, host, text, rule, rarity: 'uncommon' });

export const SET2_EDICTS: EdictDef[] = [
  E('edict_relic_tide', 'Relic Tide', 'unwritten', 'When a champion holding a Relic is defeated, the Relic returns to its owner’s hand.', { relicReturn: true }),
  E('edict_monster_tithe', 'Monster Tithe', 'dreadmouth', 'Whenever a Monster or Guardian is defeated, its rival draws a card.', { monsterDraw: true }),
  E('edict_first_armoury', 'The First Armoury', 'borin', 'Relics cost 1 less (minimum 0).', { relicDiscount: 1 }),
];

/** Cards whose rules, stats, type or ability name changed in the 2026-10-12 audit (PROPOSED, see prototype-v0.2/AUDIT_CHANGES.md).
 *  The master list marks them so the studio knows the text is new. Printed cards are never in this list. */
export const AUDIT_PROPOSED_2026_10_12: ReadonlySet<string> = new Set([
  'aurex@2', 'aurex@2-2', 'aurex@2-3', 'blacktide@2', 'blacktide@2-2', 'blacktide@2-3',
  'cannot_be_touched', 'crown_in_danger', 'crownless@2', 'gaia@2-3', 'guardian_approaches', 'head_splits',
  'hex3@2-3', 'hex_evolution', 'keeps_treasure', 'ladyvolt@2', 'ladyvolt@2-2', 'ladyvolt@2-3',
  'maeve@2', 'maeve@2-3', 'mirella@2-3', 'noctara@2', 'not_yet', 'nyx@2',
  'nyx@2-2', 'nyx@2-3', 'old_power', 'orion@2-2', 'orion@2-3', 'pyrax@2',
  'pyrax@2-2', 'pyrax@2-3', 'relic-fallen_kings_blade', 'relic-first_realm_crown', 'relic-giant_heartstone', 'relic-hourglass_of_ash',
  'relic-sovereign_crown', 'relic-spell_shroud', 'relic-storm_engine', 'relic-titans_last_heart', 'ronin@2', 'seren@2-2',
  'seren@2-3', 'shade@2-3', 'solara@2-3', 'thorn@2-2', 'thorn@2-3', 'tide_will_turn',
  'titanrho@2-3', 'unwritten@2', 'unwritten@2-2', 'unwritten@2-3', 'valkara@2', 'veilwalker@2',
  'veilwalker@2-3', 'vespera@2', 'vespera@2-2', 'vespera@2-3', 'veyra@2',
]);
