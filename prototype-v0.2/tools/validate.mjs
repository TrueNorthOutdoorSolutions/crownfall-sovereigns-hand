// Validation for the V0.2 paper prototype. Exit code 1 on any failure.
// Usage: node prototype-v0.2/tools/validate.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAMPION_LINES, SPELLS, DECKS, cardIndex } from '../data/cards.mjs';
import { playGame } from './engine.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canon = JSON.parse(readFileSync(join(root, 'data', 'canon-snapshot.json'), 'utf8'));
const CARDS = cardIndex();
const fails = [];
const passes = [];
const check = (ok, msg) => (ok ? passes : fails).push(msg);

// 1. Canon: every champion line matches the Crownfall snapshot exactly.
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const l of CHAMPION_LINES) {
  const c = canon.champions.find((x) => x.id === l.canonId);
  check(!!c, `canon: ${l.canonId} exists in Crownfall`);
  if (!c) continue;
  check(c.name === l.name && c.title === l.title, `canon: ${l.name} name+title match ("${c.name}, ${c.title}")`);
  check(c.tier === l.tier, `canon: ${l.name} tier ${l.tier} matches`);
  check(same(c.origins, l.origins) && same(c.classes, l.classes), `canon: ${l.name} Origins/Classes match`);
  for (const f of l.forms) if (f.ability) check(f.ability === c.ability, `canon: ${l.name} ★${f.star} ability name "${f.ability}" is canonical`);
  check(l.forms.every((f) => (f.keywords ?? []).includes('Ascendant') === (l.tier === 5)), `rules: only Tier V ${l.name} carries Ascendant`);
  for (const f of l.forms) check(existsSync(join(root, 'art', l.canonId, `star_${f.star}.webp`)), `art: ${l.name} ★${f.star} portrait present`);
}
check(canon.champions.length === 55, `canon: snapshot has 55 champions (Crownfall ${canon.commit.slice(0, 7)})`);

// 2. Deck legality.
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

// 3. Card text truth and fit.
const KEYWORDS = ['Charge', 'Bulwark', 'Ambush', 'Flight', 'Reach', 'Ascendant'];
const words = (t) => (t.match(/\S+/g) ?? []).length;
for (const c of Object.values(CARDS)) {
  const t = c.text ?? '';
  check(words(t) + (c.keywords?.length ?? 0) <= 40, `text: ${c.id} fits (≤40 words)`);
  for (const k of c.keywords ?? []) check(KEYWORDS.includes(k), `text: ${c.id} keyword ${k} is a rulebook keyword`);
  if (c.kind === 'champion' || c.kind === 'ascension') {
    const fx = c.fx ?? {};
    check(/Arrival:/.test(t) === !!fx.arrive, `truth: ${c.id} "Arrival:" text ⇔ arrival effect`);
    check(/Ascend:/.test(t) === !!fx.ascend, `truth: ${c.id} "Ascend:" text ⇔ ascend effect`);
    check(/Attack:/.test(t) === !!fx.attack, `truth: ${c.id} "Attack:" text ⇔ attack effect`);
    check(/Block:/.test(t) === !!fx.block, `truth: ${c.id} "Block:" text ⇔ block effect`);
    check(/have \+1/.test(t) === !!(fx.auraMight || fx.auraGuard), `truth: ${c.id} aura text ⇔ aura effect`);
    check(Number.isInteger(c.might) && Number.isInteger(c.guard) && c.might >= 0 && c.guard >= 1, `stats: ${c.id} Might/Guard valid`);
  } else {
    check(c.kind === 'tactic' ? !!(c.fx.cast || c.fx.swift) : !!c.when, `truth: ${c.id} has an implemented effect`);
    check(!!c.shardfall === /Shardfall/.test(c.name + (c.shardfall ? ' Shardfall' : '')), `text: ${c.id} Shardfall flag consistent`);
  }
}
check(SPELLS.every((s) => !CHAMPION_LINES.some((l) => s.name.includes(l.name))), 'names: no Tactic/Scheme is named after a champion');

// 4. Simulator determinism and conservation.
const run = () => Array.from({ length: 300 }, (_, k) => playGame({ seed: 777 + k, first: k % 2, decks: k % 4 < 2 ? ['banner', 'ember'] : ['ember', 'banner'] }));
const a = run(), b = run();
check(JSON.stringify(a) === JSON.stringify(b), 'sim: 300 seeded games replay identically');
const sizes = Object.fromEntries(Object.entries(DECKS).map(([id, d]) => [id, 30 + d.ascension.length]));
check(a.every((s) => s.cardCounts.every((n, i) => n === sizes[s.decks[i]])), 'sim: every card is conserved in every game (38 per player)');
check(a.every((s) => s.winner != null), 'sim: every game finishes with a winner');

console.log(`${passes.length} checks passed, ${fails.length} failed`);
for (const f of fails) console.log('FAIL', f);
process.exit(fails.length ? 1 : 0);
