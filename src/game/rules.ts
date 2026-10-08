import { catalog, decks, items, type DeckId } from '../content/prototype';
import { shuffle } from './random';
import { FRONTS, type Action, type Front, type GameState, type Player, type Unit, type Resolution } from './types';

export const RULES = { crownLimit: 6, maxRounds: 18, maxFrontUnits: 3, initialHand: 5, handLimit: 10, drawPerRound: 2, ascentCost: 1, equipCost: 1, componentCost: 2 } as const;
export function commandForRound(round: number) { return Math.min(8, 3 + round); }
export function other(player: Player): Player { return player === 0 ? 1 : 0; }
export function armyTrait(state: GameState, player: Player, name: string) {
  return new Set(state.units.filter(u => u.owner === player && catalog[u.card].class === name).map(u => u.card)).size >= 2;
}
export function frontTrait(state: GameState, unit: Unit, name: string) {
  return new Set(state.units.filter(u => u.owner === unit.owner && u.front === unit.front && catalog[u.card].origin === name).map(u => u.card)).size >= 2;
}
export function stats(state: GameState, unit: Unit) {
  const c = catalog[unit.card], item = items.find(i => i.id === unit.item);
  const rally = state.units.filter(u => u.uid !== unit.uid && u.owner === unit.owner && u.front === unit.front && catalog[u.card].ability === 'rally').length;
  const alone = !state.units.some(u => u.uid !== unit.uid && u.owner === unit.owner && u.front === unit.front);
  const might = c.might + (unit.stars - 1) * 2 + unit.growth + (item?.might ?? 0) + rally
    + (c.ability === 'veteran' ? unit.stars - 1 : 0)
    + (c.ability === 'duelist' && alone ? 2 : 0)
    + (c.origin === 'Dawnkin' && frontTrait(state, unit, 'Dawnkin') ? 1 : 0);
  const maxGuard = c.guard + (unit.stars - 1) * 3 + (item?.guard ?? 0)
    + (c.ability === 'bulwark' ? unit.stars : 0);
  return { might, maxGuard, guard: Math.max(0, maxGuard - unit.wounds) };
}
export function strength(state: GameState, player: Player, front: Front) {
  return state.units.filter(u => u.owner === player && u.front === front && stats(state, u).guard > 0).reduce((sum, u) => sum + stats(state, u).might, 0);
}
function log(state: GameState, text: string) { state.log.push(text); }
function draw(state: GameState, player: Player, count: number) {
  const p = state.players[player];
  for (let i = 0; i < count; i++) {
    const card = p.deck.shift();
    if (!card) break;
    if (p.hand.length < RULES.handLimit) p.hand.push(card);
    else { p.discard.push(card); log(state, `${player === 0 ? 'Your' : 'Rival’s'} full hand discarded ${catalog[card].name}.`); }
  }
}
export function createGame(seed = 1, deckId: DeckId = 'dawn', rivalDeck: DeckId = 'wild'): GameState {
  seed = seed >>> 0 || 1;
  const makePlayer = (id: DeckId) => {
    const [deck, next] = shuffle(decks[id].ids.flatMap(id => [id, id, id]), seed); seed = next;
    return { hand: [] as string[], deck, discard: [] as string[], command: 4, components: 0, freeMoveUsed: false };
  };
  const initialSeed = seed;
  const players: GameState['players'] = [makePlayer(deckId), makePlayer(rivalDeck)];
  const state: GameState = { version: 1, seed, initialSeed, deckIds: [deckId, rivalDeck], round: 1, active: 0, initiative: 0, passes: 0, players, units: [], nextUid: 1, crown: 0, claim: null, winner: null, phase: 'planning', lastResolution: null, log: ['The Crown awaits. Command the battlefronts.'], history: [] };
  draw(state, 0, RULES.initialHand); draw(state, 1, RULES.initialHand);
  return state;
}
export function moveCost(state: GameState, unit: Unit) {
  return catalog[unit.card].class === 'Strider' && armyTrait(state, unit.owner, 'Strider') && !state.players[unit.owner].freeMoveUsed ? 0 : 1;
}
export function legalActions(state: GameState): Action[] {
  if (state.phase === 'resolution') return [{ type: 'continue' }];
  if (state.phase !== 'planning') return [];
  const player = state.active, p = state.players[player], actions: Action[] = [];
  const own = state.units.filter(u => u.owner === player);
  p.hand.forEach((card, handIndex) => {
    if (p.command >= catalog[card].cost) for (const front of FRONTS) {
      if (own.filter(u => u.front === front).length < RULES.maxFrontUnits) actions.push({ type: 'deploy', handIndex, front });
    }
    if (p.command >= RULES.ascentCost) for (const u of own) {
      if (u.card === card && u.stars < 3) actions.push({ type: 'ascend', handIndex, uid: u.uid });
    }
  });
  for (const unit of own) {
    if (p.command >= moveCost(state, unit)) for (const front of FRONTS) {
      if (front !== unit.front && own.filter(u => u.front === front).length < RULES.maxFrontUnits) actions.push({ type: 'move', uid: unit.uid, front });
    }
    if (p.command >= RULES.equipCost && p.components >= RULES.componentCost && !unit.item) for (const item of items) actions.push({ type: 'equip', uid: unit.uid, item: item.id });
  }
  actions.push({ type: 'pass' });
  return actions;
}
export function isLegal(state: GameState, action: Action) {
  if (!action || typeof action !== 'object') return false;
  return legalActions(state).some(a => Object.keys(a).length === Object.keys(action).length && Object.entries(a).every(([key, value]) => (action as unknown as Record<string, unknown>)[key] === value));
}
/** Rejects invalid actions; returns a new state and never mutates caller data. */
export function applyAction(input: GameState, action: Action): GameState {
  if (!isLegal(input, action)) throw new Error(`Illegal action: ${JSON.stringify(action)}`);
  const state = structuredClone(input);
  state.history.push(structuredClone(action));
  if (action.type === 'continue') {
    state.round++; state.phase = 'planning'; state.initiative = other(state.initiative); state.active = state.initiative; state.passes = 0;
    for (const player of [0, 1] as Player[]) {
      state.players[player].command = commandForRound(state.round); state.players[player].freeMoveUsed = false; draw(state, player, RULES.drawPerRound);
    }
    log(state, `Round ${state.round} · ${commandForRound(state.round)} Command each.`);
    return state;
  }
  const player = state.active, p = state.players[player], who = player === 0 ? 'You' : 'Rival';
  switch (action.type) {
    case 'deploy': {
      const [card] = p.hand.splice(action.handIndex, 1), c = catalog[card];
      p.command -= c.cost;
      state.units.push({ uid: state.nextUid++, card, owner: player, front: action.front, stars: 1, wounds: 0, growth: 0, item: null });
      if (c.ability === 'seer') draw(state, player, 1);
      if (c.ability === 'smith') p.components++;
      log(state, `${who} deployed ${c.name} to the ${action.front}.`); break;
    }
    case 'ascend': {
      const unit = state.units.find(u => u.uid === action.uid)!;
      p.hand.splice(action.handIndex, 1); unit.stars = (unit.stars + 1) as 2 | 3; unit.wounds = 0; p.command -= RULES.ascentCost;
      log(state, `${who} ascended ${catalog[unit.card].name} to ${'★'.repeat(unit.stars)}. Guard restored.`); break;
    }
    case 'move': {
      const unit = state.units.find(u => u.uid === action.uid)!;
      const cost = moveCost(state, unit); p.command -= cost;
      if (cost === 0) p.freeMoveUsed = true;
      unit.front = action.front;
      state.units = [...state.units.filter(u => u.uid !== unit.uid), unit]; // Arrival order = physical front-to-back order.
      if (catalog[unit.card].ability === 'wanderer') unit.wounds = Math.max(0, unit.wounds - 1);
      log(state, `${who} moved ${catalog[unit.card].name} to the ${action.front}.`); break;
    }
    case 'equip': {
      const unit = state.units.find(u => u.uid === action.uid)!;
      unit.item = action.item; p.components -= RULES.componentCost; p.command -= RULES.equipCost;
      log(state, `${who} forged ${items.find(i => i.id === action.item)!.name} for ${catalog[unit.card].name}.`); break;
    }
    case 'pass': log(state, `${who} passed.`); break;
  }
  state.passes = action.type === 'pass' ? state.passes + 1 : 0;
  state.active = other(player);
  if (state.passes === 2) resolveBattle(state);
  return state;
}
function resolveBattle(state: GameState) {
  const report: Resolution = { round: state.round, fronts: [], influence: [0, 0], from: state.crown, to: state.crown, claim: null, winner: null };
  // All fronts read the same prebattle army; casualties cannot disable a trait mid-resolution.
  for (const unit of state.units) if (catalog[unit.card].origin === 'Wildborn' && frontTrait(state, unit, 'Wildborn')) unit.wounds = Math.max(0, unit.wounds - 1);
  const snapshot = structuredClone(state);
  const survivors: Unit[] = [];
  for (const front of FRONTS) {
    const before: [number, number] = [strength(snapshot, 0, front), strength(snapshot, 1, front)];
    const damage: [number, number] = [0, 0], after: [number, number] = [0, 0], fallen: string[] = [];
    for (const player of [0, 1] as Player[]) {
      const army = state.units.filter(u => u.owner === player && u.front === front);
      const vanguardBlock = army.some(u => catalog[u.card].class === 'Vanguard') && armyTrait(snapshot, player, 'Vanguard') ? 1 : 0;
      const ironBlock = army.some(u => catalog[u.card].origin === 'Ironbound' && frontTrait(snapshot, u, 'Ironbound')) ? 2 : 0;
      const block = vanguardBlock + ironBlock;
      let incoming = Math.max(0, before[other(player)] - block); damage[player] = incoming;
      for (const unit of army) {
        const unitStats = stats(snapshot, snapshot.units.find(u => u.uid === unit.uid)!);
        const hit = Math.min(incoming, unitStats.guard); unit.wounds += hit; incoming -= hit;
        if (unitStats.guard - hit <= 0) {
          for (let i = 0; i < unit.stars; i++) state.players[player].discard.push(unit.card);
          fallen.push(`${player === 0 ? 'Your' : 'Rival’s'} ${catalog[unit.card].name}`);
        } else { survivors.push(unit); after[player] += unitStats.might; }
      }
    }
    const winner: Player | null = after[0] === after[1] ? null : after[0] > after[1] ? 0 : 1;
    let influence = front === 'throne' ? 2 : 1;
    if (winner !== null) {
      if (front === 'throne' && armyTrait(snapshot, winner, 'Arcanist') && survivors.some(u => u.front === front && u.owner === winner && catalog[u.card].class === 'Arcanist')) influence++;
      report.influence[winner] += influence;
      if (front === 'forge') state.players[winner].components++;
      if (front === 'wild') for (const u of survivors.filter(u => u.front === front && u.owner === winner)) { u.growth = Math.min(2, u.growth + 1); u.wounds = Math.max(0, u.wounds - 1); }
    }
    report.fronts.push({ front, before, after, damage, fallen, winner, influence });
    log(state, `${front}: strike ${before[0]}–${before[1]}, survivors ${after[0]}–${after[1]}. ${fallen.length ? `Fallen: ${fallen.join(', ')}.` : 'No champions fell.'} ${winner === null ? 'Tied.' : `${winner === 0 ? 'You' : 'Rival'} gained ${influence} influence.`}`);
  }
  state.units = survivors;
  const net = report.influence[0] - report.influence[1];
  state.crown = Math.max(-RULES.crownLimit, Math.min(RULES.crownLimit, state.crown + net));
  const atEnd: Player | null = state.crown === RULES.crownLimit ? 0 : state.crown === -RULES.crownLimit ? 1 : null;
  // A claim must survive a later resolution with positive net influence. Ties cannot seal it.
  if (atEnd !== null && state.claim === atEnd && (atEnd === 0 ? net > 0 : net < 0)) state.winner = atEnd;
  state.claim = atEnd;
  if (state.winner === null && state.round >= RULES.maxRounds) {
    state.winner = state.crown === 0 ? null : state.crown > 0 ? 0 : 1;
    state.phase = 'finished'; // Crown at centre is a draw at the round limit.
  } else state.phase = state.winner === null ? 'resolution' : 'finished';
  report.to = state.crown; report.claim = state.claim; report.winner = state.winner;
  state.lastResolution = report;
  log(state, `Battle ${state.round}: influence ${report.influence[0]}–${report.influence[1]}. Crown ${net === 0 ? 'held' : `moved ${Math.abs(report.to - report.from)} toward ${net > 0 ? 'you' : 'the rival'}`}.`);
  if (state.claim !== null && state.winner === null) log(state, `${state.claim === 0 ? 'Your' : 'Rival’s'} Ascension is pending. Win net influence next battle to seal it.`);
}
export function replay(seed: number, deckIds: [DeckId, DeckId], actions: Action[]) {
  return actions.reduce((state, action) => applyAction(state, action), createGame(seed, ...deckIds));
}
