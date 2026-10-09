import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CARDS, DECKS, champion, isChampionCard, isSpellCard } from '../content/cards';
import type { DeckId } from '../content/cards';
import {
  actor, apply, ascendBlockReason, newGame, attackBlockReason, canAttack, canBlock, findChampion, guard, handPlayability, might, nextAscension,
  predictClash, round, top,
} from '../rules/engine';
import type { Action, ChampionInPlay, GameState, LogEntry, PlayerIndex } from '../rules/types';
import { chooseAction } from '../ai/bot';
import { CardFace, ChampionToken, GLOSSARY } from './cardview';
import { humanize } from './text';

const ME: PlayerIndex = 0;
const AI: PlayerIndex = 1;
const champLabel = (c: ChampionInPlay) => `${top(c).name} ${'★'.repeat(top(c).star)}`;

type Inspect = { kind: 'card'; id: string; live?: { might: number; guard: number } } | null;

function predictionText(s: GameState, a: ChampionInPlay, d: ChampionInPlay, blocking = false) {
  const r = predictClash(s, a, d, { blocking });
  return `${champLabel(a)} ⚔${r.am} vs ${champLabel(d)} ⛨${r.dg} → ${r.defenderFalls ? `${top(d).name} falls` : d.shield && r.am >= r.dg ? `${top(d).name}'s Shield breaks` : `${top(d).name} holds`}. `
    + `${top(d).name} ⚔${r.dm} vs ⛨${r.ag} → ${r.attackerFalls ? `${top(a).name} falls` : r.ambush && r.defenderFalls ? `no strike back (Ambush)` : a.shield && r.dm > 0 && r.dm >= r.ag ? `${top(a).name}'s Shield breaks` : `${top(a).name} holds`}.`;
}

function phaseHint(s: GameState): string {
  if (s.phase === 'over') return '';
  const p = actor(s);
  if (p !== ME) return s.pending ? 'Your rival is deciding…' : `Your rival's turn — ${s.phase === 'main' ? 'Main step' : s.phase === 'battle' ? 'Battle' : 'After battle'}.`;
  if (s.pending) return 'Make a decision in the panel on the right.';
  if (s.phase === 'main') return 'Main step: play cards from your hand, Ascend one champion if you like, then go to battle.';
  if (s.phase === 'battle') return 'Battle: select one of your ready champions, then choose its target — the rival Crown or a rival champion.';
  return 'After battle: you may Ascend a champion that was here when your turn began (even if it attacked). Then end your turn.';
}

