// Applies a Bout's starting conditions to a freshly dealt game and judges its objective.
// Only the starting state is changed; the rules engine runs the game unchanged.
import { CARDS } from '../content/cards';
import { round } from '../rules/engine';
import type { ChampionInPlay, GameState, PlayerIndex } from '../rules/types';
import type { BoutSetup, Objective } from './act1';

export function applySetup(s: GameState, setup: BoutSetup | undefined): GameState {
  if (!setup) return s;
  const t: GameState = structuredClone(s);
  const crown = (p: PlayerIndex, n?: number) => {
    if (n === undefined) return;
    const pl = t.players[p];
    while (pl.crown.length > n) pl.deck.unshift(pl.crown.pop()!); // extra shards go to the bottom of the deck
  };
  crown(0, setup.myCrown);
  crown(1, setup.rivalCrown);
  const field = (p: PlayerIndex, ids?: string[]) => {
    for (const id of ids ?? []) {
      if (!CARDS[id]) continue;
      const c: ChampionInPlay = { uid: t.nextUid++, owner: p, stack: [id], exhausted: false, arrivedTurn: -1, ascendedTurn: -1, shield: false,
        mods: { might: 0, guard: 0 }, blocking: false, noAttack: false, readiedTurn: -1, relic: null, token: false };
      t.players[p].field.push(c);
    }
  };
  field(0, setup.myField);
  field(1, setup.rivalField);
  if (setup.edict && CARDS[setup.edict]) {
    t.edict = { card: setup.edict, owner: 1 };
    t.players[1].edictCard = setup.edict;
  }
  return t;
}

export type Verdict = { done: false } | { done: true; won: boolean; reason: string };

/** Me = player 0. Checked after every state change. */
export function judge(s: GameState, o: Objective): Verdict {
  if (o.kind === 'survive' && s.phase !== 'over' && round(s) >= o.rounds && s.players[0].crown.length > 0)
    return { done: true, won: true, reason: `You held the line until round ${o.rounds}.` };
  if (s.phase !== 'over') return { done: false };
  const won = s.winner === 0;
  if (!won) return { done: true, won: false, reason: o.kind === 'survive' ? 'The line broke before the time was up.' : 'Your Crown fell.' };
  if (o.kind === 'keepShards' && s.players[0].crown.length < o.n)
    return { done: true, won: false, reason: `You won, but with only ${s.players[0].crown.length} shards left. The Bout needs ${o.n}.` };
  return { done: true, won: true, reason: 'Victory.' };
}

export const objectiveText = (o: Objective) =>
  o.kind === 'win' ? 'Break all of your rival’s Crown Shards.'
  : o.kind === 'keepShards' ? `Win with at least ${o.n} of your Crown Shards still whole.`
  : `Survive: still have a Crown Shard when round ${o.rounds} begins.`;
