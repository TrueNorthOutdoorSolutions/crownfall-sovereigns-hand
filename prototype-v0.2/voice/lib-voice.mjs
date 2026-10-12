// Shared extractor for the voice-over pack. Reads the game's own text (never a copy of it):
//   • campaign story lines + chapter/act titles from src/v02/campaign/act*.ts
//   • champion speech quotes (★★ / ★★★) from src/v02/content/printings.ts (Set 1) and set2.ts FLAVOUR (SET2_LINES)
// Used by build-voice.mjs (writes the script, CSV and manifest) and check-voice.mjs (sync check).
import { build } from 'esbuild';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const VOICE_DIR = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(VOICE_DIR, '..', '..');

/** Bundle a TS module with esbuild (in memory) and import it. */
export async function loadTs(rel) {
  const r = await build({ entryPoints: [join(ROOT, rel)], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
  return import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'));
}

const pad = (n) => String(n).padStart(2, '0');
const ROMAN = { I: 'One', II: 'Two', III: 'Three', IV: 'Four', V: 'Five', VI: 'Six', VII: 'Seven', VIII: 'Eight', IX: 'Nine', X: 'Ten' };
export const romanWord = (r) => ROMAN[r] ?? r;

/** Spoken word count. Non-verbal cues (* hums *) and a bare ellipsis count as 0 words. */
export function wordCount(text) {
  if (/^\s*\*.*\*\s*$/.test(text) || /^\s*…\s*$/.test(text)) return 0;
  return text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

/** Every act module in src/v02/campaign (act1.ts, act2.ts, …), in order. */
export async function loadActs() {
  const files = readdirSync(join(ROOT, 'src/v02/campaign')).filter((f) => /^act\d+\.ts$/.test(f)).sort((a, b) => parseInt(a.slice(3)) - parseInt(b.slice(3)));
  const acts = [];
  for (const f of files) {
    const mod = await loadTs(`src/v02/campaign/${f}`);
    for (const v of Object.values(mod)) if (v && typeof v === 'object' && Array.isArray(v.chapters) && v.id) acts.push({ file: f, act: v });
  }
  return acts;
}

/** All campaign lines the player sees on a story panel, in play order, with stable line IDs.
 *  ID = A{act}-C{chapter}-{scene}-{line}: scene P00 = chapter prologue, B01…B16 = Bout in map order (B16 = the Crowning), T00 = title card. */
export async function extractCampaign() {
  const out = [];
  for (const { act } of await loadActs()) {
    const an = parseInt(String(act.id).replace(/\D/g, ''), 10) || 1;
    const actNumeral = Object.keys(ROMAN)[an - 1] ?? String(an);
    out.push({ section: 'title', id: `A${an}-C0-T00-01`, act: an, chapter: 0, scene: 'Act title card', boutId: null, speaker: 'Narration',
      text: `Act ${actNumeral} · ${act.title}`, sayAs: `Act ${romanWord(actNumeral)}. ${act.title}.`, idx: 1, of: 1, canon: false });
    act.chapters.forEach((c, ci) => {
      const ch = ci + 1;
      out.push({ section: 'title', id: `A${an}-C${ch}-T00-01`, act: an, chapter: ch, scene: 'Chapter title card', boutId: null, speaker: 'Narration',
        text: `Chapter ${c.numeral} · ${c.title}`, sayAs: `Chapter ${romanWord(c.numeral)}. ${c.title}.`, idx: 1, of: 1, canon: false, chapterTitle: c.title });
      c.intro.forEach((l, i) => out.push({ section: 'campaign', id: `A${an}-C${ch}-P00-${pad(i + 1)}`, act: an, chapter: ch, scene: 'Prologue', boutId: null,
        speaker: l.speaker, text: l.text, canon: !!l.canon, idx: i + 1, of: c.intro.length, chapterTitle: c.title }));
      c.bouts.forEach((b, bi) => {
        const label = b.crowning ? 'The Crowning' : `Trial ${b.trial} · Bout ${b.bout}`;
        b.story.forEach((l, i) => out.push({ section: 'campaign', id: `A${an}-C${ch}-B${pad(bi + 1)}-${pad(i + 1)}`, act: an, chapter: ch,
          scene: b.crowning ? b.title : `${label} · ${b.title}`, boutId: b.id, boutTitle: b.title, crowning: !!b.crowning, trialName: b.crowning ? 'The Crowning' : c.trials[b.trial - 1],
          speaker: l.speaker, text: l.text, canon: !!l.canon, idx: i + 1, of: b.story.length, chapterTitle: c.title, edict: b.setup?.edict ?? null, crowningEdicts: b.crowning ? Object.fromEntries(Object.entries(b.crowning).map(([d, v]) => [d, v.setup?.edict ?? null])) : null }));
      });
    });
  }
  return out;
}

/** Champion speech on cards: ★★ and ★★★ forms. ★ flavour is third-person description (narration), so it is not a quote. */
export async function extractCardQuotes() {
  const { CARDS } = await loadTs('src/v02/content/cards.ts');
  const { SET2_LINES } = await loadTs('src/v02/content/set2.ts');
  const { SET1_PRINTINGS } = await loadTs('src/v02/content/printings.ts');
  const out = [];
  for (const p of SET1_PRINTINGS) {
    if (p.kind !== 'base' || !p.flavour) continue;
    const m = /^(.*)-([23])$/.exec(p.cardId);
    if (!m || !CARDS[p.cardId] || CARDS[m[1]]?.kind !== 'champion') continue;
    out.push({ section: 'cardquote', set: 1, canonId: m[1], star: +m[2], speaker: CARDS[m[1]].name, text: p.flavour, cardNo: p.id,
      id: `CQ-S1-${m[1].toUpperCase()}-${m[2]}` });
  }
  for (const line of SET2_LINES ?? []) {
    if (line.set !== 2 || line.family !== 'champion' || !line.flavour) continue;
    for (const star of [2, 3]) {
      const t = line.flavour[star];
      if (!t) continue;
      out.push({ section: 'cardquote', set: 2, canonId: line.canonId, star, speaker: line.name, text: t, cardNo: `${line.lineId} ★${star}`,
        id: `CQ-S2-${line.canonId.toUpperCase()}-${star}` });
    }
  }
  return out;
}