export function Match({ decks, seed, onExit, onRematch }: { decks: [DeckId, DeckId]; seed: number; onExit: () => void; onRematch: (swap: boolean) => void }) {
  const [game, setGame] = useState<GameState>(() => newGame({ seed, decks }));
  const ready = true;
  const [selected, setSelected] = useState<number | null>(null);
  const [inspect, setInspect] = useState<Inspect>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fast, setFast] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [view, setView] = useState<null | 'myFallen' | 'aiFallen' | 'myAsc'>(null);
  const [clash, setClash] = useState<GameState['lastClash']>(null);
  const [banner, setBanner] = useState<{ key: number; text: string; tone: 'ascend' | 'shard' | 'turn' | 'scheme' } | null>(null);
  const [flashUid, setFlashUid] = useState<number | null>(null);
  const lastLog = useRef(0);

  // React to new log entries: banners for Ascension, shard breaks, sprung Schemes and new turns.
  useEffect(() => {
    if (!ready) return;
    const fresh = game.log.filter((e) => e.n > lastLog.current);
    lastLog.current = game.log.length;
    if (game.lastClash && fresh.some((e) => e.n === game.lastClash!.n)) setClash(game.lastClash);
    const pick = [...fresh].reverse().find((e) => e.kind === 'ascend' || e.kind === 'shard' || e.kind === 'scheme' || e.kind === 'turn');
    if (pick) {
      const tone = pick.kind === 'ascend' ? 'ascend' : pick.kind === 'shard' ? 'shard' : pick.kind === 'scheme' ? 'scheme' : 'turn';
      const text = pick.kind === 'turn' ? (game.active === ME ? `Round ${round(game)} · Your turn` : `Round ${round(game)} · Rival's turn`)
        : pick.kind === 'ascend' ? humanize(pick.text).replace(/ for \d+ Command.*$/, '!')
        : pick.kind === 'shard' ? `${pick.player === ME ? 'Your' : "Rival's"} Crown Shard breaks!` : humanize(pick.text).replace(/!.*$/, '!');
      setBanner({ key: pick.n, text, tone });
    }
    const asc = [...fresh].reverse().find((e) => e.kind === 'ascend');
    if (asc) {
      const champ = game.players.flatMap((p) => p.field).sort((a, b) => b.ascendedTurn - a.ascendedTurn)[0];
      if (champ) setFlashUid(champ.uid);
    }
  }, [game, ready]);

  useEffect(() => { if (!banner) return; const t = setTimeout(() => setBanner(null), banner.tone === 'turn' ? 1300 : 2000); return () => clearTimeout(t); }, [banner]);
  useEffect(() => { if (!clash) return; const t = setTimeout(() => setClash(null), fast ? 1400 : 2600); return () => clearTimeout(t); }, [clash, fast]);
  useEffect(() => { if (flashUid === null) return; const t = setTimeout(() => setFlashUid(null), 1600); return () => clearTimeout(t); }, [flashUid]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);

  // The AI acts whenever it holds the decision, at a pace a person can follow.
  // Test aids: #autoplay = the AI also plays your seat; #autoturns = it plays your turns but leaves blocks,
  // responses, Shardfall and target choices to you.
  const hash = typeof location !== 'undefined' ? location.hash : '';
  const autoplay = hash.includes('autoplay') || (hash.includes('autoturns') && !game.pending);
  useEffect(() => {
    const who = actor(game);
    if (!ready || game.phase === 'over' || who === null || (who !== AI && !autoplay)) return;
    const justClashed = clash !== null;
    const delay = fast ? 260 : justClashed ? 1500 : game.pending ? 900 : 750;
    const t = setTimeout(() => {
      const r = apply(game, who, chooseAction(game, who));
      if (!r.error) setGame(r.state);
    }, delay);
    return () => clearTimeout(t);
  }, [game, ready, fast, clash, autoplay]);

  useEffect(() => { setSelected(null); }, [game.phase, game.turn]);

  const act = (a: Action) => {
    const r = apply(game, ME, a);
    if (r.error) setToast(r.error);
    else { setGame(r.state); if (a.type === 'attack') setSelected(null); }
    return !r.error;
  };

  const me = game.players[ME];
  const them = game.players[AI];
  const myDecision = actor(game) === ME;
  const pend = myDecision ? game.pending : null;
  const playability = useMemo(() => handPlayability(game, ME), [game]);

  const selChamp = selected !== null ? findChampion(game, selected) : null;
  const chooseKeys = new Set(pend?.kind === 'choose' ? pend.options.map((o) => o.key) : []);
  const blockKeys = new Set(pend?.kind === 'block' ? pend.options : []);
  const attackerNow = game.combat ? findChampion(game, game.combat.attacker) : null;

  const clickHand = (i: number) => {
    if (pend?.kind === 'discard') return act({ type: 'discard', handIndex: i });
    if (pend?.kind === 'choose' && chooseKeys.has(`h:${i}`)) return act({ type: 'choose', key: `h:${i}` });
    if (pend) return setToast('Answer the decision in the panel first.');
    const pl = playability[i];
    if (!pl?.action) return setToast(pl?.reason ?? 'Not now.');
    act({ type: pl.action, handIndex: i } as Action);
  };
  const clickMine = (c: ChampionInPlay) => {
    if (pend?.kind === 'choose' && chooseKeys.has(`u:${c.uid}`)) return act({ type: 'choose', key: `u:${c.uid}` });
    if (pend?.kind === 'block' && blockKeys.has(c.uid)) return act({ type: 'block', uid: c.uid });
    if (pend) return;
    setSelected(selected === c.uid ? null : c.uid);
  };
  const clickTheirs = (c: ChampionInPlay) => {
    if (pend?.kind === 'choose' && chooseKeys.has(`u:${c.uid}`)) return act({ type: 'choose', key: `u:${c.uid}` });
    if (pend) return;
    if (game.phase === 'battle' && selChamp && game.active === ME) {
      if (act({ type: 'attack', uid: selChamp.uid, target: c.uid })) setSelected(null);
    }
  };
  const attackCrown = () => {
    if (game.phase === 'battle' && selChamp && !pend && game.active === ME) { if (act({ type: 'attack', uid: selChamp.uid, target: 'crown' })) setSelected(null); }
  };

  const inspectChamp = (c: ChampionInPlay | null) => setInspect(c ? { kind: 'card', id: c.stack[c.stack.length - 1], live: { might: might(game, c), guard: guard(game, c) } } : null);
  const myTurnFree = game.active === ME && !game.pending && game.phase !== 'over';
  const canAttackSel = selChamp && game.phase === 'battle' && selChamp.owner === ME && canAttack(game, selChamp);

  return (
    <div className="match">
      <div className="arena-bg" />
      {/* ── Rival bar ── */}
      <div className="pbar rival">
        <div className="who"><b>Rival · AI</b><span>{DECKS[them.deckId].name}</span></div>
        <Crown count={them.crown.length} onClick={attackCrown} targetable={!!canAttackSel} label="Rival Crown" />
        <div className="pstats">
          <Stat label="Command" value={`${them.command}/${them.commandMax}`} />
          <Stat label="Hand" value={them.hand.length} />
          <Stat label="Deck" value={them.deck.length} />
          <Stat label="Ascension" value={them.ascension.length} />
          <button type="button" className="statbtn" onClick={() => setView('aiFallen')}>Fallen {them.fallen.length}</button>
        </div>
        <div className="schemes">{[0, 1, 2].map((i) => <div key={i} className={`scheme-slot ${them.schemes[i] ? 'set' : ''}`} title={them.schemes[i] ? 'A face-down Scheme' : 'Empty Scheme Zone'}>{them.schemes[i] ? '◈' : ''}</div>)}</div>
      </div>
      <div className="field rival">
        {[0, 1, 2, 3].map((i) => {
          const c = them.field[i];
          return <div key={i} className="slot">{c && <ChampionToken s={game} c={c} flash={flashUid === c.uid}
            targetable={!!canAttackSel || chooseKeys.has(`u:${c.uid}`)} selected={attackerNow?.uid === c.uid}
            onClick={() => clickTheirs(c)} onHover={(on) => inspectChamp(on ? c : null)} />}</div>;
        })}
      </div>
      {/* ── Middle band ── */}
      <div className="midband">
        <div className="phase-pill">{game.phase === 'over' ? 'Match over' : `Round ${round(game)} · ${game.active === ME ? 'Your turn' : "Rival's turn"} · ${game.phase === 'main' ? 'Main' : game.phase === 'battle' ? 'Battle' : game.phase === 'after' ? 'After battle' : 'Setup'}`}</div>
        <div className="hint">{phaseHint(game)}</div>
      </div>
      <div className="field mine">
        {[0, 1, 2, 3].map((i) => {
          const c = me.field[i];
          return <div key={i} className="slot">{c && <ChampionToken s={game} c={c} flash={flashUid === c.uid}
            selected={selected === c.uid || attackerNow?.uid === c.uid}
            targetable={chooseKeys.has(`u:${c.uid}`) || blockKeys.has(c.uid) || (myTurnFree && game.phase === 'battle' && canAttack(game, c))}
            onClick={() => clickMine(c)} onHover={(on) => inspectChamp(on ? c : null)} />}</div>;
        })}
      </div>
      {/* ── My bar ── */}
      <div className="pbar mine">
        <div className="who"><b>You</b><span>{DECKS[me.deckId].name}</span></div>
        <Crown count={me.crown.length} label="Your Crown" />
        <div className="pstats">
          <div className="command" title="Command: +1 each turn (max 8), refilled at the start of your turn. Unspent Command pays for Schemes and Swift Tactics on your rival's turn.">
            {Array.from({ length: 8 }, (_, i) => <i key={i} className={i < me.command ? 'on' : i < me.commandMax ? 'spent' : ''} />)}
            <b>{me.command}</b><span>Command</span>
          </div>
          <Stat label="Deck" value={me.deck.length} />
          <button type="button" className="statbtn" onClick={() => setView('myAsc')}>Ascension {me.ascension.length}</button>
          <button type="button" className="statbtn" onClick={() => setView('myFallen')}>Fallen {me.fallen.length}</button>
        </div>
        <div className="schemes">{[0, 1, 2].map((i) => {
          const sc = me.schemes[i];
          return <div key={i} className={`scheme-slot mine ${sc ? 'set' : ''}`} onMouseEnter={() => sc && setInspect({ kind: 'card', id: sc.card })} onMouseLeave={() => setInspect(null)}
            title={sc ? (sc.setTurn >= game.turn ? 'Set this turn: ready from your rival\'s next turn' : 'Ready to spring') : 'Empty Scheme Zone'}>{sc ? CARDS[sc.card].name : ''}</div>;
        })}</div>
      </div>
      {/* ── Hand ── */}
      <div className="hand">
        {me.hand.map((id, i) => {
          const pl = playability[i];
          const choosable = pend?.kind === 'choose' && chooseKeys.has(`h:${i}`);
          const playable = !pend && !!pl?.action;
          return (
            <button type="button" key={`${id}-${i}`} className={`handcard ${playable ? 'playable' : ''} ${choosable || pend?.kind === 'discard' ? 'choosable' : ''}`}
              style={{ ['--i' as string]: i, ['--n' as string]: me.hand.length }} onClick={() => clickHand(i)}
              onMouseEnter={() => setInspect({ kind: 'card', id })} onMouseLeave={() => setInspect(null)}
              aria-label={`${CARDS[id].name}. ${pl?.reason ?? ''}`}>
              <CardFace id={id} size="sm" />
              {pl && !pend && <span className={`hc-reason ${pl.action ? 'ok' : ''}`}>{pl.reason}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Side panel ── */}
      <aside className="side">
        <div className="side-top">
          <button type="button" className="ghost" onClick={() => setShowRules(true)}>Rules</button>
          <button type="button" className={`ghost ${fast ? 'on' : ''}`} onClick={() => setFast(!fast)}>{fast ? 'Speed: fast' : 'Speed: normal'}</button>
          <button type="button" className="ghost" onClick={onExit}>Menu</button>
        </div>
        <DecisionPanel game={game} pend={pend} act={act} setInspect={setInspect} />
        {!pend && myTurnFree && (
          <div className="actions">
            {selChamp && selChamp.owner === ME && <SelectedPanel game={game} c={selChamp} act={act} onAttackCrown={attackCrown} onClear={() => setSelected(null)} />}
            <div className="btnrow">
              {game.phase === 'main' && <button type="button" className="primary" onClick={() => act({ type: 'toBattle' })}>To battle ⚔</button>}
              {game.phase === 'battle' && <button type="button" className="primary" onClick={() => act({ type: 'endBattle' })}>End battle</button>}
              <button type="button" className={game.phase === 'after' ? 'primary' : 'secondary'} onClick={() => act({ type: 'endTurn' })}>End turn</button>
            </div>
          </div>
        )}
        <LogPanel log={game.log} />
      </aside>

      {inspect && <div className="inspector"><CardFace id={inspect.id} size="lg" live={inspect.live} /><KeywordHelp id={inspect.id} /></div>}
      {clash && (
        <div className="clash" key={clash.n}>
          <div className="clash-row">
            <div className={`fighter ${clash.attackerDefeated ? 'fallen' : ''}`}><b>{clash.attacker}</b><span>⚔ {clash.attackerMight} · ⛨ {clash.attackerGuard}</span><em>{clash.attackerDefeated ? 'DEFEATED' : 'survives'}</em></div>
            <div className="vs">VS</div>
            <div className={`fighter ${clash.defenderDefeated ? 'fallen' : ''}`}><b>{clash.defender}</b><span>⚔ {clash.defenderMight} · ⛨ {clash.defenderGuard}</span><em>{clash.defenderDefeated ? 'DEFEATED' : 'survives'}</em></div>
          </div>
          <div className="clash-why">Might {clash.attackerMight} {clash.attackerMight >= clash.defenderGuard && clash.attackerMight > 0 ? '≥' : '<'} Guard {clash.defenderGuard} · Might {clash.defenderMight} {clash.defenderMight >= clash.attackerGuard && clash.defenderMight > 0 ? '≥' : '<'} Guard {clash.attackerGuard}{clash.notes.length ? ` · ${clash.notes.join(' ')}` : ''}</div>
        </div>
      )}
      {banner && <div className={`banner ${banner.tone}`} key={banner.key}>{banner.text}</div>}
      {toast && <div className="toast" role="status">{toast}</div>}
      {pend?.kind === 'mulligan' && (
        <div className="overlay">
          <div className="modal wide">
            <h2>Your opening hand</h2>
            <p>{game.first === ME ? 'You go first (no draw on your first turn).' : 'Your rival goes first. You start with 6 cards and +1 Command on your first turn.'} You may shuffle this hand back and draw the same number once.</p>
            <div className="mull-hand">{me.hand.map((id, i) => <CardFace key={i} id={id} size="sm" />)}</div>
            <div className="btnrow center"><button type="button" className="primary" onClick={() => act({ type: 'mulligan', redraw: false })}>Keep hand</button>
              <button type="button" className="secondary" onClick={() => act({ type: 'mulligan', redraw: true })}>Redraw</button></div>
          </div>
        </div>
      )}
      {view && <PileView game={game} view={view} onClose={() => setView(null)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {game.phase === 'over' && <Results game={game} onRematch={onRematch} onExit={onExit} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="stat"><b>{value}</b><span>{label}</span></div>;
}

function Crown({ count, onClick, targetable, label }: { count: number; onClick?: () => void; targetable?: boolean; label: string }) {
  const prev = useRef(count);
  const [cracking, setCracking] = useState<number | null>(null);
  useEffect(() => {
    if (count < prev.current) { setCracking(count); const t = setTimeout(() => setCracking(null), 1200); prev.current = count; return () => clearTimeout(t); }
    prev.current = count;
  }, [count]);
  return (
    <button type="button" className={`crown ${targetable ? 'targetable' : ''}`} onClick={onClick} disabled={!onClick} aria-label={`${label}: ${count} of 5 shards`}>
      {Array.from({ length: 5 }, (_, i) => <span key={i} className={`shard ${i < count ? 'whole' : 'broken'} ${cracking !== null && i >= cracking && i < cracking + 2 && i >= count ? 'cracking' : ''}`} />)}
      <b>{count}</b>{targetable && <em>Attack the Crown</em>}
    </button>
  );
}

function SelectedPanel({ game, c, act, onAttackCrown, onClear }: { game: GameState; c: ChampionInPlay; act: (a: Action) => boolean; onAttackCrown: () => void; onClear: () => void }) {
  const them = game.players[AI];
  const next = nextAscension(game, c);
  const ascWhy = ascendBlockReason(game, c);
  const attackWhy = game.phase === 'battle' ? attackBlockReason(game, c) : null;
  const blockers = them.field.filter((b) => !b.exhausted && canBlock(b, c));
  return (
    <div className="selpanel">
      <div className="sel-head"><b>{champLabel(c)}</b><span>⚔{might(game, c)} ⛨{guard(game, c)}</span><button type="button" className="x" onClick={onClear} aria-label="Deselect">×</button></div>
      {game.phase === 'battle' && (attackWhy ? <p className="why">{attackWhy}</p> : (
        <div className="targets">
          <button type="button" className="tgt" onClick={onAttackCrown}>
            <b>Attack the Crown</b>
            <span>{blockers.length ? `Rival can block with ${blockers.map(champLabel).join(', ')}.` : `No ready blocker: ${top(c).crown} shard${top(c).crown > 1 ? 's' : ''} will break (unless a Scheme answers).`}</span>
          </button>
          {them.field.map((t) => (
            <button type="button" key={t.uid} className="tgt" onClick={() => act({ type: 'attack', uid: c.uid, target: t.uid })}>
              <b>Attack {champLabel(t)}{t.exhausted ? ' (sideways)' : ''}</b><span>{predictionText(game, c, t)}</span>
            </button>
          ))}
        </div>
      ))}
      {next && (
        <div className="ascend-box">
          <div className="asc-preview"><CardFace id={next.id} size="sm" /></div>
          <div>
            <b>Ascend to {'★'.repeat(next.star)}</b>
            <p>{`Cost ↑${next.cost}. Might ${next.might}, Guard ${next.guard}. `}{next.text}</p>
            <p className="why">Ascending turns {top(c).name} sideways: it can't attack or block until your next turn.</p>
            <button type="button" className="primary" disabled={!!ascWhy} onClick={() => act({ type: 'ascend', uid: c.uid })}>Ascend</button>
            {ascWhy && <p className="why">{ascWhy}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function DecisionPanel({ game, pend, act, setInspect }: { game: GameState; pend: GameState['pending']; act: (a: Action) => boolean; setInspect: (i: Inspect) => void }) {
  if (!pend || pend.kind === 'mulligan') return null;
  const att = game.combat ? findChampion(game, game.combat.attacker) : null;
  const def = game.combat?.defender != null ? findChampion(game, game.combat.defender) : null;
  const context = att ? (
    <p className="ctx">{`${att.owner === ME ? 'Your' : "Rival's"} ${champLabel(att)} (⚔${might(game, att)} ⛨${guard(game, att)}) is attacking `}
      {def ? `${def.owner === ME ? 'your' : 'their'} ${champLabel(def)} (⚔${might(game, def)} ⛨${guard(game, def)}).` : game.combat?.target === 'crown' ? 'your Crown.' : '.'}
      {att && def && <><br /><span className="pred">Right now: {predictionText(game, att, def)}</span></>}
    </p>
  ) : null;
  switch (pend.kind) {
    case 'block': {
      const a = att!;
      return (
        <div className="decision">
          <h3>Block?</h3>{context}
          {pend.options.map((uid) => {
            const b = findChampion(game, uid)!;
            return <button type="button" key={uid} className="opt" onClick={() => act({ type: 'block', uid })}><b>Block with {champLabel(b)}</b><span>{predictionText(game, a, b, true)}</span></button>;
          })}
          <button type="button" className="opt warn" onClick={() => act({ type: 'block', uid: null })}><b>Don't block</b><span>{`${top(a).crown} of your shards will break unless you respond.`}</span></button>
        </div>
      );
    }
    case 'respond':
      return (
        <div className="decision">
          <h3>Respond?</h3>{context}
          {pend.options.map((o) => {
            const id = o.key.startsWith('s:') ? game.players[ME].schemes.find((x) => x.sid === Number(o.key.slice(2)))?.card : game.players[ME].hand[Number(o.key.slice(2))];
            return <button type="button" key={o.key} className="opt" onMouseEnter={() => id && setInspect({ kind: 'card', id })} onMouseLeave={() => setInspect(null)}
              onClick={() => act({ type: 'respond', key: o.key })}><b>{o.label}</b><span>{id ? CARDS[id].text : ''}</span></button>;
          })}
          <button type="button" className="opt" onClick={() => act({ type: 'respond', key: null })}><b>Pass</b><span>Let the fight resolve.</span></button>
        </div>
      );
    case 'choose':
      return (
        <div className="decision">
          <h3>Choose</h3><p className="ctx">{pend.prompt}</p>
          {pend.options.map((o) => <button type="button" key={o.key} className="opt" onClick={() => act({ type: 'choose', key: o.key })}><b>{o.label}</b></button>)}
          {pend.optional && <button type="button" className="opt" onClick={() => act({ type: 'choose', key: null })}><b>Skip</b></button>}
          <p className="note">You can also click a highlighted champion or card.</p>
        </div>
      );
    case 'shardfall': {
      const c = CARDS[pend.card];
      return (
        <div className="decision shardfall">
          <h3>Shardfall!</h3>
          <p className="ctx">Your broken shard was <b>{c.name}</b>. You may {c.kind === 'scheme' ? 'set it face-down' : 'cast it'} right now for free, or keep it in your hand.</p>
          <div className="sf-card"><CardFace id={pend.card} size="sm" /></div>
          <button type="button" className="opt" onClick={() => act({ type: 'shardfall', use: true })}><b>{c.kind === 'scheme' ? 'Set it free' : 'Cast it free'}</b></button>
          <button type="button" className="opt" onClick={() => act({ type: 'shardfall', use: false })}><b>Keep it in hand</b></button>
        </div>
      );
    }
    case 'discard':
      return <div className="decision"><h3>Hand limit</h3><p className="ctx">You have more than 8 cards. Click {pend.count} card{pend.count > 1 ? 's' : ''} in your hand to discard.</p></div>;
  }
}

function KeywordHelp({ id }: { id: string }) {
  const c = CARDS[id];
  const words = new Set<string>();
  if (isChampionCard(c)) c.keywords.forEach((k) => words.add(k));
  for (const k of Object.keys(GLOSSARY)) if (c.text.includes(k)) words.add(k);
  if (isSpellCard(c) && c.shardfall) words.add('Shardfall');
  if (isSpellCard(c) && c.swift) words.add('Swift');
  if (!words.size) return null;
  return <dl className="kwhelp">{[...words].map((w) => <React.Fragment key={w}><dt>{w}</dt><dd>{GLOSSARY[w]}</dd></React.Fragment>)}</dl>;
}

function LogPanel({ log }: { log: LogEntry[] }) {
  const items = log.slice(-60).reverse();
  return (
    <div className="log" aria-live="polite">
      <h4>Battle log</h4>
      <ol>{items.map((e) => <li key={e.n} className={`k-${e.kind} ${e.player === ME ? 'me' : e.player === AI ? 'ai' : ''}`}>{humanize(e.text)}</li>)}</ol>
    </div>
  );
}

function PileView({ game, view, onClose }: { game: GameState; view: 'myFallen' | 'aiFallen' | 'myAsc'; onClose: () => void }) {
  const ids = view === 'myAsc' ? game.players[ME].ascension : view === 'myFallen' ? game.players[ME].fallen : game.players[AI].fallen;
  const title = view === 'myAsc' ? 'Your Ascension Pile' : view === 'myFallen' ? 'Your Fallen pile' : "Rival's Fallen pile";
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {view === 'myAsc' && <p>These forms are never drawn. Ascend a champion that was on the field when your turn began: pay its ↑ cost, place the next form on top, and turn it sideways.</p>}
        <div className="pile">{ids.length ? ids.map((id, i) => <CardFace key={i} id={id} size="sm" />) : <p>Empty.</p>}</div>
        <div className="btnrow center"><button type="button" className="secondary" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal rules" onClick={(e) => e.stopPropagation()}>
        <h2>The Shattered Crown — quick rules</h2>
        <p className="lead">Break all five of your rival's Crown Shards. A champion that attacks can't guard your Crown on your rival's turn.</p>
        <div className="rules-cols">
          <section><h3>Your turn</h3><ol>
            <li><b>Rise</b>: your cards stand up; Command +1 (max 8) and refills. From round 10 you break one of your own shards first.</li>
            <li><b>Draw</b> 1.</li>
            <li><b>Main</b>: deploy ★ champions, cast Tactics, set Schemes face-down (free), and Ascend once.</li>
            <li><b>Battle</b>: attack one champion at a time.</li>
            <li><b>After battle</b>: Ascend if you haven't.</li>
            <li><b>End</b>: discard to 8. Unspent Command pays for Schemes and Swift Tactics on your rival's turn.</li></ol></section>
          <section><h3>Combat</h3><ol>
            <li>Attack the <b>Crown</b> or any rival champion. The attacker turns sideways.</li>
            <li>Crown attacks can be <b>blocked</b> by one ready champion (it turns sideways unless Bulwark).</li>
            <li><b>Respond</b>: defender springs one Scheme or Swift Tactic, then the attacker may cast one Swift Tactic.</li>
            <li><b>Clash</b>: Might ≥ Guard defeats, both ways at once. No damage stays.</li>
            <li>Unblocked: <b>1 shard</b> breaks (★★★: 2). Beat the blocker and survive: <b>Breakthrough</b>, 1 shard.</li></ol></section>
          <section><h3>Ascension</h3><p>★★ and ★★★ forms wait in your Ascension Pile; you never draw them. Once per turn, before or after battle: choose a champion that was on the field when your turn began, pay ↑, place the next form on top and <b>turn it sideways</b> (no attack or block until your next turn).</p>
            <h3>Shards</h3><p>A broken shard goes to its owner's hand. <b>Shardfall</b> cards can be played free at once. You lose when your last shard breaks.</p></section>
        </div>
        <dl className="kwhelp">{Object.entries(GLOSSARY).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
        <div className="btnrow center"><button type="button" className="primary" onClick={onClose}>Back to the arena</button></div>
      </div>
    </div>
  );
}

function Results({ game, onRematch, onExit }: { game: GameState; onRematch: (swap: boolean) => void; onExit: () => void }) {
  const won = game.winner === ME;
  const reason = humanize(game.endReason ?? '');
  const lastClashes = game.log.filter((e) => e.kind === 'shard' || e.kind === 'ascend' || e.kind === 'scheme').slice(-5);
  return (
    <div className="overlay results">
      <div className={`modal ${won ? 'victory' : 'defeat'}`}>
        <h1>{won ? 'Victory' : 'Defeat'}</h1>
        <p className="lead">{reason}</p>
        <div className="res-stats">
          <div><b>{round(game)}</b><span>rounds</span></div>
          <div><b>{game.stats.shardsBroken[ME]}</b><span>shards you broke</span></div>
          <div><b>{game.stats.shardsBroken[AI]}</b><span>shards rival broke</span></div>
          <div><b>{game.stats.ascends[ME]}</b><span>your Ascensions</span></div>
          <div><b>{game.stats.schemes[ME]}</b><span>Schemes you sprang</span></div>
        </div>
        <h3>How it ended</h3>
        <ol className="res-log">{lastClashes.map((e) => <li key={e.n}>{humanize(e.text)}</li>)}</ol>
        <div className="btnrow center">
          <button type="button" className="primary big" onClick={() => onRematch(false)}>Rematch</button>
          <button type="button" className="secondary" onClick={() => onRematch(true)}>Rematch with decks swapped</button>
          <button type="button" className="secondary" onClick={onExit}>Menu</button>
        </div>
        <p className="note">Seed {game.seed} · rules {game.rulesVersion}</p>
      </div>
    </div>
  );
}

export { champion };
