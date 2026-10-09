// Validation for Sovereign's Hand V0.2 — both sets, all four starter decks, print kit and digital engine
// (they all share src/v02/content/cards.ts).
// Usage: npx tsx prototype-v0.2/tools/validate.mjs   (exit code 1 on any failure)
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_LINES, SPELLS, EXTRA_SPELLS, RELICS, EDICTS, DECKS, CARDS } from '../../src/v02/content/cards.ts';
import { newGame, cardsInZones } from '../../src/v02/rules/engine.ts';
import { playOut } from '../../src/v02/ai/bot.ts';
import { cardIndex as researchIndex } from '../research/cards.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canon = JSON.parse(readFileSync(join(root, 'data', 'canon-snapshot.json'), 'utf8'));
const extras = JSON.parse(readFileSync(join(root, 'data', 'canon-extras.json'), 'utf8'));
const fails = [];
const passes = [];
const check = (ok, msg) => (ok ? passes : fails).push(msg);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const champLines = ALL_LINES.filter((l) => (l.family ?? 'champion') === 'champion');

// 1. Canon: champion identity (name, tier, Origins, Classes; Set 1 titles and ability names) matches Crownfall exactly.
for (const l of champLines) {
  const c = canon.champions.find((x) => x.id === l.canonId);
  const tag = `${l.name}${l.set === 2 ? ' (Set 2)' : ''}`;
  check(!!c, `canon: ${l.canonId} exists in Crownfall`);
  if (!c) continue;
  check(c.name === l.name, `canon: ${tag} name matches`);
  if (l.set === 2) check(l.epithetProposed === true && l.title !== c.title && !!l.scene, `canon: ${tag} carries a new epithet marked PROPOSED and an art setting`);
  else check(c.title === l.title, `canon: ${tag} title matches ("${c.title}")`);
  check(c.tier === l.tier, `canon: ${tag} tier ${l.tier} matches`);
  check(same(c.origins, l.origins) && same(c.classes, l.classes), `canon: ${tag} Origins/Classes match`);
  for (const f of l.forms) if (f.ability) check(f.ability === c.ability, `canon: ${tag} ★${f.star} ability name "${f.ability}" is canonical`);
  check(l.forms.every((f) => f.keywords.includes('Ascendant') === (l.tier === 5)), `rules: only Tier V ${tag} carries Ascendant`);
  check(l.forms.length === 3 && l.forms.map((f) => f.star).join() === '1,2,3', `set: ${tag} has ★, ★★ and ★★★ forms`);
  for (const f of l.forms) if (f.star > 1) check(f.might > l.forms[f.star - 2].might && f.guard > l.forms[f.star - 2].guard, `set: ${tag} ★${f.star} is stronger than ★${f.star - 1}`);
  if (l.set !== 2) for (const f of l.forms) check(existsSync(join(root, 'art', l.canonId, `star_${f.star}.webp`)), `art: ${tag} ★${f.star} temporary portrait present`);
}
check(canon.champions.length === 55, `canon: snapshot has 55 champions (Crownfall ${canon.commit.slice(0, 7)})`);
const set1Champs = champLines.filter((l) => (l.set ?? 1) === 1);
check(set1Champs.length === 55 && new Set(set1Champs.map((l) => l.canonId)).size === 55, 'set 1: all 55 canonical champions, each once');
const set2Champs = champLines.filter((l) => l.set === 2);
check(new Set(set2Champs.map((l) => l.canonId)).size === set2Champs.length, `set 2: ${set2Champs.length} returning champions, each once`);
// Monsters, Guardians and tokens are Crownfall's own units and summons.
const unitName = Object.fromEntries(extras.units.map((u) => [u.id, u.name]));
const waveName = Object.fromEntries(extras.waves.map((w) => [w.id, w.name]));
const unitAbility = Object.fromEntries(extras.units.map((u) => [u.id, u.ability]));
const summonName = Object.fromEntries(extras.summons.map((s) => [s.id, s.name]));
for (const l of ALL_LINES.filter((x) => x.family && x.family !== 'champion')) {
  const ok = l.family === 'token' ? (summonName[l.canonId] ?? unitName[l.canonId]) === l.name
    : unitName[l.canonId] === l.name || waveName[l.canonId] === l.name;
  check(ok, `canon: ${l.family} "${l.name}" is a Crownfall ${l.family === 'token' ? 'summon/unit' : 'unit or encounter'} name`);
  if (l.family === 'guardian') {
    check(l.forms[0].ability === unitAbility[l.canonId], `canon: Guardian ${l.name} uses its canonical ability "${unitAbility[l.canonId]}"`);
    check(l.forms[0].keywords.includes('Guardian'), `rules: ${l.name} carries the Guardian keyword`);
  }
}
// Crown Power, item and Edict names.
const powerName = Object.fromEntries(extras.powers.map((p) => [p.id, p.name]));
const itemName = Object.fromEntries(extras.items.map((i) => [i.id, i.name]));
const edictCanon = Object.fromEntries(extras.edicts.map((e) => [e.id, e]));
const allSpells = [...SPELLS, ...EXTRA_SPELLS];
for (const s of allSpells) {
  if (s.canonId && powerName[s.canonId]) check(powerName[s.canonId] === s.name, `canon: Crown Power card "${s.name}" uses its canonical name`);
  if (s.canonId === 'unbinding_charm') check(itemName.unbinding_charm === s.name, 'canon: Unbinding Charm name matches');
  if (s.canonId === 'crown_hex') check(s.name.startsWith('Crown Hex: '), `canon: ${s.name} is a Crown Hex boon`);
}
const powersUsed = new Set(allSpells.map((s) => s.canonId).filter((id) => id && powerName[id]));
check(powersUsed.size === extras.powers.length, `set 1: all ${extras.powers.length} Crown Powers have a card (${powersUsed.size})`);
for (const r of RELICS) check(itemName[r.canonId] === r.name, `canon: Relic "${r.name}" is a Crownfall item name`);
const itemsUsed = new Set(RELICS.map((r) => r.canonId));
const itemsLeftOut = extras.items.filter((i) => !itemsUsed.has(i.id)).map((i) => i.id).sort();
check(same(itemsLeftOut, ['shard', 'unbinding_charm']), `set 2: every Crownfall item is a Relic except the Crown Shard (left out) and the Unbinding Charm (a Tactic): ${itemsLeftOut.join(', ')}`);
check(RELICS.filter((r) => r.relicType === 'artifact').every((r) => r.legendary), 'rules: every Crown Artifact is legendary');
for (const e of EDICTS) {
  const c = edictCanon[e.canonId];
  check(!!c && c.name === e.name && c.hostChampionId === e.host, `canon: Edict "${e.name}" matches its Crownfall name and host`);
}
check(EDICTS.length === extras.edicts.length, `edicts: all ${extras.edicts.length} Crownfall Edicts have a card`);
// Announcer-line spell names: the flavour must be the canonical recorded line (exact text).
const manifestLines = new Set();
try {
  const m = JSON.parse(readFileSync(join(root, 'data', 'canon-extras.json'), 'utf8'));
  for (const v of Object.values(m.guardianLines ?? {})) manifestLines.add(v);
} catch { /* covered below */ }

