// Master card list for the art team: every Set 1 card with its rules text, flavour text and art brief.
// Generated from src/v02/content/cards.ts + data/canon-snapshot.json; do not edit the outputs by hand.
// Usage: npx tsx prototype-v0.2/tools/master-list.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_LINES, CARDS, DECKS, SPELLS, RULES_VERSION } from '../../src/v02/content/cards.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canon = JSON.parse(readFileSync(join(root, 'data', 'canon-snapshot.json'), 'utf8'));
const byId = Object.fromEntries(canon.champions.map((c) => [c.id, c]));
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const stars = (n) => '★'.repeat(n);

// Art briefs for Tactics and Schemes. These cards have no Crownfall canon, so the briefs are PROPOSED.
const SPELL_ART = {
  'rally-banners': 'Kingdom banners in blue and gold raised over a line of soldiers at dawn, every blade lifted at once.',
  reinforcements: 'Fresh Kingdom soldiers pouring through a castle gate into the arena, shields first.',
  'royal-dispatch': 'A falcon carrying a sealed royal letter stamped with the crown sigil, high over the arena.',
  'shield-wall': 'Tower shields locked edge to edge, glowing with soft dawn light.',
  'first-light': 'The first ray of sunrise striking a champion’s armour and turning it gold.',
  'dawnward-oath': 'A kneeling knight with sword raised as a sun-shaped ward forms around an ally.',
  'hold-the-gate': 'A lone defender bracing an arena gate as a charging attacker crashes into it.',
  'arrow-volley': 'A sky full of arrows arcing down over the arena, sunlight glinting on the heads.',
  firebolt: 'A spiralling bolt of flame streaking across the arena, trailing embers.',
  firestorm: 'Fire raining across the battlefield, the sky orange with drifting embers.',
  'feral-howl': 'A wolf pack howling at a blood-red moon, breath steaming.',
  'return-to-fire': 'Silhouettes of fallen warriors re-forming out of rising embers.',
  'flare-up': 'A champion’s weapon erupting in sudden white-hot flame.',
  kindling: 'A single spark catching in dry grass and growing into a flame.',
  bloodscent: 'A wolf with its nose to the ground, glowing red scent trails leading across the arena.',
  'ember-trap': 'Hidden embers bursting up from cracks in the arena floor beneath an attacker’s feet.',
  'cinder-veil': 'A curtain of ash and smoke swallowing an incoming charge.',
};

function status(c) {
  if (!c.deck) return 'Set 1 (draft, not yet in a deck)';
  const d = DECKS[c.deck];
  const inDeck = d.main.some(([id]) => id === c.id) || d.ascension.includes(c.id);
  return inDeck ? `Starter deck: ${d.name} (playtested)` : `Set 1 (draft): ${d.name} champion, not in its starter Ascension Pile`;
}

const rows = [];
let no = 0;
const total = ALL_LINES.length * 3 + SPELLS.length;
const lines = [...ALL_LINES].sort((a, b) => a.tier - b.tier || canon.champions.findIndex((c) => c.id === a.canonId) - canon.champions.findIndex((c) => c.id === b.canonId));
for (const l of lines) {
  const cc = byId[l.canonId];
  for (const f of l.forms) {
    const id = f.star === 1 ? l.canonId : `${l.canonId}-${f.star}`;
    const c = CARDS[id];
    const flavour = f.star === 1 ? cc.lore : f.star === 2 ? cc.lines.star : cc.lines.ult ?? cc.lines.win;
    const flavourSource = f.star === 1 ? 'Crownfall lore' : f.star === 2 ? 'Crownfall voice line (gains a star)' : cc.lines.ult ? 'Crownfall voice line (ultimate)' : 'Crownfall voice line (victory)';
    rows.push({
      no: String(++no).padStart(3, '0'), name: l.name, title: l.title, form: stars(f.star), type: f.star === 1 ? 'Champion' : 'Ascension',
      status: status(c), tier: `Tier ${ROMAN[l.tier]} · ${cc.tierName}`, origins: l.origins.map(cap).join(' · '), classes: l.classes.map(cap).join(' · '),
      cost: f.star === 1 ? String(f.cost) : '', ascend: f.star === 1 ? '' : `↑${f.cost}`, might: String(f.might), guard: String(f.guard),
      keywords: f.keywords.join(', '), ability: f.text ? f.ability ?? '' : '', text: f.text, crown: f.star === 3 ? 'Breaks 2 shards' : '',
      flavour, flavourSource, art: cc[`star${f.star}`], artSource: `Crownfall star ${f.star} description`,
      file: `champions/${l.canonId}/star_${f.star}.png`, temp: `prototype-v0.2/art/${l.canonId}/star_${f.star}.webp (256 px placeholder)`,
    });
  }
}
for (const sp of SPELLS) {
  rows.push({
    no: String(++no).padStart(3, '0'), name: sp.name, title: '', form: '', type: sp.kind === 'scheme' ? 'Scheme' : sp.swift ? 'Swift Tactic' : 'Tactic',
    status: `Starter deck: ${DECKS[sp.deck].name} (playtested; working name)`, tier: '', origins: '', classes: '',
    cost: String(sp.cost), ascend: '', might: '', guard: '', keywords: sp.shardfall ? 'Shardfall' : '', ability: '', text: sp.text, crown: '',
    flavour: '', flavourSource: 'None yet (no canon; write when the name is approved)', art: SPELL_ART[sp.id], artSource: 'PROPOSED (no canon)',
    file: `spells/${sp.id}.png`, temp: 'none (symbol placeholder)',
  });
}
if (rows.length !== total) throw new Error(`Expected ${total} rows, got ${rows.length}`);

