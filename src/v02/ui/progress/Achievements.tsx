// Achievements screen (PROPOSED 2026-10-11). Renders inside the 1600×900 stage like Collection and Decks.
import React, { useEffect, useMemo, useState } from 'react';
import { useProfile } from '../../economy/profile';
import { CATEGORY_INFO, CATEGORY_ORDER, RARITY_COLOR, RARITY_LABEL, describe, evaluate, roman } from '../../progress/achievements';
import type { AchievementCategory, AchievementStatus } from '../../progress/achievements';
import { claimAchievement, claimAllAchievements } from '../../progress/claim';
import { useProgress } from '../../progress/stats';
import { Wallet } from '../collect/Shop';
import './progress.css';

export const ribbonUrl = (file: string) => `${import.meta.env.BASE_URL}v02/ribbons/${file}.webp`;
type Filter = AchievementCategory | 'all' | 'ready';

function Card({ st, onClaim }: { st: AchievementStatus; onClaim: (id: string) => void }) {
  const { def, value, done, claimable, pendingValor, next, secret } = st;
  const complete = done === def.tiers.length;
  const tier = next ?? def.tiers[def.tiers.length - 1];
  const target = tier.target;
  const shown = Math.min(value, target);
  const pct = def.future ? 0 : Math.round((100 * shown) / target);
  const r = RARITY_COLOR[tier.rarity];
  const cls = ['pg-ach', complete ? 'complete' : '', claimable ? 'ready' : '', def.future ? 'future' : '', secret ? 'secret' : ''].join(' ');
  const name = secret ? '???' : def.tiers.length > 1 ? `${def.name} ${roman(Math.min(done, def.tiers.length - 1))}` : def.name;
  const title = def.tiers.slice(0, done).reverse().find((t) => t.title)?.title ?? (next?.title && !secret ? `Next title: ${next.title}` : null);
  return (
    <div className={cls} style={{ ['--r' as string]: r }}>
      <div className="pg-art">
        {secret ? <div className="pg-glyph">?</div>
          : def.ribbon ? <img className={done ? '' : 'locked'} src={ribbonUrl(def.ribbon)} alt="" loading="lazy" />
          : <div className="pg-glyph">{def.icon}</div>}
      </div>
      <div className="pg-main">
        <h4 title={name}>{name}</h4>
        <p>{secret ? 'A secret achievement. Keep playing to discover it.' : describe(def.desc, target)}</p>
        {def.future ? <div className="pg-note">{def.future}</div> : !secret && (
          <>
            <div className="pg-barline">
              <div className="pg-bar" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={shown}><i style={{ width: `${pct}%` }} /></div>
              <small>{complete ? 'Complete' : `${shown.toLocaleString()} / ${target.toLocaleString()}`}</small>
            </div>
            {def.tiers.length > 1 && (
              <div className="pg-pips" aria-label={`${done} of ${def.tiers.length} tiers`}>
                {def.tiers.map((t, i) => (
                  <span key={i} className={`pg-pip ${i < done ? 'on' : ''}`} style={{ ['--pr' as string]: RARITY_COLOR[t.rarity] }}
                    title={`${roman(i)} · ${describe(def.desc, t.target)} · ${RARITY_LABEL[t.rarity]} · ✧ ${t.valor}${t.title ? ` · Title: ${t.title}` : ''}`}>{roman(i)}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="pg-side">
        <span className="pg-rarity">{RARITY_LABEL[tier.rarity]}</span>
        {claimable > 0 ? (
          <button type="button" className="btn gold" onClick={() => onClaim(def.id)}>Claim ✧ {pendingValor}</button>
        ) : complete ? <span className="pg-done">✓ Complete</span>
          : !def.future && !secret ? <span className="pg-reward">✧ {tier.valor}</span> : null}
        {title && !def.future && <span className="pg-title">{title}</span>}
      </div>
    </div>
  );
}

export function Achievements({ onBack }: { onBack: () => void }) {
  const progress = useProgress();
  const profile = useProfile();
  const ev = useMemo(() => evaluate(progress.stats, profile, { claimed: progress.claimed }), [progress, profile]);
  const [filter, setFilter] = useState<Filter>(() => (ev.claimable > 0 ? 'ready' : 'all'));
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); }, [msg]);

  const shown = ev.list.filter((s) => (filter === 'all' ? true : filter === 'ready' ? s.claimable > 0 : s.def.category === filter));
  const counts = (c: AchievementCategory) => {
    const l = ev.list.filter((s) => s.def.category === c);
    return { done: l.filter((s) => s.done === s.def.tiers.length).length, total: l.length, ready: l.filter((s) => s.claimable > 0).length };
  };
  const claim = (id: string) => { const v = claimAchievement(id); if (v) setMsg(`Claimed ✧ ${v} Valor.`); };

  return (
    <div className="screen pg-screen">
      <div className="screen-top">
        <button type="button" className="btn" onClick={onBack}>← Menu</button><h2>Achievements</h2><div className="spacer" />
        <div className="pg-score"><b>{ev.score.toLocaleString()} / {ev.maxScore.toLocaleString()}</b><span>Achievement Score</span></div>
        <div className="pg-score"><b>{ev.titles.length}</b><span>Titles earned</span></div>
        <button type="button" className="btn gold" disabled={ev.claimable === 0} onClick={() => { const v = claimAllAchievements(); if (v) setMsg(`Claimed ✧ ${v} Valor.`); }}>
          Claim all{ev.claimable ? ` (${ev.claimable})` : ''}</button>
        <Wallet />
      </div>
      <div className="screen-body">
        <nav className="pg-rail" aria-label="Achievement categories">
          <button type="button" className={`pg-cat ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}><i>✦</i><span>All</span><small>{ev.list.length}</small></button>
          <button type="button" className={`pg-cat ${filter === 'ready' ? 'on' : ''}`} onClick={() => setFilter('ready')}><i>✧</i><span>Ready to claim</span>{ev.claimable > 0 && <em>{ev.claimable}</em>}</button>
          {CATEGORY_ORDER.map((c) => {
            const n = counts(c);
            return (
              <button type="button" key={c} className={`pg-cat ${filter === c ? 'on' : ''}`} onClick={() => setFilter(c)}>
                <i>{CATEGORY_INFO[c].glyph}</i><span>{CATEGORY_INFO[c].name}</span>{n.ready > 0 && <em>{n.ready}</em>}<small>{n.done}/{n.total}</small>
              </button>
            );
          })}
        </nav>
        <div className="pg-list">
          {shown.map((s) => <Card key={s.def.id} st={s} onClaim={claim} />)}
          {!shown.length && <div className="pg-empty">{filter === 'ready' ? 'Nothing to claim right now. Play a match, open a pack or clear a Bout.' : 'No achievements here yet.'}</div>}
        </div>
      </div>
      {msg && <div className="pg-msg" role="status">{msg}</div>}
    </div>
  );
}
