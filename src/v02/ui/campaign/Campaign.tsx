import React, { useState } from 'react';
import { ACT_I } from '../../campaign/act1';
import type { Bout, Chapter, Difficulty, StoryLine } from '../../campaign/act1';
import { objectiveText } from '../../campaign/setup';
import { CARDS } from '../../content/cards';
import { useProfile } from '../../economy/profile';
import { cardImage } from '../cardart';
import { Wallet } from '../collect/Shop';

export interface StartBout { bout: Bout; difficulty: Difficulty; playerDeck: string }

const DIFF_NAMES: Record<Difficulty, string> = { contender: 'Contender', masterwork: 'Masterwork', omega: 'Omega' };
const label = (b: Bout) => (b.crowning ? 'The Crowning' : `Trial ${b.trial} · Bout ${b.bout}`);

function Lines({ lines }: { lines: StoryLine[] }) {
  return (
    <div className="story-lines">
      {lines.map((l, i) => (
        <p key={i} className={l.speaker === 'Narration' ? 'narration' : 'speech'}>
          {l.speaker !== 'Narration' && <b>{l.speaker}</b>}
          <span>{l.speaker === 'Narration' ? l.text : `“${l.text}”`}</span>
        </p>
      ))}
    </div>
  );
}

/** Act I map: chapters, Trials and Bouts. Bouts unlock in order; the Crowning comes last. */
export function Campaign({ onBack, onStart }: { onBack: () => void; onStart: (s: StartBout) => void }) {
  const profile = useProfile();
  const cleared = (id: string) => !!profile.campaign?.[id];
  // A chapter opens once the previous chapter's Crowning is won; the screen opens on the furthest open chapter.
  const chapterOpen = (i: number) => i === 0 || cleared(ACT_I.chapters[i - 1].bouts.at(-1)!.id);
  const [chapterIdx, setChapterIdx] = useState(() => { let i = 0; while (i + 1 < ACT_I.chapters.length && chapterOpen(i + 1)) i++; return i; });
  const chapter: Chapter = ACT_I.chapters[chapterIdx];
  const [open, setOpen] = useState<Bout | null>(null);
  const [introFor, setIntroFor] = useState<number | null>(() => (chapter.bouts.some((b) => cleared(b.id)) ? null : chapterIdx));
  const intro = introFor === chapterIdx;
  const setIntro = (v: boolean) => setIntroFor(v ? chapterIdx : null);
  const unlocked = (b: Bout) => { const i = chapter.bouts.indexOf(b); return i === 0 || cleared(chapter.bouts[i - 1].id); };
  const done = chapter.bouts.filter((b) => cleared(b.id)).length;
  const act2Done = false; // Masterwork and Omega Crownings reopen once Act II is complete.

  return (
    <div className="screen campaign">
      <div className="camp-bg" aria-hidden="true" />
      <div className="screen-top"><button type="button" className="btn" onClick={onBack}>← Menu</button>
        <h2>Act I · {ACT_I.title}</h2><div className="spacer" /><Wallet /></div>
      <div className="screen-body camp-body">
        <div className="camp-chapter">
          <div className="camp-tabs">
            {ACT_I.chapters.map((c, i) => (
              <button type="button" key={c.id} className={`chip ${i === chapterIdx ? 'on' : ''}`} disabled={!chapterOpen(i)}
                onClick={() => { setChapterIdx(i); if (!c.bouts.some((b) => cleared(b.id))) setIntroFor(i); }}>
                Chapter {c.numeral} · {c.title}{chapterOpen(i) ? '' : ' 🔒'}</button>
            ))}
          </div>
          <div className="camp-head">
            <span className="camp-num">Chapter {chapter.numeral}</span>
            <h3>{chapter.title}</h3>
            <span className="note">{done} / {chapter.bouts.length} Bouts · the Crowning: {CARDS[chapter.legend].name}</span>
            <button type="button" className="btn" onClick={() => setIntro(true)}>Prologue</button>
          </div>
          {[1, 2, 3, 4].map((t) => (
            <div key={t} className="camp-trial">
              <div className="camp-trial-name">{t <= 3 ? `Trial ${t} · ${chapter.trials[t - 1]}` : 'The Crowning'}</div>
              <div className="camp-nodes">
                {chapter.bouts.filter((b) => b.trial === t).map((b) => {
                  const ok = unlocked(b), won = cleared(b.id);
                  return (
                    <button type="button" key={b.id} className={`camp-node ${won ? 'won' : ''} ${ok ? '' : 'locked'} ${b.crowning ? 'crowning' : ''}`} disabled={!ok} onClick={() => setOpen(b)}
                      aria-label={`${label(b)}: ${b.title}${won ? ', cleared' : ok ? '' : ', locked'}`}>
                      <span className="cn-art" style={{ backgroundImage: `url(${cardImage(b.portrait)})` }} />
                      <span className="cn-label">{label(b)}</span>
                      <b>{b.title}</b>
                      {won && <span className="cn-done">✓</span>}
                      {!ok && <span className="cn-lock">🔒</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="camp-later note">{cleared('c8-crowning') ? 'Act I complete. Act II · Beneath the Arena is coming, and with it the Masterwork and Omega Crownings.' : 'Act II · Beneath the Arena follows Act I.'}</div>
        </div>
      </div>

      {intro && (
        <div className="modal-back" onClick={() => setIntro(false)}>
          <div className="story-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Prologue">
            <div className="sp-art wide" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}v02/menu-bg.webp)` }} />
            <div className="sp-text"><span className="camp-num">Act I · Chapter {chapter.numeral}</span><h3>{chapter.title}</h3><Lines lines={chapter.intro} />
              <button type="button" className="btn gold" onClick={() => setIntro(false)}>Begin</button></div>
          </div>
        </div>
      )}

      {open && (
        <div className="modal-back" onClick={() => setOpen(null)}>
          <div className="story-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={open.title}>
            <div className="sp-art" style={{ backgroundImage: `url(${cardImage(open.portrait)})` }} />
            <div className="sp-text">
              <span className="camp-num">{label(open)}</span>
              <h3>{open.title}</h3>
              <Lines lines={open.story} />
              <div className="sp-rules">
                <div><b>Objective</b> {objectiveText(open.objective)}</div>
                {open.rules && <div><b>Rules</b> {open.rules}</div>}
                <div><b>Rival</b> {open.rival} · <b>Your deck</b> {chapter.playerDeckName}</div>
                <div><b>Reward</b> ✧ {open.reward.valor} Valor{open.reward.cards?.length ? ` · ${open.reward.cards.map((c) => `${CARDS[c].name}${(CARDS[c] as { star?: number }).star && (CARDS[c] as { star: number }).star > 1 ? ` ${'★'.repeat((CARDS[c] as { star: number }).star)}` : ''}`).join(', ')}` : ''}{cleared(open.id) ? ' (already claimed)' : ''}</div>
              </div>
              {open.crowning ? (
                <div className="sp-diff">
                  {(['contender', 'masterwork', 'omega'] as Difficulty[]).map((d) => {
                    const locked = d !== 'contender' && !act2Done;
                    return <button type="button" key={d} className={`btn ${d === 'contender' ? 'gold' : ''}`} disabled={locked}
                      title={locked ? 'Reopens once Act II is complete.' : ''} onClick={() => onStart({ bout: open, difficulty: d, playerDeck: chapter.playerDeck })}>
                      {DIFF_NAMES[d]}{locked ? ' 🔒' : ''}</button>;
                  })}
                  <p className="note">Masterwork and Omega Crownings reopen after Act II, with the legend’s Masterwork and Omega cards.</p>
                </div>
              ) : <button type="button" className="btn gold" onClick={() => onStart({ bout: open, difficulty: 'contender', playerDeck: chapter.playerDeck })}>Begin Bout</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
