// The Shattered Crown rules engine (paper rules 0.2-paper-1).
// Pure and deterministic: no DOM, no clock, no Math.random. Every transition is apply(state, player, action),
// which validates the action against the legal-action contract and returns a new state.
// The step-by-step order mirrors prototype-v0.2/RULEBOOK.md.
import { CARDS, DECKS, RULES_VERSION, champion, edict, isChampionCard, isEdictCard, isRelicCard, isSpellCard, relic, spell } from '../content/cards';
import type { ChampionCard, ChampionForm, DeckId, Effect, EdictRule, Keyword, RelicCard, SpellCard, Statics } from '../content/cards';
import type {
  Action, ApplyResult, ChampionInPlay, ChoiceOption, ClashReport, GameState, LogKind, PlayerIndex, PlayerState, QueueItem,
} from './types';

export const SHARDS = 5;
export const COMMAND_MAX = 8;
export const STALL_ROUND = 10;
export const HAND_LIMIT = 8;
export const ZONES = 4;
export const SCHEME_ZONES = 3;

// ── randomness (seeded, stored in state) ───────────────────────────────────────
function nextRandom(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffle<T>(s: GameState, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom(s) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── small helpers ──────────────────────────────────────────────────────────────
export const rival = (p: PlayerIndex): PlayerIndex => (p === 0 ? 1 : 0);
export const round = (s: GameState) => Math.floor(s.turn / 2) + 1;
export const top = (c: ChampionInPlay): ChampionCard => champion(c.stack[c.stack.length - 1]);
export const relicOf = (c: ChampionInPlay): RelicCard | null => (c.relic ? relic(c.relic) : null);
export const hasKeyword = (c: ChampionInPlay, k: Keyword) => top(c).keywords.includes(k) || !!relicOf(c)?.keywords?.includes(k);
/** Origins of a champion in play: its own plus an Emblem's. */
export const ALL_ORIGINS = ['kingdom', 'gearbound', 'astral', 'verdant', 'hollow', 'umbral', 'elemental', 'wildkin', 'voltborn', 'riftborn', 'dawnforged', 'hexbound', 'titanborn', 'wyrmblood', 'crownless'];
export const originsOf = (c: ChampionInPlay): string[] => relicOf(c)?.allOrigins ? ALL_ORIGINS
  : [...top(c).line.origins, ...(relicOf(c)?.origin ? [relicOf(c)!.origin!] : [])];
const staticsOf = (c: ChampionInPlay): Statics[] => [top(c).statics, relicOf(c)?.statics].filter((x): x is Statics => !!x);
type TriggerKey = 'attack' | 'block' | 'attacked' | 'defeats' | 'defeated' | 'rise';
/** A champion's trigger effects, including its Relic's. */
const triggers = (c: ChampionInPlay, key: TriggerKey): Effect[] => [...((top(c) as ChampionForm)[key] ?? []), ...((relicOf(c) as Record<string, Effect[] | undefined> | null)?.[key] ?? [])];
export const edictRule = (s: GameState): EdictRule => (s.edict ? edict(s.edict.card).rule : {});
/** Champion Zones available: 4, or 5 with the Sovereign Crown. */
export const zonesFor = (s: GameState, p: PlayerIndex) => ZONES + (s.players[p].extraZones ?? 0) + (s.players[p].field.some((c) => relicOf(c)?.extraZone) ? 1 : 0);
/** A champion in play matches a trait: an Origin, a Class, 'token', or 'ascended' (★★ or ★★★). */
export const hasTrait = (c: ChampionInPlay, trait: string) => trait === 'token' ? !!c.token : trait === 'ascended' ? c.stack.length > 1
  : trait === 'monster' ? top(c).family === 'monster' || top(c).family === 'guardian' : trait === 'relic' ? !!c.relic
  : originsOf(c).includes(trait) || top(c).line.classes.includes(trait);
/** Effects that break your own shards can't be used if they would break your last one. */
export const selfShardCost = (effects: Effect[]) => effects.reduce((n, e) => n + (e.op === 'selfShard' ? e.n : 0), 0);
export const relicCost = (s: GameState, r: RelicCard) => Math.max(0, r.cost - (edictRule(s).relicDiscount ?? 0));
export const ascendCost = (s: GameState, next: ChampionCard) => Math.max(0, next.cost - (edictRule(s).ascendDiscount ?? 0) - (next.star === 3 ? edictRule(s).star3Discount ?? 0 : 0));
export const stars = (n: number) => '★'.repeat(n);
export const champName = (c: ChampionInPlay) => `${top(c).name} ${stars(top(c).star)}`;
export function findChampion(s: GameState, uid: number): ChampionInPlay | null {
  for (const p of s.players) for (const c of p.field) if (c.uid === uid) return c;
  return null;
}
export const behind = (s: GameState, p: PlayerIndex) => s.players[p].crown.length < s.players[rival(p)].crown.length;

export function might(s: GameState, c: ChampionInPlay): number {
  let m = top(c).might + (relicOf(c)?.might ?? 0) + c.mods.might;
  for (const st of staticsOf(c)) {
    if (st.mightIfBehind && behind(s, c.owner)) m += st.mightIfBehind;
    if (st.mightWhileBlocking && c.blocking) m += st.mightWhileBlocking;
    if (st.mightIfRelic && c.relic) m += st.mightIfRelic;
  }
  const mine = originsOf(c);
  for (const a of s.players[c.owner].field) {
    if (a === c) continue;
    for (const st of staticsOf(a)) {
      m += st.auraMight ?? 0;
      if (st.originAura && hasTrait(c, st.originAura.origin)) m += st.originAura.might ?? 0;
    }
  }
  return Math.max(0, m);
}
export function guard(s: GameState, c: ChampionInPlay): number {
  let g = top(c).guard + (relicOf(c)?.guard ?? 0) + c.mods.guard;
  for (const st of staticsOf(c)) if (st.guardIfRelic && c.relic) g += st.guardIfRelic;
  const mine = originsOf(c);
  for (const a of s.players[c.owner].field) {
    if (a === c) continue;
    for (const st of staticsOf(a)) {
      g += st.auraGuard ?? 0;
      if (st.originAura && hasTrait(c, st.originAura.origin)) g += st.originAura.guard ?? 0;
    }
  }
  return Math.max(0, g);
}
export function canAttack(s: GameState, c: ChampionInPlay): boolean {
  return !c.exhausted && !c.noAttack && (c.arrivedTurn < s.turn || hasKeyword(c, 'Charge'));
}
export function canBlock(blocker: ChampionInPlay, attacker: ChampionInPlay): boolean {
  return !hasKeyword(attacker, 'Flight') || hasKeyword(blocker, 'Flight') || hasKeyword(blocker, 'Reach');
}
export function attackBlockReason(s: GameState, c: ChampionInPlay): string | null {
  if (c.exhausted) return `${champName(c)} is sideways (it already acted).`;
  if (c.noAttack) return `${champName(c)} can't attack this turn.`;
  if (c.arrivedTurn >= s.turn && !hasKeyword(c, 'Charge')) return `${champName(c)} arrived this turn (no Charge).`;
  return null;
}

function log(s: GameState, kind: LogKind, text: string, player: PlayerIndex | null = s.active) {
  s.log.push({ n: s.log.length + 1, turn: s.turn, player, kind, text });
}
const P = (p: PlayerIndex) => `P${p + 1}`;

// ── setup ──────────────────────────────────────────────────────────────────────
export interface NewGameOptions { seed: number; decks: [DeckId, DeckId]; first?: PlayerIndex }

export function newGame(opts: NewGameOptions): GameState {
  const s: GameState = {
    rulesVersion: RULES_VERSION, seed: opts.seed >>> 0, rng: opts.seed >>> 0, first: 0, turn: 0, active: 0, phase: 'mulligan',
    players: [null as unknown as PlayerState, null as unknown as PlayerState], combat: null, queue: [], pending: null,
    ending: false, winner: null, endReason: null, nextUid: 1, log: [], lastClash: null,
    stats: { shardsBroken: [0, 0], ascends: [0, 0], schemes: [0, 0] },
    edict: null, bannerTurn: -1,
  };
  s.first = opts.first ?? (nextRandom(s) < 0.5 ? 0 : 1);
  s.active = s.first;
  for (const i of [0, 1] as PlayerIndex[]) {
    const d = DECKS[opts.decks[i]];
    const deck: string[] = [];
    for (const [id, n] of d.main) for (let k = 0; k < n; k++) deck.push(id);
    shuffle(s, deck);
    const crown = deck.splice(deck.length - SHARDS, SHARDS);
    const handSize = i === s.first ? 5 : 6;
    const hand = deck.splice(deck.length - handSize, handSize).reverse();
    s.players[i] = { deckId: opts.decks[i], deck, hand, crown, fallen: [], ascension: [...d.ascension], field: [], schemes: [],
      command: 0, commandMax: 0, ascendedOnTurn: -1, mulliganed: false };
  }
  log(s, 'info', `${P(s.first)} goes first. ${P(rival(s.first))} draws 6 and gets +1 Command on their first turn.`, null);
  s.pending = { kind: 'mulligan', player: s.first };
  return s;
}

function startTurn(s: GameState) {
  const p = s.players[s.active];
  for (const c of p.field) { c.exhausted = false; c.noAttack = false; }
  log(s, 'turn', `Round ${round(s)} — ${P(s.active)}'s turn.`);
  if (round(s) >= STALL_ROUND) {
    log(s, 'info', `"The Crown grows impatient": ${P(s.active)} breaks one of their own shards.`);
    s.queue.push({ kind: 'breakShard', player: s.active, reason: 'stall' });
  }
  s.queue.push({ kind: 'refill', player: s.active });
  if (s.turn !== 0) s.queue.push({ kind: 'draw', player: s.active });
  for (const c of p.field) queueEffects(s, triggers(c, 'rise'), { controller: s.active, source: c.stack[c.stack.length - 1], self: c.uid });
  s.queue.push({ kind: 'enterMain' });
}

function finishTurn(s: GameState) {
  for (const pl of s.players) for (const c of pl.field) { c.mods = { might: 0, guard: 0 }; c.blocking = false; }
  s.ending = false;
  s.turn++;
  s.active = rival(s.active);
  s.phase = 'main';
  startTurn(s);
}

function gameOver(s: GameState, winner: PlayerIndex, reason: string) {
  s.phase = 'over';
  s.winner = winner;
  s.endReason = reason;
  s.pending = null;
  s.queue = [];
  s.combat = null;
  log(s, 'win', `${P(winner)} wins: ${reason}`, winner);
}

// ── the engine loop ────────────────────────────────────────────────────────────
function advance(s: GameState) {
  for (let guardRail = 0; guardRail < 10000; guardRail++) {
    if (s.phase === 'over' || s.pending) return;
    const item = s.queue.shift();
    if (item) { runItem(s, item); continue; }
    if (s.combat) { stepCombat(s); continue; }
    if (s.ending) {
      const pl = s.players[s.active];
      if (pl.hand.length > HAND_LIMIT) { s.pending = { kind: 'discard', player: s.active, count: pl.hand.length - HAND_LIMIT }; return; }
      finishTurn(s);
      continue;
    }
    return;
  }
  throw new Error('Rules engine did not settle (loop guard).');
}

function runItem(s: GameState, item: QueueItem) {
  switch (item.kind) {
    case 'refill': {
      const pl = s.players[item.player];
      pl.commandMax = Math.min(COMMAND_MAX, pl.commandMax + 1);
      pl.command = pl.commandMax + (s.turn === 1 ? 1 : 0) + (edictRule(s).commandBonus ?? 0);
      return;
    }
    case 'draw': {
      const pl = s.players[item.player];
      const c = pl.deck.pop();
      if (c === undefined) {
        log(s, 'info', `${P(item.player)}'s deck is empty: ${P(item.player)} breaks one of their own shards instead of drawing.`, item.player);
        s.queue.unshift({ kind: 'breakShard', player: item.player, reason: 'deckout' });
      } else pl.hand.push(c);
      return;
    }
    case 'enterMain':
      s.phase = 'main';
      return;
    case 'breakShard':
      breakShard(s, item.player, item.reason);
      return;
    case 'effect':
      runEffect(s, item);
      return;
  }
}

function breakShard(s: GameState, player: PlayerIndex, reason: 'attack' | 'breakthrough' | 'stall' | 'deckout' | 'sacrifice') {
  const pl = s.players[player];
  const c = pl.crown.pop();
  if (c === undefined) return;
  pl.hand.push(c);
  if (reason === 'attack' || reason === 'breakthrough') s.stats.shardsBroken[rival(player)]++;
  const why = { attack: 'an unblocked attack', breakthrough: 'Breakthrough', stall: 'the round-10 rule', deckout: 'an empty deck', sacrifice: 'a Void sacrifice' }[reason];
  log(s, 'shard', `${P(player)}'s Crown Shard breaks (${why}). ${pl.crown.length} left. It returns to their hand: ${CARDS[c].name}.`, player);
  if (!pl.crown.length) {
    gameOver(s, rival(player), reason === 'stall' || reason === 'deckout' || reason === 'sacrifice'
      ? `${P(player)}'s last shard broke to ${why}.` : `${P(rival(player))} broke all five of ${P(player)}'s Crown Shards.`);
    return;
  }
  const rule = edictRule(s);
  if (rule.attackShardCommand && (reason === 'attack' || reason === 'breakthrough') && s.bannerTurn !== s.turn) {
    s.bannerTurn = s.turn;
    s.players[rival(player)].command += 1;
    log(s, 'effect', `War Banners: ${P(rival(player))} gains 1 Command for breaking a shard.`, rival(player));
  }
  if (rule.shardDraw) s.queue.unshift({ kind: 'draw', player });
  const def = CARDS[c];
  if (isSpellCard(def) && def.shardfall) s.pending = { kind: 'shardfall', player, card: c };
}

// ── effects ────────────────────────────────────────────────────────────────────
type EffectItem = Extract<QueueItem, { kind: 'effect' }>;

function queueEffects(s: GameState, effects: Effect[] | undefined, base: Omit<EffectItem, 'kind' | 'effect'>, front = false) {
  if (!effects?.length) return;
  const items: EffectItem[] = effects.map((effect) => ({ kind: 'effect', effect, ...base }));
  if (front) s.queue.unshift(...items);
  else s.queue.push(...items);
}

function choiceOptions(s: GameState, item: EffectItem): ChoiceOption[] | null {
  const e = item.effect;
  const me = s.players[item.controller];
  const them = s.players[rival(item.controller)];
  const champOpt = (c: ChampionInPlay): ChoiceOption => ({ key: `u:${c.uid}`, label: `${champName(c)} (${c.owner === item.controller ? 'yours' : 'rival'})` });
  switch (e.op) {
    case 'scorch': return e.target === 'chooseRival' ? them.field.map(champOpt) : null;
    case 'shield':
      if (e.target === 'self') return null;
      return me.field.filter((c) => !c.shield && (e.target === 'chooseOwn' || c.uid !== item.self)).map(champOpt);
    case 'buff': return e.target === 'chooseAny' ? [...me.field, ...them.field].map(champOpt) : e.target === 'chooseRival' ? them.field.map(champOpt) : null;
    case 'readyOther': return me.field.filter((c) => c.exhausted && c.uid !== item.self).map(champOpt);
    case 'deployFromFallen':
      if (me.field.length >= zonesFor(s, item.controller)) return [];
      return me.fallen.map((id, i) => ({ id, i })).filter(({ id }) => CARDS[id].kind === 'champion' && (CARDS[id] as ChampionCard).cost <= e.maxCost)
        .map(({ id, i }) => ({ key: `f:${i}`, label: `${CARDS[id].name} ★ (from your Fallen pile, cost ${(CARDS[id] as ChampionCard).cost})` }));
    case 'equipFree': {
      const holder = item.self !== undefined ? findChampion(s, item.self) : null;
      if (!holder || holder.relic) return [];
      return me.hand.map((id, i) => ({ id, i })).filter(({ id }) => isRelicCard(CARDS[id]) && (CARDS[id] as RelicCard).cost <= e.maxCost)
        .map(({ id, i }) => ({ key: `h:${i}`, label: `${CARDS[id].name} (attach for free)` }));
    }
    case 'returnFallen':
      if (e.what === 'relic') return me.fallen.map((id, i) => ({ id, i })).filter(({ id }) => isRelicCard(CARDS[id]))
        .map(({ id, i }) => ({ key: `f:${i}`, label: `${CARDS[id].name} (Relic, from your Fallen pile)` }));
      return me.fallen.map((id, i) => ({ id, i })).filter(({ id }) => CARDS[id].kind === 'champion')
        .map(({ id, i }) => ({ key: `f:${i}`, label: `${CARDS[id].name} ★ (from your Fallen pile)` }));
    case 'unequip': return [...me.field, ...them.field].filter((c) => c.relic).map(champOpt);
    case 'ascendNow':
      return me.field.filter((c) => nextAscension(s, c) && top(c).star <= (e.maxStar ?? 2)).map(champOpt);
    case 'tuck':
      return me.hand.map((id, i) => ({ key: `h:${i}`, label: `${CARDS[id].name} (to the bottom of your deck)` }));
    case 'deployFree':
      if (me.field.length >= zonesFor(s, item.controller)) return [];
      return me.hand.map((id, i) => ({ id, i })).filter(({ id }) => CARDS[id].kind === 'champion' && (CARDS[id] as ChampionCard).cost <= e.maxCost
        && (!e.family || (CARDS[id] as ChampionCard).family === 'monster' || (CARDS[id] as ChampionCard).family === 'guardian'))
        .map(({ id, i }) => ({ key: `h:${i}`, label: `${CARDS[id].name} ★ (cost ${(CARDS[id] as ChampionCard).cost})` }));
    case 'mend':
      if (me.crown.length >= SHARDS) return [];
      return me.hand.map((id, i) => ({ key: `h:${i}`, label: `${CARDS[id].name} (becomes a face-down shard)` }));
    case 'gateBlock': {
      const att = s.combat ? findChampion(s, s.combat.attacker) : null;
      if (!att || !s.combat || s.combat.defender !== null) return [];
      return me.field.filter((b) => canBlock(b, att)).map(champOpt);
    }
    default: return null;
  }
}

const PROMPTS: Partial<Record<Effect['op'], string>> = {
  scorch: 'Choose a rival champion to Scorch.',
  shield: 'Choose one of your champions to Shield.',
  buff: 'Choose a champion.',
  returnFallen: 'Choose a ★ champion to return from your Fallen pile to your hand.',
  deployFree: 'Choose a ★ champion to deploy for free.',
  deployFromFallen: 'Choose a ★ champion to deploy from your Fallen pile for free.',
  equipFree: 'Choose a Relic from your hand to attach for free.',
  readyOther: 'Choose one of your sideways champions to ready.',
  ascendNow: 'Choose one of your champions to Ascend for free.',
  tuck: 'Choose a card from your hand to put on the bottom of your deck.',
  unequip: 'Choose a champion whose Relic returns to its owner\'s hand.',
  mend: 'Choose a card from your hand to become a new Crown Shard.',
  gateBlock: 'Choose a champion to ready and block the attack.',
};

function runEffect(s: GameState, item: EffectItem) {
  const cond = item.effect.when;
  if (cond === 'behind' && !behind(s, item.controller)) return;
  if (cond === 'ahead' && !(s.players[item.controller].crown.length > s.players[rival(item.controller)].crown.length)) return;
  const options = choiceOptions(s, item);
  if (options !== null) {
    const optional = 'optional' in item.effect ? !!item.effect.optional : false;
    if (!options.length) { log(s, 'effect', `${CARDS[item.source].name}: no legal target, so that part does nothing.`, item.controller); return; }
    if (options.length === 1 && !optional) { resolveEffect(s, item, options[0].key); return; }
    s.pending = { kind: 'choose', player: item.controller, prompt: `${CARDS[item.source].name}: ${PROMPTS[item.effect.op] ?? 'Choose.'}`, options, optional, item };
    return;
  }
  resolveEffect(s, item, null);
}

function resolveEffect(s: GameState, item: EffectItem, key: string | null) {
  const e = item.effect;
  const p = item.controller;
  const me = s.players[p];
  const src = CARDS[item.source].name;
  const byKey = (k: string | null) => (k && k.startsWith('u:') ? findChampion(s, Number(k.slice(2))) : null);
  const ctxChamp = (which: 'attacker' | 'defender') => {
    const uid = item.ctx?.[which];
    return uid === undefined ? null : findChampion(s, uid);
  };
  switch (e.op) {
    case 'scorch': {
      const t = e.target === 'chooseRival' ? byKey(key) : ctxChamp(e.target);
      if (!t) return;
      t.mods.guard -= e.n;
      log(s, 'effect', `${src}: ${champName(t)} gets −${e.n} Guard this turn (Scorch ${e.n}).`, p);
      return;
    }
    case 'scorchAll': {
      const field = s.players[rival(p)].field;
      for (const c of field) c.mods.guard -= e.n;
      if (field.length) log(s, 'effect', `${src}: every rival champion gets −${e.n} Guard this turn (Scorch ${e.n}).`, p);
      return;
    }
    case 'shield': {
      const t = e.target === 'self' ? (item.self !== undefined ? findChampion(s, item.self) : null) : byKey(key);
      if (!t) return;
      t.shield = true;
      log(s, 'effect', `${src}: ${champName(t)} gains a Shield.`, p);
      return;
    }
    case 'shieldAll':
      for (const c of me.field) c.shield = true;
      log(s, 'effect', `${src}: every champion ${P(p)} controls gains a Shield.`, p);
      return;
    case 'buffAll': {
      if (e.maxField !== undefined && me.field.length > e.maxField) { log(s, 'effect', `${src}: you control more than ${e.maxField} champions, so it does nothing.`, p); return; }
      const m = e.might + (e.extraIfBehind && behind(s, p) ? e.extraIfBehind : 0);
      for (const c of me.field) { c.mods.might += m; c.mods.guard += e.guard ?? 0; }
      log(s, 'effect', `${src}: ${P(p)}'s champions get ${m >= 0 ? '+' : ''}${m} Might${e.guard ? ` and ${e.guard > 0 ? '+' : ''}${e.guard} Guard` : ''} this turn.`, p);
      return;
    }
    case 'buffTrait': {
      const hit = me.field.filter((c) => hasTrait(c, e.trait));
      for (const c of hit) { c.mods.might += e.might; c.mods.guard += e.guard ?? 0; }
      log(s, 'effect', `${src}: ${hit.length} champion${hit.length === 1 ? '' : 's'} (${e.trait}) get +${e.might} Might${e.guard ? ` and +${e.guard} Guard` : ''} this turn.`, p);
      return;
    }
    case 'selfShard':
      for (let k = 0; k < e.n; k++) s.queue.unshift({ kind: 'breakShard', player: p, reason: 'sacrifice' });
      log(s, 'effect', `${src}: ${P(p)} breaks ${e.n === 1 ? 'one' : e.n} of their own shards.`, p);
      return;
    case 'extraZone':
      me.extraZones = (me.extraZones ?? 0) + e.n;
      log(s, 'effect', `${src}: ${P(p)} has ${zonesFor(s, p)} Champion Zones for the rest of the game.`, p);
      return;
    case 'coinFlip': {
      const heads = nextRandom(s) < 0.5;
      log(s, 'effect', `${src}: the coin lands ${heads ? 'heads' : 'tails'}.`, p);
      queueEffects(s, heads ? e.heads : e.tails, { controller: p, source: item.source, self: item.self, ctx: item.ctx }, true);
      return;
    }
    case 'tuck': {
      if (!key) return;
      const [id] = me.hand.splice(Number(key.slice(2)), 1);
      me.deck.unshift(id);
      log(s, 'effect', `${src}: ${P(p)} puts a card on the bottom of their deck.`, p);
      return;
    }
    case 'ascendNow': {
      const c = byKey(key);
      const next = c ? nextAscension(s, c) : null;
      if (!c || !next) return;
      me.ascension.splice(me.ascension.indexOf(next.id), 1);
      c.stack.push(next.id);
      c.ascendedTurn = s.turn;
      if (!e.stayReady) c.exhausted = true;
      s.stats.ascends[p]++;
      log(s, 'ascend', `${P(p)} ASCENDS ${next.name} to ${stars(next.star)} for free (${src}).${e.stayReady ? ' It stays standing.' : ' It turns sideways.'}`, p);
      queueEffects(s, next.ascend, { controller: p, source: next.id, self: c.uid }, true);
      return;
    }
    case 'buffOthers':
      for (const c of me.field) if (c.uid !== item.self) c.mods.might += e.might;
      log(s, 'effect', `${src}: ${P(p)}'s other champions get +${e.might} Might this turn.`, p);
      return;
    case 'buff': {
      const t = e.target === 'chooseAny' || e.target === 'chooseRival' ? byKey(key) : ctxChamp(e.target);
      if (!t) return;
      t.mods.might += e.might;
      t.mods.guard += e.guard;
      const parts = [e.might ? `${e.might > 0 ? '+' : '−'}${Math.abs(e.might)} Might` : '', e.guard ? `+${e.guard} Guard` : ''].filter(Boolean).join(' and ');
      log(s, 'effect', `${src}: ${champName(t)} gets ${parts} this turn.`, p);
      return;
    }
    case 'draw': {
      const who = e.who === 'rival' ? rival(p) : p;
      for (let k = 0; k < e.n; k++) s.queue.unshift({ kind: 'draw', player: who });
      log(s, 'effect', `${src}: ${P(who)} draws ${e.n}.`, p);
      return;
    }
    case 'command': {
      const who = e.who === 'rival' ? rival(p) : p;
      s.players[who].command += e.n;
      log(s, 'effect', `${src}: ${P(who)} gains ${e.n} Command.`, p);
      return;
    }
    case 'summon': {
      let made = 0;
      for (let k = 0; k < e.count; k++) {
        if (me.field.length >= zonesFor(s, p)) break;
        const c: ChampionInPlay = { uid: s.nextUid++, owner: p, stack: [e.token], exhausted: false, arrivedTurn: s.turn, ascendedTurn: -1,
          shield: false, mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, relic: null, token: true };
        me.field.push(c);
        made++;
      }
      if (made) log(s, 'effect', `${src}: ${P(p)} summons ${made} ${CARDS[e.token].name} token${made > 1 ? 's' : ''}.`, p);
      else log(s, 'effect', `${src}: no free Champion Zone, so nothing is summoned.`, p);
      return;
    }
    case 'buffRivals': {
      for (const c of s.players[rival(p)].field) { c.mods.might += e.might; c.mods.guard += e.guard ?? 0; }
      if (s.players[rival(p)].field.length) log(s, 'effect', `${src}: every rival champion gets ${e.might} Might${e.guard ? ` and ${e.guard} Guard` : ''} this turn.`, p);
      return;
    }
    case 'unequip': {
      const t = byKey(key);
      if (!t || !t.relic) return;
      s.players[t.owner].hand.push(t.relic);
      log(s, 'effect', `${src}: ${CARDS[t.relic].name} returns from ${champName(t)} to its owner's hand.`, p);
      t.relic = null;
      return;
    }
    case 'returnFallen': {
      if (!key) return;
      const i = Number(key.slice(2));
      const [id] = me.fallen.splice(i, 1);
      me.hand.push(id);
      log(s, 'effect', `${src}: ${CARDS[id].name} returns from the Fallen pile to ${P(p)}'s hand.`, p);
      return;
    }
    case 'deployFree': {
      if (!key) return;
      const i = Number(key.slice(2));
      placeChampion(s, p, i, true);
      return;
    }
    case 'equipFree': {
      const holder = item.self !== undefined ? findChampion(s, item.self) : null;
      if (!key || !holder) return;
      const [id] = me.hand.splice(Number(key.slice(2)), 1);
      holder.relic = id;
      log(s, 'effect', `${src}: ${CARDS[id].name} is attached to ${champName(holder)} for free.`, p);
      return;
    }
    case 'deployFromFallen': {
      if (!key) return;
      placeChampion(s, p, Number(key.slice(2)), true, 'fallen');
      return;
    }
    case 'readyOther': {
      const t = byKey(key);
      if (!t) return;
      t.exhausted = false;
      log(s, 'effect', `${src}: ${champName(t)} stands back up.`, p);
      return;
    }
    case 'readySelf': {
      const c = item.self !== undefined ? findChampion(s, item.self) : null;
      if (!c) return;
      c.exhausted = false;
      log(s, 'effect', `${src}: ${champName(c)} ignores the rule and stays standing.`, p);
      return;
    }
    case 'mend': {
      if (!key) return;
      const i = Number(key.slice(2));
      const [id] = me.hand.splice(i, 1);
      me.crown.push(id);
      log(s, 'effect', `${src}: Mend 1 — ${P(p)} adds a face-down Crown Shard (${me.crown.length} now).`, p);
      return;
    }
    case 'defeatGuardAtMost': {
      const victims = s.players[rival(p)].field.filter((c) => guard(s, c) <= e.n);
      if (!victims.length) log(s, 'effect', `${src}: no rival champion has Guard ${e.n} or less.`, p);
      for (const c of victims) tryDefeat(s, c, `${src}`);
      return;
    }
    case 'stopOthersAttacking':
      for (const c of me.field) if (c.uid !== item.self) c.noAttack = true;
      log(s, 'effect', `${src}: ${P(p)}'s other champions can't attack this turn.`, p);
      return;
    case 'readyOncePerTurn': {
      const c = item.self !== undefined ? findChampion(s, item.self) : null;
      if (!c || s.active !== p || c.readiedTurn === s.turn) return;
      c.readiedTurn = s.turn;
      c.exhausted = false;
      log(s, 'effect', `${src}: ${champName(c)} stands back up, ready to attack again.`, p);
      return;
    }
    case 'gateBlock': {
      const b = byKey(key);
      if (!b || !s.combat) return;
      b.exhausted = false;
      log(s, 'effect', `${src}: ${champName(b)} is readied to block.`, p);
      setBlocker(s, b);
      return;
    }
    case 'cancelAttack':
      if (s.combat) {
        const a = findChampion(s, s.combat.attacker);
        log(s, 'effect', `${src}: ${a ? champName(a) : 'The'} attack ends. No shards break.`, p);
        s.combat = null;
      }
      return;
  }
}

function placeChampion(s: GameState, p: PlayerIndex, index: number, free: boolean, from: 'hand' | 'fallen' = 'hand') {
  const pl = s.players[p];
  const [id] = (from === 'hand' ? pl.hand : pl.fallen).splice(index, 1);
  const def = champion(id);
  if (!free) pl.command -= def.cost;
  const c: ChampionInPlay = { uid: s.nextUid++, owner: p, stack: [id], exhausted: false, arrivedTurn: s.turn, ascendedTurn: -1,
    shield: false, mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, relic: null, token: false };
  pl.field.push(c);
  log(s, 'play', `${P(p)} deploys ${def.name} ★ (Might ${def.might}, Guard ${def.guard})${from === 'fallen' ? ' from the Fallen pile' : ''}${free ? ' for free' : ` for ${def.cost} Command`}.`, p);
  queueEffects(s, def.arrive, { controller: p, source: id, self: c.uid });
}

function tryDefeat(s: GameState, c: ChampionInPlay, why: string): boolean {
  if (c.shield) {
    c.shield = false;
    log(s, 'effect', `${champName(c)}'s Shield breaks instead of it being defeated (${why}).`, c.owner);
    return false;
  }
  const pl = s.players[c.owner];
  const i = pl.field.indexOf(c);
  if (i < 0) return false;
  pl.field.splice(i, 1);
  const rule = edictRule(s);
  if (c.token) log(s, 'effect', `${champName(c)} is defeated (${why}) and vanishes (token).`, c.owner);
  else {
    pl.fallen.push(...c.stack);
    log(s, 'effect', `${champName(c)} is defeated (${why}) and goes to the Fallen pile${c.stack.length > 1 ? ' with its whole stack' : ''}.`, c.owner);
  }
  if (c.relic) {
    if (rule.relicReturn) { pl.hand.push(c.relic); log(s, 'effect', `Relic Tide: ${CARDS[c.relic].name} returns to its owner's hand.`, c.owner); }
    else pl.fallen.push(c.relic);
  }
  queueEffects(s, triggers(c, 'defeated'), { controller: c.owner, source: c.stack[c.stack.length - 1] });
  if (rule.monsterDraw && (top(c).family === 'monster' || top(c).family === 'guardian')) {
    s.queue.push({ kind: 'draw', player: rival(c.owner) });
    log(s, 'effect', `Monster Tithe: ${P(rival(c.owner))} draws a card.`, rival(c.owner));
  }
  return true;
}

// ── combat ─────────────────────────────────────────────────────────────────────
function setBlocker(s: GameState, b: ChampionInPlay) {
  const cbt = s.combat!;
  const att = findChampion(s, cbt.attacker)!;
  cbt.defender = b.uid;
  b.blocking = true;
  if (!hasKeyword(b, 'Bulwark')) b.exhausted = true;
  log(s, 'attack', `${champName(b)} blocks ${champName(att)}${hasKeyword(b, 'Bulwark') ? ' (Bulwark: it stays standing)' : ''}.`, b.owner);
  queueEffects(s, triggers(b, 'block'), { controller: b.owner, source: b.stack[b.stack.length - 1], self: b.uid, ctx: { attacker: att.uid, defender: b.uid } });
}

function applyDefenderEffects(s: GameState) {
  const cbt = s.combat!;
  if (!cbt.defenderEffects.length || cbt.defender === null) return;
  const a = findChampion(s, cbt.attacker);
  const effects = cbt.defenderEffects;
  cbt.defenderEffects = [];
  if (!a) return;
  for (const effect of effects) {
    resolveEffect(s, { kind: 'effect', effect, controller: a.owner, source: a.stack[a.stack.length - 1], self: a.uid, ctx: { attacker: a.uid, defender: cbt.defender } }, null);
  }
}

export function responseOptions(s: GameState, q: PlayerIndex): ChoiceOption[] {
  const cbt = s.combat;
  if (!cbt) return [];
  const pl = s.players[q];
  const att = findChampion(s, cbt.attacker);
  if (!att) return [];
  const out: ChoiceOption[] = [];
  const defending = q !== cbt.attackerOwner;
  if (defending) {
    for (const sc of pl.schemes) {
      const d = spell(sc.card);
      if (sc.setTurn >= s.turn || d.cost > pl.command) continue;
      const ok = d.when === 'rivalAttacks' || (d.when === 'crownAttacked' && cbt.target === 'crown')
        || (d.when === 'crownUnblocked' && cbt.target === 'crown' && cbt.defender === null)
        || (d.when === 'clash' && cbt.defender !== null);
      if (!ok) continue;
      if (d.effects.some((e) => e.op === 'shield') && !pl.field.some((c) => !c.shield)) continue;
      if (d.effects.some((e) => e.op === 'gateBlock') && !pl.field.some((b) => canBlock(b, att))) continue;
      out.push({ key: `s:${sc.sid}`, label: `Spring ${d.name} (${d.cost} Command)` });
    }
  }
  if (cbt.defender !== null) {
    pl.hand.forEach((id, i) => {
      const d = CARDS[id];
      if (isSpellCard(d) && d.swift && d.cost <= pl.command) out.push({ key: `h:${i}`, label: `Cast ${d.name} (${d.cost} Command, Swift)` });
    });
  }
  return out;
}

function stepCombat(s: GameState) {
  const cbt = s.combat!;
  const att = findChampion(s, cbt.attacker);
  if (!att) { log(s, 'attack', 'The attacker is gone, so the attack ends.'); s.combat = null; return; }
  const q = rival(cbt.attackerOwner);
  switch (cbt.stage) {
    case 'declared': {
      if (cbt.target !== 'crown') {
        const d = findChampion(s, cbt.target);
        if (!d) { log(s, 'attack', 'The target is gone, so the attack ends.'); s.combat = null; return; }
        cbt.defender = d.uid;
        queueEffects(s, triggers(d, 'attacked'), { controller: d.owner, source: d.stack[d.stack.length - 1], self: d.uid, ctx: { attacker: att.uid, defender: d.uid } });
        cbt.stage = 'respondDefender';
        return;
      }
      const options = s.players[q].field.filter((b) => !b.exhausted && canBlock(b, att)).map((b) => b.uid);
      cbt.stage = 'respondDefender';
      if (options.length) s.pending = { kind: 'block', player: q, options };
      return;
    }
    case 'block':
      cbt.stage = 'respondDefender';
      return;
    case 'respondDefender': {
      applyDefenderEffects(s);
      cbt.stage = 'respondAttacker';
      const options = responseOptions(s, q);
      if (options.length) s.pending = { kind: 'respond', player: q, options };
      return;
    }
    case 'respondAttacker': {
      applyDefenderEffects(s);
      cbt.stage = 'clash';
      const options = responseOptions(s, cbt.attackerOwner);
      if (options.length) s.pending = { kind: 'respond', player: cbt.attackerOwner, options };
      return;
    }
    case 'clash':
      resolveClash(s, att);
      if (s.combat) {
        const d = s.combat.defender !== null ? findChampion(s, s.combat.defender) : null;
        if (d) d.blocking = false;
      }
      s.combat = null;
      return;
  }
}

function resolveClash(s: GameState, att: ChampionInPlay) {
  const cbt = s.combat!;
  const q = rival(cbt.attackerOwner);
  const def = cbt.defender !== null ? findChampion(s, cbt.defender) : null;
  if (!def) {
    if (cbt.target === 'crown') {
      const n = top(att).crown;
      log(s, 'clash', `${champName(att)} is unblocked and strikes ${P(q)}'s Crown: ${n} shard${n > 1 ? 's' : ''} break${n > 1 ? '' : 's'}.`, att.owner);
      for (let k = 0; k < n; k++) s.queue.push({ kind: 'breakShard', player: q, reason: 'attack' });
    }
    return;
  }
  const am = might(s, att), ag = guard(s, att), dm = might(s, def), dg = guard(s, def);
  const ambush = hasKeyword(att, 'Ambush') && cbt.target !== 'crown' && cbt.targetWasExhausted;
  let dDies = am > 0 && am >= dg;
  let aDies = dm > 0 && dm >= ag;
  const notes: string[] = [];
  const report: ClashReport = { n: s.log.length + 1, attacker: champName(att), defender: champName(def), attackerMight: am, attackerGuard: ag,
    defenderMight: dm, defenderGuard: dg, attackerDefeated: false, defenderDefeated: false, notes };
  log(s, 'clash', `Clash: ${champName(att)} Might ${am} vs ${champName(def)} Guard ${dg} → ${dDies ? `${champName(def)} falls` : `${champName(def)} holds`}; `
    + `${champName(def)} Might ${dm} vs ${champName(att)} Guard ${ag} → ${aDies ? `${champName(att)} falls` : `${champName(att)} holds`}.`, att.owner);
  let dGone = false;
  if (ambush && dDies) {
    notes.push('Ambush: it strikes first.');
    dGone = tryDefeat(s, def, 'clash');
    if (dGone) { aDies = false; notes.push(`${champName(def)} can't strike back.`); }
    if (aDies) report.attackerDefeated = tryDefeat(s, att, 'clash');
  } else {
    if (dDies) dGone = tryDefeat(s, def, 'clash');
    if (aDies) report.attackerDefeated = tryDefeat(s, att, 'clash');
  }
  if (dDies && !dGone) notes.push(`${report.defender}'s Shield saved it.`);
  if (aDies && !report.attackerDefeated && !(ambush && dGone)) notes.push(`${report.attacker}'s Shield saved it.`);
  report.defenderDefeated = dGone;
  dDies = dGone;
  const attAlive = s.players[att.owner].field.includes(att);
  if (dGone && attAlive) queueEffects(s, triggers(att, 'defeats'), { controller: att.owner, source: att.stack[att.stack.length - 1], self: att.uid });
  if (dGone && attAlive && cbt.target === 'crown') {
    notes.push('Breakthrough: 1 shard breaks.');
    log(s, 'clash', `Breakthrough: ${report.attacker} beat its blocker and survived, so 1 shard breaks.`, att.owner);
    s.queue.push({ kind: 'breakShard', player: q, reason: 'breakthrough' });
  }
  s.lastClash = report;
}

// ── turn actions ───────────────────────────────────────────────────────────────
export function actor(s: GameState): PlayerIndex | null {
  if (s.phase === 'over') return null;
  return s.pending ? s.pending.player : s.active;
}

export function nextAscension(s: GameState, c: ChampionInPlay): ChampionCard | null {
  const f = top(c);
  if (f.star >= 3) return null;
  const id = `${f.lineId}-${f.star + 1}`;
  return s.players[c.owner].ascension.includes(id) ? champion(id) : null;
}

/** Why this champion can't Ascend right now, or null when it can. */
export function ascendBlockReason(s: GameState, c: ChampionInPlay): string | null {
  const pl = s.players[c.owner];
  const next = nextAscension(s, c);
  if (!next) return top(c).star >= 3 ? 'Already ★★★.' : `No ${stars(top(c).star + 1)} form for ${top(c).name} in your Ascension Pile.`;
  if (s.active !== c.owner) return "Only on your own turn.";
  if (s.phase !== 'main' && s.phase !== 'after') return 'Ascend during your Main step or after battle.';
  if (pl.ascendedOnTurn === s.turn) return 'You already Ascended this turn.';
  if (c.arrivedTurn >= s.turn) return 'It must have been on the field when your turn began.';
  if (pl.command < ascendCost(s, next)) return `Needs ${ascendCost(s, next)} Command (you have ${pl.command}).`;
  return null;
}

/** For each card in a player's hand: the action it allows now, or why not. */
export function handPlayability(s: GameState, p: PlayerIndex): { action: 'deploy' | 'cast' | 'setScheme' | 'equip' | 'playEdict' | null; reason: string }[] {
  const pl = s.players[p];
  const myMain = s.active === p && s.phase === 'main' && !s.pending && !s.combat;
  return pl.hand.map((id) => {
    const d = CARDS[id];
    if (!myMain) return { action: null, reason: s.active !== p ? "It's your rival's turn." : s.phase === 'main' ? 'Finish the current step first.' : 'Cards are played in your Main step.' };
    if (isChampionCard(d)) {
      if (pl.command < d.cost) return { action: null, reason: `Needs ${d.cost} Command (you have ${pl.command}).` };
      if (pl.field.length >= zonesFor(s, p)) return { action: null, reason: `All ${zonesFor(s, p)} Champion Zones are full.` };
      return { action: 'deploy', reason: `Deploy for ${d.cost} Command.` };
    }
    if (isRelicCard(d)) {
      const cost = relicCost(s, d);
      if (pl.command < cost) return { action: null, reason: `Needs ${cost} Command (you have ${pl.command}).` };
      if (!pl.field.some((c) => !c.relic)) return { action: null, reason: 'You need a champion without a Relic to attach it to.' };
      return { action: 'equip', reason: `Attach to one of your champions for ${cost} Command.` };
    }
    if (isEdictCard(d)) {
      if (pl.command < d.cost) return { action: null, reason: `Needs ${d.cost} Command (you have ${pl.command}).` };
      return { action: 'playEdict', reason: `Proclaim for ${d.cost} Command. It replaces the Edict in play.` };
    }
    if (d.kind === 'scheme') {
      if (pl.schemes.length >= SCHEME_ZONES) return { action: null, reason: 'All 3 Scheme Zones are full.' };
      return { action: 'setScheme', reason: `Set face-down for free. Spring it on your rival's turn for ${d.cost} Command.` };
    }
    if (pl.command < d.cost) return { action: null, reason: `Needs ${d.cost} Command (you have ${pl.command}).` };
    if (isSpellCard(d) && selfShardCost(d.effects) >= pl.crown.length) return { action: null, reason: 'It would break your last shard.' };
    return { action: 'cast', reason: `Cast for ${d.cost} Command.` };
  });
}

export function legalActions(s: GameState): Action[] {
  const p = actor(s);
  if (p === null) return [];
  const pend = s.pending;
  const pl = s.players[p];
  if (pend) {
    switch (pend.kind) {
      case 'mulligan': return [{ type: 'mulligan', redraw: false }, { type: 'mulligan', redraw: true }];
      case 'choose': return [...pend.options.map((o) => ({ type: 'choose' as const, key: o.key })), ...(pend.optional ? [{ type: 'choose' as const, key: null }] : [])];
      case 'block': return [{ type: 'block', uid: null }, ...pend.options.map((uid) => ({ type: 'block' as const, uid }))];
      case 'respond': return [{ type: 'respond', key: null }, ...pend.options.map((o) => ({ type: 'respond' as const, key: o.key }))];
      case 'shardfall': return [{ type: 'shardfall', use: true }, { type: 'shardfall', use: false }];
      case 'discard': return pl.hand.map((_, handIndex) => ({ type: 'discard' as const, handIndex }));
    }
  }
  const out: Action[] = [];
  if (s.phase === 'main') {
    handPlayability(s, p).forEach((h, handIndex) => {
      if (h.action === 'equip') { for (const c of pl.field) if (!c.relic) out.push({ type: 'equip', handIndex, uid: c.uid }); }
      else if (h.action) out.push({ type: h.action, handIndex } as Action);
    });
    if (edictRule(s).cycle && pl.cycledOnTurn !== s.turn && pl.command >= 1) pl.hand.forEach((_, handIndex) => out.push({ type: 'cycle', handIndex }));
    out.push({ type: 'toBattle' });
  }
  if (s.phase === 'main' || s.phase === 'after') for (const c of pl.field) if (!ascendBlockReason(s, c)) out.push({ type: 'ascend', uid: c.uid });
  if (s.phase === 'battle') {
    for (const c of pl.field) {
      if (!canAttack(s, c)) continue;
      out.push({ type: 'attack', uid: c.uid, target: 'crown' });
      for (const t of s.players[rival(p)].field) out.push({ type: 'attack', uid: c.uid, target: t.uid });
    }
    out.push({ type: 'endBattle' });
  }
  out.push({ type: 'endTurn' });
  return out;
}

const sameAction = (a: Action, b: Action) => JSON.stringify(a) === JSON.stringify(b);

/** Apply one action for one player. Illegal actions leave the state unchanged and return an error. */
export function apply(prev: GameState, player: PlayerIndex, action: Action): ApplyResult {
  if (prev.phase === 'over') return { state: prev, error: 'The game is over.' };
  if (actor(prev) !== player) return { state: prev, error: `It is P${(actor(prev) ?? 0) + 1}'s decision.` };
  if (!legalActions(prev).some((a) => sameAction(a, action))) return { state: prev, error: explainIllegal(prev, player, action) };
  const s: GameState = structuredClone(prev);
  const pl = s.players[player];
  const pend = s.pending;
  switch (action.type) {
    case 'mulligan': {
      if (action.redraw) {
        const n = pl.hand.length;
        pl.deck.push(...pl.hand.splice(0));
        shuffle(s, pl.deck);
        pl.hand = pl.deck.splice(pl.deck.length - n, n).reverse();
        log(s, 'info', `${P(player)} shuffles their hand back and draws ${n} new cards.`, player);
      } else log(s, 'info', `${P(player)} keeps their opening hand.`, player);
      pl.mulliganed = true;
      s.pending = player === s.first ? { kind: 'mulligan', player: rival(s.first) } : null;
      if (!s.pending) { s.phase = 'main'; startTurn(s); }
      break;
    }
    case 'deploy':
      placeChampion(s, player, action.handIndex, false);
      break;
    case 'cast': {
      const [id] = pl.hand.splice(action.handIndex, 1);
      const d = spell(id);
      pl.command -= d.cost;
      pl.fallen.push(id);
      log(s, 'play', `${P(player)} casts ${d.name} (${d.cost} Command).`, player);
      queueEffects(s, d.effects, { controller: player, source: id });
      break;
    }
    case 'setScheme': {
      const [id] = pl.hand.splice(action.handIndex, 1);
      pl.schemes.push({ sid: s.nextUid++, card: id, setTurn: s.turn });
      log(s, 'play', `${P(player)} sets a Scheme face-down.`, player);
      break;
    }
    case 'ascend': {
      const c = findChampion(s, action.uid)!;
      const next = nextAscension(s, c)!;
      const paid = ascendCost(s, next);
      pl.command -= paid;
      pl.ascension.splice(pl.ascension.indexOf(next.id), 1);
      c.stack.push(next.id);
      c.ascendedTurn = s.turn;
      c.exhausted = true;
      pl.ascendedOnTurn = s.turn;
      s.stats.ascends[player]++;
      log(s, 'ascend', `${P(player)} ASCENDS ${next.name} to ${stars(next.star)} for ${paid} Command (Might ${next.might}, Guard ${next.guard}). It turns sideways.`, player);
      queueEffects(s, next.ascend, { controller: player, source: next.id, self: c.uid });
      break;
    }
    case 'equip': {
      const [id] = pl.hand.splice(action.handIndex, 1);
      const r = relic(id);
      const cost = relicCost(s, r);
      pl.command -= cost;
      const c = findChampion(s, action.uid)!;
      c.relic = id;
      log(s, 'play', `${P(player)} attaches ${r.name} to ${champName(c)} (${cost} Command).`, player);
      break;
    }
    case 'playEdict': {
      const [id] = pl.hand.splice(action.handIndex, 1);
      const d = edict(id);
      pl.command -= d.cost;
      if (s.edict) {
        const old = s.players[s.edict.owner];
        old.fallen.push(s.edict.card);
        old.edictCard = null;
        log(s, 'play', `The Edict ${CARDS[s.edict.card].name} ends.`, s.edict.owner);
      }
      s.edict = { card: id, owner: player };
      pl.edictCard = id;
      log(s, 'scheme', `${P(player)} proclaims an Edict: ${d.name}! ${d.text}`, player);
      break;
    }
    case 'cycle': {
      const [id] = pl.hand.splice(action.handIndex, 1);
      pl.command -= 1;
      pl.deck.unshift(id);
      pl.cycledOnTurn = s.turn;
      s.queue.push({ kind: 'draw', player });
      log(s, 'play', `${P(player)} puts a card on the bottom of their deck and draws (The Open Market).`, player);
      break;
    }
    case 'toBattle':
      s.phase = 'battle';
      log(s, 'info', `${P(player)} moves to battle.`, player);
      break;
    case 'attack': {
      const a = findChampion(s, action.uid)!;
      const t = action.target === 'crown' ? null : findChampion(s, action.target)!;
      a.exhausted = true;
      s.combat = { attacker: a.uid, attackerOwner: player, target: action.target, defender: null, stage: 'declared',
        targetWasExhausted: !!t?.exhausted, defenderEffects: [] };
      log(s, 'attack', `${champName(a)} (Might ${might(s, a)}) attacks ${t ? `${champName(t)} (Guard ${guard(s, t)})` : `${P(rival(player))}'s Crown`}.`, player);
      for (const e of triggers(a, 'attack')) {
        if ('target' in e && e.target === 'defender') s.combat.defenderEffects.push(e);
        else queueEffects(s, [e], { controller: player, source: a.stack[a.stack.length - 1], self: a.uid, ctx: { attacker: a.uid } });
      }
      break;
    }
    case 'endBattle':
      s.phase = 'after';
      break;
    case 'endTurn':
      s.ending = true;
      break;
    case 'choose': {
      if (pend?.kind !== 'choose') break;
      s.pending = null;
      if (action.key === null) log(s, 'effect', `${CARDS[pend.item.source].name}: ${P(player)} chooses not to use that part.`, player);
      else resolveEffect(s, pend.item, action.key);
      break;
    }
    case 'block': {
      s.pending = null;
      if (action.uid === null) {
        const a = findChampion(s, s.combat!.attacker)!;
        log(s, 'attack', `${P(player)} does not block ${champName(a)}.`, player);
      } else setBlocker(s, findChampion(s, action.uid)!);
      break;
    }
    case 'respond': {
      s.pending = null;
      if (action.key === null) break;
      const ctx = { attacker: s.combat!.attacker, defender: s.combat!.defender ?? undefined };
      if (action.key.startsWith('s:')) {
        const sid = Number(action.key.slice(2));
        const sc = pl.schemes.find((x) => x.sid === sid)!;
        const d = spell(sc.card);
        pl.schemes.splice(pl.schemes.indexOf(sc), 1);
        pl.command -= d.cost;
        pl.fallen.push(sc.card);
        s.stats.schemes[player]++;
        log(s, 'scheme', `${P(player)} springs ${d.name}! ${d.text}`, player);
        queueEffects(s, d.effects, { controller: player, source: sc.card, ctx }, true);
      } else {
        const i = Number(action.key.slice(2));
        const [id] = pl.hand.splice(i, 1);
        const d = spell(id);
        pl.command -= d.cost;
        pl.fallen.push(id);
        log(s, 'scheme', `${P(player)} casts ${d.name} (Swift).`, player);
        queueEffects(s, d.effects, { controller: player, source: id, ctx }, true);
      }
      break;
    }
    case 'shardfall': {
      if (pend?.kind !== 'shardfall') break;
      s.pending = null;
      const d = spell(pend.card);
      if (!action.use) { log(s, 'info', `${P(player)} keeps ${d.name} in hand.`, player); break; }
      const i = pl.hand.lastIndexOf(pend.card);
      if (d.kind === 'scheme') {
        if (pl.schemes.length >= SCHEME_ZONES) { log(s, 'info', `No free Scheme Zone: ${d.name} stays in hand.`, player); break; }
        pl.hand.splice(i, 1);
        pl.schemes.push({ sid: s.nextUid++, card: pend.card, setTurn: s.turn });
        log(s, 'scheme', `Shardfall! ${P(player)} sets ${d.name} face-down for free.`, player);
      } else {
        pl.hand.splice(i, 1);
        pl.fallen.push(pend.card);
        log(s, 'scheme', `Shardfall! ${P(player)} casts ${d.name} for free.`, player);
        queueEffects(s, d.effects, { controller: player, source: pend.card }, true);
      }
      break;
    }
    case 'discard': {
      const [id] = pl.hand.splice(action.handIndex, 1);
      pl.fallen.push(id);
      log(s, 'info', `${P(player)} discards ${CARDS[id].name} (hand limit ${HAND_LIMIT}).`, player);
      s.pending = pl.hand.length > HAND_LIMIT ? { kind: 'discard', player, count: pl.hand.length - HAND_LIMIT } : null;
      break;
    }
  }
  advance(s);
  return { state: s, error: null };
}

/** Plain-language reason an action is not allowed. */
export function explainIllegal(s: GameState, player: PlayerIndex, a: Action): string {
  const pl = s.players[player];
  switch (a.type) {
    case 'deploy': case 'cast': case 'setScheme':
      return handPlayability(s, player)[a.handIndex]?.reason ?? 'That card is not in your hand.';
    case 'ascend': {
      const c = findChampion(s, a.uid);
      return c && c.owner === player ? ascendBlockReason(s, c) ?? 'Not allowed now.' : 'That is not your champion.';
    }
    case 'attack': {
      if (s.phase !== 'battle') return 'Attacks happen in the Battle step. Press "To battle" first.';
      const c = findChampion(s, a.uid);
      if (!c || c.owner !== player) return 'That is not your champion.';
      return attackBlockReason(s, c) ?? 'That target cannot be attacked.';
    }
    default:
      return pl ? 'That move is not allowed right now.' : 'Unknown player.';
  }
}

/** Predict a clash from what both players can see (ignores hidden Schemes and hands). */
export function predictClash(s: GameState, att: ChampionInPlay, def: ChampionInPlay, opts: { blocking?: boolean } = {}) {
  const wasBlocking = def.blocking;
  def.blocking = !!opts.blocking;
  let dm = might(s, def);
  def.blocking = wasBlocking;
  const am = might(s, att), ag = guard(s, att) - (opts.blocking && top(def).block?.some((e) => e.op === 'scorch') ? 2 : 0), dg = guard(s, def);
  const ambush = !opts.blocking && hasKeyword(att, 'Ambush') && def.exhausted;
  let defenderFalls = am > 0 && am >= dg && !def.shield;
  let attackerFalls = dm > 0 && dm >= ag && !att.shield;
  if (ambush && defenderFalls) attackerFalls = false;
  if (dm < 0) dm = 0;
  return { am, ag, dm, dg, defenderFalls, attackerFalls, ambush };
}

export const cardsInZones = (pl: PlayerState) =>
  pl.deck.length + pl.hand.length + pl.crown.length + pl.fallen.length + pl.ascension.length + pl.schemes.length
  + pl.field.reduce((n, c) => n + (c.token ? 0 : c.stack.length) + (c.relic ? 1 : 0), 0) + (pl.edictCard ? 1 : 0);

export type { SpellCard };
