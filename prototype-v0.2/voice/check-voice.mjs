// Voice sync check. Re-extracts every spoken line from the game (all src/v02/campaign/act*.ts, plus the champion card
// quotes) and compares it with voice_manifest.json. Reports lines the game has that the manifest lacks, lines whose
// words changed, and manifest lines the game no longer has. Also checks each announcer line's words still exist in
// the UI source it was taken from.
// Run:  node prototype-v0.2/voice/check-voice.mjs        Exit code 1 if anything is missing or changed.
// Fix:  node prototype-v0.2/voice/build-voice.mjs        (then re-record any line reported as CHANGED)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, VOICE_DIR, extractCampaign, extractCardQuotes } from './lib-voice.mjs';
import { ANNOUNCER } from './cast.mjs';

const manifest = JSON.parse(readFileSync(join(VOICE_DIR, 'voice_manifest.json'), 'utf8'));
const byId = new Map(manifest.lines.map((l) => [l.id, l]));
const game = [...(await extractCampaign()), ...(await extractCardQuotes())];

const missing = [], changed = [], speaker = [];
for (const g of game) {
  const m = byId.get(g.id);
  if (!m) { missing.push(g); continue; }
  if (m.text !== g.text) changed.push({ id: g.id, was: m.text, now: g.text });
  if (m.speaker !== g.speaker) speaker.push({ id: g.id, was: m.speaker, now: g.speaker });
}
const gameIds = new Set(game.map((g) => g.id));
const stale = manifest.lines.filter((l) => (l.section === 'campaign' || l.section === 'title' || l.section === 'cardquote') && !gameIds.has(l.id));

const annMissing = [];
for (const a of ANNOUNCER) {
  const [file, needle] = a.source;
  if (!readFileSync(join(ROOT, file), 'utf8').includes(needle)) annMissing.push(`${a.id}: "${needle}" no longer found in ${file}`);
}

const campaignCount = game.filter((g) => g.section === 'campaign').length;
console.log(`Voice check: ${game.length} game lines (${campaignCount} campaign story, ${game.filter((g) => g.section === 'title').length} title cards, ${game.filter((g) => g.section === 'cardquote').length} card quotes) vs ${manifest.lines.length} manifest lines.`);
console.log(`  missing from manifest: ${missing.length}`);
for (const g of missing) console.log(`    + ${g.id} [${g.speaker}] ${g.text}`);
console.log(`  text changed:          ${changed.length}`);
for (const c of changed) console.log(`    ~ ${c.id}\n        was: ${c.was}\n        now: ${c.now}`);
console.log(`  speaker changed:       ${speaker.length}`);
for (const s of speaker) console.log(`    ~ ${s.id}: ${s.was} -> ${s.now}`);
console.log(`  in manifest, no longer in game: ${stale.length}`);
for (const s of stale) console.log(`    - ${s.id} [${s.speaker}] ${s.text}`);
console.log(`  announcer source text missing: ${annMissing.length}`);
for (const a of annMissing) console.log(`    ! ${a}`);
const bad = missing.length + changed.length + speaker.length + stale.length + annMissing.length;
console.log(bad ? '\nOUT OF SYNC: run build-voice.mjs, then re-record any CHANGED lines.' : '\nIn sync: 0 missing, 0 changed.');
process.exit(bad ? 1 : 0);
