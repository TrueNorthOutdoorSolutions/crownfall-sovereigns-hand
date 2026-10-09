// AI opponent for The Shattered Crown. It chooses one legal action at a time from the visible state only:
// its own hand, Schemes and Ascension Pile, and the public board. It never reads the rival's hand,
// Crown Shards, Schemes or deck order. Same heuristics as the paper balance bot.
import { CARDS, champion, isChampionCard, isSpellCard, spell } from '../content/cards';
import type { ChampionCard, Card } from '../content/cards';
import {
  actor, apply, ascendBlockReason, behind, canAttack, hasTrait, zonesFor, canBlock, findChampion, guard, handPlayability, hasKeyword, legalActions,
  might, nextAscension, predictClash, rival, top,
} from '../rules/engine';
import type { Action, ChampionInPlay, GameState, PlayerIndex } from '../rules/types';

const baseVal = (d: ChampionCard) => d.might + d.guard + (d.star - 1) * 3 + (d.keywords.includes('Ascendant') ? 4 : 0);
const val = (c: ChampionInPlay) => baseVal(top(c)) + (c.shield ? 2 : 0);
const cardWorth = (d: Card) => (isChampionCard(d) ? d.might + d.guard : d.kind === 'scheme' ? 3 : 2) + (isSpellCard(d) && d.shardfall ? -1 : 0);

function tacticUseful(s: GameState, p: PlayerIndex, id: string): boolean {
  const d = CARDS[id];
  if (!isSpellCard(d)) return false;
  const me = s.players[p], them = s.players[rival(p)];
  const eff = d.effects[0];
  switch (eff.op) {
    case 'draw': return me.hand.length <= 5;
    case 'returnFallen': return me.fallen.some((x) => CARDS[x].kind === 'champion') && me.hand.filter((x) => CARDS[x].kind === 'champion').length <= 1;
    case 'deployFree': return me.field.length < 4 && me.hand.some((x) => CARDS[x].kind === 'champion' && (CARDS[x] as ChampionCard).cost <= eff.maxCost);
    case 'shield': return me.field.filter((c) => !c.shield).length >= 2;
    case 'scorchAll': return them.field.length >= 2;
    case 'scorch': return them.field.length >= 1 && me.field.some((c) => canAttack(s, c));
    case 'buffAll': return s.active === p && s.phase !== 'after' && me.field.filter((c) => canAttack(s, c)).length >= 2 && (eff.maxField === undefined || me.field.length <= eff.maxField);
    case 'buffTrait': return s.active === p && me.field.filter((c) => canAttack(s, c) && hasTrait(c, eff.trait)).length >= 1;
    case 'buff': return s.active === p && me.field.some((c) => canAttack(s, c));
    case 'command': return me.hand.some((x) => CARDS[x].kind === 'champion' && champion(x).cost > me.command - d.cost);
    case 'summon': return me.field.length < zonesFor(s, p);
    case 'ascendNow': return me.field.some((c) => nextAscension(s, c));
    case 'extraZone': return me.field.length >= zonesFor(s, p) - 1;
    case 'selfShard': return me.crown.length >= them.crown.length && me.crown.length > eff.n + 2;
    case 'coinFlip': case 'tuck': case 'mend': return true;
    case 'defeatGuardAtMost': return them.field.length > 0;
    case 'readyOther': return me.field.some((c) => c.exhausted && c.arrivedTurn < s.turn);
    case 'unequip': return them.field.some((c) => c.relic);
    default: return false;
  }
}

function bestAttackValue(s: GameState, a: ChampionInPlay): number {
  let best = 0;
  for (const t of s.players[rival(a.owner)].field) {
    const r = predictClash(s, a, t);
    const v = (r.defenderFalls ? val(t) : 0) - (r.attackerFalls ? val(a) : 0);
    if (v > best) best = v;
  }
  return best;
}

