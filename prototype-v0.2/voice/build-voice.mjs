// Builds the voice-over pack from the game's own text:
//   VOICE_SCRIPT.md (owner-friendly script + cast), voice_lines.csv (Excel), voice_manifest.json (for the game).
// Run:  node prototype-v0.2/voice/build-voice.mjs      Re-run whenever campaign or card text changes (e.g. Act II).
// Spoken words are never typed here: they are read from src/v02 (see lib-voice.mjs). Only PROPOSED extras live in cast.mjs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, VOICE_DIR, loadTs, extractCampaign, extractCardQuotes, wordCount, romanWord } from './lib-voice.mjs';
import { CAST, DELIVERY, ANNOUNCER, REUSE, PROPOSED, PRONUNCIATION } from './cast.mjs';

const WPM = 150;
const campaign = await extractCampaign();
const quotes = await extractCardQuotes();
const { CARDS } = await loadTs('src/v02/content/cards.ts');
const { ACT_I } = await loadTs('src/v02/campaign/act1.ts');

// speaker name → canonId (Set 1 champion) → lore file header
const NAME_TO_ID = {};
for (const c of Object.values(CARDS)) if (c.kind === 'champion' && c.set === 1 && c.canonId === c.id) NAME_TO_ID[c.name] = c.id;
const loreHeader = (name) => {
  const id = NAME_TO_ID[name]; if (!id) return null;
  const f = join(ROOT, 'prototype-v0.2/lore/champions', `${id}.md`);
  if (!existsSync(f)) return null;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  return { id, title: lines[0].replace(/^#\s*/, ''), meta: (lines[1] || '').replace(/^\*|\*$/g, '') };
};

const pronounOf = (name) => {
  const imp = CAST[name]?.impression ?? '';
  return /woman|female|girl/i.test(imp) ? 'she' : /\b(man|male|boy)\b|boy-like/i.test(imp) ? 'he' : 'see lore';
};

// ---------- rows ----------
const INSTRUCTION = /\b(round \d|Hold|Survive|Break|Keep|Go around|Let him|Find the hinge|flow around|Lose no more)\b/;
function delivery(r) {
  if (DELIVERY[r.id]) return DELIVERY[r.id];
  const t = r.text.trim();
  if (r.speaker === 'Narration') {
    if (r.section === 'title') return `Title card: clear and ceremonial. Read it as "${r.sayAs}"`;
    if (r.scene === 'Prologue' && r.idx === 1) return 'Opening of the chapter: unhurried, set the scene.';
    if (r.crowning) return 'Hushed and slow; leave space around it.';
    if (INSTRUCTION.test(t)) return 'Clear and steady: the instruction is plain, not dramatic.' + (/\d/.test(t) ? ' Say numbers as words.' : '');
    if (r.canon) return 'Storyteller with dry wit; a small pause before the final turn.';
    return 'Storyteller, warm and measured.';
  }
  if (/^\*.*\*$/.test(t)) return 'NON-VERBAL performance cue (no words).';
  if (t.endsWith('…')) return 'Trailing off; let it hang.';
  if (/!$/.test(t)) return t === t.toUpperCase() ? 'Full-voiced shout (big, joyful or fierce, never screamed).' : 'Projected battle cry: energetic, not screamed.';
  if (/\?$/.test(t)) return 'A real question, in character.';
  const feel = (CAST[r.speaker]?.tone ?? '').split(/[;:]/)[0].toLowerCase();
  if (r.canon && wordCount(t) <= 6) return `Signature line, fully in character (${feel}).`;
  return `Conversational, in character (${feel}).`;
}
function trigger(r) {
  if (r.section === 'title') return r.chapter === 0 ? `OPTIONAL title card: the Act ${['I', 'II', 'III'][r.act - 1]} campaign map opens for the first time.` : `OPTIONAL title card: the Chapter ${romanWord(r.text.split(' ')[1])} prologue panel opens, before its first line.`;
  if (r.scene === 'Prologue') return `Prologue panel opens (automatically on the first visit to Chapter ${r.chapter}, or via the "Prologue" button). Line ${r.idx} of ${r.of}, in order.`;
  return `Story panel opens when the player taps the "${r.boutTitle}" node. Line ${r.idx} of ${r.of}, in order; stops if the panel closes or the Bout begins.`;
}

const rows = [];
const add = (r) => rows.push({ ...r, words: wordCount(r.sayAs && /★/.test(r.text) ? r.sayAs : r.text), file: `${r.id}.wav` });
for (const r of campaign) add({ ...r, trigger: trigger(r), delivery: delivery(r) });
for (const q of quotes) {
  const champ = q.speaker;
  add({ ...q, act: '', chapter: '', scene: `Card quote · Set ${q.set} · ${'★'.repeat(q.star)}`, canon: q.set === 1,
    trigger: q.star === 2 ? `OPTIONAL bark: ${champ} Ascends to ★★ (plays with the ★★ burst).` : `OPTIONAL bark: ${champ} Awakens to ★★★ (the quote is already shown under the card in the ★★★ cinematic).`,
    delivery: /^\*.*\*$/.test(q.text) ? 'NON-VERBAL performance cue (no words).' : q.star === 2 ? 'Rising: power arriving. In character.' : 'Peak moment: full legend, in character.' });
}
// Announcer: fixed lines, one "… Ascends" per champion, and the campaign verdict variants actually reachable in the acts.
const ann = [...ANNOUNCER];
for (const [name] of Object.entries(NAME_TO_ID).sort()) ann.push({ id: `ANN-ASCEND-${NAME_TO_ID[name].toUpperCase()}`, text: `${name} Ascends`,
  trigger: `OPTIONAL. ${name} reaches ★★ (the "★★ ${name} Ascends" burst). Alternative: one shared Crownfall "Ascension." for every champion.`, delivery: 'Bright, ceremonial; the name is the point.', source: ['src/v02/ui/AscendFx.tsx', 'Ascends'] });
const objectives = ACT_I.chapters.flatMap((c) => c.bouts.map((b) => b.objective));
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
for (const n of [...new Set(objectives.filter((o) => o.kind === 'survive').map((o) => o.rounds))].sort())
  ann.push({ id: `ANN-VERDICT-HELD-R${n}`, text: `You held the line until round ${n}.`, sayAs: `You held the line until round ${NUM[n]}.`, trigger: `Campaign "Survive until round ${n}" Bout won (results sub-line).`, delivery: 'Proud, warm.', source: ['src/v02/campaign/setup.ts', 'You held the line until round'] });
for (const n of [...new Set(objectives.filter((o) => o.kind === 'keepShards').map((o) => o.n))].sort())
  for (let x = 1; x < n; x++)
    ann.push({ id: `ANN-VERDICT-SHORT-N${n}-X${x}`, text: `You won, but with only ${x} shards left. The Bout needs ${n}.`, sayAs: `You won, but with only ${NUM[x]} shard${x === 1 ? '' : 's'} left. The Bout needs ${NUM[n]}.`,
      trigger: `Campaign "Win with at least ${n} shards" Bout won with only ${x} left (counts as a loss).`, delivery: 'Fair, a little rueful; not mocking.' + (x === 1 ? ' NOTE: the game text says "1 shards"; read it as "one shard".' : ''), source: ['src/v02/campaign/setup.ts', 'You won, but with only'] });
for (const a of ann) add({ ...a, section: 'announcer', speaker: 'The Arena', act: '', chapter: '', scene: 'Announcer callout', canon: true });

// same words, same speaker → one recording serves both
const firstBy = new Map();
const norm = (s) => s.replace(/[’']/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
for (const r of rows) {
  const k = `${r.speaker}|${norm(r.text)}`;
  if (r.sameAs) continue;
  if (firstBy.has(k)) r.sameAs = firstBy.get(k); else firstBy.set(k, r.id);
}
const reuseOf = Object.fromEntries(REUSE.filter((x) => /^A\d/.test(x.use)).map((x) => [x.use.split(' ')[0], x.crownfallId]));
for (const r of rows) if (reuseOf[r.id]) r.reuse = reuseOf[r.id];

// ---------- stats ----------
const sum = (xs) => xs.reduce((a, r) => a + r.words, 0);
const sect = (s) => rows.filter((r) => r.section === s);
const toRecord = rows.filter((r) => !r.sameAs && !r.reuse);
const speakers = [...new Set(rows.map((r) => r.speaker))];
const mins = (w) => (w / WPM).toFixed(1);
const propWords = PROPOSED.reduce((a, p) => a + wordCount(p.text), 0);

// ---------- CSV ----------
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const header = ['id', 'act', 'chapter', 'scene', 'speaker', 'trigger', 'delivery', 'text', 'words', 'filename', 'section', 'say_as', 'same_as', 'reuse_crownfall', 'canon'];
const csvRows = [...rows.map((r) => [r.id, r.act, r.chapter, r.scene, r.speaker, r.trigger, r.delivery, r.text, r.words, r.file, r.section, r.sayAs, r.sameAs, r.reuse, r.canon ? 'yes' : '']),
  ...PROPOSED.map((p) => [p.id, '', '', 'PROPOSED extra (not in the game yet)', p.speaker, p.trigger, p.delivery, p.text, wordCount(p.text), `${p.id}.wav`, 'PROPOSED', '', '', '', 'PROPOSED'])];
writeFileSync(join(VOICE_DIR, 'voice_lines.csv'), '﻿' + [header, ...csvRows].map((r) => r.map(q).join(',')).join('\r\n') + '\r\n', 'utf8');

// ---------- manifest (mirrors Crownfall's voice_manifest.json conventions) ----------
const manifest = {
  $comment: "SOVEREIGN'S HAND VOICE MANIFEST. Built by prototype-v0.2/voice/build-voice.mjs from the game's own text; do not edit by hand. Playback rule (Crownfall's): approved recording -> play it; no recording -> silence, the text still shows. Never a synthetic voice. PROPOSED extras are NOT listed here until approved. `recorded` will be maintained by the import step once files exist.",
  version: 1, language: 'en', game: "Crownfall: Sovereign's Hand", defaultPack: 'default',
  packs: [{ id: 'default', name: 'Campaign cast', description: "Narrator, the Arena announcer (Crownfall's locked voice) and the 55 champions.", available: true }],
  masterFormat: 'wav', runtimeFormats: ['mp3', 'm4a', 'ogg', 'webm', 'wav'],
  masterSpec: { container: 'WAV', sampleRateHz: 48000, bitDepth: 24, channels: 1, truePeakDbtp: -1, loudnessLufs: -18, headTailSeconds: 0.3 },
  voices: speakers.map((s) => ({ speaker: s, role: CAST[s]?.role ?? 'Champion', pronoun: CAST[s]?.pronoun ?? undefined, accent: CAST[s]?.accent, tone: CAST[s]?.tone })),
  pronunciation: PRONUNCIATION.map(([word, say, note]) => ({ word, say, note })),
  lines: rows.map((r) => ({ id: r.id, speaker: r.speaker, trigger: r.trigger, text: r.text, file: r.file, section: r.section,
    ...(r.boutId ? { boutId: r.boutId } : {}), ...(r.idx ? { line: r.idx, of: r.of } : {}), ...(r.sayAs ? { sayAs: r.sayAs } : {}),
    ...(r.sameAs ? { sameAs: r.sameAs } : {}), ...(r.reuse ? { reuseCrownfall: r.reuse } : {}), direction: r.delivery, canon: !!r.canon, recorded: false })),
  reuseFromCrownfall: REUSE,
};
writeFileSync(join(VOICE_DIR, 'voice_manifest.json'), JSON.stringify(manifest, null, 1) + '\n', 'utf8');

// ---------- VOICE_SCRIPT.md ----------
const md = [];
const P = (...l) => md.push(...l);
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');
P(`# Crownfall: Sovereign's Hand — Voice-Over Script and Casting Guide`, '',
  `*Generated ${new Date().toLocaleDateString('en-CA')} from the game's own text by \`prototype-v0.2/voice/build-voice.mjs\`. Every spoken line below is copied word for word from the game. The casting notes (accents, ages) are suggestions; change anything you like.*`, '',
  `**The one rule:** the game plays a real recorded voice, or nothing. It will never make up a computer voice. If a line has no recording yet, the words simply show on screen as they do today.`, '');
P('## At a glance', '',
  '| What | Lines | Words | Finished minutes (≈150 words/min) |', '|---|---:|---:|---:|',
  `| Campaign story (Act I: prologues + Bout story panels) | ${sect('campaign').length} | ${sum(sect('campaign'))} | ${mins(sum(sect('campaign')))} |`,
  `| Title cards (Act + chapter names, optional) | ${sect('title').length} | ${sum(sect('title'))} | ${mins(sum(sect('title')))} |`,
  `| Champion card quotes (★★ / ★★★ barks, optional) | ${sect('cardquote').length} | ${sum(sect('cardquote'))} | ${mins(sum(sect('cardquote')))} |`,
  `| Announcer callouts (match + campaign results) | ${sect('announcer').length} | ${sum(sect('announcer'))} | ${mins(sum(sect('announcer')))} |`,
  `| **Total in the game today** | **${rows.length}** | **${sum(rows)}** | **${mins(sum(rows))}** |`,
  `| Actually needing a new recording (repeats and Crownfall reuse removed) | ${toRecord.length} | ${sum(toRecord)} | ${mins(sum(toRecord))} |`,
  `| PROPOSED extra lines (only if you approve them) | ${PROPOSED.length} | ${propWords} | ${mins(propWords)} |`, '',
  `**Distinct voices: ${speakers.length}** — the Narrator, the Announcer and all 55 champions (every champion speaks in Act I).`, '',
  `Minutes are finished audio at about 150 words a minute. Real files run a little longer because of pauses and the 0.3 s of silence at each end; budget roughly ${Math.ceil(sum(rows) / WPM * 1.3)} minutes of finished audio for everything.`, '',
  '**Not voiced on purpose:** the "Objective", "Rules", "Rival" and "Reward" boxes on each story panel (they are instructions, not story), card names, menus and buttons.', '');

// Cast list
P('## Cast list', '', `${speakers.length} voices. "Campaign" = story lines; "Cards" = the optional card quotes.`, '',
  '| Voice | Who they are | Campaign lines / words | Card quotes / words |', '|---|---|---:|---:|');
const castOrder = ['Narration', 'The Arena', ...speakers.filter((s) => s !== 'Narration' && s !== 'The Arena')];
for (const s of castOrder) {
  const mine = rows.filter((r) => r.speaker === s);
  const camp = mine.filter((r) => r.section === 'campaign' || r.section === 'title' || r.section === 'announcer');
  const cards = mine.filter((r) => r.section === 'cardquote');
  const h = loreHeader(s);
  P(`| ${s === 'Narration' ? 'Narrator' : s === 'The Arena' ? 'Announcer ("The Arena")' : s} | ${cell(h ? h.title.split(' — ')[1] ?? '' : CAST[s]?.role ?? '')} | ${camp.length} / ${sum(camp)} | ${cards.length} / ${sum(cards)} |`);
}
P('');
for (const s of castOrder) {
  const c = CAST[s] ?? {};
  const h = loreHeader(s);
  const mine = rows.filter((r) => r.speaker === s);
  const sample = mine.find((r) => r.section === 'campaign') ?? mine[0];
  const name = s === 'Narration' ? 'Narrator' : s === 'The Arena' ? 'The Announcer ("The Arena")' : s;
  P(`### ${name}`, '');
  if (h) P(`*${h.meta}* · pronoun: **${c.pronoun ?? pronounOf(s)}**`, '');
  P(`- **Gender / age impression:** ${c.impression ?? '—'}`,
    `- **Accent (suggestion):** ${c.accent ?? '—'}`,
    `- **Tone:** ${c.tone ?? '—'}`,
    `- **Pace:** ${c.pace ?? '—'}`,
    `- **Sounds like:** ${c.reference ?? '—'}`,
    `- **Sample line:** "${sample?.text ?? ''}"${sample ? ` (${sample.id})` : ''}`,
    `- **Workload:** ${mine.length} lines, ${sum(mine)} words`, '');
}
P('**Young voices** (Emberling, Hexie, Kira Volt, Seren, Bramble): use adult performers who specialise in young characters.', '',
  '**Machines and creatures** (Bolt, Gearwick-9, HEX-3, Titan Rho, ATLAS-Ω, Dreadmouth, Ronin Zero, Zyrak, Veilwalker): a real performer records every line; any robotic or monstrous effect is added on top of that recording. Please send the clean (dry) take as well as the processed one.', '');

// Script
P('## The script (Act I · The Shattered Crown, in play order)', '',
  'Each scene is one story panel. Lines play in order, one after another. ID = **A**ct-**C**hapter-scene-line: **P00** = chapter prologue, **B01–B15** = the Bouts in map order, **B16** = the Crowning, **T00** = optional title card.', '');
let lastCh = -1, lastScene = '';
for (const r of rows.filter((x) => x.section === 'campaign' || x.section === 'title')) {
  if (r.chapter !== lastCh) {
    lastCh = r.chapter; lastScene = '';
    if (r.chapter === 0) P(`### Act ${['I', 'II', 'III'][r.act - 1]} title`, '');
    else P(`### Chapter ${ACT_I.chapters[r.chapter - 1].numeral} · ${ACT_I.chapters[r.chapter - 1].title}`, '');
  }
  const sceneKey = `${r.chapter}|${r.scene}`;
  if (sceneKey !== lastScene && r.section !== 'title') {
    lastScene = sceneKey;
    const when = r.scene === 'Prologue' ? `the chapter's prologue panel opens (automatically on the first visit to Chapter ${ACT_I.chapters[r.chapter - 1].numeral}, or via the "Prologue" button). Lines play in order.`
      : `the player taps "${r.boutTitle}" on the chapter map and its story panel opens. Lines play in order; audio stops if the panel closes or the Bout begins.`;
    P(`#### ${r.scene === 'Prologue' ? 'Prologue' : r.scene}`, '', `*Plays when:* ${when}${r.edict ? ` · Edict in play: ${CARDS[r.edict]?.name ?? r.edict} (Crownfall has an announcer line for it, see Reuse)` : ''}`, '');
  }
  const extra = [r.sameAs ? `same words as ${r.sameAs}: one recording` : '', r.reuse ? `**already recorded** in Crownfall as \`${r.reuse}\`` : '', r.section === 'title' ? r.trigger : ''].filter(Boolean).join(' · ');
  P(`- **${r.id}** · **${r.speaker === 'Narration' ? 'Narrator' : r.speaker === 'The Arena' ? 'Announcer' : r.speaker}** · *${r.delivery}*${extra ? ` · ${extra}` : ''}`, `  > ${r.text}`, '');
}

// Card quotes
P('## Champion card quotes (optional barks when the card is played / ascends)', '',
  'Only spoken lines are listed: the ★ card text is third-person description and stays as on-screen text. ★★ plays when the champion Ascends; ★★★ plays in the ★★★ Awakening cinematic, which already shows the quote under the card. Lines marked *same as* are identical to a campaign line, so one recording serves both.', '',
  '**Set 2 quotes** (Act II · Beneath the Arena) are in the game data but marked PROPOSED there, so wait for your approval of the Set 2 text before recording them.', '');
for (const set of [1, 2]) {
  P(`### Set ${set}${set === 2 ? ' (text PROPOSED in game data)' : ''}`, '', '| ID | Champion | Form | Quote | Note |', '|---|---|---|---|---|');
  for (const r of rows.filter((x) => x.section === 'cardquote' && x.set === set))
    P(`| ${r.id} | ${cell(r.speaker)} | ${'★'.repeat(r.star)} | ${cell(r.text)} | ${r.sameAs ? `same as ${r.sameAs}` : /^\*.*\*$/.test(r.text) ? 'non-verbal' : ''} |`);
  P('');
}

// Announcer
P('## The Announcer (game-event callouts)', '',
  "Sovereign's Hand reuses **the Crownfall announcer**: the same locked voice (female, Irish, mature, warm, regal, controlled, cinematic, authoritative without shouting, slightly mysterious) and, ideally, the same performer. She already speaks the two \"The Arena\" lines in the Chapter I prologue. Like in Crownfall, she speaks at big moments and stays quiet otherwise.", '',
  '### Lines that exist as on-screen text in Sovereign\'s Hand', '', '| ID | Words | Say it as | When it plays | Delivery |', '|---|---|---|---|---|');
for (const r of rows.filter((x) => x.section === 'announcer')) P(`| ${r.id} | ${cell(r.text)} | ${cell(r.sayAs ?? '')} | ${cell(r.trigger)} | ${cell(r.delivery)} |`);
P('', '### Already recorded for Crownfall (reuse at no cost, optional)', '',
  "These are Crownfall's approved announcer lines, already recorded (files in `Desktop\\Crownfall\\audio-masters\\announcer\\default\\en`). They are not Sovereign's Hand text, so they are optional extras; nothing new needs recording.", '',
  '| Crownfall ID | Words | Where it could play in Sovereign\'s Hand |', '|---|---|---|');
for (const x of REUSE) P(`| ${x.crownfallId} | ${cell(x.text)} | ${cell(x.use)} |`);
P('');

// Proposed
P('## PROPOSED extra lines (NOT in the game yet: approve before recording)', '',
  'These are new words suggested to fill quiet moments. None of them is canon; nothing is recorded or wired in unless you say yes.', '',
  '| ID | Speaker | PROPOSED words | When it would play | Delivery |', '|---|---|---|---|---|');
for (const p of PROPOSED) P(`| ${p.id} | ${p.speaker === 'Narration' ? 'Narrator' : 'Announcer'} | ${cell(p.text)} | ${cell(p.trigger)} | ${cell(p.delivery)} |`);
P('');

// Pronunciation + specs + handoff
P('## Pronunciation guide', '', '| Word | Say | Source |', '|---|---|---|');
for (const [w, s, n] of PRONUNCIATION) P(`| ${w} | ${s} | ${n} |`);
P('', 'Say numbers as words ("round 6" = "round six"). The ★ symbols are not read aloud unless the "Say it as" column says so.', '',
  '## Recording specs', '',
  '- **Masters:** WAV, 48 kHz, 24-bit, mono.',
  '- **Peak:** no higher than −1 dBTP (true peak).',
  '- **Loudness:** about −18 LUFS for dialogue (keep every voice consistent with the others).',
  '- **Silence:** 0.3 s of clean room tone at the start and end of every file.',
  '- **One file per line**, named exactly by its line ID: `A1-C3-B07-02.wav`, `CQ-S1-BOLT-2.wav`, `ANN-SHARD-YOURS.wav`.',
  '- Lines marked *same as* or *already recorded* do not need a new file.',
  '- No music or sound effects baked in. Creature or robot effects: send the dry take too.',
  '- Optional: 2–3 alternate takes as `A1-C3-B07-02_alt1.wav`.', '',
  '## How to hand the files back', '',
  "1. Put the finished WAVs in one folder per line ID (for example `voice-masters\\A1-C3-B07-02\\A1-C3-B07-02.wav`), or simply all together in one folder named by line ID. Either is fine.",
  '2. Tell Claude where the folder is. Claude will check every file against this list (right name, right length, nothing missing), convert them to small game files, and wire them in so each line plays when its panel opens.',
  '3. Anything not recorded yet simply stays silent with its text on screen, so you can deliver in batches (for example Chapter I first).', '',
  '## Keeping this list up to date', '',
  '- `node prototype-v0.2/voice/build-voice.mjs` rebuilds this script, the CSV and the manifest from the game text.',
  '- `node prototype-v0.2/voice/check-voice.mjs` reports any game line missing from the manifest or whose words changed. Run it after writing Act II (it picks up `act2.ts` automatically).',
  '- Line IDs follow the Bout\'s position on the chapter map. If a Bout is inserted or reordered after recording, rebuild and re-check before recording anything new.', '');
writeFileSync(join(VOICE_DIR, 'VOICE_SCRIPT.md'), md.join('\n'), 'utf8');

console.log(JSON.stringify({ lines: rows.length, words: sum(rows), minutes: +mins(sum(rows)), toRecord: toRecord.length, toRecordWords: sum(toRecord), voices: speakers.length,
  bySection: Object.fromEntries(['campaign', 'title', 'cardquote', 'announcer'].map((s) => [s, [sect(s).length, sum(sect(s))]])), proposed: [PROPOSED.length, propWords] }, null, 1));
