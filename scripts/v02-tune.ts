// Balance bench: how does one deck (optionally modified) do against every other starter deck?
// Usage: npx tsx scripts/v02-tune.ts <deckId> [gamesPerPairing=300] [variant JSON: {"swap":[["out","in",n]],"main":[...]}]
import { DECKS } from '../src/v02/content/cards';
import type { DeckId } from '../src/v02/content/cards';
import { newGame } from '../src/v02/rules/engine';
import { playOut } from '../src/v02/ai/bot';

const [deck, nArg, variantArg] = process.argv.slice(2);
const N = Number(nArg ?? 300);
if (variantArg) {
  const v = JSON.parse(variantArg) as { swap?: [string, string, number][]; ascension?: string[] };
  const d = DECKS[deck];
  let main = d.main.map(([c, n]) => [c, n] as [string, number]);
  for (const [out, inn, n] of v.swap ?? []) {
    main = main.map(([c, k]) => [c, c === out ? k - n : k] as [string, number]).filter(([, k]) => k > 0);
    const have = main.find(([c]) => c === inn);
    if (have) have[1] += n; else main.push([inn, n]);
  }
  DECKS[deck] = { ...d, main, ascension: v.ascension ?? d.ascension };
}
const total = DECKS[deck].main.reduce((a, [, n]) => a + n, 0);
if (total !== 30) throw new Error(`deck has ${total} cards`);
const rows: [string, number][] = [];
let seed = 90000;
for (const opp of Object.keys(DECKS) as DeckId[]) {
  if (opp === deck || opp.startsWith('custom-')) continue;
  let wins = 0;
  for (let k = 0; k < N; k++) {
    const decks: [DeckId, DeckId] = k % 2 ? [opp, deck] : [deck, opp];
    const s = playOut(newGame({ seed: seed++, decks, first: (Math.floor(k / 2) % 2) as 0 | 1 }));
    if (s.players[s.winner!].deckId === deck) wins++;
  }
  rows.push([opp, Math.round((1000 * wins) / N) / 10]);
}
const avg = Math.round((10 * rows.reduce((a, [, r]) => a + r, 0)) / rows.length) / 10;
console.log(`${deck} ${variantArg ?? '(as is)'} -> ${rows.map(([o, r]) => `${o} ${r}`).join(' | ')} | AVG ${avg}`);
