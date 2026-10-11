import React, { useRef } from 'react';
import { CARDS } from '../../content/cards';
import type { Finish } from '../../economy/odds';
import { FINISH_NAMES } from '../../economy/odds';
import { PRINTING_BY_ID, cardBackUrl, imgUrl } from '../cardart';
import { cardText } from '../text';

/** A collectible card image with its foil finish. The foil follows the pointer, like tilting a real card. */
export function FoilCard({ printing, finish = 'normal', width = 220, faceDown, onClick, tilt = true, className = '' }: {
  printing: string; finish?: Finish; width?: number; faceDown?: boolean; onClick?: () => void; tilt?: boolean; className?: string;
}) {
  const p = PRINTING_BY_ID[printing];
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty('--mx', `${x * 100}%`);
    ref.current.style.setProperty('--my', `${y * 100}%`);
    ref.current.style.setProperty('--rx', `${(0.5 - y) * 14}deg`);
    ref.current.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
  };
  const leave = () => { ref.current?.style.removeProperty('--rx'); ref.current?.style.removeProperty('--ry'); };
  const label = faceDown ? 'Face-down card' : `${cardText(CARDS[p.cardId])}${finish !== 'normal' ? ` (${FINISH_NAMES[finish]} foil)` : ''}`;
  return (
    <div ref={ref} className={`foilcard f-${faceDown ? 'back' : finish} r-${p.rarity} k-${p.kind} ${onClick ? 'clickable' : ''} ${className}`}
      style={{ width, height: Math.round(width * 1.395) }} onPointerMove={move} onPointerLeave={leave} onClick={onClick}
      role={onClick ? 'button' : 'img'} tabIndex={onClick ? 0 : undefined} aria-label={label}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}>
      <img src={faceDown ? cardBackUrl : imgUrl(p)} alt="" draggable={false} />
      {!faceDown && finish !== 'normal' && <div className="foil-layer" aria-hidden="true" />}
      {!faceDown && finish !== 'normal' && <div className="foil-glare" aria-hidden="true" />}
    </div>
  );
}
