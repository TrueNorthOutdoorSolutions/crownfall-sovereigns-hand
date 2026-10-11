import React, { useEffect, useState } from 'react';
import { FINISH_NAMES, RARITY_NAMES } from '../../economy/odds';
import type { Pack, Pull } from '../../economy/packs';
import { clearLastOpening } from '../../economy/profile';
import { PRINTING_BY_ID } from '../cardart';
import { FoilCard } from './FoilCard';
import { PackArt } from './Shop';
import { CARDS } from '../../content/cards';

const isBig = (c: Pull) => {
  const p = PRINTING_BY_ID[c.printing];
  return p.kind !== 'base' || p.rarity === 'mythic' || c.finish === 'rainbow';
};
const bigTitle = (c: Pull) => {
  const p = PRINTING_BY_ID[c.printing];
  if (p.kind === 'omega') return 'OMEGA MASTERWORK';
  if (p.kind === 'masterwork') return 'MASTERWORK';
  if (p.kind === 'alt') return c.finish !== 'normal' ? `Alternate Art · ${FINISH_NAMES[c.finish]}` : 'Alternate Art';
  if (c.finish === 'rainbow') return `Sovereign Rainbow ${RARITY_NAMES[p.rarity]}`;
  return `${RARITY_NAMES[p.rarity]}!`;
};

/** Open the packs one at a time: tap the pack, then flip the cards. Big pulls get their own moment. */
export function Opening({ packs, onDone }: { packs: Pack[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [torn, setTorn] = useState(false);
  const [tearing, setTearing] = useState(false);
  const [shown, setShown] = useState<boolean[]>(Array(10).fill(false));
  const [big, setBig] = useState<Pull | null>(null);
  const [summary, setSummary] = useState(false);
  const pack = packs[i];
  // Reveal order puts the Hero and Foil slots last, as in a real pack.
  useEffect(() => { setShown(Array(pack?.length ?? 10).fill(false)); setTorn(false); setTearing(false); }, [i, pack?.length]);

  const flip = (k: number) => {
    if (shown[k]) return;
    setShown((s) => s.map((v, j) => (j === k ? true : v)));
    if (isBig(pack[k])) setTimeout(() => setBig(pack[k]), 450);
  };
  const flipAll = () => {
    const firstBig = pack.findIndex((c, k) => !shown[k] && isBig(c));
    setShown(pack.map(() => true));
    if (firstBig >= 0) setTimeout(() => setBig(pack[firstBig]), 500);
  };
  const next = () => { if (i + 1 < packs.length) setI(i + 1); else setSummary(true); };
  const finish = () => { clearLastOpening(); onDone(); };

  if (summary || !pack) {
    const best = packs.flat().filter((c) => { const p = PRINTING_BY_ID[c.printing]; return p.kind !== 'base' || c.finish !== 'normal' || ['epic', 'mythic'].includes(p.rarity); });
    return (
      <div className="screen">
        <div className="screen-top"><h2>{packs.length} {packs.length === 1 ? 'pack' : 'packs'} opened</h2><div className="spacer" /><button type="button" className="btn gold" onClick={finish}>Done</button></div>
        <div className="screen-body">
          <p className="note">{packs.length * 10} cards added to your Collection. Highlights:</p>
          <div className="reveal-row" style={{ justifyContent: 'flex-start' }}>
            {best.slice(0, 60).map((c, k) => <FoilCard key={k} printing={c.printing} finish={c.finish} width={150} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="opening">
      <div className="count">Pack {i + 1} of {packs.length}</div>
      {!torn ? (
        <>
          <div className={`sealed ${tearing ? 'tear' : ''}`} onClick={() => { setTearing(true); setTimeout(() => setTorn(true), 650); }} role="button" tabIndex={0}
            aria-label="Open pack" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setTearing(true); setTimeout(() => setTorn(true), 650); } }}>
            <PackArt width={280} />
          </div>
          <div className="controls"><button type="button" className="btn" onClick={() => setSummary(true)}>Skip to results</button></div>
        </>
      ) : (
        <>
          <div className="reveal-row">
            {pack.map((c, k) => {
              const p = PRINTING_BY_ID[c.printing];
              return (
                <div key={k} className={`flip ${shown[k] ? 'shown' : 'unseen'} r-${p.rarity} ${p.kind !== 'base' ? 'special' : ''}`} onClick={() => flip(k)}>
                  <div className="inner">
                    <div className="face back"><FoilCard printing={c.printing} faceDown width={186} tilt={false} onClick={() => flip(k)} /></div>
                    <div className="face front"><FoilCard printing={c.printing} finish={c.finish} width={186} /></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="controls">
            {shown.some((v) => !v) && <button type="button" className="btn" onClick={flipAll}>Reveal all</button>}
            {shown.every(Boolean) && <button type="button" className="btn gold" onClick={next}>{i + 1 < packs.length ? 'Next pack' : 'See results'}</button>}
            {packs.length > 1 && <button type="button" className="btn" onClick={() => setSummary(true)}>Skip to results</button>}
          </div>
        </>
      )}
      {big && (
        <div className="bigpull" onClick={() => setBig(null)} role="dialog" aria-label={bigTitle(big)}>
          <div className="rays" />
          <h2>{bigTitle(big)}</h2>
          <FoilCard printing={big.printing} finish={big.finish} width={360} />
          <div className="note">{CARDS[PRINTING_BY_ID[big.printing].cardId].name} · tap to continue</div>
        </div>
      )}
    </div>
  );
}
