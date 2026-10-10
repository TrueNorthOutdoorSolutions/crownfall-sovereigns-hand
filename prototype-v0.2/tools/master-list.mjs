// Master card lists for the art studio: every card in Set 1 and Set 2 with rules text, flavour text and art brief.
// Generated from src/v02/content/*.ts + data/canon-snapshot.json + data/canon-extras.json; do not edit the outputs by hand.
// Usage: npx tsx prototype-v0.2/tools/master-list.mjs
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_LINES, CARDS, DECKS, SPELLS, EXTRA_SPELLS, RELICS, EDICTS, RULES_VERSION } from '../../src/v02/content/cards.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canon = JSON.parse(readFileSync(join(root, 'data', 'canon-snapshot.json'), 'utf8'));
const extras = JSON.parse(readFileSync(join(root, 'data', 'canon-extras.json'), 'utf8'));
const byId = Object.fromEntries(canon.champions.map((c) => [c.id, c]));
const powerById = Object.fromEntries(extras.powers.map((p) => [p.id, p]));
const itemById = Object.fromEntries(extras.items.map((i) => [i.id, i]));
const edictById = Object.fromEntries(extras.edicts.map((e) => [e.id, e]));
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const stars = (n) => '★'.repeat(n);
const SET_NAME = { 1: 'The Shattered Crown', 2: 'Beneath the Arena' };

// ── PROPOSED art briefs for cards with no Crownfall visual canon ──
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
const SCHOOL_ART = Object.fromEntries(Object.entries(extras.schools).map(([k, s]) =>
  [k, (name) => `${s.name} power: a ${s.blurb.toLowerCase()} scene that shows “${name}” at work in the arena, framed by the ${s.name} sigil (${s.glyph}) in its school colour ${s.color}.`]));
const UNIT_ART = {
  mite: 'A small crystal-backed creature skittering out of a cracked arena wall, glowing shards on its back.',
  shardling: 'A jagged little shard creature hopping across broken crown fragments.',
  hound: 'A lean hound with rift-light leaking from its eyes, bursting through a tear in the air.',
  alpha: 'The biggest Rift Hound at the head of a pack, rift-light streaming from its jaws.',
  golem: 'A towering crystal golem rising from the arena floor, ground cracking under each step.',
  spiderqueen: 'A huge void spider in a web of shadow across the arena ceiling, smaller spiders pouring from beneath her.',
  hydra: 'A brass-and-steam clockwork hydra with many mechanical heads, gears and pistons exposed.',
  treant: 'An ancient tree giant with moss-covered bark, roots tearing up the arena stones.',
  sentinel: 'A radiant winged sentinel of starlight hovering over the arena, a beam of light in its hand.',
  guardian: 'An armoured colossus wearing a broken crown, holding a great hammer over the arena.',
  spiderling: 'A single small void spider, shadowy and fast, mid-leap.',
  hydralet: 'A small clockwork hydra hatchling, one brass head, sparks flying.',
  sapling: 'A wild sapling with a bark shield, standing firm in the arena dirt.',
  construct: 'A plain stone-and-crystal guardian construct, arms raised to block.',
  starling: 'A small bird of starlight darting across the night sky.',
  turret: 'A compact arc turret crackling with blue lightning.',
  skeleton: 'A risen soldier in rusted armour clawing up out of the ground.',
  shadow: 'A courtly figure made of shadow, bowing with a hidden blade.',
  grove_treant: 'A young treant stepping out of a grove, leaves rustling.',
  fallen: 'A ghostly fallen warrior answering a royal summons.',
  crownling: 'A tiny crowned sprite carrying a sliver of the crown.',
  dummy: 'A straw training dummy wearing a paper crown, propped up in the arena.',
};
const GUARDIAN_LINE_KEY = { spiderqueen: 'spiders' };

// Set 2 flavour: draw from the canon voice lines Set 1 hasn't used, so the two sets don't repeat. Duplicates are flagged.
function flavourFor(cc, star, set) {
  const L = cc.lines ?? {};
  const s1 = [cc.lore, L.star, L.ult ?? L.win];
  if (set === 1) {
    const src = star === 1 ? 'Crownfall lore' : star === 2 ? 'Crownfall voice line (gains a star)' : L.ult ? 'Crownfall voice line (ultimate)' : 'Crownfall voice line (victory)';
    return [s1[star - 1], src];
  }
  const pool = [[L.buy, 'Crownfall voice line (recruited)'], [L.ult ? L.win : undefined, 'Crownfall voice line (victory)']].filter(([t]) => t);
  if (pool[star - 1]) return pool[star - 1];
  return [s1[star - 1], 'Crownfall (same line as Set 1 — no unused canon line left; studio may replace)'];
}

