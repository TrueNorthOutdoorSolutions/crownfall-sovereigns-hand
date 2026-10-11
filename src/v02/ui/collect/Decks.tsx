import React, { useMemo, useState } from 'react';
import { CARDS, DECKS, isChampionCard, isEdictCard } from '../../content/cards';
import type { Rarity } from '../../content/printings';
import { ASCENSION_MAX, DECK_SIZE, checkDeck, fromStarter, registerDeck } from '../../economy/decks';
import { RARITIES, RARITY_NAMES } from '../../economy/odds';
import { copiesOfCard, deleteDeck, saveDeck, useProfile } from '../../economy/profile';
import type { SavedDeck } from '../../economy/profile';
import { PRINTINGS } from '../cardart';
import { FoilCard } from './FoilCard';
import { Wallet } from './Shop';

const BASE = PRINTINGS.filter((p) => p.kind === 'base');
type Kind = 'champion' | 'ascension' | 'spell' | 'edict';
const kindOf = (id: string): Kind => { const c = CARDS[id]; return isChampionCard(c) ? (c.kind === 'ascension' ? 'ascension' : 'champion') : isEdictCard(c) ? 'edict' : 'spell'; };
const KIND_NAMES: Record<Kind, string> = { champion: '★ Champions', ascension: '★★ / ★★★ Ascension', spell: 'Tactics & Schemes', edict: 'Edicts' };
const label = (id: string) => { const c = CARDS[id]; return isChampionCard(c) ? `${c.name} ${'★'.repeat(c.star)}` : c.name; };
const costOf = (id: string) => (CARDS[id] as { cost: number }).cost;
const newId = () => Math.random().toString(36).slice(2, 10);
const OPPONENTS = Object.keys(DECKS).filter((d) => (DECKS[d].set ?? 1) === 1 && !d.startsWith('custom-'));