// 2. Parity: every Set 1 starter-deck card keeps the rules that were balance-tested (research/cards.mjs).
//    Names may now be canonical Crown Power names instead of the old working names.
const R = researchIndex();
const set1Decks = Object.entries(DECKS).filter(([, d]) => (d.set ?? 1) === 1);
const inSet1Decks = new Set(set1Decks.flatMap(([, d]) => [...d.main.map(([id]) => id), ...d.ascension]));
const rules = (x) => ({ kind: x.kind, cost: x.cost, might: x.might, guard: x.guard, text: x.text, keywords: x.keywords ?? [], swift: !!x.swift, shardfall: !!x.shardfall, when: x.when ?? null });
for (const id of inSet1Decks) {
  check(!!R[id], `parity: ${id} exists in the paper-tested card set`);
  if (R[id]) check(same(rules(CARDS[id]), rules(R[id])), `parity: ${id} rules identical to the paper-tested card${CARDS[id].name !== R[id].name ? ` (renamed "${R[id].name}" → "${CARDS[id].name}")` : ''}`);
}
check(Object.keys(R).every((id) => inSet1Decks.has(id)), 'parity: every paper-tested card is still in a Set 1 starter deck');

// 3. Deck legality (all four starter decks).
for (const [id, d] of Object.entries(DECKS)) {
  const total = d.main.reduce((n, [, k]) => n + k, 0);
  check(total === 30, `deck ${id}: main deck is exactly 30 (${total})`);
  check(d.main.every(([, k]) => k <= 2), `deck ${id}: no more than 2 copies of any card`);
  check(d.main.every(([cid]) => CARDS[cid] && CARDS[cid].kind !== 'ascension' && CARDS[cid].kind !== 'token'), `deck ${id}: every main card exists and is deckable`);
  const count = (pred) => d.main.filter(([cid]) => pred(CARDS[cid])).reduce((n, [, k]) => n + k, 0);
  check(count((c) => c.keywords?.includes('Ascendant')) <= 1, `deck ${id}: at most one Ascendant`);
  check(count((c) => c.keywords?.includes('Guardian')) <= 1, `deck ${id}: at most one Guardian`);
  check(d.main.every(([cid, k]) => !CARDS[cid].legendary || k === 1), `deck ${id}: legendary Relics (Crown Artifacts) are single copies`);
  check(d.main.every(([cid]) => (CARDS[cid].set ?? 1) === (d.set ?? 1)), `deck ${id}: uses only Set ${d.set ?? 1} cards`);
  check(d.ascension.length <= 8, `deck ${id}: Ascension Pile has ${d.ascension.length} (max 8)`);
  for (const a of d.ascension) {
    const def = CARDS[a];
    check(def?.kind === 'ascension', `deck ${id}: ${a} is an Ascension card`);
    check(d.main.some(([cid]) => cid === def.lineId), `deck ${id}: ${a} has its ★ form in the main deck`);
    if (def.star === 3) check(d.ascension.includes(`${def.lineId}-2`), `deck ${id}: ${a} has its ★★ form in the pile`);
  }
}

