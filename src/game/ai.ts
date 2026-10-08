import { applyAction, legalActions, other, stats, strength, armyTrait, RULES } from './rules';
import { FRONTS, type Action, type GameState, type Player } from './types';

function evaluate(state: GameState, player: Player) {
  const enemy = other(player), sign = player === 0 ? 1 : -1;
  if (state.phase === 'finished') return state.winner === player ? 100000 : state.winner === null ? 0 : -100000;
  let score = state.crown * sign * 9;
  if (state.claim === player) score += 25;
  if (state.claim === enemy) score -= 35;
  const urgent = Math.abs(state.crown) >= RULES.crownLimit - 2;
  for (const front of FRONTS) {
    const ours = strength(state, player, front), theirs = strength(state, enemy, front);
    const value = front === 'throne' ? 16 : front === 'forge' ? 7 : 8;
    score += Math.tanh((ours - theirs) / 3) * value * (urgent ? 1.7 : 1);
  }
  for (const unit of state.units) {
    const s = stats(state, unit), factor = unit.owner === player ? 1 : -1;
    score += factor * (s.might * 1.2 + s.guard * 0.6 + (unit.stars - 1) * 1.5);
  }
  score += (state.players[player].hand.length - state.players[enemy].hand.length) * 0.7;
  score += (state.players[player].components - state.players[enemy].components) * 1.2;
  score += (state.players[player].command - state.players[enemy].command) * 0.35;
  for (const trait of ['Arcanist', 'Vanguard', 'Strider']) if (armyTrait(state, player, trait)) score += 1.5;
  return score;
}
/** Deterministic one-response lookahead. Includes passing into the actual battle outcome. */
export function chooseAction(state: GameState): Action {
  // Hypothetical branches do not need the historical journal. Never alter live state.
  state = { ...state, history: [], log: [] };
  const seen = new Set<string>();
  const actions = legalActions(state).filter(a => {
    const key = JSON.stringify('handIndex' in a ? { ...a, handIndex: state.players[state.active].hand[a.handIndex] } : a);
    if (seen.has(key)) return false; seen.add(key); return true;
  });
  if (!actions.length) throw new Error('No action available');
  if (state.phase !== 'planning') return actions[0];
  const player = state.active;
  const scored = actions.map(action => {
    const next = applyAction(state, action);
    let score = evaluate(next, player);
    if (action.type === 'pass' && next.phase === 'planning') {
      const projected = applyAction(next, { type: 'pass' }); score = evaluate(projected, player) - 0.25;
    }
    if (action.type === 'move') score -= 0.45; // Avoid reposition oscillation, even when free.
    return { action, next, score };
  }).sort((a, b) => b.score - a.score);
  let best = scored[0], bestScore = -Infinity;
  for (const candidate of scored.slice(0, 6)) {
    let score = candidate.score;
    if (candidate.next.phase === 'planning') {
      // Model only the opponent's public board actions, never hidden hand plays.
      const publicReplyState: GameState = { ...candidate.next, players: candidate.next.players.map((p, i) => i === player ? p : { ...p, hand: [] }) as GameState['players'] };
      const replies = legalActions(publicReplyState);
      const worst = Math.min(...replies.map(reply => evaluate(applyAction(candidate.next, reply), player)));
      score = candidate.score * 0.45 + worst * 0.55;
    }
    if (score > bestScore) { best = candidate; bestScore = score; }
  }
  return best.action;
}