// ── CSV (UTF-8 with BOM so Excel shows ★ correctly) ──
const COLS = [['no', 'No.'], ['name', 'Card name'], ['title', 'Title'], ['form', 'Star form'], ['type', 'Card type'], ['status', 'Status'],
  ['tier', 'Champion tier'], ['origins', 'Origins'], ['classes', 'Classes'], ['cost', 'Command cost'], ['ascend', 'Ascend cost'], ['might', 'Might'], ['guard', 'Guard'],
  ['keywords', 'Keywords'], ['ability', 'Ability name'], ['text', 'Rules text'], ['crown', 'Crown damage'], ['flavour', 'Flavour text'], ['flavourSource', 'Flavour source'],
  ['art', 'Art brief'], ['artSource', 'Art brief source'], ['file', 'Final art file (suggested)'], ['temp', 'Current temporary art']];
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csv = '﻿' + [COLS.map(([, h]) => q(h)).join(','), ...rows.map((r) => COLS.map(([k]) => q(r[k])).join(','))].join('\r\n') + '\r\n';
writeFileSync(join(root, 'master-card-list.csv'), csv);

// ── Markdown ──
const champs = rows.filter((r) => r.form);
let md = `# Sovereign's Hand — Set 1 master card list\n\n`;
md += `Every card in Set 1: **${ALL_LINES.length} champions × 3 star forms = ${champs.length} champion cards**, plus **${SPELLS.length} Tactics and Schemes**, for **${rows.length} card faces** needing final art.\n`;
md += `Rules version ${RULES_VERSION}. Generated from \`src/v02/content/cards.ts\` and Crownfall commit \`${canon.commit.slice(0, 7)}\`; do not edit by hand. A spreadsheet version is \`master-card-list.csv\`.\n\n`;
md += `**How to read it**\n\n- **Names, titles, tiers, Origins, Classes and ability names** are canonical Crownfall.\n`;
md += `- **Flavour text** is canonical: ★ uses the champion's lore line, ★★ the line they say when they gain a star, ★★★ their ultimate line (or victory line if they have no ultimate).\n`;
md += `- **Art briefs** for champions are Crownfall's own star-form descriptions. Tactic and Scheme briefs are proposals, since those cards have no canon yet.\n`;
md += `- **Status**: "Starter deck (playtested)" cards are in the two decks and balance-tested. "Set 1 (draft)" cards are complete and playable by the engine but not yet balance-tested in a deck, so their numbers may still change. Their names, art and flavour won't.\n`;
md += `- Every card also needs a **card back** (one design) and there are 3 text-only **reference cards** (Your Turn, Combat, Keywords).\n\n`;
for (let t = 1; t <= 5; t++) {
  md += `## Tier ${ROMAN[t]} · ${canon.tierNames[t]}\n\n`;
  for (const l of lines.filter((x) => x.tier === t)) {
    const rs = champs.filter((r) => r.name === l.name);
    md += `### ${l.name}, ${l.title}\n*${rs[0].origins} · ${rs[0].classes} · ${rs[0].status.replace(/ \(.*$/, '')}*\n\n`;
    md += `| No. | Form | Cost | Might / Guard | Rules text | Flavour text | Art brief |\n| --- | --- | --- | --- | --- | --- | --- |\n`;
    for (const r of rs) {
      const rules = [r.keywords ? `**${r.keywords}**` : '', r.ability ? `*${r.ability}*` : '', r.text, r.crown ? `♛2 (${r.crown.toLowerCase()})` : ''].filter(Boolean).join(' · ') || '—';
      md += `| ${r.no} | ${r.form} | ${r.cost || r.ascend} | ${r.might} / ${r.guard} | ${rules} | "${r.flavour}" | ${r.art} |\n`;
    }
    md += '\n';
  }
}
md += `## Tactics and Schemes\n\nWorking names, awaiting approval. Art briefs are proposals.\n\n| No. | Card | Type | Deck | Cost | Rules text | Art brief (proposed) |\n| --- | --- | --- | --- | --- | --- | --- |\n`;
for (const r of rows.filter((x) => !x.form)) {
  md += `| ${r.no} | ${r.name} | ${r.type}${r.keywords ? ` · ${r.keywords}` : ''} | ${r.status.replace(/^Starter deck: | \(.*$/g, '')} | ${r.cost} | ${r.text} | ${r.art} |\n`;
}
writeFileSync(join(root, 'MASTER_CARD_LIST.md'), md);
console.log(`master list: ${rows.length} cards (${champs.length} champion, ${rows.length - champs.length} Tactic/Scheme) → MASTER_CARD_LIST.md, master-card-list.csv`);
