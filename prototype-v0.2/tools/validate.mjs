// Validation for Sovereign's Hand V0.2 (paper kit + digital engine share src/v02/content/cards.ts).
// Usage: npx tsx prototype-v0.2/tools/validate.mjs   (exit code 1 on any failure)
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAMPION_LINES, SPELLS, DECKS, CARDS } from '../../src/v02/content/cards.ts';
import { newGame, cardsInZones } from '../../src/v02/rules/engine.ts';
import { playOut } from '../../src/v02/ai/bot.ts';
import { cardIndex as researchIndex } from '../research/cards.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canon = JSON.parse(readFileSync(join(root, 'data', 'canon-snapshot.json'), 'utf8'));
const fails = [];
const passes = [];
const check = (ok, msg) => (ok ? passes : fails).push(msg);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. Canon: every champion line matches the Crownfall snapshot exactly.
for (const l of CHAMPION_LINES) {
  const c = canon.champions.find((x) => x.id === l.canonId);
  check(!!c, `canon: ${l.canonId} exists in Crownfall`);
  if (!c) continue;
  check(c.name === l.name && c.title === l.title, `canon: ${l.name} name+title match ("${c.name}, ${c.title}")`);
  check(c.tier === l.tier, `canon: ${l.name} tier ${l.tier} matches`);
  check(same(c.origins, l.origins) && same(c.classes, l.classes), `canon: ${l.name} Origins/Classes match`);
  for (const f of l.forms) if (f.ability) check(f.ability === c.ability, `canon: ${l.name} ★${f.star} ability name "${f.ability}" is canonical`);
  check(l.forms.every((f) => f.keywords.includes('Ascendant') === (l.tier === 5)), `rules: only Tier V ${l.name} carries Ascendant`);
  for (const f of l.forms) check(existsSync(join(root, 'art', l.canonId, `star_${f.star}.webp`)), `art: ${l.name} ★${f.star} portrait present`);
}
check(canon.champions.length === 55, `canon: snapshot has 55 champions (Crownfall ${canon.commit.slice(0, 7)})`);

// 2. Parity with the paper-tested cards (prototype-v0.2/research/cards.mjs, the data the balance runs used).
const R = researchIndex();
for (const [id, c] of Object.entries(CARDS)) {
  const r = R[id];
  check(!!r, `parity: ${id} exists in the paper-tested card set`);
  if (!r) continue;
  const pick = (x) => ({ name: x.name, kind: x.kind, cost: x.cost, might: x.might, guard: x.guard, text: x.text, keywords: x.keywords ?? [], swift: !!x.swift, shardfall: !!x.shardfall, when: x.when ?? null });
  check(same(pick(c), pick(r)), `parity: ${id} stats and text identical to the paper-tested card`);
}
check(Object.keys(R).length === Object.keys(CARDS).length, 'parity: same number of cards as the paper-tested set');

// 3. Deck legality.
for (const [id, d] of Object.entries(DECKS)) {
  const total = d.main.reduce((n, [, k]) => n + k, 0);
  check(total === 30, `deck ${id}: main deck is exactly 30 (${total})`);
  check(d.main.every(([, k]) => k <= 2), `deck ${id}: no more than 2 copies of any card`);
  check(d.main.every(([cid]) => CARDS[cid]), `deck ${id}: every main card exists`);
  const asc = d.main.filter(([cid]) => CARDS[cid]?.keywords?.includes('Ascendant'));
  check(asc.length <= 1 && asc.every(([, k]) => k === 1), `deck ${id}: at most one Ascendant, one copy`);
  check(d.ascension.length <= 8, `deck ${id}: Ascension Pile has ${d.ascension.length} (max 8)`);
  for (const a of d.ascension) {
    const def = CARDS[a];
    check(def?.kind === 'ascension', `deck ${id}: ${a} is an Ascension card`);
    check(d.main.some(([cid]) => cid === def.canonId), `deck ${id}: ${a} has its ★ form in the main deck`);
    if (def.star === 3) check(d.ascension.includes(`${def.canonId}-2`), `deck ${id}: ${a} has its ★★ form in the pile`);
  }
  check(d.main.every(([cid]) => !CARDS[cid].deck || CARDS[cid].deck === id), `deck ${id}: uses only its own cards`);
}

// 4. Card text truth: every printed trigger has an implemented effect, and the reverse.
const words = (t) => (t.match(/\S+/g) ?? []).length;
for (const c of Object.values(CARDS)) {
  const t = c.text ?? '';
  check(words(t) + (c.keywords?.length ?? 0) <= 40, `text: ${c.id} fits (≤40 words)`);
  if (c.kind === 'champion' || c.kind === 'ascension') {
    check(/Arrival:/.test(t) === !!c.arrive?.length, `truth: ${c.id} "Arrival:" text ⇔ arrival effect`);
    check(/Ascend:/.test(t) === !!c.ascend?.length, `truth: ${c.id} "Ascend:" text ⇔ ascend effect`);
    check(/Attack:/.test(t) === !!c.attack?.length, `truth: ${c.id} "Attack:" text ⇔ attack effect`);
    check(/Block:/.test(t) === !!c.block?.length, `truth: ${c.id} "Block:" text ⇔ block effect`);
    check(/have \+1/.test(t) === !!(c.statics?.auraMight || c.statics?.auraGuard), `truth: ${c.id} aura text ⇔ aura effect`);
    check(/fewer shards/.test(t) === !!c.statics?.mightIfBehind, `truth: ${c.id} "fewer shards" text ⇔ effect`);
    check(/while blocking/.test(t) === !!c.statics?.mightWhileBlocking, `truth: ${c.id} "while blocking" text ⇔ effect`);
    check(/when Fen defeats/.test(t) === !!c.defeats?.length, `truth: ${c.id} defeat trigger text ⇔ effect`);
  } else {
    check(c.effects.length > 0, `truth: ${c.id} has an implemented effect`);
    check(c.kind === 'tactic' || !!c.when, `truth: ${c.id} Scheme has a spring condition`);
  }
}
check(SPELLS.every((s) => !CHAMPION_LINES.some((l) => s.name.includes(l.name))), 'names: no Tactic/Scheme is named after a champion');

// 5. Engine determinism and conservation (full AI games on the digital rules engine).
const run = () => Array.from({ length: 120 }, (_, k) => playOut(newGame({ seed: 777 + k, first: k % 2, decks: k % 4 < 2 ? ['banner', 'ember'] : ['ember', 'banner'] })));
const a = run(), b = run();
check(JSON.stringify(a) === JSON.stringify(b), 'engine: 120 seeded AI games replay identically');
check(a.every((s) => s.players.every((p) => cardsInZones(p) === 38)), 'engine: every card is conserved in every game (38 per player)');
check(a.every((s) => s.phase === 'over' && s.winner !== null), 'engine: every game finishes with a winner');

console.log(`${passes.length} checks passed, ${fails.length} failed`);
for (const f of fails) console.log('FAIL', f);
process.exit(fails.length ? 1 : 0);