function mainAction(s: GameState, p: PlayerIndex): Action {
  const me = s.players[p], them = s.players[rival(p)];
  const play = handPlayability(s, p);
  // 1. Set Schemes (free).
  const sch = play.findIndex((h, i) => h.action === 'setScheme' && CARDS[me.hand[i]].kind === 'scheme');
  if (sch >= 0) return { type: 'setScheme', handIndex: sch };
  // 2. The Ascendant first when affordable.
  const asd = me.hand.findIndex((id, i) => play[i].action === 'deploy' && champion(id).keywords.includes('Ascendant'));
  if (asd >= 0) return { type: 'deploy', handIndex: asd };
  // 3. Bodies and cards.
  for (const op of ['command', 'selfShard', 'deployFree', 'returnFallen', 'draw', 'tuck', 'coinFlip', 'summon', 'extraZone', 'ascendNow', 'mend']) {
    const i = me.hand.findIndex((id, k) => play[k].action === 'cast' && !isChampionCard(CARDS[id]) && !spell(id).swift
      && spell(id).effects[0].op === op && tacticUseful(s, p, id));
    if (i >= 0) return { type: 'cast', handIndex: i };
  }
  // 3b. Proclaim an Edict when none of ours is in play; attach Relics to the strongest champion without one.
  const edictIdx = me.hand.findIndex((_, i) => play[i].action === 'playEdict');
  if (edictIdx >= 0 && s.edict?.owner !== p) return { type: 'playEdict', handIndex: edictIdx };
  const relicIdx = me.hand.findIndex((_, i) => play[i].action === 'equip');
  if (relicIdx >= 0) {
    const holder = me.field.filter((c) => !c.relic).sort((a, b) => val(b) - val(a))[0];
    if (holder) return { type: 'equip', handIndex: relicIdx, uid: holder.uid };
  }
  // 4. Greedy value per Command over deploys and one pre-battle Ascend (only when its Ascend effect helps now).
  const reserve = me.schemes.some((x) => spell(x.card).cost > 0) && me.commandMax >= 4 ? 1 : 0;
  const options: { act: Action; cost: number; value: number }[] = [];
  const openCrown = them.field.filter((b) => !b.exhausted).length === 0;
  for (const c of me.field) {
    if (ascendBlockReason(s, c)) continue;
    const next = nextAscension(s, c)!;
    if (!(next.ascend?.length && them.field.length > 0) && canAttack(s, c)) continue; // leave it for after battle
    let value = baseVal(next) - baseVal(top(c)) + (next.ascend ? 3 : 0);
    if (canAttack(s, c)) value -= openCrown ? top(c).crown * 5 : bestAttackValue(s, c);
    if (them.field.length) value -= me.crown.length <= 2 ? 6 : 2;
    if (value > 0) options.push({ act: { type: 'ascend', uid: c.uid }, cost: next.cost, value });
  }
  me.hand.forEach((id, i) => {
    if (play[i].action !== 'deploy') return;
    const d = champion(id);
    options.push({ act: { type: 'deploy', handIndex: i }, cost: d.cost, value: d.might + d.guard + (d.arrive ? 2 : 0) });
  });
  options.sort((a, b) => b.value / Math.max(1, b.cost) - a.value / Math.max(1, a.cost));
  const budget = me.command - reserve;
  const pick = options.find((o) => o.cost <= budget);
  if (pick) return pick.act;
  // 5. Removal, protection and buffs right before battle.
  for (const op of ['scorchAll', 'scorch', 'defeatGuardAtMost', 'unequip', 'shield', 'readyOther', 'buffTrait', 'buff', 'buffAll']) {
    const i = me.hand.findIndex((id, k) => play[k].action === 'cast' && !isChampionCard(CARDS[id]) && !spell(id).swift
      && spell(id).effects[0].op === op && tacticUseful(s, p, id));
    if (i >= 0) return { type: 'cast', handIndex: i };
  }
  return { type: 'toBattle' };
}

