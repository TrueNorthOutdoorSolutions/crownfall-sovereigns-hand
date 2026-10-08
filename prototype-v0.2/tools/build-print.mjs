// Builds the print-and-play kit from src/v02/content/cards.ts (the same card data the digital game uses) + RULEBOOK.md.
// Output: prototype-v0.2/print/*.html (source) and prototype-v0.2/print/*.pdf (via local Chrome, if found).
// Usage: npx tsx prototype-v0.2/tools/build-print.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { DECKS, RULES_VERSION, CARDS } from '../../src/v02/content/cards.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'print');
mkdirSync(out, { recursive: true });

const canon = JSON.parse(readFileSync(join(root, 'data', 'canon-snapshot.json'), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// ── shared print CSS ──
const BASE_CSS = `
@page { size: letter; margin: 0 }
* { box-sizing: border-box }
html, body { margin: 0; padding: 0; background: #fff; color: #16161a; -webkit-print-color-adjust: exact; print-color-adjust: exact }
body { font-family: "Segoe UI", Arial, sans-serif }
.page { width: 215.9mm; height: 279.4mm; position: relative; overflow: hidden; page-break-after: always }
.page:last-child { page-break-after: auto }
`;

// ── card faces ──
function rulesHtml(text) {
  return esc(text)
    .replace(/(Arrival:|Ascend:|Attack:|Block:)/g, '<b>$1</b>')
    .replace(/(Scorch \d+|Shield|Mend \d+)/g, '<i>$1</i>');
}

function championFace(def, deck, num, total) {
  const d = DECKS[deck];
  const line = def.line;
  const asc = def.kind === 'ascension';
  const stars = '★'.repeat(def.star);
  const origins = line.origins.map(cap).join(' · ');
  const classes = line.classes.map(cap).join(' · ');
  const kw = (def.keywords ?? []).join(' · ');
  const tierName = canon.tierNames[String(line.tier)];
  const art = `../art/${line.canonId}/star_${def.star}.webp`;
  return `<div class="card s${def.star}" style="--deck:${d.color};--acc:${d.accent}">
    <div class="head">
      <div class="nm"><div class="name">${esc(def.name)}</div><div class="title">${esc(line.title)}</div></div>
      <div class="${asc ? 'asc' : 'cost'}" title="${asc ? 'Ascend cost' : 'Command cost'}">${asc ? '↑' : ''}${def.cost}</div>
    </div>
    <div class="art" style="background-image:url('${art}')">
      <span class="stars">${stars}</span>${def.star === 3 ? '<span class="crowndmg">♛2</span>' : ''}
      ${asc ? `<span class="ascband">${def.star === 2 ? '★★' : '★★★'} ASCENSION · from ${esc(def.name)} ${'★'.repeat(def.star - 1)}</span>` : ''}
    </div>
    <div class="tribe">Tier ${ROMAN[line.tier]} · ${esc(origins)} · ${esc(classes)}</div>
    <div class="box">
      ${kw ? `<div class="kw">${esc(kw)}</div>` : ''}
      ${def.ability && def.text ? `<div class="abil">${esc(def.ability)}</div>` : ''}
      <div class="txt">${rulesHtml(def.text) || (kw ? '' : '<span class="vanilla">No ability. Strong for its cost.</span>')}</div>
    </div>
    <div class="stats"><span class="mt">⚔ ${def.might}</span><span class="gd">⛨ ${def.guard}</span></div>
    <div class="foot"><span>${esc(d.name).toUpperCase()} ${String(num).padStart(2, '0')}/${total} · Tier ${ROMAN[line.tier]} ${esc(tierName)}</span><span>NOT FOR SALE</span></div>
  </div>`;
}

function spellFace(def, deck, num, total) {
  const d = DECKS[deck];
  const type = def.kind === 'scheme' ? 'SCHEME' : def.swift ? 'SWIFT TACTIC' : 'TACTIC';
  const glyph = def.kind === 'scheme' ? '◈' : def.swift ? '⚡' : '✦';
  const note = def.kind === 'scheme' ? 'Set face-down for free. Spring it on your rival’s turn by paying its cost.' : def.swift ? 'Cast on your turn, or in any response window.' : 'Cast on your turn.';
  return `<div class="card spell ${def.kind}" style="--deck:${d.color};--acc:${d.accent}">
    <div class="head">
      <div class="nm"><div class="name">${esc(def.name)}</div><div class="title">${type}</div></div>
      <div class="cost">${def.cost}</div>
    </div>
    <div class="sigil"><span>${glyph}</span>${def.shardfall ? '<em class="sf">SHARDFALL</em>' : ''}</div>
    <div class="box big"><div class="txt">${rulesHtml(def.text)}</div>
      ${def.shardfall ? '<div class="sfnote"><b>Shardfall:</b> if this breaks from your Crown, you may cast or set it free right away.</div>' : ''}
      <div class="note">${note}</div></div>
    <div class="foot"><span>${esc(d.name).toUpperCase()} ${String(num).padStart(2, '0')}/${total} · working name</span><span>NOT FOR SALE</span></div>
  </div>`;
}

function referenceFace(i) {
  if (i === 0) return `<div class="card ref"><div class="refh">YOUR TURN</div><ol>
    <li><b>Rise</b>: ready all; Command +1 (max 8), refill. Round 10+: break 1 own shard.</li>
    <li><b>Draw</b> 1 (empty deck: break 1 own shard).</li>
    <li><b>Main</b>: deploy ★ · cast Tactics · set Schemes (free) · Ascend (once per turn).</li>
    <li><b>Battle</b>: attack one at a time.</li>
    <li><b>After battle</b>: Ascend if you haven't yet.</li>
    <li><b>End</b>: discard to 8. Unspent Command stays for your rival's turn.</li></ol>
    <div class="refh">WIN</div><p>Break all 5 of your rival's Crown Shards.</p><div class="foot"><span>REFERENCE</span><span></span><span>v${RULES_VERSION}</span></div></div>`;
  if (i === 1) return `<div class="card ref"><div class="refh">COMBAT</div><ol>
    <li><b>Attack</b> the Crown or any rival champion. Attacker turns sideways.</li>
    <li><b>Block</b> (Crown only): one ready champion, turned sideways (Bulwark: stays up).</li>
    <li><b>Respond</b>: defender 1 Scheme/Swift, then attacker 1 Swift.</li>
    <li><b>Clash</b>: Might ≥ Guard defeats. Both at once.</li>
    <li><b>Unblocked</b>: break 1 shard (★★★: 2). <b>Breakthrough</b>: beat the blocker and survive, break 1.</li></ol>
    <div class="refh">ASCEND</div><p>On field since your turn began · pay ↑ · place on top · <b>turn it sideways</b> · resolve Ascend:</p><div class="foot"><span>REFERENCE</span><span></span><span>v${RULES_VERSION}</span></div></div>`;
  return `<div class="card ref"><div class="refh">KEYWORDS</div><dl>
    <dt>Shield</dt><dd>Next time it would be defeated, remove the token instead.</dd>
    <dt>Scorch X</dt><dd>−X Guard this turn.</dd><dt>Mend 1</dt><dd>Hand card → face-down shard (max 5).</dd>
    <dt>Charge</dt><dd>May attack the turn it arrives.</dd><dt>Bulwark</dt><dd>Blocking doesn't turn it sideways.</dd>
    <dt>Ambush</dt><dd>Attacking a sideways champion: strikes first.</dd><dt>Flight / Reach</dt><dd>Flight is blocked only by Flight or Reach.</dd>
    <dt>Shardfall</dt><dd>Breaks from your Crown: cast/set free.</dd><dt>Ascendant</dt><dd>Tier V. One per deck.</dd></dl>
    <div class="foot"><span>REFERENCE</span><span></span><span>v${RULES_VERSION}</span></div></div>`;
}

const CARD_CSS = `
.sheet { position: absolute; left: 13.45mm; top: 7.7mm; width: 189mm; height: 264mm; display: grid; grid-template-columns: repeat(3, 63mm); grid-template-rows: repeat(3, 88mm) }
.crop { position: absolute; background: #999 }
.card { width: 63mm; height: 88mm; position: relative; border: 2.6mm solid var(--deck, #444); border-radius: 3mm; padding: 1.6mm 1.8mm 1.2mm; display: flex; flex-direction: column; gap: .9mm; overflow: hidden; background: #fff }
.card.s2 { border-color: color-mix(in srgb, var(--deck) 70%, var(--acc)) }
.card.s3 { border-color: var(--acc); box-shadow: inset 0 0 0 .5mm var(--deck) }
.head { display: flex; align-items: center; gap: 1.5mm }
.nm { flex: 1; min-width: 0 }
.name { font-family: Georgia, "Times New Roman", serif; font-weight: 700; font-size: 10.5pt; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.title { font-size: 6pt; color: #555; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.cost, .asc { flex: none; width: 8.4mm; height: 8.4mm; display: grid; place-items: center; font-weight: 800; font-size: 11pt; color: #fff; background: var(--deck) }
.cost { border-radius: 50% }
.asc { background: var(--acc); color: #1b1b1b; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); font-size: 9.5pt }
.art { flex: none; height: 36mm; border-radius: 1.5mm; background: #ddd center 32% / cover no-repeat; position: relative; border: .3mm solid #0003 }
.stars { position: absolute; left: 1mm; top: .8mm; color: #ffd75e; font-size: 10pt; text-shadow: 0 0 1.2mm #000, 0 0 .4mm #000; letter-spacing: .3mm }
.crowndmg { position: absolute; right: 1mm; top: .8mm; background: #1b1b1b; color: #ffd75e; font-weight: 800; font-size: 8pt; padding: .2mm 1.2mm; border-radius: 1mm }
.ascband { position: absolute; left: 0; right: 0; bottom: 0; background: #000b; color: #ffe08a; font-size: 5.6pt; font-weight: 700; letter-spacing: .06em; padding: .5mm 1.2mm; text-align: center }
.tribe { font-size: 5.8pt; color: #333; font-weight: 600; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.box { flex: 1; min-height: 0; border: .3mm solid #0002; border-radius: 1.2mm; padding: 1.2mm 1.5mm; background: #f6f5f1; font-size: 7.3pt; line-height: 1.28 }
.box.big { font-size: 8.6pt; display: flex; flex-direction: column; gap: 1.6mm }
.kw { font-weight: 800; font-size: 7.4pt; color: var(--deck) }
.abil { font-family: Georgia, serif; font-style: italic; font-size: 6.6pt; color: #555 }
.vanilla { color: #777; font-style: italic }
.stats { display: flex; justify-content: space-between; font-weight: 800; font-size: 11.5pt }
.stats span { border: .35mm solid #1b1b1b; border-radius: 1.2mm; padding: 0 2mm; background: #fff }
.foot { display: flex; justify-content: space-between; gap: 1mm; white-space: nowrap; font-size: 4.6pt; color: #777; letter-spacing: .02em }
.spell .sigil { flex: none; height: 30mm; border-radius: 1.5mm; display: grid; place-items: center; position: relative;
  background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--deck) 12%, #fff) 0 2.2mm, #fff 2.2mm 4.4mm); border: .3mm solid #0002 }
.spell .sigil span { font-size: 30pt; color: var(--deck) }
.spell.scheme .sigil { background: repeating-linear-gradient(45deg, #2a2a33 0 2.2mm, #3a3a45 2.2mm 4.4mm) }
.spell.scheme .sigil span { color: var(--acc) }
.sf { position: absolute; bottom: 1mm; font-style: normal; font-weight: 800; font-size: 6.4pt; letter-spacing: .14em; color: #fff; background: var(--acc); padding: .3mm 1.6mm; border-radius: 1mm }
.sfnote { font-size: 6.6pt; color: #444 }
.note { margin-top: auto; font-size: 6.2pt; color: #666; font-style: italic }
.ref { border-color: #1b1b1b; font-size: 6.9pt; line-height: 1.28 }
.ref .refh { font-weight: 800; letter-spacing: .12em; font-size: 7.4pt; border-bottom: .3mm solid #1b1b1b; margin-top: .6mm }
.ref ol { margin: .5mm 0 0; padding-left: 3.6mm } .ref li { margin-bottom: .45mm } .ref p { margin: .6mm 0 0 }
.ref dl { margin: .5mm 0 0; display: grid; grid-template-columns: auto 1fr; gap: .3mm 1.4mm } .ref dt { font-weight: 800 } .ref dd { margin: 0 }
.ref .foot { margin-top: auto }
.back { width: 63mm; height: 88mm; border-radius: 3mm; background: radial-gradient(circle at 50% 42%, #3b2f12 0, #15131c 62%); border: 2.6mm solid #15131c; display: grid; place-items: center; color: #e2b44c; text-align: center }
.back b { display: block; font-family: Georgia, serif; font-size: 13pt; letter-spacing: .08em } .back i { font-size: 6pt; letter-spacing: .3em; color: #b89a5a }
.back .crown { font-size: 34pt; line-height: 1 }
`;

function cropMarks() {
  const xs = [0, 63, 126, 189], ys = [0, 88, 176, 264];
  let h = '';
  for (const x of xs) { h += `<div class="crop" style="left:${13.45 + x - 0.1}mm;top:0;width:.2mm;height:5mm"></div><div class="crop" style="left:${13.45 + x - 0.1}mm;bottom:0;width:.2mm;height:5mm"></div>`; }
  for (const y of ys) { h += `<div class="crop" style="top:${7.7 + y - 0.1}mm;left:0;height:.2mm;width:9mm"></div><div class="crop" style="top:${7.7 + y - 0.1}mm;right:0;height:.2mm;width:9mm"></div>`; }
  return h;
}

function deckCards(deckId) {
  const d = DECKS[deckId];
  const total = 30 + d.ascension.length;
  const faces = [];
  let n = 0;
  for (const [id, copies] of d.main) {
    const def = CARDS[id];
    for (let k = 0; k < copies; k++) {
      n++;
      faces.push(def.kind === 'champion' ? championFace(def, deckId, n, total) : spellFace(def, deckId, n, total));
    }
  }
  for (const id of d.ascension) { n++; faces.push(championFace(CARDS[id], deckId, n, total)); }
  return faces;
}

const faces = [...deckCards('banner'), ...deckCards('ember'), referenceFace(0), referenceFace(1), referenceFace(2)];
let pages = '';
for (let i = 0; i < faces.length; i += 9) pages += `<section class="page">${cropMarks()}<div class="sheet">${faces.slice(i, i + 9).join('')}</div></section>`;
const backs = Array.from({ length: 9 }, () => `<div class="back"><div><div class="crown">♛</div><b>SOVEREIGN'S HAND</b><i>CROWNFALL · PROTOTYPE</i></div></div>`).join('');
const cardsHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Sovereign's Hand — Cards</title><style>${BASE_CSS}${CARD_CSS}</style></head><body>${pages}</body></html>`;
const backsHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Sovereign's Hand — Card backs</title><style>${BASE_CSS}${CARD_CSS}</style></head><body><section class="page">${cropMarks()}<div class="sheet">${backs}</div></section></body></html>`;
writeFileSync(join(out, 'cards.html'), cardsHtml);
writeFileSync(join(out, 'card-backs.html'), backsHtml);

// ── tokens + Command tracks ──
const TOK_CSS = `
.wrap { padding: 12mm 13mm; display: flex; flex-direction: column; gap: 6mm }
h2 { font-family: Georgia, serif; margin: 0 0 2mm; font-size: 14pt }
p.small { font-size: 8.5pt; color: #444; margin: 0 }
.track { display: grid; grid-template-columns: 26mm repeat(9, 1fr); border: .4mm solid #1b1b1b; border-radius: 2mm; overflow: hidden }
.track div { height: 16mm; display: grid; place-items: center; border-left: .3mm solid #1b1b1b55; font-weight: 800; font-size: 16pt }
.track div:first-child { font-size: 9pt; letter-spacing: .1em; border: 0; background: #1b1b1b; color: #fff; text-align: center }
.tok { display: flex; flex-wrap: wrap; gap: 3mm }
.chip { width: 17mm; height: 17mm; border-radius: 50%; border: .5mm dashed #888; display: grid; place-items: center; text-align: center; font-weight: 800; font-size: 8pt; line-height: 1.05 }
.chip.sh { background: #fff3c9; color: #6a5200 } .chip.sc { background: #ffe1d6; color: #8a2a0e } .chip.mt { background: #dbe7ff; color: #1d3f8f }
.rounds { display: grid; grid-template-columns: repeat(12, 1fr); border: .4mm solid #1b1b1b; border-radius: 2mm; overflow: hidden }
.rounds div { height: 12mm; display: grid; place-items: center; border-left: .3mm solid #1b1b1b55; font-weight: 700 }
.rounds div.imp { background: #ffe9e0 }
`;
const track = (who) => `<div class="track"><div>${who}<br>COMMAND</div>${Array.from({ length: 9 }, (_, i) => `<div>${i}</div>`).join('')}</div>`;
const chips = (cls, label, n) => Array.from({ length: n }, () => `<div class="chip ${cls}">${label}</div>`).join('');
const tokensHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Sovereign's Hand — Tokens</title><style>${BASE_CSS}${TOK_CSS}</style></head><body><section class="page"><div class="wrap">
  <div><h2>Command tracks</h2><p class="small">Put a coin on your current Command. At Rise, your maximum goes up by 1 (to 8 at most) and you refill. Spend by sliding the coin down.</p></div>
  ${track('PLAYER 1')}${track('PLAYER 2')}
  <div><h2>Round tracker</h2><p class="small">Move a coin after both players have taken a turn. From round 10, each player breaks one of their own shards at the start of their turn.</p></div>
  <div class="rounds">${Array.from({ length: 12 }, (_, i) => `<div class="${i >= 9 ? 'imp' : ''}">${i + 1}</div>`).join('')}</div>
  <div><h2>Shield tokens</h2><p class="small">A champion holds at most one. Remove it instead of the champion being defeated.</p></div>
  <div class="tok">${chips('sh', 'SHIELD', 20)}</div>
  <div><h2>This-turn markers</h2><p class="small">Optional reminders for Scorch and Might boosts. Clear them all at the end of each turn.</p></div>
  <div class="tok">${chips('sc', 'SCORCH<br>−1', 10)}${chips('sc', 'SCORCH<br>−2', 10)}${chips('mt', 'MIGHT<br>+1', 10)}</div>
</div></section></body></html>`;
writeFileSync(join(out, 'tokens.html'), tokensHtml);

// ── rulebook (minimal Markdown → HTML) ──
function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  let html = '', list = null, table = null;
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
  const close = () => { if (list) { html += `</${list}>`; list = null; } if (table) { html += '</tbody></table>'; table = null; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    let m;
    if (/^\|/.test(l)) {
      const cells = l.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      if (!table) { close(); table = true; html += `<table><thead><tr>${cells.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>`; continue; }
      html += `<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`;
      continue;
    }
    if ((m = l.match(/^(#{1,3}) (.*)/))) { close(); html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; continue; }
    if ((m = l.match(/^\s*(\d+)\. (.*)/)) && !/^\s{2,}/.test(l)) { if (list !== 'ol') { close(); list = 'ol'; html += '<ol>'; } html += `<li>${inline(m[2])}</li>`; continue; }
    if ((m = l.match(/^\s*- (.*)/))) {
      if (/^\s{2,}/.test(l) && list === 'ol') { html = html.replace(/<\/li>$/, '') + `<ul class="sub"><li>${inline(m[1])}</li></ul></li>`; continue; }
      if (list !== 'ul') { close(); list = 'ul'; html += '<ul>'; } html += `<li>${inline(m[1])}</li>`; continue;
    }
    if (!l.trim()) { close(); continue; }
    close();
    html += `<p>${inline(l)}</p>`;
  }
  close();
  return html.replace(/<\/ul><\/li><ul class="sub">/g, '');
}
const RB_CSS = `
@page { size: letter; margin: 14mm 16mm }
body { font-family: Georgia, "Times New Roman", serif; font-size: 10.2pt; line-height: 1.42; color: #16161a; columns: 2; column-gap: 9mm }
h1 { column-span: all; font-size: 20pt; margin: 0 0 1mm } h1 + p { column-span: all; color: #555; font-family: "Segoe UI", Arial, sans-serif; font-size: 9pt; margin: 0 0 4mm }
h2 { font-family: "Segoe UI", Arial, sans-serif; font-size: 11pt; letter-spacing: .08em; text-transform: uppercase; border-bottom: .4mm solid #8f6a12; color: #8f6a12; margin: 4mm 0 1.5mm; break-after: avoid }
h3 { font-size: 10.5pt; margin: 2.5mm 0 1mm; break-after: avoid }
p { margin: 0 0 1.6mm } ul, ol { margin: 0 0 1.8mm; padding-left: 5mm } li { margin-bottom: .6mm } ul.sub { margin: .6mm 0 0 }
table { border-collapse: collapse; width: 100%; font-size: 8.6pt; margin: 1mm 0 2.5mm; break-inside: avoid; font-family: "Segoe UI", Arial, sans-serif }
th, td { border: .25mm solid #bbb; padding: .8mm 1.4mm; text-align: left; vertical-align: top } th { background: #f1ede2 }
`;
const rulebookHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Sovereign's Hand — Rules</title><style>${RB_CSS}</style></head><body>${md(readFileSync(join(root, 'RULEBOOK.md'), 'utf8'))}</body></html>`;
writeFileSync(join(out, 'rulebook.html'), rulebookHtml);

// ── feedback sheet ──
const FB_CSS = `
@page { size: letter; margin: 12mm 14mm }
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 9.4pt; color: #16161a }
h1 { font-family: Georgia, serif; font-size: 16pt; margin: 0 } .sub { color: #555; font-size: 8.6pt; margin: .5mm 0 3mm }
h2 { font-size: 10pt; letter-spacing: .08em; text-transform: uppercase; color: #8f6a12; border-bottom: .4mm solid #8f6a12; margin: 3.5mm 0 1.5mm }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6mm 6mm }
.f { display: flex; gap: 2mm; align-items: flex-end } .f span { white-space: nowrap } .f i { flex: 1; border-bottom: .3mm solid #777; height: 4.6mm }
.q { margin: 1.6mm 0 } .q b { display: block; margin-bottom: .6mm }
.scale { display: inline-flex; gap: 2.4mm; margin-left: 2mm } .scale span { width: 5.2mm; height: 5.2mm; border: .3mm solid #555; border-radius: 50%; display: inline-grid; place-items: center; font-size: 7.5pt }
.box { border: .3mm solid #999; border-radius: 1.5mm; height: 13mm } .box.tall { height: 20mm }
.yn { display: inline-flex; gap: 4mm; margin-left: 2mm } .yn span::before { content: "☐ "; }
table { width: 100%; border-collapse: collapse; font-size: 8.6pt } th, td { border: .3mm solid #999; padding: 1mm 1.5mm; text-align: left } th { background: #f1ede2 }
td { height: 6.4mm } .pb { page-break-before: always }
`;
const f = (label) => `<div class="f"><span>${label}</span><i></i></div>`;
const scale = (lo, hi) => `<span class="scale">${[1, 2, 3, 4, 5].map((n) => `<span>${n}</span>`).join('')}</span> <small>(1 = ${lo}, 5 = ${hi})</small>`;
const yn = (...opts) => `<span class="yn">${opts.map((o) => `<span>${o}</span>`).join('')}</span>`;
const feedbackHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Sovereign's Hand — Playtest feedback</title><style>${FB_CSS}</style></head><body>
<h1>Sovereign's Hand · Playtest Feedback</h1><div class="sub">One sheet per player per session · rules v${RULES_VERSION} · please answer honestly: "it was boring" is the most useful thing you can write.</div>
<div class="grid">${f('Your name')}${f('Date')}${f('Your deck')}${f('Opponent')}</div>
<div class="q"><b>Have you played trading card games before?</b>${yn('Never', 'A little', 'A lot')}</div>

<h2>Learning (first game only)</h2>
<div class="grid">${f('Minutes from opening the rules until you could say the goal')}${f('Minutes until your first turn')}</div>
<div class="q"><b>After the first game, could you explain how to win?</b>${yn('Yes', 'Mostly', 'No')}</div>
<div class="q"><b>The first moment you were confused:</b><div class="box"></div></div>

<h2>Each game</h2>
<table><thead><tr><th>Game</th><th>Went first?</th><th>Start time</th><th>End time</th><th>Rounds</th><th>Won?</th><th>Shards left (loser)</th><th>Your first ★★ (round)</th><th>Your first ★★★ (round)</th><th>Shardfall used?</th></tr></thead>
<tbody>${[1, 2, 3, 4].map((n) => `<tr><td>${n}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
<div class="q"><b>Game 1: why did you win or lose, in one sentence?</b><div class="box"></div></div>
<div class="q"><b>Right after game 1, did you want a rematch immediately?</b>${yn('Yes', 'Maybe', 'No')} &nbsp; How much? ${scale('not at all', 'badly')}</div>

<h2>How it felt</h2>
<div class="q"><b>Fun overall</b> ${scale('boring', 'great')}</div>
<div class="q"><b>Did choosing when to Ascend feel like a real decision?</b> ${scale('automatic', 'agonising')}</div>
<div class="q"><b>Was Ascending exciting when it happened?</b> ${scale('flat', 'a highlight')}</div>
<div class="q"><b>Attack-or-guard: did attacking feel risky in a good way?</b> ${scale('no tension', 'tense')}</div>
<div class="q"><b>Schemes: did springing or walking into one feel fair?</b> ${scale('cheap', 'clever')}</div>
<div class="q"><b>Game length</b>${yn('Too short', 'About right', 'Too long')}</div>
<div class="pb"></div>
<h2>Tier V (Sol / Aurex)</h2>
<div class="q"><b>Did you play your Ascendant?</b>${yn('Yes', 'Drew it, held it', 'Never drew it')}</div>
<div class="q"><b>When it arrived, did it feel extraordinary?</b> ${scale('meh', 'jaw-dropping')}</div>
<div class="q"><b>Did it feel unbeatable, or did it feel answerable?</b>${yn('Unbeatable', 'Answerable', 'Too weak')}</div>

<h2>The best and worst</h2>
<div class="q"><b>Most memorable moment</b><div class="box"></div></div>
<div class="q"><b>A card that felt too strong</b><div class="box"></div></div>
<div class="q"><b>A card that felt useless</b><div class="box"></div></div>
<div class="q"><b>A rule you had to look up more than once</b><div class="box"></div></div>
<div class="q"><b>Did any game end in a way that felt unfair or confusing? What happened?</b><div class="box"></div></div>
<div class="q"><b>Did the round-10 rule ("The Crown grows impatient") come into play?</b>${yn('Yes', 'No')}</div>
<div class="q"><b>If you could change one thing, what would it be?</b><div class="box tall"></div></div>
<div class="q"><b>Would you play this again next week?</b>${yn('Yes', 'Maybe', 'No')} &nbsp; <b>Would you collect these cards?</b>${yn('Yes', 'Maybe', 'No')}</div>
</body></html>`;
writeFileSync(join(out, 'feedback.html'), feedbackHtml);

// ── decklists (Markdown) ──
let dl = `# Starter decklists\n\nRules version ${RULES_VERSION}. Generated from \`src/v02/content/cards.ts\` (the same data the digital game uses); do not edit by hand.\nChampion names, titles, tiers, Origins and Classes come from Crownfall commit \`${canon.commit.slice(0, 7)}\`.\n`;
for (const [id, d] of Object.entries(DECKS)) {
  dl += `\n## ${d.name} (${d.origins})\n\n${d.pitch}\n\n| # | Card | Type | Cost | Might / Guard | Text |\n| --- | --- | --- | --- | --- | --- |\n`;
  for (const [cid, n] of d.main) {
    const c = CARDS[cid];
    const type = c.kind === 'champion' ? `★ Champion · Tier ${ROMAN[c.line.tier]}` : c.kind === 'scheme' ? 'Scheme' : c.swift ? 'Swift Tactic' : 'Tactic';
    const text = [(c.keywords ?? []).join(', '), c.text, c.shardfall ? 'Shardfall.' : ''].filter(Boolean).join(' ');
    dl += `| ${n} | ${c.name}${c.title && c.kind === 'champion' ? ` — ${c.title}` : ''} | ${type} | ${c.cost} | ${c.kind === 'champion' ? `${c.might} / ${c.guard}` : ''} | ${text} |\n`;
  }
  dl += `\n**Ascension Pile (8):**\n\n| Card | Ascend cost | Might / Guard | Text |\n| --- | --- | --- | --- |\n`;
  for (const aid of d.ascension) {
    const c = CARDS[aid];
    dl += `| ${c.name} ${'★'.repeat(c.star)} | ↑${c.cost} | ${c.might} / ${c.guard} | ${[(c.keywords ?? []).join(', '), c.text, c.star === 3 ? 'Breaks 2 shards.' : ''].filter(Boolean).join(' ')} |\n`;
  }
}
writeFileSync(join(root, 'DECKLISTS.md'), dl);

// ── PDFs via local Chrome ──
const chromes = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'];
const chrome = process.env.CHROME ?? chromes.find((p) => existsSync(p));
const docs = [['cards', '01-cards'], ['card-backs', '02-card-backs'], ['tokens', '03-tokens'], ['rulebook', '00-rulebook'], ['feedback', '04-feedback-sheet']];
if (!chrome) console.log('Chrome not found: HTML written, PDFs skipped (set CHROME=path).');
else for (const [src, pdf] of docs) {
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files',
    `--print-to-pdf=${join(out, `${pdf}.pdf`)}`, pathToFileURL(join(out, `${src}.html`)).href], { stdio: 'ignore' });
}
console.log(`print kit: ${faces.length} card faces on ${Math.ceil(faces.length / 9)} sheets${chrome ? ' + PDFs' : ''} → ${out}`);
