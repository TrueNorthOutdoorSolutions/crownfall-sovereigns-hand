// Sovereign's Hand V0.2 paper prototype: the single source of card truth.
// The print kit renders `text`; the simulator runs `fx`. tools/validate.mjs checks both against canon.
//
// Canon rule: every champion's name, title, tier, Origins and Classes must match data/canon-snapshot.json
// (read from Desktop/Crownfall). Might, Guard, costs and card text are card-game design and are PROPOSED.
// Tactic and Scheme names are working names, not canon.

export const RULES_VERSION = '0.2-paper-1';

// ── Champion lines ─────────────────────────────────────────────────────────────
// A line = the ★ card (main deck) plus optional ★★/★★★ Ascension cards.
// fx hooks (all optional), see tools/engine.mjs:
//   arrive(g, me)            when the ★ is deployed
//   ascend(g, me)            when this form is placed by Ascending
//   attack(g, me, target)    when this champion is declared as an attacker (target = champion or 'crown')
//   block(g, me, attacker)   when this champion blocks, or is attacked (Ignara ★★★)
//   might(g, me) / guard(g, me)    static bonus for this champion
//   auraMight(g, me, other) / auraGuard(g, me, other)  static bonus this champion gives your other champions
//   defeats(g, me, victim)   after this champion defeats a rival champion in a clash
export const CHAMPION_LINES = [
  // ── BANNER OF THE REALM (Kingdom / Dawnforged) ──
  {
    canonId: 'rowan', name: 'Rowan', title: 'Longbow of the Realm', tier: 1, origins: ['kingdom'], classes: ['ranger'],
    forms: [
      { star: 1, cost: 1, might: 2, guard: 2, keywords: ['Reach'], text: '' },
    ],
  },
  {
    canonId: 'kael', name: 'Kael', title: 'Seeker of the Crown', tier: 1, origins: ['kingdom'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 2, might: 3, guard: 2, keywords: [], text: '' },
      { star: 2, cost: 0, might: 6, guard: 5, keywords: [], ability: 'Crescent Slash',
        text: 'Attack: Scorch 1 each rival champion.',
        fx: { attack: (g, me) => g.scorchAll(g.rival(me.owner), 1) } },
      { star: 3, cost: 1, might: 10, guard: 8, keywords: [], ability: 'Crescent Slash',
        text: 'Ascend: Scorch 1 each rival champion. Attack: Scorch 1 each rival champion.',
        fx: { ascend: (g, me) => g.scorchAll(g.rival(me.owner), 1), attack: (g, me) => g.scorchAll(g.rival(me.owner), 1) } },
    ],
  },
  {
    canonId: 'solara', name: 'Solara', title: 'Novice of the Dawn', tier: 1, origins: ['dawnforged'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 2, keywords: [], ability: 'Sun Mend',
        text: 'Arrival: Shield another champion you control.',
        fx: { arrive: (g, me) => g.shieldBest(me.owner, me) } },
    ],
  },
  {
    canonId: 'elara', name: 'Elara', title: 'Field Surgeon of the Realm', tier: 2, origins: ['kingdom'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 3, might: 1, guard: 3, keywords: [], ability: 'Last Light',
        text: 'Arrival: Return a ★ champion from your Fallen pile to your hand.',
        fx: { arrive: (g, me) => g.returnFallen(me.owner, 1) } },
    ],
  },
  {
    canonId: 'solenne', name: 'Solenne Ash', title: 'Knight of the Burning Dawn', tier: 2, origins: ['dawnforged'], classes: ['vanguard'],
    forms: [
      { star: 1, cost: 3, might: 3, guard: 3, keywords: ['Charge'], text: '' },
      { star: 2, cost: 1, might: 6, guard: 6, keywords: ['Charge'], ability: 'Solar Charge',
        text: 'Ascend: Scorch 2 a rival champion.',
        fx: { ascend: (g, me) => g.scorchBest(g.rival(me.owner), 2) } },
      { star: 3, cost: 2, might: 10, guard: 9, keywords: ['Charge'], ability: 'Solar Charge',
        text: 'Ascend: Scorch 2 each rival champion.',
        fx: { ascend: (g, me) => g.scorchAll(g.rival(me.owner), 2) } },
    ],
  },
  {
    canonId: 'aurelia', name: 'Aurelia', title: 'Crown Commander', tier: 3, origins: ['kingdom'], classes: ['commander'],
    forms: [
      { star: 1, cost: 4, might: 3, guard: 4, keywords: [], ability: 'Rally the Crown',
        text: 'Attack: Your other champions get +1 Might this turn.',
        fx: { attack: (g, me) => g.buffOthers(me, 1, 0) } },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Rally the Crown',
        text: 'Your other champions have +1 Might.',
        fx: { auraMight: () => 1 } },
      { star: 3, cost: 2, might: 9, guard: 10, keywords: [], ability: 'Rally the Crown',
        text: 'Your other champions have +1 Might and +1 Guard.',
        fx: { auraMight: () => 1, auraGuard: () => 1 } },
    ],
  },
  {
    canonId: 'varr', name: 'General Varr', title: 'The Unbroken Line', tier: 4, origins: ['kingdom'], classes: ['commander', 'vanguard'],
    forms: [
      { star: 1, cost: 5, might: 4, guard: 6, keywords: ['Bulwark'], ability: 'Hold the Line',
        text: 'Your other champions have +1 Guard.',
        fx: { auraGuard: () => 1 } },
    ],
  },
  {
    canonId: 'sol', name: 'Sol', title: 'The First Light', tier: 5, origins: ['dawnforged'], classes: ['ascendant', 'mystic'],
    forms: [
      { star: 1, cost: 6, might: 5, guard: 7, keywords: ['Ascendant'], ability: 'DAWN',
        text: 'Arrival: Shield each champion you control.',
        fx: { arrive: (g, me) => g.shieldAll(me.owner) } },
      { star: 2, cost: 2, might: 8, guard: 10, keywords: ['Ascendant', 'Flight'], ability: 'DAWN',
        text: 'Ascend: Shield each champion you control.',
        fx: { ascend: (g, me) => g.shieldAll(me.owner) } },
      { star: 3, cost: 3, might: 12, guard: 13, keywords: ['Ascendant', 'Flight'], ability: 'DAWN',
        text: 'Ascend: Scorch 3 each rival champion, then Mend 1.',
        fx: { ascend: (g, me) => { g.scorchAll(g.rival(me.owner), 3); g.mend(me.owner, 1); } } },
    ],
  },

  // ── BLOOD & EMBER (Wildkin / Elemental, with Aurex) ──
  {
    canonId: 'fen', name: 'Fen', title: 'Blood of the Pack', tier: 1, origins: ['wildkin'], classes: ['duelist'],
    forms: [
      { star: 1, cost: 1, might: 2, guard: 1, keywords: [],
        text: '+1 Might while you have fewer shards than your rival.',
        fx: { might: (g, me) => (g.behind(me.owner) ? 1 : 0) } },
      { star: 2, cost: 0, might: 5, guard: 4, keywords: ['Ambush'], ability: 'Red Moon Pounce',
        text: '+1 Might while you have fewer shards than your rival.',
        fx: { might: (g, me) => (g.behind(me.owner) ? 1 : 0) } },
      { star: 3, cost: 1, might: 9, guard: 7, keywords: ['Ambush'], ability: 'Red Moon Pounce',
        text: '+1 Might while you have fewer shards than your rival. Once per turn, when Fen defeats a champion on your turn, ready Fen.',
        fx: { might: (g, me) => (g.behind(me.owner) ? 1 : 0), defeats: (g, me) => g.readyOncePerTurn(me) } },
    ],
  },
  {
    canonId: 'emberling', name: 'Emberling', title: 'Spark That Learned to Speak', tier: 1, origins: ['elemental'], classes: ['arcanist'],
    forms: [
      { star: 1, cost: 1, might: 1, guard: 1, keywords: [], ability: 'Kindle',
        text: 'Arrival: Scorch 2 a rival champion.',
        fx: { arrive: (g, me) => g.scorchBest(g.rival(me.owner), 2) } },
    ],
  },
  {
    canonId: 'mirella', name: 'Mirella', title: 'Voice of the Tides', tier: 2, origins: ['elemental'], classes: ['mystic'],
    forms: [
      { star: 1, cost: 2, might: 1, guard: 3, keywords: [], ability: 'Tidal Veil',
        text: 'Arrival: Shield another champion you control.',
        fx: { arrive: (g, me) => g.shieldBest(me.owner, me) } },
    ],
  },
  {
    canonId: 'grizz', name: 'Grizz', title: 'The Mountain That Walks', tier: 2, origins: ['wildkin'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 3, might: 4, guard: 4, keywords: [], ability: 'Maul',
        text: '+2 Might while blocking.',
        fx: { might: (g, me) => (me.blocking ? 2 : 0) } },
    ],
  },
  {
    canonId: 'ignara', name: 'Ignara', title: 'The Living Pyre', tier: 3, origins: ['elemental'], classes: ['vanguard'],
    forms: [
      { star: 1, cost: 3, might: 3, guard: 4, keywords: [], ability: 'Inferno Shell',
        text: 'Block: Scorch 2 the attacker.',
        fx: { block: (g, me, attacker) => g.scorch(attacker, 2) } },
      { star: 2, cost: 1, might: 6, guard: 7, keywords: [], ability: 'Inferno Shell',
        text: 'Block: Scorch 2 the attacker.',
        fx: { block: (g, me, attacker) => g.scorch(attacker, 2) } },
      { star: 3, cost: 2, might: 9, guard: 10, keywords: ['Bulwark'], ability: 'Inferno Shell',
        text: 'Block: Scorch 2 the attacker. This also happens when Ignara is attacked.',
        fx: { block: (g, me, attacker) => g.scorch(attacker, 2), attacked: (g, me, attacker) => g.scorch(attacker, 2) } },
    ],
  },
  {
    canonId: 'pyrax', name: 'Pyrax', title: 'Dragon-Blooded', tier: 4, origins: ['elemental'], classes: ['bruiser'],
    forms: [
      { star: 1, cost: 4, might: 5, guard: 4, keywords: [], text: '' },
      { star: 2, cost: 1, might: 8, guard: 8, keywords: [], ability: 'Dragonheart',
        text: 'Ascend: Scorch 1 each rival champion.',
        fx: { ascend: (g, me) => g.scorchAll(g.rival(me.owner), 1) } },
      { star: 3, cost: 2, might: 11, guard: 11, keywords: [], ability: 'Dragonheart',
        text: 'Ascend: Scorch 2 each rival champion. Attack: Scorch 2 the defender.',
        fx: { ascend: (g, me) => g.scorchAll(g.rival(me.owner), 2), attack: (g, me, t) => g.scorch(t, 2) } },
    ],
  },
  {
    canonId: 'aurex', name: 'Aurex', title: 'The Last Dragon', tier: 5, origins: ['wyrmblood'], classes: ['ascendant', 'bruiser'],
    forms: [
      { star: 1, cost: 6, might: 7, guard: 8, keywords: ['Ascendant'], ability: 'WORLD IN FLAMES',
        text: 'Arrival: Scorch 2 each rival champion.',
        fx: { arrive: (g, me) => g.scorchAll(g.rival(me.owner), 2) } },
      { star: 2, cost: 2, might: 9, guard: 9, keywords: ['Ascendant', 'Flight'], ability: 'WORLD IN FLAMES',
        text: 'Attack: Scorch 2 the defender.',
        fx: { attack: (g, me, t) => g.scorch(t, 2) } },
      { star: 3, cost: 3, might: 13, guard: 12, keywords: ['Ascendant', 'Flight'], ability: 'WORLD IN FLAMES',
        text: 'Ascend: Defeat each rival champion with Guard 3 or less. Your other champions can’t attack this turn.',
        fx: { ascend: (g, me) => { g.defeatAllGuardAtMost(g.rival(me.owner), 3); g.stopOthersAttacking(me); } } },
    ],
  },
];

