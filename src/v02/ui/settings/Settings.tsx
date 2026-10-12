import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CARDS, RULES_VERSION, isChampionCard } from '../../content/cards';
import { FINISH_NAMES } from '../../economy/odds';
import type { Finish } from '../../economy/odds';
import { devClearAct1, devEraseAccount, devGrant, devGrantAllCards, resetCampaign, useProfile } from '../../economy/profile';
import { DEV_TOOLS } from '../../devtools';
import { resetSettings, setSetting, useSettings } from '../../settings';
import type { Settings as S } from '../../settings';
import { PRINTINGS } from '../cardart';
import { FoilCard } from '../collect/FoilCard';
import { Wallet } from '../collect/Shop';
import './settings.css';

export function Settings({ onBack }: { onBack: () => void }) {
  const s = useSettings();
  const profile = useProfile();
  const [msg, setMsg] = useState<string | null>(null);
  const [viewer, setViewer] = useState(false);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); }, [msg]);
  const cleared = Object.keys(profile.campaign ?? {}).length;

  return (
    <div className="screen settings">
      <div className="screen-top"><button type="button" className="btn" onClick={onBack}>← Menu</button><h2>Settings</h2><div className="spacer" /><Wallet /></div>
      <div className="screen-body">
        <div className="st-cols">
          <div>
            <Section title="Gameplay">
              <Row label="Game speed" help="How quickly the AI plays and battles resolve. The Speed button in a match changes it too.">
                <Choice<S['speed']> value={s.speed} options={[['normal', 'Normal'], ['fast', 'Fast']]} onChange={(v) => setSetting('speed', v)} />
              </Row>
              <Row label="Ascension celebrations" help="The ★★ Ascension and ★★★ Awakening moments. Short plays them quickly; Off skips them.">
                <Choice<S['celebrations']> value={s.celebrations} options={[['full', 'Full'], ['short', 'Short'], ['off', 'Off']]} onChange={(v) => setSetting('celebrations', v)} />
              </Row>
              <Row label="Ask before ending a turn without battling" help="A safety check if you press End turn before going to battle.">
                <Switch on={s.confirmEndTurn} onChange={(v) => setSetting('confirmEndTurn', v)} label="Ask before ending a turn without battling" />
              </Row>
            </Section>
            <Section title="Display & comfort">
              <Row label="Reduce motion" help="Turns off moving effects and animations. Your device's own reduce-motion setting is always respected too.">
                <Switch on={s.reduceMotion} onChange={(v) => setSetting('reduceMotion', v)} label="Reduce motion" />
              </Row>
              <Row label="Achievement pop-ups" help="Show a banner when you unlock an achievement. They are always listed on the Achievements screen.">
                <Switch on={s.achievementPopups} onChange={(v) => setSetting('achievementPopups', v)} label="Achievement pop-ups" />
              </Row>
            </Section>
            <Section title="Sound">
              <p className="st-note">Voice-overs, music and sound effects arrive with the recorded voice pack. Their volume controls will appear here.</p>
            </Section>
          </div>
          <div>
            <Section title="Your progress">
              <p className="st-note">Saved on this device only. Campaign: {cleared} Bout{cleared === 1 ? '' : 's'} cleared.</p>
              <Row label="Restart the campaign" help="Clears which Bouts you have beaten so you can play Act I again. Cards, Valor and achievements you earned are kept.">
                <Confirm label="Restart campaign" again="Press again to restart" onConfirm={() => { resetCampaign(); setMsg('Campaign restarted.'); }} />
              </Row>
              <Row label="Default settings" help="Put every option on this page back to how it started.">
                <Confirm label="Restore defaults" again="Press again to restore" onConfirm={() => { resetSettings(); setMsg('Settings restored.'); }} />
              </Row>
            </Section>
            <Section title="About">
              <p className="st-note"><b>Crownfall: Sovereign's Hand</b> · playable prototype V0.2 · rules {RULES_VERSION}<br />Northern Summit Studios · Art: Jerian Latawiec</p>
            </Section>
            {DEV_TOOLS && (
              <Section title="Developer" dev>
                <p className="st-note">Development builds only. Players never see this section.</p>
                <Row label="Card viewer" help="Look at any card, Alternate Art, Masterwork or Omega in every finish, and play its celebration.">
                  <button type="button" className="btn gold" onClick={() => setViewer(true)}>Open card viewer</button>
                </Row>
                <Row label="Wallet" help="Top up for testing the Shop and Forge.">
                  <div className="st-btns">
                    <button type="button" className="btn" onClick={() => { devGrant(1000, 0); setMsg('+1,000 Valor'); }}>+1,000 Valor</button>
                    <button type="button" className="btn" onClick={() => { devGrant(0, 100); setMsg('+100 Starstones'); }}>+100 Starstones</button>
                  </div>
                </Row>
                <Row label="Collection" help="A playset of every Set 1 card in the standard finish.">
                  <button type="button" className="btn" onClick={() => { devGrantAllCards(); setMsg('Every Set 1 card added.'); }}>Grant every card</button>
                </Row>
                <Row label="Campaign" help="Mark all 128 Act I Bouts as cleared (no rewards paid), unlocking every chapter.">
                  <button type="button" className="btn" onClick={() => { devClearAct1(); setMsg('Act I cleared.'); }}>Clear Act I</button>
                </Row>
                <Row label="Fully reset account" help="Erases this device's wallet, cards, decks, campaign, achievements, challenges and settings, then restarts as a brand-new player.">
                  <Confirm label="Reset account" again="Press again to erase everything" danger onConfirm={devEraseAccount} />
                </Row>
              </Section>
            )}
          </div>
        </div>
      </div>
      {viewer && <CardViewer onClose={() => setViewer(false)} />}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

const Section = ({ title, dev, children }: { title: string; dev?: boolean; children: React.ReactNode }) => (
  <section className={`st-section ${dev ? 'dev' : ''}`}><h3>{title}{dev && <span className="st-devtag">Developer</span>}</h3>{children}</section>
);
const Row = ({ label, help, children }: { label: string; help: string; children: React.ReactNode }) => (
  <div className="st-row"><div><b>{label}</b><small>{help}</small></div><div className="st-ctl">{children}</div></div>
);
function Choice<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return <div className="st-choice" role="radiogroup">{options.map(([v, l]) => <button type="button" key={v} role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
const Switch = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className={`st-switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)}><i /></button>
);
/** Two-press confirmation, as in Crownfall: the first press arms the button for a few seconds. */
function Confirm({ label, again, onConfirm, danger }: { label: string; again: string; onConfirm: () => void; danger?: boolean }) {
  const [armed, setArmed] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <button type="button" className={`btn ${danger ? 'st-danger' : ''} ${armed ? 'armed' : ''}`}
      onClick={() => { if (armed) { clearTimeout(t.current); setArmed(false); onConfirm(); } else { setArmed(true); t.current = setTimeout(() => setArmed(false), 4000); } }}>
      {armed ? again : label}
    </button>
  );
}

const FINISHES: Finish[] = ['normal', 'holo', 'prismatic', 'rainbow', 'gilded'];
const KIND_NAMES: Record<string, string> = { base: 'Set 1', token: 'Tokens', alt: 'Alternate Art', masterwork: 'Masterworks', omega: 'Omegas' };

/** Developer card viewer: every printing in every finish, plus the ★★/★★★ celebration preview. */
function CardViewer({ onClose }: { onClose: () => void }) {
  const kinds = useMemo(() => [...new Set(PRINTINGS.map((p) => p.kind))], []);
  const [kind, setKind] = useState<string>('base');
  const [q, setQ] = useState('');
  const list = PRINTINGS.filter((p) => p.kind === kind && (!q || (CARDS[p.cardId]?.name ?? '').toLowerCase().includes(q.toLowerCase())));
  const [pick, setPick] = useState(list[0]?.id ?? PRINTINGS[0].id);
  const p = PRINTINGS.find((x) => x.id === pick) ?? list[0];
  const c = p ? CARDS[p.cardId] : undefined;
  const canCelebrate = !!c && isChampionCard(c) && c.star >= 2;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="st-viewer" role="dialog" aria-label="Card viewer" onClick={(e) => e.stopPropagation()}>
        <div className="st-vtop">
          <h3>Card viewer</h3>
          {kinds.map((k) => <button type="button" key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => { setKind(k); const first = PRINTINGS.find((x) => x.kind === k); if (first) setPick(first.id); }}>{KIND_NAMES[k] ?? k}</button>)}
          <input className="st-search" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search cards by name" />
          <div className="spacer" /><button type="button" className="btn gold" onClick={onClose}>Close</button>
        </div>
        <div className="st-vbody">
          <ol className="st-list">
            {list.map((x) => <li key={x.id}><button type="button" className={x.id === pick ? 'on' : ''} onClick={() => setPick(x.id)}><span>{x.no}</span>{CARDS[x.cardId]?.name ?? x.cardId}{CARDS[x.cardId] && isChampionCard(CARDS[x.cardId]) ? ` ${'★'.repeat((CARDS[x.cardId] as { star: number }).star)}` : ''}</button></li>)}
          </ol>
          {p && (
            <div className="st-show">
              <div className="st-meta"><b>{c?.name ?? p.cardId}</b> · {p.id} · {p.rarity}{p.flavour ? <> · <i>“{p.flavour}”</i></> : null}
                {canCelebrate && <button type="button" className="btn" onClick={() => { location.hash = `fx=${p.cardId}`; location.reload(); }}>Play celebration</button>}
              </div>
              <div className="st-finishes">
                {FINISHES.map((f) => <figure key={f}><FoilCard printing={p.id} finish={f} width={196} /><figcaption>{FINISH_NAMES[f]}</figcaption></figure>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
