import React, { useEffect, useState } from 'react';
import { BUNDLES, FINISH_NAMES, GUARANTEE_TEXT, PACK_PRICE, PACK_SIZE, RARITIES, RARITY_NAMES, packOdds } from '../../economy/odds';
import { STARSTONE_OFFERS, buyPacks, buyStarstones, useProfile } from '../../economy/profile';
import type { Pack } from '../../economy/packs';

const seed = () => (crypto.getRandomValues(new Uint32Array(1))[0] ^ Date.now()) >>> 0;
const pct = (x: number) => (x >= 0.1 ? `${(x * 100).toFixed(0)}%` : x >= 0.01 ? `${(x * 100).toFixed(1)}%` : `${(x * 100).toFixed(2)}%`);
const oneIn = (x: number) => `1 in ${Math.round(1 / x).toLocaleString()}`;

export function Wallet() {
  const p = useProfile();
  return <div className="wallet"><span className="valor" title="Valor: earned by playing">✧ {p.valor.toLocaleString()} Valor</span><span className="stones" title="Starstones: premium currency">✦ {p.starstones.toLocaleString()} Starstones</span></div>;
}

export const PackArt = ({ width = 300 }: { width?: number }) => (
  <div className="packart" style={{ width, height: Math.round(width * 1.57) }}>
    <img src={`${import.meta.env.BASE_URL}v02/art/crownless/star_3.webp`} alt="" />
    <div className="pa-title">The Shattered Crown</div>
    <div className="pa-sub">SET 1 · {PACK_SIZE} CARDS</div>
  </div>
);

export function Shop({ onBack, onOpened }: { onBack: () => void; onOpened: (packs: Pack[]) => void }) {
  const profile = useProfile();
  const [odds, setOdds] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); }, [msg]);
  const buy = (n: number, cur: 'valor' | 'starstones') => {
    const r = buyPacks(n, cur, seed());
    if ('error' in r) setMsg(r.error); else onOpened(r.packs);
  };
  return (
    <div className="screen">
      <div className="screen-top"><button type="button" className="btn" onClick={onBack}>← Menu</button><h2>Shop</h2><div className="spacer" /><Wallet /></div>
      <div className="screen-body">
        <div className="shop">
          <div>
            <PackArt />
            <p className="note" style={{ textAlign: 'center' }}>5 Commons · 3 Uncommons · 1 Hero card (Elite or better) · 1 guaranteed foil.<br />{PACK_PRICE.valor} ✧ Valor or {PACK_PRICE.starstones} ✦ Starstones per pack.</p>
            <div style={{ textAlign: 'center' }}><button type="button" className="btn" onClick={() => setOdds(true)}>See the odds</button></div>
          </div>
          <div>
            <div className="section-h" style={{ marginTop: 0 }}>The Shattered Crown packs</div>
            <div className="bundles">
              {BUNDLES.map((b) => (
                <div className="bundle" key={b.packs}>
                  <h3>{b.packs} {b.packs === 1 ? 'pack' : 'packs'}</h3>
                  <div className="boost">{b.boost > 1 ? `Odds boost ×${b.boost.toFixed(2)} on Epic, Mythic and specials` : 'Standard odds'}</div>
                  <div className="guar">{b.guarantee ? `Guaranteed ${GUARANTEE_TEXT[b.guarantee]}` : ''}</div>
                  <div className="buy">
                    <button type="button" className="btn gold" disabled={profile.valor < PACK_PRICE.valor * b.packs} onClick={() => buy(b.packs, 'valor')}>✧ {(PACK_PRICE.valor * b.packs).toLocaleString()}</button>
                    <button type="button" className="btn stone" disabled={profile.starstones < PACK_PRICE.starstones * b.packs} onClick={() => buy(b.packs, 'starstones')}>✦ {(PACK_PRICE.starstones * b.packs).toLocaleString()}</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-h">Starstones</div>
            <p className="note">Development build: these purchases are simulated and no payment is taken. Real payments switch on only after a payment provider is connected and the launch review is done.</p>
            <div className="offers">
              {STARSTONE_OFFERS.map((o) => (
                <div className="offer" key={o.id}><b>✦ {o.stones.toLocaleString()}</b><div className="note">≈ {Math.floor(o.stones / PACK_PRICE.starstones)} packs</div>
                  <button type="button" className="btn stone" style={{ marginTop: 8 }} onClick={() => { buyStarstones(o.id); setMsg(`Added ${o.stones} Starstones (simulated purchase).`); }}>${o.price.toFixed(2)} CAD</button></div>
              ))}
            </div>
            <p className="note" style={{ marginTop: 14 }}>Every standard card can also be forged directly with Valor in your Collection, so no card is only available by chance.</p>
          </div>
        </div>
      </div>
      {odds && <OddsModal onClose={() => setOdds(false)} />}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/** Published odds, computed from the same tables the pack opener uses. */
export function OddsModal({ onClose }: { onClose: () => void }) {
  const all = BUNDLES.map((b) => ({ b, o: packOdds(b.boost) }));
  const row = (label: string, f: (o: ReturnType<typeof packOdds>) => number, asOneIn = false) => (
    <tr key={label}><td>{label}</td>{all.map(({ b, o }) => <td key={b.packs}>{asOneIn ? oneIn(f(o)) : pct(f(o))}</td>)}</tr>
  );
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="detail" style={{ flexDirection: 'column', alignItems: 'stretch', maxHeight: 820, overflow: 'auto' }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Pack odds">
        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#f0c95a', margin: 0 }}>Pack odds · The Shattered Crown</h3>
        <p className="note">Chance per pack, by how many packs you buy at once. Bundles also carry a guarantee, which only ever improves the result.</p>
        <table className="odds">
          <thead><tr><th>Per pack</th>{all.map(({ b }) => <th key={b.packs}>{b.packs} {b.packs === 1 ? 'pack' : 'packs'}</th>)}</tr></thead>
          <tbody>
            {RARITIES.map((r) => row(`Any ${RARITY_NAMES[r]}`, (o) => o.anyOf[r]))}
            {RARITIES.map((r) => row(`Foil ${RARITY_NAMES[r]}`, (o) => o.foilOf[r]))}
            {row(`Foil is ${FINISH_NAMES.holo}`, (o) => o.finish.holo)}
            {row(`Foil is ${FINISH_NAMES.prismatic}`, (o) => o.finish.prismatic)}
            {row(`Foil is ${FINISH_NAMES.rainbow}`, (o) => o.finish.rainbow)}
            {row('Alternate Art', (o) => o.alt, true)}
            {row('Alternate Art in foil', (o) => o.altFoil, true)}
            {row('Masterwork (Gilded)', (o) => o.masterwork, true)}
            {row('Omega Masterwork (Gilded)', (o) => o.omega, true)}
            <tr><td>Bundle guarantee</td>{all.map(({ b }) => <td key={b.packs} style={{ fontSize: 12 }}>{b.guarantee ? GUARANTEE_TEXT[b.guarantee] : '—'}</td>)}</tr>
          </tbody>
        </table>
        <div style={{ textAlign: 'right' }}><button type="button" className="btn gold" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