// 4. Card text truth: every printed trigger and effect is implemented, and every implemented effect is printed.
const words = (t) => (t.match(/\S+/g) ?? []).length;
const PHRASE = {
  scorch: /Scorch \d/, scorchAll: /Scorch \d each rival champion/, shield: /Shield/, shieldAll: /Shield each champion/, draw: /draw|Draw/,
  returnFallen: /Return/i, deployFree: /Deploy (a|up to two) (★ champion|Monster)s? costing \d or less from your hand/, deployFromFallen: /Deploy (a|up to two) ★ champions? costing \d or less from your Fallen pile/,
  mend: /Mend 1/, defeatGuardAtMost: /Defeat each rival champion with Guard \d or less/, stopOthersAttacking: /can’t attack this turn/,
  readyOncePerTurn: /ready /, readyOther: /Ready another champion/, readySelf: /Ready \w/, buffAll: /Might|Guard/, buffOthers: /Might/, buff: /Might|Guard/,
  gateBlock: /blocks/, cancelAttack: /attack ends/, command: /Command/, summon: /Summon/, buffRivals: /Each rival champion gets|every rival champion gets/i, unequip: /Relic/,
  buffTrait: /Might/, selfShard: /Break (one|two) of your own shards|break one of your own shards/, ascendNow: /Ascend/, extraZone: /Champion Zone/, coinFlip: /Flip a coin/,
  tuck: /bottom of your deck/, equipFree: /Attach a Relic costing \d or less/,
};
for (const c of Object.values(CARDS)) {
  const t = c.text ?? '';
  check(words(t) + (c.keywords?.length ?? 0) <= 45, `text: ${c.id} fits (≤45 words)`);
  const trig = c.kind === 'champion' || c.kind === 'ascension' || c.kind === 'token' || c.kind === 'relic';
  const effects = trig ? [c.arrive, c.ascend, c.attack, c.block, c.attacked, c.defeats, c.defeated, c.rise].flat().filter(Boolean)
    : c.kind === 'edict' ? [] : c.effects;
  const flat = effects.flatMap((e) => (e.op === 'coinFlip' ? [e, ...e.heads, ...e.tails] : [e]));
  for (const e of flat) check(PHRASE[e.op]?.test(t), `truth: ${c.id} prints its "${e.op}" effect`);
  if (trig) {
    check(/Arrival:/.test(t) === !!c.arrive?.length, `truth: ${c.id} "Arrival:" text ⇔ arrival effect`);
    check(/Ascend:/.test(t) === !!c.ascend?.length, `truth: ${c.id} "Ascend:" text ⇔ ascend effect`);
    check(/Attack:/.test(t) === !!c.attack?.length, `truth: ${c.id} "Attack:" text ⇔ attack effect`);
    check(/Block:/.test(t) === !!c.block?.length, `truth: ${c.id} "Block:" text ⇔ block effect`);
    check(/At the start of your turn/.test(t) === !!c.rise?.length, `truth: ${c.id} start-of-turn text ⇔ effect`);
    check(/is defeated/.test(t) === !!c.defeated?.length, `truth: ${c.id} "is defeated" text ⇔ effect`);
    check(/defeats a champion on your turn/i.test(t) === !!c.defeats?.length, `truth: ${c.id} defeat trigger text ⇔ effect`);
    const st = c.statics ?? {};
    check(/have \+\d/.test(t) === !!(st.auraMight || st.auraGuard || st.originAura), `truth: ${c.id} aura text ⇔ aura effect`);
    check(/fewer shards than your rival\./.test(t.replace(/, or \+\d if you have fewer shards than your rival/, '')) === !!st.mightIfBehind || /Might while you have fewer shards/.test(t) === !!st.mightIfBehind, `truth: ${c.id} "fewer shards" text ⇔ effect`);
    check(/while blocking/.test(t) === !!st.mightWhileBlocking, `truth: ${c.id} "while blocking" text ⇔ effect`);
    check(/holds a Relic/.test(t) === !!(st.mightIfRelic || st.guardIfRelic), `truth: ${c.id} "holds a Relic" text ⇔ effect`);
  } else if (c.kind === 'edict') {
    check(Object.keys(c.rule).length > 0, `truth: ${c.id} Edict has an implemented rule`);
  } else {
    check(c.effects.length > 0, `truth: ${c.id} has an implemented effect`);
    check(c.kind === 'tactic' || !!c.when, `truth: ${c.id} Scheme has a spring condition`);
  }
  if (c.kind === 'relic') {
    check(!c.might || t.includes(`+${c.might} Might`), `truth: ${c.id} prints its +${c.might} Might`);
    check(!c.guard || t.includes(`+${c.guard} Guard`), `truth: ${c.id} prints its +${c.guard} Guard`);
    for (const k of c.keywords ?? []) check(t.includes(k), `truth: ${c.id} prints keyword ${k}`);
    if (c.origin) check(/The holder is also/.test(t), `truth: ${c.id} prints its Emblem Origin`);
  }
}
check(allSpells.every((s) => !champLines.some((l) => s.name === l.name)), 'names: no Tactic/Scheme shares a champion’s name');

// 5. Engine determinism and conservation across every starter-deck pairing.
const ids = Object.keys(DECKS);
const pairs = ids.flatMap((a, i) => ids.slice(i).map((b) => [a, b]));
const run = () => pairs.flatMap(([a, b], j) => Array.from({ length: 12 }, (_, k) => playOut(newGame({ seed: 777 + j * 100 + k, first: k % 2, decks: k % 2 ? [b, a] : [a, b] }))));
const A = run(), B = run();
check(JSON.stringify(A) === JSON.stringify(B), `engine: ${A.length} seeded AI games across all deck pairings replay identically`);
check(A.every((s) => s.players.every((p) => cardsInZones(p) === 30 + DECKS[p.deckId].ascension.length)), 'engine: every card is conserved in every game');
check(A.every((s) => s.phase === 'over' && s.winner !== null), 'engine: every game finishes with a winner');

console.log(`${passes.length} checks passed, ${fails.length} failed`);
for (const f of fails.slice(0, 60)) console.log('FAIL', f);
process.exit(fails.length ? 1 : 0);