export function Decks({ onBack, onPlay }: { onBack: () => void; onPlay: (deckId: string, opponent: string) => void }) {
  const profile = useProfile();
  const [edit, setEdit] = useState<SavedDeck | null>(null);
  const [kind, setKind] = useState<Kind>('champion');
  const [rarity, setRarity] = useState<Rarity | 'all'>('all');
  const [search, setSearch] = useState('');
  const [playtest, setPlaytest] = useState(false);
  const [opp, setOpp] = useState(OPPONENTS[1] ?? OPPONENTS[0]);
  const owned = (id: string) => (playtest ? 99 : copiesOfCard(profile, id));

  const pool = useMemo(() => BASE.filter((p) => kindOf(p.cardId) === kind)
    .filter((p) => rarity === 'all' || p.rarity === rarity)
    .filter((p) => !search || CARDS[p.cardId].name.toLowerCase().includes(search.toLowerCase())), [kind, rarity, search]);

  if (!edit) {
    return (
      <div className="screen">
        <div className="screen-top"><button type="button" className="btn" onClick={onBack}>← Menu</button><h2>Decks</h2><div className="spacer" /><Wallet /></div>
        <div className="screen-body">
          <div className="section-h" style={{ marginTop: 0 }}>Your decks</div>
          <div className="decklist">
            {profile.decks.length === 0 && <p className="note">No decks yet. Start from a starter deck or an empty list.</p>}
            {profile.decks.map((d) => {
              // Rules decide whether a deck can be played; cards you don't own only matter once ownership is enforced.
              const chk = checkDeck(d.main, d.ascension);
              const own = checkDeck(d.main, d.ascension, (id) => copiesOfCard(profile, id));
              return (
                <div className="deckrow" key={d.id}>
                  <b>{d.name}</b><span className="note">{chk.mainCount}/{DECK_SIZE} cards · {chk.ascCount}/{ASCENSION_MAX} Ascension · {!chk.ok ? `${chk.errors.length} rule problem${chk.errors.length === 1 ? '' : 's'}` : own.ok ? 'ready to play' : 'playtest deck (uses cards you do not own yet)'}</span>
                  <div className="spacer" />
                  <button type="button" className="btn gold" disabled={!chk.ok} onClick={() => onPlay(registerDeck(d), opp)}>Play</button>
                  <button type="button" className="btn" onClick={() => setEdit(d)}>Edit</button>
                  <button type="button" className="btn" onClick={() => { if (confirm(`Delete ${d.name}?`)) deleteDeck(d.id); }}>Delete</button>
                </div>
              );
            })}
          </div>
          <div className="coll-filters" style={{ marginTop: 16 }}>
            <span className="note">AI opponent:</span>
            {OPPONENTS.map((o) => <button type="button" key={o} className={`chip ${opp === o ? 'on' : ''}`} onClick={() => setOpp(o)}>{DECKS[o].name}</button>)}
          </div>
          <div className="section-h">New deck</div>
          <div className="coll-filters">
            <button type="button" className="btn gold" onClick={() => setEdit({ id: newId(), name: 'New deck', main: [], ascension: [], updated: Date.now() })}>Empty deck</button>
            {OPPONENTS.map((o) => <button type="button" key={o} className="btn" onClick={() => setEdit(fromStarter(o, newId()))}>Start from {DECKS[o].name}</button>)}
          </div>
        </div>
      </div>
    );
  }

  const chk = checkDeck(edit.main, edit.ascension, playtest ? undefined : owned);
  const inMain = (id: string) => edit.main.find(([c]) => c === id)?.[1] ?? 0;
  const inPile = (id: string) => edit.ascension.filter((c) => c === id).length;
  const add = (id: string) => {
    if (kindOf(id) === 'ascension') setEdit({ ...edit, ascension: [...edit.ascension, id] });
    else setEdit({ ...edit, main: inMain(id) ? edit.main.map(([c, n]) => [c, c === id ? n + 1 : n] as [string, number]) : [...edit.main, [id, 1]] });
  };
  const remove = (id: string) => {
    if (kindOf(id) === 'ascension') { const i = edit.ascension.lastIndexOf(id); setEdit({ ...edit, ascension: edit.ascension.filter((_, j) => j !== i) }); }
    else setEdit({ ...edit, main: edit.main.map(([c, n]) => [c, c === id ? n - 1 : n] as [string, number]).filter(([, n]) => n > 0) });
  };
  const groups: Kind[] = ['champion', 'spell', 'edict'];
  const sorted = (ids: [string, number][]) => [...ids].sort((a, b) => costOf(a[0]) - costOf(b[0]) || label(a[0]).localeCompare(label(b[0])));
  const pile = Object.entries(edit.ascension.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {})) as [string, number][];

  return (
    <div className="screen">
      <div className="screen-top">
        <button type="button" className="btn" onClick={() => setEdit(null)}>← Decks</button>
        <input className="deckname" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} aria-label="Deck name" maxLength={40} />
        <div className="spacer" />
        <label className="note" style={{ display: 'flex', gap: 6, alignItems: 'center' }} title="Build with every Set 1 card, owned or not, for playtesting">
          <input type="checkbox" checked={playtest} onChange={(e) => setPlaytest(e.target.checked)} /> Playtest: all cards
        </label>
        <button type="button" className="btn gold" onClick={() => { saveDeck(edit); setEdit(null); }}>Save deck</button>
      </div>
      <div className="builder">
        <div className="pool">
          <div className="coll-filters">
            {(Object.keys(KIND_NAMES) as Kind[]).map((k) => <button type="button" key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{KIND_NAMES[k]}</button>)}
            <span style={{ width: 10 }} />
            <button type="button" className={`chip ${rarity === 'all' ? 'on' : ''}`} onClick={() => setRarity('all')}>All</button>
            {RARITIES.map((r) => <button type="button" key={r} className={`chip ${rarity === r ? 'on' : ''}`} onClick={() => setRarity(r)}>{RARITY_NAMES[r]}</button>)}
            <input className="search" placeholder="Search name" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search cards" />
          </div>
          <div className="pool-grid">
            {pool.map((p) => {
              const have = owned(p.cardId), used = kindOf(p.cardId) === 'ascension' ? inPile(p.cardId) : inMain(p.cardId);
              return (
                <div key={p.id} className={`coll-item ${have ? '' : 'missing'}`}>
                  <FoilCard printing={p.id} width={150} onClick={have > used ? () => add(p.cardId) : undefined} />
                  <div className="cnt">{used ? <b style={{ color: '#f0c95a' }}>{used} in deck · </b> : null}{playtest ? '' : `own ${have}`}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="decklist-panel">
          <div className={`counts ${chk.mainCount === DECK_SIZE ? 'good' : ''}`}>Deck {chk.mainCount}/{DECK_SIZE}</div>
          {groups.map((g) => {
            const rows = sorted(edit.main.filter(([id]) => kindOf(id) === g));
            if (!rows.length) return null;
            return (
              <div key={g}><div className="grp">{KIND_NAMES[g]} ({rows.reduce((n, [, c]) => n + c, 0)})</div>
                {rows.map(([id, n]) => <div className="row" key={id}><span className="cost">{costOf(id)}</span><span className="nm">{label(id)}</span><span>×{n}</span><button type="button" className="mini" onClick={() => remove(id)} aria-label={`Remove ${label(id)}`}>−</button><button type="button" className="mini" onClick={() => add(id)} aria-label={`Add ${label(id)}`} disabled={owned(id) <= n}>+</button></div>)}
              </div>
            );
          })}
          <div className={`counts ${chk.ascCount ? 'good' : ''}`} style={{ marginTop: 10 }}>Ascension Pile {chk.ascCount}/{ASCENSION_MAX}</div>
          {pile.map(([id, n]) => <div className="row" key={id}><span className="cost">↑{costOf(id)}</span><span className="nm">{label(id)}</span><span>×{n}</span><button type="button" className="mini" onClick={() => remove(id)} aria-label={`Remove ${label(id)}`}>−</button></div>)}
          <div className="checks">
            {chk.errors.map((e) => <div key={e} className="err">✕ {e}</div>)}
            {chk.warnings.map((w) => <div key={w} className="warn">! {w}</div>)}
            {chk.ok && <div className="okmsg">✓ Legal deck</div>}
          </div>
          <button type="button" className="btn gold" disabled={!chk.ok} onClick={() => { saveDeck(edit); onPlay(registerDeck(edit), opp); }}>Save and play vs {DECKS[opp].name}</button>
        </div>
      </div>
    </div>
  );
}

