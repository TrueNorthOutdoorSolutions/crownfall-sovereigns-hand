import React, { useEffect, useState } from 'react';
import { BUNDLES, FINISH_NAMES, GUARANTEE_TEXT, PACK_PRICE, PACK_SIZE, RARITIES, RARITY_NAMES, packOdds } from '../../economy/odds';
import { STARSTONE_OFFERS, buyPacks, buyStarstones, useProfile } from '../../economy/profile';
import type { Pack } from '../../economy/packs';

const seed = () => (crypto.getRandomValues(new Uint32Array(1))[0] ^ Date.now()) >>> 0;
const pct = (x: number) => (x >= 0.1 ? `${(x * 100).toFixed(0)}%` : x >= 0.01 ? `${(x * 100).toFixed(1)}%` : `${(x * 100).toFixed(2)}%`);
const oneIn = (x: number) => `1 in ${Math.round(1 / x).toLocaleString()}`;

export function Wallet() {
  const p = useProfile();
  return (
    <div className="wallet">
      <span className="coin valor" title="Valor: earned by playing"><ValorGem /><b>{p.valor.toLocaleString()} Valor</b></span>
      <span className="coin stones" title="Starstones: premium currency"><StarstoneGem /><b>{p.starstones.toLocaleString()} Starstones</b></span>
    </div>
  );
}

/** Valor: a faceted blue crystal. */
export const ValorGem = () => (
  <svg className="gem" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 1 L27 16 L16 31 L5 16 Z" fill="#1d6fe0" />
    <path d="M16 1 L27 16 L16 16 Z" fill="#7fd0ff" /><path d="M16 1 L5 16 L16 16 Z" fill="#3b9cff" />
    <path d="M5 16 L16 31 L16 16 Z" fill="#1450b0" /><path d="M27 16 L16 31 L16 16 Z" fill="#2a7ae8" />
    <path d="M16 6 L20 16 L16 26 L12 16 Z" fill="#c9f0ff" opacity=".55" />
  </svg>
);

/** Starstones: a four-pointed violet star gem. */
export const StarstoneGem = () => (
  <svg className="gem" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="#9b3df0" />
    <path d="M16 1 L19.5 12.5 L16 16 L12.5 12.5 Z" fill="#f2c4ff" /><path d="M31 16 L19.5 12.5 L16 16 L19.5 19.5 Z" fill="#c77bff" />
    <path d="M1 16 L12.5 12.5 L16 16 L12.5 19.5 Z" fill="#b25cff" /><path d="M16 31 L12.5 19.5 L16 16 L19.5 19.5 Z" fill="#6a1fb8" />
    <circle cx="16" cy="16" r="2.4" fill="#fff" opacity=".9" />
  </svg>
);

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
  return (
    <div className="shopx">
      <div className="shopx-bg" style={{ backgroundImage: `url(${B}v02/shop/bg.webp)` }} />
      <button type="button" className="shopx-back" onClick={onBack}>← Menu</button>
      <h2 className="shopx-title"><i className="sx-line l" aria-hidden="true" /><img className="sx-crownimg" src={`${B}v02/crown.webp`} alt="" /><span className="sx-word">Shop</span><i className="sx-line r" aria-hidden="true" /></h2>
      <div className="shopx-wallet"><Wallet /></div>

      <aside className="shopx-feature">
        <img src={`${B}v02/shop/info.webp`} alt={`The Shattered Crown. Set 1, ${PACK_SIZE} cards: 5 Commons, 3 Uncommons, 1 Hero Card (Elite or better), 1 guaranteed foil. ${PACK_PRICE.valor} Valor or ${PACK_PRICE.starstones} Starstones per pack.`} />
        <button type="button" className="sf-odds" onClick={() => setOdds(true)}><i>i</i> See the Odds</button>
      </aside>

      <section className="shopx-main">
        <div className="sx-board" style={{ backgroundImage: `url(${B}v02/shop/board.webp)` }}>
          {BUNDLES.map((b) => {
            const hot = BOARD_BUNDLES[b.packs];
            if (!hot) return null;
            const [y, v0, v1, s0, s1] = hot, vCost = PACK_PRICE.valor * b.packs, sCost = PACK_PRICE.starstones * b.packs;
            const label = `${b.packs} ${b.packs === 1 ? 'pack' : 'packs'}`;
            return (
              <React.Fragment key={b.packs}>
                <button type="button" className="sx-hot valor" style={box(y, v0, v1)} disabled={profile.valor < vCost} onClick={() => buy(b.packs, 'valor')} aria-label={`${label} for ${vCost.toLocaleString()} Valor`} />
                <button type="button" className="sx-hot stone" style={box(y, s0, s1)} disabled={profile.starstones < sCost} onClick={() => buy(b.packs, 'starstones')} aria-label={`${label} for ${sCost.toLocaleString()} Starstones`} />
              </React.Fragment>
            );
          })}
          {STARSTONE_OFFERS.map((o) => {
            const hot = BOARD_OFFERS[o.stones];
            return hot ? <button key={o.id} type="button" className="sx-hot valor" style={box(925, hot[0], hot[1])} aria-label={`${o.stones.toLocaleString()} Starstones for $${o.price.toFixed(2)} CAD`} onClick={() => { buyStarstones(o.id); setMsg(`Added ${o.stones} Starstones (simulated purchase, no payment taken).`); }} /> : null;
          })}
        </div>
        <p className="sx-foot">Every standard card can also be forged directly with Valor in your Collection, so no card is only available by chance.<br /><em>Development build: Starstone purchases are simulated and no payment is taken.</em></p>
      </section>
      {odds && <OddsModal onClose={() => setOdds(false)} />}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/** The owner's shop board (Templates\Shop Packs and Purchase Template.png, 1536×1024) has every price and
 * button painted in. These are the button positions in that image's pixels: [top, valor left, valor right,
 * starstones left, starstones right]. If PACK_PRICE or STARSTONE_OFFERS change, the board art must change too. */
const BOARD_W = 1536, BOARD_H = 1024, BTN_H = 42;
const BOARD_BUNDLES: Record<number, [number, number, number, number, number]> = {
  1: [350, 72, 217, 232, 374], 5: [350, 440, 585, 599, 738], 10: [350, 804, 947, 965, 1104], 25: [350, 1176, 1314, 1331, 1467],
  50: [628, 103, 279, 297, 464], 100: [628, 581, 761, 777, 946], 250: [628, 1068, 1248, 1262, 1437],
};
const BOARD_OFFERS: Record<number, [number, number]> = { 80: [81, 298], 170: [362, 584], 360: [649, 870], 950: [938, 1162], 2000: [1231, 1453] };
const box = (y: number, x0: number, x1: number): React.CSSProperties => ({ left: `${(x0 / BOARD_W) * 100}%`, width: `${((x1 - x0) / BOARD_W) * 100}%`, top: `${(y / BOARD_H) * 100}%`, height: `${(BTN_H / BOARD_H) * 100}%` });

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
            {row(`Foil is ${FINISH_NAMES.gilded}`, (o) => o.finish.gilded)}
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