function status(id) {
  const d = Object.values(DECKS).find((dk) => dk.main.some(([x]) => x === id) || dk.ascension.includes(id));
  return d ? `Starter deck: ${d.name} (playtested)` : 'Draft (playable, not yet balance-tested in a deck)';
}

function build(set) {
  const rows = [];
  let no = 0;
  const nextNo = () => `S${set}-${String(++no).padStart(3, '0')}`;
  const lines = ALL_LINES.filter((l) => (l.set ?? 1) === set);
  const champs = lines.filter((l) => (l.family ?? 'champion') === 'champion')
    .sort((a, b) => a.tier - b.tier || canon.champions.findIndex((c) => c.id === a.canonId) - canon.champions.findIndex((c) => c.id === b.canonId));
  for (const l of champs) {
    const cc = byId[l.canonId];
    const base = l.lineId ?? l.canonId;
    for (const f of l.forms) {
      const id = f.star === 1 ? base : `${base}-${f.star}`;
      if (!CARDS[id]) throw new Error(`missing card ${id}`);
      const [flavour, flavourSource] = flavourFor(cc, f.star, set);
      rows.push({
        no: nextNo(), id, section: 'Champions', name: l.name, title: l.title + (l.epithetProposed ? ' (PROPOSED epithet)' : ''), form: stars(f.star),
        type: f.star === 1 ? 'Champion' : 'Ascension', status: status(id), tier: `Tier ${ROMAN[l.tier]} · ${cc.tierName}`,
        origins: l.origins.map(cap).join(' · '), classes: l.classes.map(cap).join(' · '),
        cost: f.star === 1 ? String(f.cost) : `↑${f.cost}`, might: String(f.might), guard: String(f.guard),
        keywords: f.keywords.join(', '), ability: f.text ? f.ability ?? '' : '', text: f.text, crown: f.star === 3 ? 'Breaks 2 shards' : '',
        flavour, flavourSource,
        art: set === 1 ? cc[`star${f.star}`] : `${l.scene} Canon look for this form: ${cc[`star${f.star}`]}`,
        artSource: set === 1 ? `Crownfall star ${f.star} description` : 'PROPOSED Set 2 scene + Crownfall star-form description',
        file: `set${set}/champions/${l.canonId}/star_${f.star}.png`,
      });
    }
  }
  for (const fam of ['monster', 'guardian', 'token']) {
    for (const l of lines.filter((x) => x.family === fam)) {
      const f = l.forms[0];
      const id = l.lineId;
      const gl = fam === 'guardian' ? extras.guardianLines[GUARDIAN_LINE_KEY[l.canonId] ?? l.canonId] : undefined;
      rows.push({
        no: fam === 'token' ? 'TOKEN' : nextNo(), id, section: fam === 'monster' ? 'Monsters' : fam === 'guardian' ? 'Guardians' : 'Tokens', name: l.name, title: '', form: '',
        type: cap(fam), status: fam === 'token' ? 'Token (made by other cards; not in decks)' : status(id), tier: '', origins: '', classes: '',
        cost: fam === 'token' ? '' : String(f.cost), might: String(f.might), guard: String(f.guard), keywords: f.keywords.join(', '),
        ability: f.ability ?? '', text: f.text ?? '', crown: '',
        flavour: gl ?? '', flavourSource: gl ? 'Crownfall announcer line (Guardian round)' : 'None (no canon line)',
        art: UNIT_ART[l.canonId] ?? '', artSource: 'PROPOSED (canonical unit, no visual description in canon)',
        file: `set${set}/${fam}s/${l.canonId}.png`,
      });
    }
  }
  const spells = [...SPELLS.filter(() => set === 1), ...EXTRA_SPELLS.filter((s) => s.set === set)];
  for (const sp of spells) {
    const pw = sp.canonId ? powerById[sp.canonId] : undefined;
    const school = pw?.school;
    rows.push({
      no: nextNo(), id: sp.id, section: 'Tactics and Schemes', name: sp.name, title: pw ? `${extras.schools[school].name} · ${cap(pw.rarity)}` : '', form: '',
      type: sp.kind === 'scheme' ? 'Scheme' : sp.swift ? 'Swift Tactic' : 'Tactic', status: status(sp.id), tier: '', origins: '', classes: '',
      cost: String(sp.cost), might: '', guard: '', keywords: sp.shardfall ? 'Shardfall' : '', ability: '', text: sp.text, crown: '',
      flavour: sp.flavour ?? '', flavourSource: sp.flavour ? 'Crownfall announcer line' : pw ? `None yet. Crownfall effect for reference: “${pw.desc}”` : 'None yet',
      art: sp.art ?? SPELL_ART[sp.id] ?? (school ? SCHOOL_ART[school](sp.name) : ''),
      artSource: sp.art || SPELL_ART[sp.id] ? 'PROPOSED' : school ? 'PROPOSED (school template — refine in the studio)' : 'PROPOSED',
      file: `set${set}/spells/${sp.id}.png`,
    });
  }
  for (const r of RELICS.filter((x) => (x.set ?? 2) === set)) {
    const it = itemById[r.canonId];
    rows.push({
      no: nextNo(), id: r.id, section: 'Relics', name: r.name, title: `${cap(r.relicType)}${r.legendary ? ' · Legendary' : ''}`, form: '', type: 'Relic',
      status: status(r.id), tier: '', origins: '', classes: '', cost: String(r.cost), might: r.might ? `+${r.might}` : '', guard: r.guard ? `+${r.guard}` : '',
      keywords: (r.keywords ?? []).join(', '), ability: '', text: r.text, crown: '',
      flavour: '', flavourSource: it ? `None yet. Crownfall item for reference: “${it.effect}”` : 'None yet',
      art: r.art ?? '', artSource: 'PROPOSED', file: `set${set}/relics/${r.canonId}.png`,
    });
  }
  for (const e of EDICTS.filter((x) => x.set === set)) {
    const ce = edictById[e.canonId];
    rows.push({
      no: nextNo(), id: e.id, section: 'Edicts', name: e.name, title: `Proclaimed by ${byId[e.host]?.name ?? e.host}`, form: '', type: 'Edict',
      status: status(e.id), tier: '', origins: '', classes: '', cost: String(e.cost), might: '', guard: '', keywords: '', ability: '', text: e.text, crown: '',
      flavour: ce?.proclamation ?? '', flavourSource: ce ? 'Crownfall Edict proclamation' : 'None',
      art: `${byId[e.host]?.name ?? e.host} proclaiming the Edict from the royal box, the arena crowd below.`, artSource: 'PROPOSED (host is canon)',
      file: `set${set}/edicts/${e.canonId}.png`,
    });
  }
  // Tokens are numbered separately (T01, T02 …) and never count toward the set total.
  let t = 0;
  for (const r of rows) if (r.no === 'TOKEN') r.no = `S${set}-T${String(++t).padStart(2, '0')}`;
  return rows;
}