function battleAction(s: GameState, p: PlayerIndex): Action {
  const me = s.players[p], them = s.players[rival(p)];
  const attackers = me.field.filter((c) => canAttack(s, c));
  let best: { act: Action; v: number } | null = null;
  const consider = (act: Action, v: number) => { if (!best || v > best.v) best = { act, v }; };
  for (const a of attackers) {
    const blockers = them.field.filter((b) => !b.exhausted && canBlock(b, a));
    let crownV: number;
    if (!blockers.length) crownV = top(a).crown * 10 + (them.crown.length <= top(a).crown ? 1000 : 0);
    else {
      const outs = blockers.map((b) => predictClash(s, a, b, { blocking: true }));
      const worst = outs.some((o) => o.attackerFalls && !o.defenderFalls) ? -val(a) : outs.some((o) => o.attackerFalls) ? -val(a) / 2 : 3;
      crownV = attackers.length > blockers.length ? Math.max(worst, top(a).crown * 6) : worst;
    }
    consider({ type: 'attack', uid: a.uid, target: 'crown' }, crownV);
    for (const t of them.field) {
      const r = predictClash(s, a, t);
      consider({ type: 'attack', uid: a.uid, target: t.uid },
        (r.defenderFalls ? val(t) + (t.exhausted ? 0 : 2) : 0) - (r.attackerFalls ? val(a) : 0) - (r.defenderFalls ? 0 : 1));
    }
  }
  const threshold = them.field.length && me.crown.length <= 2 ? 2 : 0;
  const b = best as { act: Action; v: number } | null;
  return b && b.v > threshold ? b.act : { type: 'endBattle' };
}

function afterAction(s: GameState, p: PlayerIndex): Action {
  const me = s.players[p];
  let best: { uid: number; value: number } | null = null;
  for (const c of me.field) {
    if (ascendBlockReason(s, c)) continue;
    const next = nextAscension(s, c)!;
    let value = baseVal(next) - baseVal(top(c));
    if (!c.exhausted) value -= me.crown.length <= 2 ? 8 : 3;
    if (!best || value > best.value) best = { uid: c.uid, value };
  }
  return best && best.value > 0 ? { type: 'ascend', uid: best.uid } : { type: 'endTurn' };
}

function chooseBlock(s: GameState, q: PlayerIndex, options: number[]): number | null {
  const a = findChampion(s, s.combat!.attacker)!;
  const d = top(a).crown;
  const left = s.players[q].crown.length;
  let best: { uid: number; sc: number } | null = null;
  for (const uid of options) {
    const b = findChampion(s, uid)!;
    const r = predictClash(s, a, b, { blocking: true });
    let sc: number;
    if (!r.defenderFalls && r.attackerFalls) sc = 100 + val(a);
    else if (!r.defenderFalls) sc = 50;
    else if (r.attackerFalls) sc = val(a) - val(b) + (left <= d + 1 ? 30 : 0) + 1;
    else sc = left <= d ? 80 : left <= d + 1 ? 8 - val(b) / 2 : -100;
    if (!best || sc > best.sc) best = { uid, sc };
  }
  return best && best.sc > 0 ? best.uid : null;
}

