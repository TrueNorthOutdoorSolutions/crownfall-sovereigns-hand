// Balance run on the digital V0.2 rules engine (AI vs AI), to confirm it plays like the paper-tested rules.
// Usage: npx tsx scripts/v02-sim.ts [games=2000] [--write]
import { writeFileSync } from 'node:fs';
import { newGame, round } from '../src/v02/rules/engine';
import { playOut } from '../src/v02/ai/bot';
import type { DeckId } from '../src/v02/content/cards';

const N = Number(process.argv[2] ?? 2000);
let banner = 0, firstWins = 0, stallEnds = 0;
const rounds: number[] = [];
const reached = { star2: 0, star3: 0 };
const ascends: number[] = [];
const t0 = Date.now();
for (let k = 0; k < N; k++) {
  const decks: [DeckId, DeckId] = k % 2 ? ['ember', 'banner'] : ['banner', 'ember'];
  const s = playOut(newGame({ seed: 20000 + k, decks, first: (Math.floor(k / 2) % 2) as 0 | 1 }));
  if (s.players[s.winner!].deckId === 'banner') banner++;
  if (s.winner === s.first) firstWins++;
  if (/round-10 rule|empty deck/.test(s.endReason ?? '')) stallEnds++;
  rounds.push(round(s));
  for (const p of s.players) {
    // Ascension cards only ever leave the pile by Ascending.
    if (p.ascension.length < 8) reached.star2++;
    if (p.ascension.filter((id) => id.endsWith('-3')).length < 4) reached.star3++;
  }
  ascends.push(s.stats.ascends[0] + s.stats.ascends[1]);
}
rounds.sort((a, b) => a - b);
const pct = (x: number, n: number) => Math.round((1000 * x) / n) / 10;
const out = {
  engine: 'src/v02/rules/engine.ts', games: N, seeds: `20000..${20000 + N - 1}`,
  winRate: { banner: pct(banner, N), ember: pct(N - banner, N) },
  firstPlayerWinRate: pct(firstWins, N),
  rounds: { median: rounds[N >> 1], p90: rounds[Math.floor(N * 0.9)], max: rounds[N - 1] },
  endedByRound10OrDeckOut: pct(stallEnds, N),
  playersReachingStar2: pct(reached.star2, 2 * N),
  playersReachingStar3: pct(reached.star3, 2 * N),
  ascendsPerGame: Math.round((10 * ascends.reduce((a, b) => a + b, 0)) / N) / 10,
  msPerGame: Math.round(((Date.now() - t0) / N) * 10) / 10,
};
console.log(JSON.stringify(out, null, 2));
if (process.argv.includes('--write')) writeFileSync('prototype-v0.2/validation/engine-sim.json', JSON.stringify(out, null, 2) + '\n');
