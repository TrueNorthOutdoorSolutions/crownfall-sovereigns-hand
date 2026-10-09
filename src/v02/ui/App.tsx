import React, { useEffect, useState } from 'react';
import { DECKS, RULES_VERSION } from '../content/cards';
import type { DeckId } from '../content/cards';
import { Match, RulesModal } from './Match';
import { artUrl } from './cardview';

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
  const [match, setMatch] = useState<{ decks: [DeckId, DeckId]; seed: number } | null>(null);
  const [mine, setMine] = useState<DeckId>('banner');
  const [rules, setRules] = useState(false);
  // The AI plays the other starter deck of the same set.
  const other = (d: DeckId): DeckId => (Object.keys(DECKS) as DeckId[]).find((x) => x !== d && (DECKS[x].set ?? 1) === (DECKS[d].set ?? 1)) ?? d;

  if (match) {
    return (
      <Stage>
        <Match key={match.seed} decks={match.decks} seed={match.seed} onExit={() => setMatch(null)}
          onRematch={(swap) => setMatch({ decks: swap ? [match.decks[1], match.decks[0]] : match.decks, seed: newSeed() })} />
      </Stage>
    );
  }
  return (
    <Stage>
      <div className="menu">
        <div className="arena-bg menu-bg" />
        <header className="title">
          <div className="studio">Northern Summit Studios · Crownfall</div>
          <h1>Sovereign's Hand</h1>
          <div className="sub">Two sets · four starter decks · playable prototype V0.2</div>
        </header>
        <p className="goal">Break all five of your rival's <b>Crown Shards</b>. Deploy champions, Ascend them from ★ to ★★★, and strike — but every champion that attacks can't guard your Crown.</p>
        {SETS.map(([setNo, setName]) => (
        <div className="setgroup" key={setNo}>
        <div className="setname">{setName}</div>
        <div className="decks">
          {(Object.keys(DECKS) as DeckId[]).filter((d) => (DECKS[d].set ?? 1) === setNo).map((d) => (
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
          <button type="button" className="primary big" onClick={() => setMatch({ decks: [mine, other(mine)], seed: newSeed() })}>Play vs AI ({DECKS[other(mine)].name})</button>
          <button type="button" className="secondary" onClick={() => setRules(true)}>How to play</button>
        </div>
        <footer className="menu-foot">Prototype for playtesting only · rules {RULES_VERSION} · same rules as the printed kit · <a href={`${import.meta.env.BASE_URL}v0.1.html`}>V0.1 archive</a></footer>
        {rules && <RulesModal onClose={() => setRules(false)} />}
      </div>
    </Stage>
  );
}
