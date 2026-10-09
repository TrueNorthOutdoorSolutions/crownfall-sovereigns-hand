// Balance run on the digital V0.2 rules engine (AI vs AI), across every pairing of the starter decks.
// Usage: npx tsx scripts/v02-sim.ts [gamesPerPairing=1000] [--write]
import { writeFileSync } from 'node:fs';
import { cardsInZones, newGame, round } from '../src/v02/rules/engine';
import { playOut } from '../src/v02/ai/bot';
import { DECKS } from '../src/v02/content/cards';
import type { DeckId } from '../src/v02/content/cards';

const N = Number(process.argv[2] ?? 1000);
const ids = Object.keys(DECKS) as DeckId[];
const pct = (x: number, n: number) => Math.round((1000 * x) / n) / 10;
const t0 = Date.now();
let total = 0, conservationFailures = 0;

function pairing(a: DeckId, b: DeckId, seedBase: number) {
  let aWins = 0, firstWins = 0, stallEnds = 0;
  const rounds: number[] = [];
  const reached = { star2: 0, star3: 0 };
  let ascends = 0;
  for (let k = 0; k < N; k++) {
    const decks: [DeckId, DeckId] = k % 2 ? [b, a] : [a, b];
    const s = playOut(newGame({ seed: seedBase + k, decks, first: (Math.floor(k / 2) % 2) as 0 | 1 }));
    total++;
    if (s.players.some((p) => cardsInZones(p) !== 30 + DECKS[p.deckId].ascension.length)) conservationFailures++;
    if (s.players[s.winner!].deckId === a) aWins++;
    if (s.winner === s.first) firstWins++;
    if (/round-10 rule|empty deck/.test(s.endReason ?? '')) stallEnds++;
    rounds.push(round(s));
    for (const p of s.players) {
      // Ascension cards only ever leave the pile by Ascending.
      const pile = DECKS[p.deckId].ascension;
      if (p.ascension.length < pile.length) reached.star2++;
      if (p.ascension.filter((id) => id.endsWith('-3')).length < pile.filter((id) => id.endsWith('-3')).length) reached.star3++;
    }
    ascends += s.stats.ascends[0] + s.stats.ascends[1];
  }
  rounds.sort((x, y) => x - y);
  return {
    [`${a}WinRate`]: pct(aWins, N), [`${b}WinRate`]: pct(N - aWins, N),
    firstPlayerWinRate: pct(firstWins, N),
    rounds: { median: rounds[N >> 1], p90: rounds[Math.floor(N * 0.9)], max: rounds[N - 1] },
    endedByRound10OrDeckOut: pct(stallEnds, N),
    playersReachingStar2: pct(reached.star2, 2 * N), playersReachingStar3: pct(reached.star3, 2 * N),
    ascendsPerGame: Math.round((10 * ascends) / N) / 10,
  };
}

const pairings: Record<string, ReturnType<typeof pairing>> = {};
let seed = 20000;
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
  pairings[`${ids[i]} vs ${ids[j]}`] = pairing(ids[i], ids[j], seed);
  seed += N;
}
// Overall win rate per deck across all its pairings.
const overall = Object.fromEntries(ids.map((d) => {
  const rates = Object.entries(pairings).filter(([k]) => k.split(' vs ').includes(d)).map(([, v]) => v[`${d}WinRate`] as number);
  return [d, Math.round((10 * rates.reduce((x, y) => x + y, 0)) / rates.length) / 10];
}));
const out = {
  engine: 'src/v02/rules/engine.ts', gamesPerPairing: N, totalGames: total, seeds: `20000..${seed - 1}`,
  overallWinRate: overall, conservationFailures, pairings,
  msPerGame: Math.round(((Date.now() - t0) / total) * 10) / 10,
};
console.log(JSON.stringify(out, null, 2));
if (process.argv.includes('--write')) writeFileSync('prototype-v0.2/validation/engine-sim.json', JSON.stringify(out, null, 2) + '\n');
