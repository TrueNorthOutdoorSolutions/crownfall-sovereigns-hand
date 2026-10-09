import React from 'react';
import { CARDS, DECKS, ORIGIN_COLORS, isChampionCard } from '../content/cards';
import type { Card, ChampionCard } from '../content/cards';
import { guard, hasKeyword, might, top } from '../rules/engine';
import type { ChampionInPlay, GameState } from '../rules/types';

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
export const TIER_NAMES = ['', 'Common', 'Uncommon', 'Elite', 'Epic', 'Mythic'];
export const artUrl = (canonId: string, star: number) => `${import.meta.env.BASE_URL}v02/art/${canonId}/star_${star}.webp`;
export const traitUrl = (t: string) => `${import.meta.env.BASE_URL}v02/traits/${t}.webp`;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export const GLOSSARY: Record<string, string> = {
  Charge: 'Can attack the turn it is deployed.',
  Bulwark: "Blocking doesn't turn this champion sideways.",
  Ambush: "When it attacks a sideways champion, it strikes first. If that champion is defeated, it can't strike back.",
  Flight: 'Can only be blocked by champions with Flight or Reach.',
  Reach: 'Can block champions with Flight.',
  Ascendant: 'A Tier V champion. A deck holds only one.',
  Scorch: 'The champion gets −X Guard this turn.',
  Shield: 'The next time it would be defeated, the Shield breaks instead.',
  Mend: 'Put a card from your hand face-down into your Crown as a new shard (5 maximum).',
  Shardfall: 'If this breaks from your Crown, you may cast or set it for free right away.',
  Swift: "Can also be cast in a response window, on either player's turn.",
};

