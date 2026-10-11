import React, { useEffect, useMemo, useState } from 'react';
import { CARDS, isChampionCard, isEdictCard } from '../../content/cards';
import type { Printing, Rarity } from '../../content/printings';
import { FINISH_NAMES, RARITIES, RARITY_NAMES } from '../../economy/odds';
import type { Finish } from '../../economy/odds';
import { FORGE_PRICE, PLAYSET, forge, ownKey, salvageExtras, useProfile } from '../../economy/profile';
import { PRINTINGS } from '../cardart';
import { FoilCard } from './FoilCard';
import { Wallet } from './Shop';

const FINISHES: Finish[] = ['normal', 'holo', 'prismatic', 'rainbow', 'gilded'];
type Group = 'base' | 'alt' | 'special';
const typeOf = (p: Printing) => { const c = CARDS[p.cardId]; return isChampionCard(c) ? 'champion' : isEdictCard(c) ? 'edict' : 'spell'; };

export function Collection({ onBack }: { onBack: () => void }) {
  const profile = useProfile();
  const [group, setGroup] = useState<Group>('base');
  const [rarity, setRarity] = useState<Rarity | 'all'>('all');
  const [kind, setKind] = useState<'all' | 'champion' | 'spell' | 'edict'>('all');
  const [show, setShow] = useState<'all' | 'owned' | 'missing'>('all');
  const [open, setOpen] = useState<Printing | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); }, [msg]);

  const owned = (p: Printing, f?: Finish) => (f ? profile.owned[ownKey(p.id, f)] ?? 0 : FINISHES.reduce((n, x) => n + (profile.owned[ownKey(p.id, x)] ?? 0), 0));
  const list = useMemo(() => PRINTINGS.filter((p) => p.kind !== 'token')
    .filter((p) => (group === 'base' ? p.kind === 'base' : group === 'alt' ? p.kind === 'alt' : p.kind === 'masterwork' || p.kind === 'omega'))
    .filter((p) => rarity === 'all' || p.rarity === rarity)
    .filter((p) => kind === 'all' || typeOf(p) === kind), [group, rarity, kind]);
  const visible = list.filter((p) => (show === 'owned' ? owned(p) > 0 : show === 'missing' ? owned(p) === 0 : true));
  const have = list.filter((p) => owned(p) > 0).length;

  return (
    <div className="screen">
      <div className="screen-top">
        <button type="button" className="btn" onClick={onBack}>← Menu</button><h2>Collection</h2><div className="spacer" />
        <button type="button" className="btn" title={`Turn standard copies beyond ${PLAYSET} of a card into Valor`} onClick={() => { const v = salvageExtras(); setMsg(v ? `Salvaged extra copies for ${v} Valor.` : 'No extra copies to salvage.'); }}>Salvage extras</button>
        <Wallet />
      </div>
      <div className="screen-body">
        <div className="coll-filters">
          {(['base', 'alt', 'special'] as Group[]).map((g) => <button type="button" key={g} className={`chip ${group === g ? 'on' : ''}`} onClick={() => setGroup(g)}>{g === 'base' ? 'Set 1 (248)' : g === 'alt' ? 'Alternate Art (52)' : 'Masterworks & Omegas (20)'}</button>)}
          <span style={{ width: 16 }} />
          <button type="button" className={`chip ${rarity === 'all' ? 'on' : ''}`} onClick={() => setRarity('all')}>All rarities</button>
          {RARITIES.map((r) => <button type="button" key={r} className={`chip ${rarity === r ? 'on' : ''}`} onClick={() => setRarity(r)}>{RARITY_NAMES[r]}</button>)}
          <span style={{ width: 16 }} />
          {(['all', 'champion', 'spell', 'edict'] as const).map((k) => <button type="button" key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{k === 'all' ? 'All types' : k === 'champion' ? 'Champions' : k === 'spell' ? 'Tactics & Schemes' : 'Edicts'}</button>)}
          <span style={{ width: 16 }} />
          {(['all', 'owned', 'missing'] as const).map((k) => <button type="button" key={k} className={`chip ${show === k ? 'on' : ''}`} onClick={() => setShow(k)}>{k === 'all' ? 'Owned + missing' : k === 'owned' ? 'Owned' : 'Missing'}</button>)}
          <span className="coll-stats">{have} / {list.length} collected</span>
        </div>
        <div className="coll-grid">
          {visible.map((p) => {
            const n = owned(p), foils = n - owned(p, 'normal');
            const best = (['gilded', 'rainbow', 'prismatic', 'holo'] as Finish[]).find((f) => owned(p, f) > 0) ?? 'normal';
            return (
              <div key={p.id} className={`coll-item ${n ? '' : 'missing'}`}>
                <FoilCard printing={p.id} finish={best} width={168} onClick={() => setOpen(p)} />
                <div className="cnt">{p.no}{p.kind === 'base' ? '' : ''} · ×{n}{foils > 0 && <span className="fo">{foils} foil</span>}</div>
              </div>
            );
          })}
        </div>
      </div>
      {open && (
        <div className="modal-back" onClick={() => setOpen(null)}>
          <div className="detail" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={CARDS[open.cardId].name}>
            <FoilCard printing={open.id} finish={(['gilded', 'rainbow', 'prismatic', 'holo'] as Finish[]).find((f) => owned(open, f) > 0) ?? 'normal'} width={380} />
            <div className="info">
              <h3>{CARDS[open.cardId].name}</h3>
              <div className="note">{open.no}{open.kind === 'base' ? '/248' : ''} · {RARITY_NAMES[open.rarity]}{open.kind === 'alt' ? ' · Alternate Art' : open.kind === 'masterwork' ? ' · Masterwork' : open.kind === 'omega' ? ' · Omega Masterwork' : ''}</div>
              <div className="finishes">
                {FINISHES.filter((f) => (open.kind === 'masterwork' || open.kind === 'omega' ? f === 'gilded' : f !== 'gilded')).map((f) => (
                  <span key={f} className="chip" style={{ cursor: 'default' }}>{FINISH_NAMES[f]} ×{owned(open, f)}</span>
                ))}
              </div>
              {open.kind === 'base' && (
                <>
                  <p className="note">Forge a standard copy directly. Decks use up to {PLAYSET} copies of a card.</p>
                  <button type="button" className="btn gold" disabled={profile.valor < FORGE_PRICE[open.rarity]} onClick={() => { const e = forge(open.id); setMsg(e ?? `Forged ${CARDS[open.cardId].name}.`); }}>Forge for ✧ {FORGE_PRICE[open.rarity]}</button>
                </>
              )}
              <button type="button" className="btn" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}