// ── Tactics (your turn; Swift ones also in a response window) and Schemes (set face-down) ──
// Schemes: `when` names the trigger; `use(g, ctx)` applies it; `wants(g, ctx)` lets the bot decide.
export const SPELLS = [
  // Banner
  { id: 'rally-banners', deck: 'banner', kind: 'tactic', name: 'Rally the Banners', cost: 1,
    text: 'Your champions get +1 Might this turn.', fx: { cast: (g, p) => g.buffAll(p, 1, 0) }, ai: 'preAttackBuff' },
  { id: 'reinforcements', deck: 'banner', kind: 'tactic', name: 'Reinforcements', cost: 2, shardfall: true,
    text: 'Deploy a ★ champion costing 2 or less from your hand for free.', fx: { cast: (g, p) => g.deployFree(p, 2) }, ai: 'deployFree' },
  { id: 'royal-dispatch', deck: 'banner', kind: 'tactic', name: 'Royal Dispatch', cost: 2,
    text: 'Draw 2 cards.', fx: { cast: (g, p) => g.draw(p, 2) }, ai: 'draw' },
  { id: 'shield-wall', deck: 'banner', kind: 'tactic', name: 'Shield Wall', cost: 2,
    text: 'Shield up to two champions you control.', fx: { cast: (g, p) => { g.shieldBest(p); g.shieldBest(p); } }, ai: 'shield' },
  { id: 'first-light', deck: 'banner', kind: 'tactic', name: 'First Light', cost: 1, swift: true,
    text: 'A champion gets +2 Guard this turn.', fx: { swift: (g, c) => g.buff(c, 0, 2) }, ai: 'swiftGuard' },
  { id: 'dawnward-oath', deck: 'banner', kind: 'scheme', name: 'Dawnward Oath', cost: 1, when: 'rivalAttacks',
    text: 'Spring when a rival champion attacks: Shield one of your champions.', ai: 'schemeShield' },
  { id: 'hold-the-gate', deck: 'banner', kind: 'scheme', name: 'Hold the Gate', cost: 0, shardfall: true, when: 'crownUnblocked',
    text: 'Spring when a rival champion attacks your Crown and is not blocked: ready one of your champions; it blocks that attack.', ai: 'schemeGate' },
  { id: 'arrow-volley', deck: 'banner', kind: 'scheme', name: 'Arrow Volley', cost: 1, when: 'rivalAttacks',
    text: 'Spring when a rival champion attacks: it gets −2 Might this turn.', ai: 'schemeWeaken' },

  // Ember
  { id: 'firebolt', deck: 'ember', kind: 'tactic', name: 'Firebolt', cost: 1,
    text: 'Scorch 2 a rival champion.', fx: { cast: (g, p) => g.scorchBest(g.rival(p), 2) }, ai: 'scorchOne' },
  { id: 'firestorm', deck: 'ember', kind: 'tactic', name: 'Firestorm', cost: 2,
    text: 'Scorch 1 each rival champion. Draw a card.', fx: { cast: (g, p) => { g.scorchAll(g.rival(p), 1); g.draw(p, 1); } }, ai: 'scorchAll' },
  { id: 'feral-howl', deck: 'ember', kind: 'tactic', name: 'Feral Howl', cost: 1,
    text: 'Your champions get +1 Might this turn, or +2 if you have fewer shards than your rival.',
    fx: { cast: (g, p) => g.buffAll(p, g.behind(p) ? 2 : 1, 0) }, ai: 'preAttackBuff' },
  { id: 'return-to-fire', deck: 'ember', kind: 'tactic', name: 'Return to the Fire', cost: 2, shardfall: true,
    text: 'Return up to two ★ champions from your Fallen pile to your hand.', fx: { cast: (g, p) => g.returnFallen(p, 2) }, ai: 'recur' },
  { id: 'flare-up', deck: 'ember', kind: 'tactic', name: 'Flare Up', cost: 1, swift: true,
    text: 'A champion gets +2 Might this turn.', fx: { swift: (g, c) => g.buff(c, 2, 0) }, ai: 'swiftMight' },
  { id: 'kindling', deck: 'ember', kind: 'tactic', name: 'Kindling', cost: 0, shardfall: true,
    text: 'Draw a card.', fx: { cast: (g, p) => g.draw(p, 1) }, ai: 'draw' },
  { id: 'bloodscent', deck: 'ember', kind: 'scheme', name: 'Bloodscent', cost: 0, shardfall: true, when: 'clash',
    text: 'Spring when one of your champions is attacked or blocks: it gets +3 Guard this turn.', ai: 'schemeGuard' },
  { id: 'ember-trap', deck: 'ember', kind: 'scheme', name: 'Ember Trap', cost: 1, when: 'rivalAttacks',
    text: 'Spring when a rival champion attacks: Scorch 2 it.', ai: 'schemeScorch' },
  { id: 'cinder-veil', deck: 'ember', kind: 'scheme', name: 'Cinder Veil', cost: 1, when: 'crownAttacked',
    text: 'Spring when a rival champion attacks your Crown: that attack ends. No shards break.', ai: 'schemeVeil' },
];

