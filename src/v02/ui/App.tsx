import React, { useEffect, useState } from 'react';
import { CARDS, DECKS, RULES_VERSION, STARTER_DECK_IDS } from '../content/cards';
import type { DeckId } from '../content/cards';
import { Match, RulesModal } from './Match';
import { artUrl } from './cardview';
import { Collection } from './collect/Collection';
import { Campaign } from './campaign/Campaign';
import type { StartBout } from './campaign/Campaign';
import { clearBout } from '../economy/profile';
import { Decks } from './collect/Decks';
import { Opening } from './collect/Opening';
import { Shop, Wallet } from './collect/Shop';
import './collect/collect.css';
import { AscendFx } from './AscendFx';
import { getProfile } from '../economy/profile';
import type { Pack } from '../economy/packs';

const W = 1600, H = 900;

/** Fixed 1600×900 stage scaled to fit the window, so the battlefield layout never breaks. */
function Stage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return <div className="viewport"><div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>{children}</div></div>;
}

const FACE: Record<DeckId, [string, number]> = { banner: ['sol', 3], ember: ['aurex', 3], vault: ['atlas', 3], brood: ['unwritten', 3] };
const SETS: [number, string][] = [[1, 'Set 1 · The Shattered Crown'], [2, 'Set 2 · Beneath the Arena']];
const newSeed = () => (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0; // UI only: the engine itself never reads the clock

export function App() {
  const [match, setMatch] = useState<{ decks: [DeckId, DeckId]; seed: number; bout?: StartBout } | null>(null);
  const [mine, setMine] = useState<DeckId>('banner');
  const [rules, setRules] = useState(false);
  const [soon, setSoon] = useState<string | null>(null);
  const [screen, setScreen] = useState<'menu' | 'arena' | 'shop' | 'collection' | 'decks' | 'campaign'>('menu');
  // A pack opening interrupted by a refresh resumes where it left off.
  const [opening, setOpening] = useState<Pack[] | null>(() => getProfile().lastOpening);
  // The AI plays the other starter deck of the same set.
  const other = (d: DeckId): DeckId => (STARTER_DECK_IDS as DeckId[]).find((x) => x !== d && (DECKS[x].set ?? 1) === (DECKS[d].set ?? 1)) ?? d;

  if (match) {
    return (
      <Stage>
        <Match key={match.seed} decks={match.decks} seed={match.seed} onExit={() => setMatch(null)}
          campaign={match.bout ? {
            setup: match.bout.bout.crowning ? match.bout.bout.crowning[match.bout.difficulty].setup : match.bout.bout.setup,
            objective: match.bout.bout.objective, rivalName: match.bout.bout.rival,
            onResult: (won) => { if (won) clearBout(match.bout!.bout.id, match.bout!.bout.reward); },
          } : undefined}
          onRematch={(swap) => setMatch({ decks: swap && !match.bout ? [match.decks[1], match.decks[0]] : match.decks, seed: newSeed(), bout: match.bout })} />
      </Stage>
    );
  }
  // Test aid: #fx=<card id> previews that card's Ascension celebration (e.g. #fx=crownless-3, #fx=bramble-2).
  const fxPreview = typeof location !== 'undefined' ? /#fx=([\w@-]+)/.exec(location.hash)?.[1] : undefined;
  if (fxPreview && CARDS[fxPreview]) {
    const star = (CARDS[fxPreview] as { star?: number }).star ?? 2;
    return <Stage><div className="menu"><div className="arena-bg menu-bg" /><AscendFx m={{ key: 1, cardId: fxPreview, star, mine: true }} fast={false} hold onDone={() => { location.hash = ''; location.reload(); }} /></div></Stage>;
  }
  if (opening) return <Stage><Opening packs={opening} onDone={() => { setOpening(null); setScreen('collection'); }} /></Stage>;
  if (screen === 'shop') return <Stage><Shop onBack={() => setScreen('menu')} onOpened={setOpening} /></Stage>;
  if (screen === 'collection') return <Stage><Collection onBack={() => setScreen('menu')} /></Stage>;
  if (screen === 'campaign') return <Stage><Campaign onBack={() => setScreen('menu')} onStart={(b) => setMatch({ decks: [b.playerDeck, b.bout.crowning ? b.bout.crowning[b.difficulty].deck : b.bout.deck], seed: newSeed(), bout: b })} /></Stage>;
  if (screen === 'decks') return <Stage><Decks onBack={() => setScreen('menu')} onPlay={(deck, opp) => { setScreen('decks'); setMatch({ decks: [deck, opp], seed: newSeed() }); }} /></Stage>;
  if (screen === 'menu') {
    const tile = (label: string, art: string, go?: () => void, badge?: boolean) => (
      <button type="button" className="home-tile" aria-label={label} onClick={go ?? (() => setSoon(label))}><img src={`${import.meta.env.BASE_URL}v02/menu/${art}.webp`} alt="" />{badge && <i className="home-badge" aria-hidden="true">!</i>}</button>
    );
    return (
      <Stage>
        <div className="home">
          <div className="arena-bg menu-bg" />
          <div className="intro-frame" aria-hidden="true" />
          <div className="home-plaque">Crownfall</div>
          <div className="menu-wallet"><Wallet /><button type="button" className="btn gold" onClick={() => setScreen('shop')}>🛒 Shop</button></div>
          <h1 className="home-title"><span className="ht-glow" aria-hidden="true" /><img src={`${import.meta.env.BASE_URL}v02/home-title-v3.webp`} alt="Sovereign's Hand" /><span className="home-tag"><i aria-hidden="true">◆</i> Command · Outplay · Ascend <i aria-hidden="true">◆</i></span></h1>
          <div className="home-modes">
            <button type="button" className="home-panel" aria-label="Campaign — Continue" onClick={() => setScreen('campaign')}><img src={`${import.meta.env.BASE_URL}v02/home-campaign-panel.webp`} alt="" /></button>
            <button type="button" className="home-panel" aria-label="Play vs AI — Play Battle" onClick={() => setScreen('arena')}><img src={`${import.meta.env.BASE_URL}v02/home-ai-panel.webp`} alt="" /></button>
            <button type="button" className="home-panel wide" aria-label="Arena of Ascension — Enter Arena" onClick={() => setSoon('Arena of Ascension')}><img src={`${import.meta.env.BASE_URL}v02/home-arena-panel.webp`} alt="" /></button>
          </div>
          <nav className="home-tiles">
            {tile('Collection', 'collection', () => setScreen('collection'))}
            {tile('Decks', 'decks', () => setScreen('decks'))}
            {tile('Codex', 'codex')}
            {tile('Challenges', 'challenges', undefined, true)}
            {tile('Achievements', 'achievements')}
            {tile('Shop', 'shop', () => setScreen('shop'))}
            {tile('Settings', 'settings')}
          </nav>
          <button type="button" className="home-howto" onClick={() => setRules(true)}>How to play</button>
          {rules && <RulesModal onClose={() => setRules(false)} />}
          {soon && <div className="modal-back" onClick={() => setSoon(null)}><div className="soon" role="dialog">{soon}<small>{soon === 'Arena of Ascension' ? 'Online play against other players is coming soon.' : 'Coming soon.'}</small><button type="button" className="btn gold" onClick={() => setSoon(null)}>OK</button></div></div>}
        </div>
      </Stage>
    );
  }
  return (
    <Stage>
      <div className="menu intro">
        <button type="button" className="btn intro-back" onClick={() => setScreen('menu')}>← Home</button>
        <div className="intro-frame" aria-hidden="true" />
        <div className="intro-brand">Crownfall</div>
        <div className="menu-wallet"><Wallet /><button type="button" className="btn gold" onClick={() => setScreen('shop')}>Shop</button><button type="button" className="btn" onClick={() => setScreen('decks')}>Decks</button></div>
        <div className="arena-bg menu-bg" />
        <header className="title">
          <div className="studio"><span className="ribbon">⟶</span> Northern Summit Studios <span className="ribbon">⟵</span></div>
          <TitleCrown />
          <svg className="title-crown old" viewBox="0 0 120 84" aria-hidden="true">
            <defs>
              <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff6d2" /><stop offset=".45" stopColor="#f2c95a" /><stop offset=".75" stopColor="#b98318" /><stop offset="1" stopColor="#f6dc8e" />
              </linearGradient>
            </defs>
            <path fill="url(#crownGold)" stroke="#5a3a08" strokeWidth="2" strokeLinejoin="round"
              d="M10 66 L4 22 L30 42 L42 12 L52 34 L60 2 L68 34 L78 12 L90 42 L116 22 L110 66 Z" />
            <rect x="10" y="64" width="100" height="14" rx="3" fill="url(#crownGold)" stroke="#5a3a08" strokeWidth="2" />
            <circle cx="60" cy="71" r="4" fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />
            <circle cx="36" cy="71" r="3" fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />
            <circle cx="84" cy="71" r="3" fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />
            <circle cx="60" cy="4" r="4" fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />
            <circle cx="42" cy="13" r="3.4" fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />
            <circle cx="78" cy="13" r="3.4" fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />
          </svg>
          <h1>Play vs AI</h1>
          <div className="sub">Choose your deck · face the AI</div>
        </header>
        <p className="goal">Break all five of your rival's <b>Crown Shards</b>. Deploy champions, Ascend them from ★ to ★★★, and strike — but every champion that attacks can't guard your Crown.</p>
        {SETS.map(([setNo, setName]) => (
        <div className="setgroup" key={setNo}>
        <div className="setname"><span className="ribbon">⟶</span> {setName} <span className="ribbon">⟵</span></div>
        <div className="decks">
          {(STARTER_DECK_IDS as DeckId[]).filter((d) => (DECKS[d].set ?? 1) === setNo).map((d) => (
            <button type="button" key={d} className={`deckpick ${mine === d ? 'on' : ''}`} style={{ ['--deck' as string]: DECKS[d].color, ['--acc' as string]: DECKS[d].accent }} onClick={() => setMine(d)}>
              <div className="dp-art" style={{ backgroundImage: `url(${artUrl(FACE[d][0], FACE[d][1])})` }} />
              <div className="dp-body"><b>{DECKS[d].name}</b><span>{DECKS[d].origins}</span><p>{DECKS[d].pitch}</p></div>
              {mine === d && <div className="dp-tag">Your deck</div>}
            </button>
          ))}
        </div>
        </div>
        ))}
        <div className="menu-actions">
          <button type="button" className="primary big" onClick={() => setMatch({ decks: [mine, other(mine)], seed: newSeed() })}><span aria-hidden="true">⚔</span> Play vs AI ({DECKS[other(mine)].name})</button>
          <button type="button" className="secondary" onClick={() => setRules(true)}><span aria-hidden="true">📖</span> How to play</button>
        </div>
        <ol className="intro-steps" aria-label="Turn steps">
          {[['⧗', 'Ready'], ['🂠', 'Draw'], ['☀', 'Main'], ['⚔', 'Battle'], ['⚑', 'End']].map(([icon, label], i) => (
            <li key={label}>{i > 0 && <span className="arrow" aria-hidden="true">⟶</span>}<i aria-hidden="true">{icon}</i>{label}</li>
          ))}
        </ol>
        <div className="intro-studio" aria-hidden="true"><span>⛰</span>Northern Summit Studios</div>
        <footer className="menu-foot">Prototype for playtesting only · rules {RULES_VERSION} · same rules as the printed kit · <a href={`${import.meta.env.BASE_URL}v0.1.html`}>V0.1 archive</a></footer>
        {rules && <RulesModal onClose={() => setRules(false)} />}
      </div>
    </Stage>
  );
}

function TitleCrown() {
  return (
    <svg className="title-crown" viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id="crownGoldHome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d2" /><stop offset=".45" stopColor="#f2c95a" /><stop offset=".75" stopColor="#b98318" /><stop offset="1" stopColor="#f6dc8e" />
        </linearGradient>
      </defs>
      <path fill="url(#crownGoldHome)" stroke="#5a3a08" strokeWidth="2" strokeLinejoin="round" d="M10 66 L4 22 L30 42 L42 12 L52 34 L60 2 L68 34 L78 12 L90 42 L116 22 L110 66 Z" />
      <rect x="10" y="64" width="100" height="14" rx="3" fill="url(#crownGoldHome)" stroke="#5a3a08" strokeWidth="2" />
      {[[60, 71, 4], [36, 71, 3], [84, 71, 3], [60, 4, 4], [42, 13, 3.4], [78, 13, 3.4]].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff3c4" stroke="#5a3a08" strokeWidth="1.5" />)}
    </svg>
  );
}
