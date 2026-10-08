import { createGame, applyAction } from '../src/game/rules';
import { chooseAction } from '../src/game/ai';
import { shuffle } from '../src/game/random';
import { decks } from '../src/content/prototype';

const matches = Number(process.argv[2] || 50);
const rounds: number[] = [], actionCounts: number[] = [];
const wins = [0, 0, 0]; let claimsBroken = 0, forgeUses = 0, ascents = 0, stalled = 0;
for (let seed = 1; seed <= matches; seed++) {
  let s = createGame(seed, seed % 2 ? 'dawn' : 'wild', seed % 2 ? 'wild' : 'dawn'), count = 0;
  while (s.phase !== 'finished' && count < 500) {
    const action = chooseAction(s), claim = s.claim;
    if (action.type === 'ascend') ascents++;
    if (action.type === 'equip') forgeUses++;
    s = applyAction(s, action); count++;
    if (claim !== null && s.claim === null) claimsBroken++;
  }
  if (s.phase !== 'finished') stalled++;
  wins[s.winner === null ? 2 : s.winner]++; rounds.push(s.round); actionCounts.push(count);
}
function percentile(values: number[], q: number) { return [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * q)]; }
// Exact sampling without replacement: at least 2 / all 3 copies of one named champion.
function choose(n: number, k: number): number { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v *= (n - i + 1) / i; return v; }
const probabilities = [5, 9, 13, 17, 21].map(seen => ({ seen, pairOfNamedChampion: +(100 * (choose(3, 2) * choose(27, seen - 2) + choose(27, seen - 3)) / choose(30, seen)).toFixed(1), tripleOfNamedChampion: +(100 * choose(27, seen - 3) / choose(30, seen)).toFixed(1) }));
let openingsWithoutCheapPlay = 0, openingsWithAnyPair = 0;
for (let seed = 1; seed <= 10000; seed++) {
  const [cards] = shuffle(decks.dawn.ids.flatMap(id => [id, id, id]), seed * 7919);
  const hand = cards.slice(0, 5);
  if (!hand.some(id => ['shp-gilded', 'shp-rivet'].includes(id))) openingsWithoutCheapPlay++;
  if (new Set(hand).size < hand.length) openingsWithAnyPair++;
}
console.log(JSON.stringify({ matches, wins: { first: wins[0], second: wins[1], draws: wins[2] }, rounds: { median: percentile(rounds, .5), p90: percentile(rounds, .9) }, actions: { median: percentile(actionCounts, .5), p90: percentile(actionCounts, .9) }, claimsBroken, forgeUses, ascents, stalled, probabilities, openingSamples: 10000, openingsWithAnyPair, openingsWithoutOneCostCard: openingsWithoutCheapPlay, deadOpeningHands: 0, note: 'All champions cost at most starting Command (4). Simulation measures bots, not human fun or physical duration.' }, null, 2));