function chooseResponse(s: GameState, p: PlayerIndex, keys: string[]): string | null {
  const cbt = s.combat!;
  const a = findChampion(s, cbt.attacker)!;
  const d = cbt.defender !== null ? findChampion(s, cbt.defender) : null;
  const pl = s.players[p];
  const defending = p !== cbt.attackerOwner;
  const r = d ? predictClash(s, a, d) : null;
  const left = pl.crown.length;
  for (const key of keys) {
    if (key.startsWith('s:')) {
      const sc = pl.schemes.find((x) => x.sid === Number(key.slice(2)))!;
      const e = spell(sc.card).effects[0];
      if (e.op === 'cancelAttack' && !d && (top(a).crown === 2 || left <= 3)) return key;
      if (e.op === 'gateBlock' && !d) {
        const cand = pl.field.filter((b) => canBlock(b, a)).map((b) => ({ b, r: predictClash(s, a, b, { blocking: true }) }));
        if (cand.some((c) => !c.r.defenderFalls) || (cand.length && left <= top(a).crown + 1)) return key;
      }
      if (!d || !r) continue;
      if (e.op === 'shield' && r.defenderFalls && !d.shield) return key;
      if (e.op === 'buff' && e.target === 'defender' && r.defenderFalls && might(s, a) < guard(s, d) + e.guard) return key;
      if (e.op === 'buff' && e.target === 'attacker' && r.defenderFalls && might(s, a) + e.might < guard(s, d)) return key;
      if (e.op === 'scorch' && e.target === 'attacker' && !r.attackerFalls && might(s, d) >= guard(s, a) - e.n && might(s, d) > 0) return key;
    } else if (d && r) {
      const id = pl.hand[Number(key.slice(2))];
      const e = spell(id).effects[0];
      if (e.op !== 'buff') continue;
      if (defending) {
        if (e.guard && r.defenderFalls && might(s, a) < guard(s, d) + e.guard) return key;
        if (e.might && !r.attackerFalls && might(s, d) + e.might >= guard(s, a)) return key;
      } else {
        if (e.guard && r.attackerFalls && might(s, d) < guard(s, a) + e.guard) return key;
        if (e.might && !r.defenderFalls && might(s, a) + e.might >= guard(s, d) && !d.shield) return key;
      }
    }
  }
  return null;
}

function chooseOption(s: GameState, p: PlayerIndex): string | null {
  const pend = s.pending;
  if (pend?.kind !== 'choose') return null;
  const op = pend.item.effect.op;
  const champs = pend.options.filter((o) => o.key.startsWith('u:')).map((o) => findChampion(s, Number(o.key.slice(2)))!);
  switch (op) {
    case 'scorch': {
      const mine = s.players[p].field.filter((c) => !c.exhausted);
      const n = pend.item.effect.op === 'scorch' ? pend.item.effect.n : 0;
      const killable = champs.filter((t) => mine.some((a) => might(s, a) >= guard(s, t) - n && might(s, a) > 0));
      const pool = killable.length ? killable : champs;
      return `u:${pool.sort((a, b) => val(b) - val(a))[0].uid}`;
    }
    case 'shield': case 'gateBlock':
      if (op === 'gateBlock') {
        const a = findChampion(s, s.combat!.attacker)!;
        const ranked = champs.map((b) => ({ b, r: predictClash(s, a, b, { blocking: true }) }))
          .sort((x, y) => Number(x.r.defenderFalls) - Number(y.r.defenderFalls) || Number(y.r.attackerFalls) - Number(x.r.attackerFalls) || val(x.b) - val(y.b));
        return `u:${ranked[0].b.uid}`;
      }
      return `u:${champs.sort((a, b) => val(b) - val(a))[0].uid}`;
    case 'unequip': {
      const theirs = champs.filter((c) => c.owner !== p);
      return `u:${(theirs.length ? theirs : champs).sort((a, b) => val(b) - val(a))[0].uid}`;
    }
    case 'readyOther': case 'ascendNow':
      return `u:${champs.sort((a, b) => val(b) - val(a))[0].uid}`;
    case 'tuck': {
      const pl = s.players[p];
      return pend.options.map((o) => ({ key: o.key, w: cardWorth(CARDS[pl.hand[Number(o.key.slice(2))]]) })).sort((a, b) => a.w - b.w)[0].key;
    }
    case 'equipFree': {
      const pl = s.players[p];
      return pend.options.map((o) => ({ key: o.key, c: CARDS[pl.hand[Number(o.key.slice(2))]] as { cost: number } })).sort((a, b) => b.c.cost - a.c.cost)[0].key;
    }
    case 'deployFromFallen': {
      const pl = s.players[p];
      return pend.options.map((o) => ({ key: o.key, d: champion(pl.fallen[Number(o.key.slice(2))]) })).sort((a, b) => b.d.cost - a.d.cost)[0].key;
    }
    case 'buff': {
      if (pend.item.effect.op === 'buff' && pend.item.effect.target === 'chooseRival') {
        return `u:${champs.sort((a, b) => might(s, b) - might(s, a))[0].uid}`;
      }
      // Swift buffs: the champion in the current clash on this player's side; otherwise the strongest own champion.
      const cbt = s.combat;
      const mineInClash = cbt ? [cbt.attacker, cbt.defender].map((u) => (u === null ? null : findChampion(s, u))).find((c) => c && c.owner === p) : null;
      if (mineInClash) return `u:${mineInClash.uid}`;
      const own = champs.filter((c) => c.owner === p).sort((a, b) => val(b) - val(a));
      return `u:${(own[0] ?? champs[0]).uid}`;
    }
    case 'returnFallen': {
      const pl = s.players[p];
      const opts = pend.options.map((o) => ({ key: o.key, d: CARDS[pl.fallen[Number(o.key.slice(2))]] as { cost: number } })).sort((a, b) => b.d.cost - a.d.cost);
      return opts[0]?.key ?? null;
    }
    case 'deployFree': {
      const pl = s.players[p];
      return pend.options.map((o) => ({ key: o.key, d: champion(pl.hand[Number(o.key.slice(2))]) })).sort((a, b) => b.d.cost - a.d.cost)[0].key;
    }
    case 'mend': {
      const pl = s.players[p];
      return pend.options.map((o) => ({ key: o.key, w: cardWorth(CARDS[pl.hand[Number(o.key.slice(2))]]) })).sort((a, b) => a.w - b.w)[0].key;
    }
    default:
      return pend.options[0]?.key ?? null;
  }
}