const COLS = [['no', 'No.'], ['id', 'Card ID'], ['name', 'Card name'], ['title', 'Title / subtype'], ['form', 'Star form'], ['type', 'Card type'], ['status', 'Status'],
  ['tier', 'Champion tier'], ['origins', 'Origins'], ['classes', 'Classes'], ['cost', 'Cost (↑ = Ascend cost)'], ['might', 'Might'], ['guard', 'Guard'],
  ['keywords', 'Keywords'], ['ability', 'Ability name'], ['text', 'Rules text'], ['crown', 'Crown damage'], ['flavour', 'Flavour text'], ['flavourSource', 'Flavour source'],
  ['art', 'Art brief'], ['artSource', 'Art brief source'], ['file', 'Final art file (suggested)'], ['variants', 'Variants (alt art / full art — fill in the studio)']];
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const esc = (v) => String(v ?? '').replace(/\|/g, '\\|');

const summary = [];
for (const set of [1, 2]) {
  const rows = build(set);
  const csv = '﻿' + [COLS.map(([, h]) => q(h)).join(','), ...rows.map((r) => COLS.map(([k]) => q(r[k])).join(','))].join('\r\n') + '\r\n';
  writeFileSync(join(root, `master-card-list-set${set}.csv`), csv);

  const count = (sec) => rows.filter((r) => r.section === sec).length;
  const sections = ['Champions', 'Monsters', 'Guardians', 'Tokens', 'Tactics and Schemes', 'Relics', 'Edicts'].filter(count);
  const nonToken = rows.filter((r) => r.section !== 'Tokens').length;
  summary.push({ set, total: rows.length, nonToken, parts: sections.map((s) => `${count(s)} ${s}`) });

  let md = `# Sovereign's Hand — Set ${set}: ${SET_NAME[set]}\n\n`;
  md += `**${rows.length} card faces** (${nonToken} collectible + ${count('Tokens')} tokens): ${sections.map((s) => `${count(s)} ${s.toLowerCase()}`).join(', ')}.\n`;
  md += `Rules version ${RULES_VERSION}. Generated from the game's card data and Crownfall commit \`${canon.commit.slice(0, 7)}\`; do not edit by hand. The spreadsheet is \`master-card-list-set${set}.csv\` (it has a Variants column for alt and full arts).\n\n`;
  md += `**How to read it**\n\n- Names, tiers, Origins, Classes, ability names, Crown Powers, items, Edicts, Monsters and Guardians are canonical Crownfall.\n`;
  md += set === 1
    ? `- Champion flavour is canon: ★ lore, ★★ the "gains a star" line, ★★★ the ultimate line (or victory line). Champion art briefs are Crownfall's own star-form descriptions.\n`
    : `- Every Set 2 champion is a **new card** for a returning champion: new epithet (PROPOSED, awaiting approval), new abilities, new art scene. Flavour uses canon voice lines Set 1 didn't use, where any are left.\n- Set 2 art briefs combine a PROPOSED underground-arena scene with the champion's canon look for that star form, so the character stays on-model.\n`;
  md += `- Anything marked **PROPOSED** is my suggestion and needs your approval. Cards marked **Draft** work in the engine but haven't been balance-tested in a deck, so numbers may change; names and art won't.\n\n`;
  for (const sec of sections) {
    md += `## ${sec} (${count(sec)})\n\n`;
    const rs = rows.filter((r) => r.section === sec);
    if (sec === 'Champions') {
      let last = '';
      for (const r of rs) {
        if (r.name + r.title !== last) {
          last = r.name + r.title;
          md += `### ${r.name}, ${r.title}\n*${r.tier} · ${r.origins} · ${r.classes}*\n\n| No. | Form | Cost | Might / Guard | Rules text | Flavour | Art brief | Status |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
        }
        const rules = [r.keywords ? `**${r.keywords}**` : '', r.ability ? `*${r.ability}*` : '', r.text, r.crown ? '♛2' : ''].filter(Boolean).join(' · ') || '—';
        md += `| ${r.no} | ${r.form} | ${r.cost} | ${r.might} / ${r.guard} | ${esc(rules)} | ${r.flavour ? `"${esc(r.flavour)}"` : '—'} | ${esc(r.art)} | ${r.status.replace(/ \(.*$/, '')} |\n`;
        const nextR = rs[rs.indexOf(r) + 1];
        if (!nextR || nextR.name + nextR.title !== last) md += '\n';
      }
    } else {
      md += `| No. | Card | Type | Cost | Stats | Rules text | Flavour | Art brief | Status |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n`;
      for (const r of rs) {
        const stats = r.might || r.guard ? `${r.might || '0'} / ${r.guard || '0'}` : '';
        const rules = [r.keywords ? `**${r.keywords}**` : '', r.ability ? `*${r.ability}*` : '', r.text].filter(Boolean).join(' · ');
        md += `| ${r.no} | ${esc(r.name)}${r.title ? `<br>*${esc(r.title)}*` : ''} | ${r.type} | ${r.cost} | ${stats} | ${esc(rules)} | ${r.flavour ? `"${esc(r.flavour)}"` : '—'} | ${esc(r.art)} | ${r.status.replace(/ \(.*$/, '')} |\n`;
      }
      md += '\n';
    }
  }
  writeFileSync(join(root, `MASTER_CARD_LIST_SET${set}.md`), md);
}

// The old single-set files are replaced by the per-set lists.
for (const old of ['MASTER_CARD_LIST.md', 'master-card-list.csv']) if (existsSync(join(root, old))) rmSync(join(root, old));
let idx = `# Sovereign's Hand — master card lists\n\nOne list per set. Generated; do not edit by hand.\n\n| Set | Theme | Card faces | Breakdown | Files |\n| --- | --- | --- | --- | --- |\n`;
for (const s of summary) idx += `| ${s.set} | ${SET_NAME[s.set]} | ${s.total} (${s.nonToken} + tokens) | ${s.parts.join(', ')} | [MASTER_CARD_LIST_SET${s.set}.md](MASTER_CARD_LIST_SET${s.set}.md) · \`master-card-list-set${s.set}.csv\` |\n`;
idx += `\nPlus one shared **card back** and 3 text-only **reference cards** (Your Turn, Combat, Keywords).\n`;
writeFileSync(join(root, 'MASTER_CARD_LISTS.md'), idx);
for (const s of summary) console.log(`Set ${s.set}: ${s.total} cards (${s.parts.join(', ')})`);
