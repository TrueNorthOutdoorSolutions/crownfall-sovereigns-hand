import React, { useEffect, useState } from 'react';
import { BUNDLES, FINISH_NAMES, GUARANTEE_TEXT, PACK_PRICE, PACK_SIZE, RARITIES, RARITY_NAMES, packOdds } from '../../economy/odds';
import { STARSTONE_OFFERS, buyPacks, buyStarstones, useProfile } from '../../economy/profile';
import type { Pack } from '../../economy/packs';
import { cardBackUrl } from '../cardart';

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
  const B = import.meta.env.BASE_URL;
  const boostLine = (b: (typeof BUNDLES)[number]) => b.boost > 1 ? <><span>Odds boost ×{b.boost.toFixed(2)}</span><span>on Epic, Mythic and specials</span></> : <span>Standard odds</span>;
  return (
    <div className="shopx">
      <div className="shopx-bg" style={{ backgroundImage: `url(${B}v02/menu-bg.webp)` }} />
      <button type="button" className="shopx-back" onClick={onBack}>← Menu</button>
      <h2 className="shopx-title"><span className="sx-orn" aria-hidden="true">⟜◆</span><span className="sx-crown" aria-hidden="true">♛</span><span className="sx-word">Shop</span><span className="sx-orn" aria-hidden="true">◆⟞</span></h2>
      <div className="shopx-wallet"><span className="valor">✧ {profile.valor.toLocaleString()} Valor</span><span className="stones">✦ {profile.starstones.toLocaleString()} Starstones</span></div>

      <aside className="shopx-feature">
        <div className="sf-art" style={{ backgroundImage: `url(${B}v02/art/crownless/star_3.webp)` }} />
        <div className="sf-name">The Shattered Crown</div>
        <div className="sf-foot">
          <b>Set 1 • {PACK_SIZE} Cards</b>
          <small>5 Commons • 3 Uncommons • 1 Hero Card (Elite or better) • 1 Guaranteed Foil!</small>
          <small>{PACK_PRICE.valor} Valor or {PACK_PRICE.starstones} Starstones per pack.</small>
          <button type="button" className="sf-odds" onClick={() => setOdds(true)}><i>i</i> See the Odds</button>
        </div>
      </aside>

      <section className="shopx-main">
        <h3 className="sx-h">The Shattered Crown Packs</h3>
        <p className="sx-sub">Expand your collection with powerful cards from Set 1.</p>
        <div className="sx-bundles">
          {BUNDLES.map((b, i) => (
            <div className={`sx-bundle t${i}`} key={b.packs}>
              {b.boost > 1 && <span className="sx-ribbon">+{Math.round((b.boost - 1) * 100)}%</span>}
              <h4>{b.packs} {b.packs === 1 ? 'Pack' : 'Packs'}</h4>
              <div className="sx-boost">{boostLine(b)}</div>
              <div className="sx-guar">{b.guarantee ? `Guaranteed ${GUARANTEE_TEXT[b.guarantee]}` : ''}</div>
              <div className="sx-art">
                <PackFan n={[3, 5, 7, 7, 9, 9, 11][i] ?? 7} />
              </div>
              <div className="sx-buy">
                <button type="button" className="sx-btn valor" disabled={profile.valor < PACK_PRICE.valor * b.packs} onClick={() => buy(b.packs, 'valor')}>✧ {(PACK_PRICE.valor * b.packs).toLocaleString()}</button>
                <button type="button" className="sx-btn stone" disabled={profile.starstones < PACK_PRICE.starstones * b.packs} onClick={() => buy(b.packs, 'starstones')}>✦ {(PACK_PRICE.starstones * b.packs).toLocaleString()}</button>
              </div>
            </div>
          ))}
        </div>
        <div className="sx-stones-h"><h3 className="sx-h">Starstones</h3><span>Purchase Starstones to unlock packs, cosmetics and more.</span></div>
        <div className="sx-offers">
          {STARSTONE_OFFERS.map((o, i) => (
            <div className="sx-offer" key={o.id}>
              <b>✦ {o.stones.toLocaleString()}</b>
              <small>≈ {Math.floor(o.stones / PACK_PRICE.starstones)} packs</small>
              <div className="sx-gems">{'✦'.repeat(i + 2)}</div>
              <button type="button" className="sx-btn price" onClick={() => { buyStarstones(o.id); setMsg(`Added ${o.stones} Starstones (simulated purchase, no payment taken).`); }}>${o.price.toFixed(2)} CAD</button>
            </div>
          ))}
        </div>
        <p className="sx-foot">Every standard card can also be forged directly with Valor in your Collection, so no card is only available by chance.<br /><em>Development build: Starstone purchases are simulated and no payment is taken.</em></p>
      </section>
      {odds && <OddsModal onClose={() => setOdds(false)} />}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/** A fan of card backs standing in for bundle art until the owner's images arrive. */
function PackFan({ n }: { n: number }) {
  const mid = (n - 1) / 2;
  return (
    <span className="sx-fan" aria-hidden="true">
      {Array.from({ length: n }, (_, k) => (
        <img key={k} src={cardBackUrl} alt="" style={{ transform: `translateX(${(k - mid) * 15}px) rotate(${(k - mid) * 7}deg)`, zIndex: n - Math.abs(Math.round(k - mid)) }} />
      ))}
    </span>
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