/** The AI's next action for player p. Always returns a legal action when p must act. */
export function chooseAction(s: GameState, p: PlayerIndex): Action {
  const pend = s.pending;
  const pl = s.players[p];
  let act: Action;
  if (pend) {
    switch (pend.kind) {
      case 'mulligan':
        act = { type: 'mulligan', redraw: !pl.hand.some((id) => CARDS[id].kind === 'champion' && champion(id).cost <= 2) };
        break;
      case 'choose': act = { type: 'choose', key: chooseOption(s, p) }; break;
      case 'block': act = { type: 'block', uid: chooseBlock(s, p, pend.options) }; break;
      case 'respond': act = { type: 'respond', key: chooseResponse(s, p, pend.options.map((o) => o.key)) }; break;
      case 'shardfall': {
        const d = spell(pend.card);
        act = { type: 'shardfall', use: d.kind === 'scheme' ? pl.schemes.length < 3 : tacticUseful(s, p, pend.card) || d.effects[0].op === 'draw' };
        break;
      }
      case 'discard': {
        let worst = 0;
        pl.hand.forEach((id, i) => { if (cardWorth(CARDS[id]) < cardWorth(CARDS[pl.hand[worst]])) worst = i; });
        act = { type: 'discard', handIndex: worst };
        break;
      }
    }
  } else if (s.phase === 'main') act = mainAction(s, p);
  else if (s.phase === 'battle') act = battleAction(s, p);
  else act = afterAction(s, p);
  // Safety net: never return an illegal action.
  const legal = legalActions(s);
  if (!legal.some((a) => JSON.stringify(a) === JSON.stringify(act))) act = legal.find((a) => a.type === 'endTurn' || a.type === 'endBattle') ?? legal[0];
  return act;
}

/** Play a whole game AI vs AI (tests and balance runs). */
export function playOut(s: GameState, maxSteps = 5000): GameState {
  for (let i = 0; i < maxSteps && s.phase !== 'over'; i++) {
    const p = actor(s)!;
    const r = apply(s, p, chooseAction(s, p));
    if (r.error) throw new Error(`AI chose an illegal action: ${r.error}`);
    s = r.state;
  }
  return s;
}

export { behind, hasKeyword };
