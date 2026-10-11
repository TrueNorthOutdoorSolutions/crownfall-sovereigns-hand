import React, { useEffect } from 'react';
import { CARDS, isChampionCard } from '../content/cards';
import { basePrinting, cardImage } from './cardart';

export interface AscendMoment { key: number; cardId: string; star: number; mine: boolean }

/** Ascension celebrations. ★★ is a quick burst over the board; ★★★ is a short cinematic the players can tap past.
 *  Both shorten on fast speed and respect reduced motion (CSS). The AI waits while one is showing. */
export function AscendFx({ m, fast, onDone, hold }: { m: AscendMoment; fast: boolean; onDone: () => void; hold?: boolean }) {
  const big = m.star >= 3;
  const ms = big ? (fast ? 2200 : 4200) : (fast ? 1000 : 1900);
  useEffect(() => { if (hold) return; const t = setTimeout(onDone, ms); return () => clearTimeout(t); }, [m.key, ms, onDone, hold]);
  const c = CARDS[m.cardId];
  if (!isChampionCard(c)) return null;
  const img = cardImage(m.cardId);
  const flavour = basePrinting(m.cardId)?.flavour;
  const who = m.mine ? 'You' : 'Rival';

  if (!big) {
    return (
      <div className={`afx afx2 ${m.mine ? 'mine' : 'theirs'}`} aria-live="polite" style={{ ['--afx-ms' as string]: `${ms}ms` }}>
        <div className="afx-ring" /><div className="afx-ring r2" />
        <div className="afx-sparks">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${(i * 360) / 14}deg` }} />)}</div>
        {img && <img className="afx-card" src={img} alt="" />}
        <div className="afx-title"><span className="stars">★★</span> {c.name} Ascends</div>
      </div>
    );
  }
  return (
    <div className={`afx afx3 ${m.mine ? 'mine' : 'theirs'}`} role="dialog" aria-label={`${who}: ${c.name} reaches three stars`} onClick={onDone} style={{ ['--afx-ms' as string]: `${ms}ms` }}>
      <div className="afx-rays" />
      <div className="afx-glow" />
      <div className="afx-motes">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ ['--x' as string]: `${(i * 37) % 100}%`, ['--d' as string]: `${(i % 7) * 0.18}s` }} />)}</div>
      <div className="afx-stars">{[0, 1, 2].map((i) => <span key={i} style={{ animationDelay: `${(fast ? 0.15 : 0.35) + i * (fast ? 0.12 : 0.28)}s` }}>★</span>)}</div>
      {img && <img className="afx-card" src={img} alt="" />}
      <div className="afx-name">{c.name}<small>{c.title}</small></div>
      {flavour && <div className="afx-quote">“{flavour}”</div>}
      <div className="afx-skip">{who === 'You' ? 'Your champion reaches ★★★' : 'Your rival’s champion reaches ★★★'} · tap to continue</div>
    </div>
  );
}