// ── Starter decks ──────────────────────────────────────────────────────────────
// main: [id, copies]. ★ champions are referenced by canonId; Ascension cards by `${canonId}-${star}`.
export const DECKS = {
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

// ── Lookup helpers ─────────────────────────────────────────────────────────────
export const DECK_OF_LINE = Object.fromEntries(
  Object.entries(DECKS).flatMap(([deckId, d]) => d.main.filter(([id]) => CHAMPION_LINES.some((l) => l.canonId === id)).map(([id]) => [id, deckId])),
);

/** Flat card definitions keyed by card id ('kael' = ★ card, 'kael-2' = ★★ Ascension card, spells by id). */
export function cardIndex() {
  const idx = {};
  for (const line of CHAMPION_LINES) {
    for (const f of line.forms) {
      const id = f.star === 1 ? line.canonId : `${line.canonId}-${f.star}`;
      idx[id] = {
        id, kind: f.star === 1 ? 'champion' : 'ascension', line, ...f,
        name: line.name, title: line.title, canonId: line.canonId, deck: DECK_OF_LINE[line.canonId],
        crown: f.star === 3 ? 2 : 1, fx: f.fx ?? {}, keywords: f.keywords ?? [],
      };
    }
  }
  for (const s of SPELLS) idx[s.id] = { ...s, fx: s.fx ?? {} };
  return idx;
}