export function RulesText({ text }: { text: string }) {
  const parts = text.split(/(Arrival:|Ascend:|Attack:|Block:|Scorch \d+|Shield|Mend \d+)/g);
  return <>{parts.map((p, i) => (/^(Arrival|Ascend|Attack|Block):$/.test(p) ? <b key={i}>{p}</b> : /^(Scorch|Shield|Mend)/.test(p) ? <em key={i}>{p}</em> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}

function deckStyle(c: Card): React.CSSProperties {
  if (c.deck) return { ['--deck' as string]: DECKS[c.deck].color, ['--acc' as string]: DECKS[c.deck].accent };
  const origin = isChampionCard(c) ? ORIGIN_COLORS[c.line.origins[0]] : '#8a6d2a';
  return { ['--deck' as string]: origin, ['--acc' as string]: '#f0c95a' };
}

/** A full card face, used in hand, inspector and choices. */
export function CardFace({ id, size = 'md', live }: { id: string; size?: 'sm' | 'md' | 'lg'; live?: { might: number; guard: number } }) {
  const c = CARDS[id];
  if (!isChampionCard(c)) {
    const type = c.kind === 'scheme' ? 'Scheme' : c.swift ? 'Swift Tactic' : 'Tactic';
    return (
      <div className={`cardface spell ${c.kind} ${size}`} style={deckStyle(c)}>
        <div className="cf-head"><div className="cf-name">{c.name}</div><div className="cf-cost">{c.cost}</div></div>
        <div className="cf-sigil"><span>{c.kind === 'scheme' ? '◈' : c.swift ? 'ϟ' : '✦'}</span>{c.shardfall && <i className="cf-sf">Shardfall</i>}</div>
        <div className="cf-type">{type}</div>
        <div className="cf-text"><RulesText text={c.text} />
          {c.kind === 'scheme' && <div className="cf-note">Set face-down for free. Spring it on your rival's turn by paying its cost.</div>}
          {c.swift && <div className="cf-note">Swift: also castable when a fight is being decided.</div>}
        </div>
      </div>
    );
  }
  return <ChampionFace c={c} size={size} live={live} />;
}

function ChampionFace({ c, size, live }: { c: ChampionCard; size: 'sm' | 'md' | 'lg'; live?: { might: number; guard: number } }) {
  const asc = c.kind === 'ascension';
  const m = live?.might ?? c.might, g = live?.guard ?? c.guard;
  return (
    <div className={`cardface champ s${c.star} ${size}`} style={deckStyle(c)}>
      <div className="cf-head"><div className="cf-name">{c.name}<small>{c.title}</small></div>
        <div className={asc ? 'cf-asc' : 'cf-cost'} title={asc ? 'Ascend cost' : 'Command cost'}>{asc ? `↑${c.cost}` : c.cost}</div></div>
      <div className="cf-art" style={{ backgroundImage: `url(${artUrl(c.canonId, c.star)})` }}>
        <span className="cf-stars">{'★'.repeat(c.star)}</span>
        {c.crown === 2 && <span className="cf-crowndmg" title="Breaks 2 shards when unblocked">♛2</span>}
        {asc && <span className="cf-ascband">{'★'.repeat(c.star)} Ascension</span>}
      </div>
      <div className="cf-tribe">
        {[...c.line.origins, ...c.line.classes].map((t) => <img key={t} src={traitUrl(t)} alt="" title={cap(t)} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />)}
        <span>Tier {ROMAN[c.line.tier]} · {c.line.origins.map(cap).join(' · ')} · {c.line.classes.map(cap).join(' · ')}</span>
      </div>
      <div className="cf-text">
        {c.keywords.length > 0 && <div className="cf-kw">{c.keywords.join(' · ')}</div>}
        {c.ability && c.text && <div className="cf-abil">{c.ability}</div>}
        {c.text ? <RulesText text={c.text} /> : !c.keywords.length && <span className="cf-vanilla">No ability. Strong for its cost.</span>}
      </div>
      <div className="cf-stats">
        <span className={`m ${m > c.might ? 'up' : m < c.might ? 'down' : ''}`}>⚔ {m}</span>
        <span className={`g ${g > c.guard ? 'up' : g < c.guard ? 'down' : ''}`}>⛨ {g}</span>
      </div>
    </div>
  );
}

/** A champion on the battlefield. */
export function ChampionToken({ s, c, selected, targetable, dim, onClick, onHover, flash }: {
  s: GameState; c: ChampionInPlay; selected?: boolean; targetable?: boolean; dim?: boolean; flash?: boolean;
  onClick?: () => void; onHover?: (on: boolean) => void;
}) {
  const f = top(c);
  const m = might(s, c), g = guard(s, c);
  return (
    <button type="button" className={`token s${f.star} ${c.exhausted ? 'exhausted' : ''} ${selected ? 'selected' : ''} ${targetable ? 'targetable' : ''} ${dim ? 'dim' : ''} ${flash ? 'flash' : ''} ${c.shield ? 'shielded' : ''}`}
      style={deckStyle(f)} onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}
      aria-label={`${f.name} ${f.star} star, Might ${m}, Guard ${g}${c.exhausted ? ', sideways' : ''}${c.shield ? ', shielded' : ''}`}>
      <div className="tk-art" style={{ backgroundImage: `url(${artUrl(f.canonId, f.star)})` }} />
      <div className="tk-top"><span className="tk-stars">{'★'.repeat(f.star)}</span>{c.shield && <span className="tk-shield" title="Shield: the next time it would be defeated, the Shield breaks instead">Shield</span>}</div>
      <div className="tk-name">{f.name}</div>
      {f.keywords.filter((k) => k !== 'Ascendant').length > 0 && <div className="tk-kw">{f.keywords.filter((k) => k !== 'Ascendant').join(' · ')}</div>}
      {hasKeyword(c, 'Ascendant') && <div className="tk-asc">Ascendant</div>}
      <div className="tk-stats">
        <span className={m > f.might ? 'up' : m < f.might ? 'down' : ''}>⚔{m}</span>
        <span className={g > f.guard ? 'up' : g < f.guard ? 'down' : ''}>⛨{g}</span>
      </div>
      {c.exhausted && <div className="tk-side">sideways</div>}
    </button>
  );
}
