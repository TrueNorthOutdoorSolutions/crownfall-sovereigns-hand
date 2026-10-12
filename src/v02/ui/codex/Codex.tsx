import React, { useEffect, useMemo, useState } from 'react';
import { ALL_LINES, ORIGIN_COLORS } from '../../content/cards';
import type { ChampionLine } from '../../content/cards';
import { CardFace, GLOSSARY, artUrl } from '../cardview';
import { RulesModal } from '../Match';
import { Wallet } from '../collect/Shop';
import './codex.css';

// The Codex: every champion with its cards and story, the Origins and Classes, and the rules and keywords.
// Champion stories come from prototype-v0.2/lore/champions/*.md (approved by the owner 2026-10-11) and load on demand.
const LORE = import.meta.glob('../../../../prototype-v0.2/lore/champions/*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const loreFile = (canonId: string) => Object.entries(LORE).find(([path]) => path.endsWith(`/${canonId}.md`))?.[1];

const B = import.meta.env.BASE_URL;
const TRAIT_ICONS = new Set(['arcanist', 'ascendant', 'bruiser', 'commander', 'dawnforged', 'duelist', 'elemental', 'kingdom', 'mystic', 'ranger', 'vanguard', 'wildkin', 'wyrmblood']);
const nice = (s: string) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const TIERS = [1, 2, 3, 4, 5] as const;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

/** The 55 champions, one entry each, with their Set 1 and Set 2 lines. */
const CHAMPIONS = (() => {
  const by = new Map<string, { s1?: ChampionLine; s2?: ChampionLine }>();
  for (const l of ALL_LINES) {
    if ((l.family ?? 'champion') !== 'champion') continue;
    const e = by.get(l.canonId) ?? {};
    if ((l.set ?? 1) === 2) e.s2 = l; else e.s1 = l;
    by.set(l.canonId, e);
  }
  return [...by.entries()].filter(([, e]) => e.s1).map(([id, e]) => ({ id, s1: e.s1!, s2: e.s2 }))
    .sort((a, b) => a.s1.tier - b.s1.tier || a.s1.name.localeCompare(b.s1.name));
})();

type Tab = 'champions' | 'traits' | 'rules';

export function Codex({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('champions');
  const [pick, setPick] = useState<string | null>(null);
  const [rules, setRules] = useState(false);
  return (
    <div className="screen codex">
      <div className="screen-top">
        <button type="button" className="btn" onClick={pick ? () => setPick(null) : onBack}>{pick ? '← Codex' : '← Menu'}</button><h2>Codex</h2>
        {!pick && <div className="cx-tabs">{(['champions', 'traits', 'rules'] as Tab[]).map((t) => <button type="button" key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t === 'champions' ? 'Champions' : t === 'traits' ? 'Origins & Classes' : 'Rules & Keywords'}</button>)}</div>}
        <div className="spacer" /><Wallet />
      </div>
      <div className="screen-body">
        {pick ? <ChampionPage id={pick} /> : tab === 'champions' ? <ChampionGrid onPick={setPick} /> : tab === 'traits' ? <Traits onPick={setPick} /> : <Rules onRules={() => setRules(true)} />}
      </div>
      {rules && <RulesModal onClose={() => setRules(false)} />}
    </div>
  );
}

function ChampionGrid({ onPick }: { onPick: (id: string) => void }) {
  const [tier, setTier] = useState<number | 0>(0);
  const [origin, setOrigin] = useState('');
  const origins = useMemo(() => [...new Set(CHAMPIONS.flatMap((c) => c.s1.origins))].sort(), []);
  const list = CHAMPIONS.filter((c) => (!tier || c.s1.tier === tier) && (!origin || c.s1.origins.includes(origin)));
  return (
    <>
      <div className="coll-filters">
        <button type="button" className={`chip ${tier === 0 ? 'on' : ''}`} onClick={() => setTier(0)}>All tiers</button>
        {TIERS.map((t) => <button type="button" key={t} className={`chip ${tier === t ? 'on' : ''}`} onClick={() => setTier(t)}>Tier {ROMAN[t]}</button>)}
        <span style={{ width: 16 }} />
        <select className="cx-select" value={origin} onChange={(e) => setOrigin(e.target.value)} aria-label="Filter by Origin">
          <option value="">Every Origin</option>
          {origins.map((o) => <option key={o} value={o}>{nice(o)}</option>)}
        </select>
        <span className="cx-count">{list.length} of {CHAMPIONS.length} champions</span>
      </div>
      <div className="cx-grid">
        {list.map((c) => (
          <button type="button" key={c.id} className="cx-champ" onClick={() => onPick(c.id)} style={{ ['--oc' as string]: ORIGIN_COLORS[c.s1.origins[0]] ?? '#c9a24a' }}>
            <span className="cx-portrait" style={{ backgroundImage: `url(${artUrl(c.id, 1)})` }} />
            <b>{c.s1.name}</b><small>{c.s1.title}</small>
            <span className="cx-meta">Tier {ROMAN[c.s1.tier]} · {c.s1.origins.map(nice).join(' / ')}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function ChampionPage({ id }: { id: string }) {
  const c = CHAMPIONS.find((x) => x.id === id)!;
  const [lore, setLore] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const f = loreFile(id);
    if (f) f().then((t) => live && setLore(t)); else setLore('');
    return () => { live = false; };
  }, [id]);
  const ids = (l: ChampionLine) => { const lid = l.lineId ?? l.canonId; return l.forms.map((f) => (f.star === 1 ? lid : `${lid}-${f.star}`)); };
  return (
    <div className="cx-page">
      <header className="cx-head" style={{ ['--oc' as string]: ORIGIN_COLORS[c.s1.origins[0]] ?? '#c9a24a' }}>
        <span className="cx-portrait big" style={{ backgroundImage: `url(${artUrl(c.id, 3)})` }} />
        <div>
          <h3>{c.s1.name}</h3><div className="cx-title">{c.s1.title}</div>
          <div className="cx-tags">
            <span>Tier {ROMAN[c.s1.tier]}</span>
            {c.s1.origins.map((o) => <span key={o} className="origin">{nice(o)}</span>)}
            {c.s1.classes.map((k) => <span key={k}>{nice(k)}</span>)}
            {c.s2 && <span className="s2">Set 2: {c.s2.classes.map(nice).join(' / ')}</span>}
          </div>
        </div>
      </header>
      <div className="section-h">The Shattered Crown · Set 1</div>
      <div className="cx-cards">{ids(c.s1).map((cid) => <CardFace key={cid} id={cid} size="md" />)}</div>
      {c.s2 && <>
        <div className="section-h">Beneath the Arena · Set 2 <small className="cx-note">{c.s2.title}</small></div>
        <div className="cx-cards">{ids(c.s2).map((cid) => <CardFace key={cid} id={cid} size="md" />)}</div>
      </>}
      <div className="section-h">Story</div>
      {lore === null ? <p className="note">Opening the archive…</p> : lore ? <Lore text={lore} /> : <p className="note">This champion's story has not been written yet.</p>}
    </div>
  );
}

/** Renders a lore file's simple Markdown, without the drafting notes meant for the owner. */
function Lore({ text }: { text: string }) {
  const blocks = text
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b && !/^#\s/.test(b) && !/^\*[^*]+\*$/.test(b) && !/Status:\s*PROPOSED/i.test(b))
    .map((b) => b.replace(/\s*\[canon[^\]]*\]/gi, '').replace(/^PROPOSED:\s*/i, ''));
  const inline = (s: string) => s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part.startsWith('*') && part.length > 2 ? <i key={i}>{part.slice(1, -1)}</i> : part);
  return (
    <div className="cx-lore">
      {blocks.map((b, i) => b.startsWith('## ') ? <h4 key={i}>{b.slice(3)}</h4>
        : b.startsWith('>') ? <blockquote key={i}>{inline(b.replace(/^>\s?/gm, ''))}</blockquote>
        : /^[-*] /.test(b) ? <ul key={i}>{b.split('\n').map((li, j) => <li key={j}>{inline(li.replace(/^[-*] /, ''))}</li>)}</ul>
        : <p key={i}>{inline(b)}</p>)}
    </div>
  );
}

function Traits({ onPick }: { onPick: (id: string) => void }) {
  const group = (key: 'origins' | 'classes') => {
    const m = new Map<string, typeof CHAMPIONS>();
    for (const c of CHAMPIONS) for (const t of c.s1[key]) m.set(t, [...(m.get(t) ?? []), c]);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  };
  const section = (title: string, rows: ReturnType<typeof group>) => (
    <>
      <div className="section-h">{title}</div>
      <div className="cx-traits">
        {rows.map(([t, cs]) => (
          <div className="cx-trait" key={t} style={{ ['--oc' as string]: ORIGIN_COLORS[t] ?? '#c9a24a' }}>
            <div className="cx-trait-h">{TRAIT_ICONS.has(t) ? <img src={`${B}v02/traits/${t}.webp`} alt="" /> : <span className="cx-dot" />}<b>{nice(t)}</b><small>{cs.length} champions</small></div>
            <div className="cx-names">{cs.map((c) => <button type="button" key={c.id} onClick={() => onPick(c.id)}>{c.s1.name}</button>)}</div>
          </div>
        ))}
      </div>
    </>
  );
  return <>{section('Origins', group('origins'))}{section('Classes · Set 1', group('classes'))}</>;
}

function Rules({ onRules }: { onRules: () => void }) {
  return (
    <>
      <p className="note">Break all five of your rival's Crown Shards to win. <button type="button" className="btn gold" onClick={onRules}>Open the quick rules</button></p>
      <div className="section-h">Keywords and terms</div>
      <dl className="cx-glossary">{Object.entries(GLOSSARY).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
    </>
  );
}
