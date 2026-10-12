// Challenges screen (PROPOSED 2026-10-11): 3 daily + 3 weekly challenges, one reroll a day, and the permanent
// Champion Challenges for the Tier V legends. Renders inside the 1600×900 stage like Collection and Decks.
import React, { useEffect, useState } from 'react';
import { CHAMPION_CHALLENGES, activeChallenges, challengeText, championTiersDone, championValue } from '../../progress/challenges';
import type { ActiveChallenge } from '../../progress/challenges';
import { canReroll, claimChallenge, claimChampionChallenge, rerollChallenge } from '../../progress/claim';
import { useProgress } from '../../progress/stats';
import { artUrl } from '../cardview';
import { Wallet } from '../collect/Shop';
import './progress.css';

function left(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return d > 0 ? `${d}d ${h}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Number of challenges (daily, weekly and Champion tiers) ready to claim, for a badge on the home tile. */
export function useChallengeBadge(): number {
  const p = useProgress();
  const now = new Date();
  const active = activeChallenges(now, p.ch.swaps).filter((a) => !p.ch.claimed[a.instance] && (p.ch.progress[a.instance] ?? 0) >= a.def.target).length;
  const champ = CHAMPION_CHALLENGES.reduce((n, c) => n + Math.max(0, championTiersDone(c, p.stats) - (p.ch.champClaimed[c.id] ?? 0)), 0);
  return active + champ;
}

export function Challenges({ onBack }: { onBack: () => void }) {
  const p = useProgress();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); }, [msg]);
  const active = activeChallenges(now, p.ch.swaps);
  const daily = active.filter((a) => a.def.category === 'daily'), weekly = active.filter((a) => a.def.category === 'weekly');
  const rerollOk = canReroll(now);

  const card = (a: ActiveChallenge) => {
    const prog = Math.min(p.ch.progress[a.instance] ?? 0, a.def.target);
    const claimed = !!p.ch.claimed[a.instance], ready = !claimed && prog >= a.def.target;
    return (
      <div key={a.instance} className={`pg-ch ${a.def.category} ${ready ? 'ready' : ''} ${claimed ? 'claimed' : ''}`}>
        <h4>{a.def.name}</h4>
        <p>{challengeText(a.def.desc, a.def.target)}</p>
        <div className="pg-barline">
          <div className="pg-bar" role="progressbar" aria-valuemin={0} aria-valuemax={a.def.target} aria-valuenow={prog}><i style={{ width: `${(100 * prog) / a.def.target}%` }} /></div>
          <small>{prog.toLocaleString()} / {a.def.target.toLocaleString()}</small>
        </div>
        <div className="pg-ch-foot">
          <span className="pg-reward">✧ {a.def.valor} Valor</span>
          {claimed ? <span className="pg-done">✓ Claimed</span>
            : ready ? <button type="button" className="btn gold" onClick={() => { const v = claimChallenge(a.instance, new Date()); if (v) setMsg(`Claimed ✧ ${v} Valor.`); }}>Claim</button>
            : <button type="button" className="btn" disabled={!rerollOk} title={rerollOk ? 'Swap this challenge for another (once a day)' : 'You can reroll again tomorrow'}
                onClick={() => { const e = rerollChallenge(a.instance, new Date()); setMsg(e ?? 'Challenge rerolled.'); }}>↻ Reroll</button>}
        </div>
      </div>
    );
  };

  return (
    <div className="screen pg-screen">
      <div className="screen-top">
        <button type="button" className="btn" onClick={onBack}>← Menu</button><h2>Challenges</h2><div className="spacer" />
        <div className="pg-score"><b>{rerollOk ? '1' : '0'}</b><span>Reroll left today</span></div>
        <Wallet />
      </div>
      <div className="screen-body pg-ch-body">
        <div className="pg-section"><h3>Daily</h3><span>New challenges in</span><b>{left((daily[0]?.endsAt ?? 0) - now.getTime())}</b></div>
        <div className="pg-ch-row">{daily.map(card)}</div>
        <div className="pg-section"><h3>Weekly</h3><span>Resets Monday · in</span><b>{left((weekly[0]?.endsAt ?? 0) - now.getTime())}</b></div>
        <div className="pg-ch-row">{weekly.map(card)}</div>
        <div className="pg-section"><h3>Champion Challenges</h3><span>Permanent · master the Tier V legends of Act I</span></div>
        <div className="pg-champs">
          {CHAMPION_CHALLENGES.map((c) => {
            const done = championTiersDone(c, p.stats), had = p.ch.champClaimed[c.id] ?? 0;
            const target = c.tiers[Math.min(done, c.tiers.length - 1)];
            const v = Math.min(championValue(c, p.stats), target);
            const owed = c.valor.slice(had, done).reduce((n, x) => n + x, 0);
            return (
              <div key={c.id} className={`pg-champ ${owed ? 'ready' : ''}`}>
                <img src={artUrl(c.champion, 3)} alt="" loading="lazy" />
                <div>
                  <h5>{c.name}</h5>
                  <p>{challengeText(c.desc, target)}</p>
                  <div className="pg-barline"><div className="pg-bar"><i style={{ width: `${(100 * v) / target}%` }} /></div><small>{done === c.tiers.length ? 'Complete' : `${v} / ${target}`}</small></div>
                  <div className="pg-pips">{c.tiers.map((t, i) => <span key={i} className={`pg-pip ${i < done ? 'on' : ''}`} style={{ ['--pr' as string]: '#f0c95a' }} title={`${challengeText(c.desc, t)} · ✧ ${c.valor[i]}`}>{['I', 'II', 'III'][i]}</span>)}</div>
                  {owed > 0 && <button type="button" className="btn gold" onClick={() => { const x = claimChampionChallenge(c.id); if (x) setMsg(`Claimed ✧ ${x} Valor.`); }}>Claim ✧ {owed}</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {msg && <div className="pg-msg" role="status">{msg}</div>}
    </div>
  );
}
