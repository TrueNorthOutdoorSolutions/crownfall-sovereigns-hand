// Paper-rules simulator for the V0.2 print-and-play prototype.
// Purpose: balance evidence only. It mirrors RULEBOOK.md step for step; it is NOT the digital game.
// Both seats are played by the same heuristic bot, so results measure the cards and rules under one
// consistent (imperfect) policy, not human skill.
import { cardIndex, DECKS } from './cards.mjs';

const CARDS = cardIndex();

export const DEFAULT_RULES = {
  shards: 5,
  commandMax: 8,
  stallRound: 10,
  tierV: 'none',           // 'none' | 'shard' (owner breaks a shard) | 'spoils' (rival draws 1) | 'crowning' (deploy only once your Crown is damaged)
  ascendMode: 'exhaust',   // 'free' (no drawback) | 'noAttack' (can't attack this turn) | 'exhaust' (Ascending exhausts the champion)
  secondPlayerCard: true,  // second player draws 6 at setup
  secondPlayerCommand: true, // second player's first turn: +1 Command
  replaceAscendant: null,
  breakthrough: true, 
  ascendAfterBattle: true, // the once-per-turn Ascend may also be used after battle (on an exhausted champion)     // a Crown attacker that defeats its blocker and survives still breaks 1 shard  // e.g. { banner: 'varr', ember: 'pyrax' } swaps the Tier V card for another card (experiment only)
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const isAscendant = (def) => def.keywords?.includes('Ascendant');
const has = (c, kw) => c.def.keywords?.includes(kw);
const baseVal = (def) => (def.might ?? 0) + (def.guard ?? 0) + ((def.star ?? 1) - 1) * 3 + (isAscendant(def) ? 4 : 0);

export function playGame({ decks = ['banner', 'ember'], seed = 1, first = 0, rules = {}, log = null, policy = ['smart', 'smart'] } = {}) {
  const R = { ...DEFAULT_RULES, ...rules };
  const rand = rng(seed);
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  let uid = 0;
  const say = (msg) => log && log.push(`R${round()} P${active + 1}: ${msg}`);

  const players = decks.map((deckId, i) => {
    const d = DECKS[deckId];
    const main = [];
    for (const [id, n] of d.main) {
      let cid = id;
      if (R.replaceAscendant?.[deckId] && isAscendant(CARDS[id])) cid = R.replaceAscendant[deckId];
      const def = R.cardOverrides?.[cid] ? { ...CARDS[cid], ...R.cardOverrides[cid] } : CARDS[cid];
      for (let k = 0; k < n; k++) main.push(def);
    }
    const asc = d.ascension.map((id) => {
      const c = R.cardOverrides?.[id] ? { ...CARDS[id], ...R.cardOverrides[id] } : CARDS[id];
      if (!R.evoBoost && !R.ascCostDelta) return c;
      const k = (R.evoBoost ?? 0) * (c.star - 1);
      return { ...c, might: c.might + k, guard: c.guard + k, cost: Math.max(0, c.cost + (R.ascCostDelta ?? 0)) };
    });
    return { i, deckId, name: d.name, deck: shuffle(main), hand: [], crown: [], fallen: [], asc, field: [], schemes: [], cmd: 0, cmdMax: 0 };
  });

  const stats = {
    seed, first, decks, winner: null, reason: null, rounds: 0,
    p: players.map(() => ({ maxStar: 1, star2Round: null, star3Round: null, ascends: 0, shardfalls: 0, schemes: 0, tactics: 0,
      asc: { deployedRound: null, defeated: false, shardsBroken: 0, kills: 0, penaltyShard: false, penaltyWasLast: false } })),
    stallBreaks: 0, deckouts: 0, attacks: 0, blocks: 0,
  };

  let turn = 0;
  let active = first;
  let over = false;
  const round = () => Math.floor(turn / 2) + 1;
  const rival = (p) => players[1 - (typeof p === 'number' ? p : p.i)];
  const P = (p) => (typeof p === 'number' ? players[p] : p);

  // ── stats of a champion on the field ──
  const might = (c) => {
    let m = c.def.might + c.mods.m + (c.def.fx.might?.(g, c) ?? 0);
    for (const a of P(c.owner).field) if (a !== c) m += a.def.fx.auraMight?.(g, a, c) ?? 0;
    return Math.max(0, m);
  };
  const guard = (c) => {
    let v = c.def.guard + c.mods.g + (c.def.fx.guard?.(g, c) ?? 0);
    for (const a of P(c.owner).field) if (a !== c) v += a.def.fx.auraGuard?.(g, a, c) ?? 0;
    return Math.max(0, v);
  };
  const val = (c) => baseVal(c.def) + (c.shield ? 2 : 0);
  const canBlock = (b, attacker) => !has(attacker, 'Flight') || has(b, 'Flight') || has(b, 'Reach');
  const canAttack = (c) => !c.exhausted && !c.noAttack && (c.arrivedTurn < turn || has(c, 'Charge')) && !(R.ascendMode === 'noAttack' && c.ascendedTurn === turn);

  // ── game API used by card fx ──
  const g = {
    rival: (p) => rival(p).i,
    behind: (p) => P(p).crown.length < rival(p).crown.length,
    scorch: (c, n) => { if (c && c !== 'crown') c.mods.g -= n; },
    scorchAll: (q, n) => P(q).field.forEach((c) => (c.mods.g -= n)),
    scorchBest: (q, n) => {
      const targets = P(q).field;
      if (!targets.length) return;
      const mine = rival(q).field.filter((c) => !c.exhausted);
      const killable = targets.filter((t) => mine.some((a) => might(a) >= guard(t) - n && might(a) > 0));
      const pool = killable.length ? killable : targets;
      pool.sort((a, b) => val(b) - val(a))[0].mods.g -= n;
    },
    buff: (c, m, gd) => { c.mods.m += m; c.mods.g += gd; },
    buffAll: (p, m, gd) => P(p).field.forEach((c) => { c.mods.m += m; c.mods.g += gd; }),
    buffOthers: (me, m, gd) => P(me.owner).field.forEach((c) => { if (c !== me) { c.mods.m += m; c.mods.g += gd; } }),
    shieldBest: (p, exclude) => {
      const c = P(p).field.filter((x) => x !== exclude && !x.shield).sort((a, b) => val(b) - val(a))[0];
      if (c) c.shield = true;
    },
    shieldAll: (p) => P(p).field.forEach((c) => (c.shield = true)),
    draw: (p, n) => { for (let k = 0; k < n; k++) drawCard(P(p)); },
    returnFallen: (p, n) => {
      const pl = P(p);
      for (let k = 0; k < n; k++) {
        const pick = pl.fallen.filter((d) => d.kind === 'champion').sort((a, b) => b.cost - a.cost)[0];
        if (!pick) return;
        pl.fallen.splice(pl.fallen.indexOf(pick), 1);
        pl.hand.push(pick);
      }
    },
    deployFree: (p, maxCost) => {
      const pl = P(p);
      if (pl.field.length >= 4) return;
      const pick = pl.hand.filter((d) => d.kind === 'champion' && d.cost <= maxCost).sort((a, b) => b.cost - a.cost)[0];
      if (pick) deploy(pl, pick, true);
    },
    mend: (p, n) => {
      const pl = P(p);
      for (let k = 0; k < n && pl.crown.length < R.shards && pl.hand.length; k++) {
        const cheapest = [...pl.hand].sort((a, b) => cardWorth(a) - cardWorth(b))[0];
        pl.hand.splice(pl.hand.indexOf(cheapest), 1);
        pl.crown.push(cheapest);
      }
    },
    defeatAllGuardAtMost: (q, x) => {
      for (const c of [...P(q).field]) if (guard(c) <= x) tryDefeat(c, 'WORLD IN FLAMES');
    },
    stopOthersAttacking: (me) => P(me.owner).field.forEach((c) => { if (c !== me) c.noAttack = true; }),
    readyOncePerTurn: (me) => { if (me.readiedTurn !== turn && me.owner === active) { me.readiedTurn = turn; me.exhausted = false; } },
  };

  const cardWorth = (d) => (d.kind === 'champion' ? d.might + d.guard : d.kind === 'scheme' ? 3 : 2) + (d.shardfall ? -1 : 0);

  function drawCard(pl) {
    if (over) return;
    if (!pl.deck.length) { stats.deckouts++; say('deck empty: breaks own shard'); breakShard(pl, 'deckout'); return; }
    pl.hand.push(pl.deck.pop());
  }

  function deploy(pl, def, free = false) {
    if (!free) pl.cmd -= def.cost;
    pl.hand.splice(pl.hand.indexOf(def), 1);
    const c = { uid: ++uid, owner: pl.i, def, cards: [def], exhausted: false, arrivedTurn: turn, ascendedTurn: -1, shield: false,
      mods: { m: 0, g: 0 }, blocking: false, noAttack: false, readiedTurn: -1 };
    pl.field.push(c);
    say(`deploys ${def.name} ★${free ? ' (free)' : ''}`);
    if (isAscendant(def)) stats.p[pl.i].asc.deployedRound ??= round();
    def.fx.arrive?.(g, c);
    return c;
  }

  function ascend(pl, c, next) {
    pl.cmd -= next.cost;
    pl.asc.splice(pl.asc.indexOf(next), 1);
    c.cards.push(next);
    c.def = next;
    c.ascendedTurn = turn;
    pl.ascendedOn = turn;
    if (R.ascendMode === 'exhaust') c.exhausted = true;
    const s = stats.p[pl.i];
    s.ascends++;
    if (next.star > s.maxStar) s.maxStar = next.star;
    if (next.star === 2 && s.star2Round == null) s.star2Round = round();
    if (next.star === 3 && s.star3Round == null) s.star3Round = round();
    say(`ASCENDS ${next.name} to ${'★'.repeat(next.star)}`);
    next.fx.ascend?.(g, c);
  }

  function tryDefeat(c, why) {
    if (c.shield) { c.shield = false; say(`${c.def.name}'s Shield breaks instead (${why})`); return false; }
    defeat(c, why);
    return true;
  }

  function defeat(c, why) {
    const pl = P(c.owner);
    const i = pl.field.indexOf(c);
    if (i < 0) return;
    pl.field.splice(i, 1);
    pl.fallen.push(...c.cards);
    say(`${c.def.name} ${'★'.repeat(c.def.star)} is defeated (${why})`);
    if (isAscendant(c.def)) {
      const a = stats.p[pl.i].asc;
      a.defeated = true;
      if (R.tierV === 'shard') {
        a.penaltyShard = true;
        if (pl.crown.length === 1) a.penaltyWasLast = true;
        breakShard(pl, 'ascendant');
      } else if (R.tierV === 'spoils') g.draw(rival(pl).i, 1);
    }
  }

  function breakShard(pl, reason) {
    if (over) return;
    const card = pl.crown.pop();
    if (reason === 'stall') stats.stallBreaks++;
    say(`breaks a shard (${reason}); ${pl.crown.length} left${card ? `, reveals ${card.name}` : ''}`);
    if (card) pl.hand.push(card);
    if (!pl.crown.length) { over = true; stats.winner = rival(pl).i; stats.reason = reason; return; }
    if (card.shardfall) shardfall(pl, card);
  }

  function shardfall(pl, card) {
    if (card.kind === 'scheme') {
      if (pl.schemes.length < 3) {
        pl.hand.splice(pl.hand.indexOf(card), 1);
        pl.schemes.push({ def: card, setTurn: turn });
        stats.p[pl.i].shardfalls++;
        say(`Shardfall: sets ${card.name} free`);
      }
    } else if (card.kind === 'tactic' && tacticUseful(pl, card)) {
      pl.hand.splice(pl.hand.indexOf(card), 1);
      pl.fallen.push(card);
      stats.p[pl.i].shardfalls++;
      say(`Shardfall: casts ${card.name} free`);
      card.fx.cast?.(g, pl.i);
    }
  }

  function tacticUseful(pl, d) {
    const q = rival(pl);
    switch (d.ai) {
      case 'draw': return pl.hand.length <= 5;
      case 'recur': return pl.fallen.some((x) => x.kind === 'champion') && pl.hand.filter((x) => x.kind === 'champion').length <= 1;
      case 'deployFree': return pl.field.length < 4 && pl.hand.some((x) => x.kind === 'champion' && x.cost <= 2);
      case 'shield': return pl.field.filter((c) => !c.shield).length >= 2;
      case 'scorchAll': return q.field.length >= 2;
      case 'scorchOne': return q.field.length >= 1 && pl.field.some((c) => canAttack(c));
      case 'preAttackBuff': return pl.i === active && pl.field.filter((c) => canAttack(c)).length >= 2;
      default: return false;
    }
  }

  // ── turn structure ──
  function rise(pl) {
    for (const c of pl.field) { c.exhausted = false; c.noAttack = false; }
    if (round() >= R.stallRound) breakShard(pl, 'stall');
    if (over) return;
    pl.cmdMax = Math.min(R.commandMax, pl.cmdMax + 1);
    pl.cmd = pl.cmdMax + (turn === 1 && R.secondPlayerCommand ? 1 : 0); // second player's first turn: +1 Command
    if (turn !== 0) drawCard(pl);
  }

  function endTurn(pl) {
    for (const x of players) for (const c of x.field) { c.mods = { m: 0, g: 0 }; c.blocking = false; }
    while (pl.hand.length > 8) {
      const worst = [...pl.hand].sort((a, b) => cardWorth(a) - cardWorth(b))[0];
      pl.hand.splice(pl.hand.indexOf(worst), 1);
      pl.fallen.push(worst);
    }
  }

  // ── bot: main phase ──
  function mainPhase(pl) {
    const q = rival(pl);
    // Set Schemes (free).
    for (const d of pl.hand.filter((x) => x.kind === 'scheme')) {
      if (pl.schemes.length >= 3) break;
      pl.hand.splice(pl.hand.indexOf(d), 1);
      pl.schemes.push({ def: d, setTurn: turn });
      say(`sets a Scheme`);
    }
    const reserve = () => (pl.schemes.some((s) => s.def.cost > 0) && pl.cmdMax >= 4 ? 1 : 0);

    // Ascendant first when possible.
    const asd = pl.hand.find((d) => d.kind === 'champion' && isAscendant(d));
    if (asd && pl.cmd >= asd.cost && pl.field.length < 4 && (R.tierV !== 'crowning' || pl.crown.length < R.shards)) deploy(pl, asd);

    // Free/cheap tactics that add bodies or cards first.
    castTactics(pl, ['deployFree', 'recur', 'draw']);

    // Choose actions greedily by value per Command: deploys and (one) ascend.
    const openCrown = q.field.filter((b) => !b.exhausted).length === 0;
    const options = [];
    for (const c of (R.ascendAfterBattle && policy[pl.i] !== 'always' ? pl.field.filter((x) => preBattleAscendWorth(pl, x)) : pl.field)) {
      if (c.arrivedTurn >= turn) continue; // must be on the field since the turn began
      const next = pl.asc.find((d) => d.canonId === c.def.canonId && d.star === c.def.star + 1);
      if (!next) continue;
      let value = baseVal(next) - baseVal(c.def) + (next.fx.ascend ? 3 : 0);
      if (R.ascendMode !== 'free' && canAttack(c)) value -= openCrown ? c.def.crown * 5 : bestAttackValue(c);
      if (R.ascendMode === 'exhaust' && q.field.some((x) => x.arrivedTurn < turn + 1)) value -= pl.crown.length <= 2 ? 6 : 2;
      // policy: 'smart' weighs the drawback; 'always' ascends whenever able (value floor 50); 'never' doesn't.
      if (policy[pl.i] === 'always') value = Math.max(value, 50);
      if (policy[pl.i] !== 'never' && value > 0) options.push({ kind: 'ascend', c, next, cost: next.cost, value });
    }
    for (const d of pl.hand.filter((x) => x.kind === 'champion' && !isAscendant(x))) options.push({ kind: 'deploy', d, cost: d.cost, value: d.might + d.guard + (d.fx.arrive ? 2 : 0) });
    options.sort((a, b) => b.value / Math.max(1, b.cost) - a.value / Math.max(1, a.cost));
    let ascended = false;
    const chosen = [];
    let budget = pl.cmd - reserve();
    let zones = 4 - pl.field.length;
    for (const o of options) {
      if (o.cost > budget) continue;
      if (o.kind === 'ascend') { if (ascended) continue; ascended = true; }
      if (o.kind === 'deploy') { if (zones <= 0) continue; zones--; }
      budget -= o.cost;
      chosen.push(o);
    }
    for (const o of chosen.filter((o) => o.kind === 'ascend')) if (pl.field.includes(o.c)) ascend(pl, o.c, o.next);
    for (const o of chosen.filter((o) => o.kind === 'deploy')) if (pl.hand.includes(o.d) && pl.cmd >= o.d.cost && pl.field.length < 4) deploy(pl, o.d);

    castTactics(pl, ['scorchAll', 'scorchOne', 'shield', 'preAttackBuff']);
  }

  // With after-battle Ascending, the weighing bot Ascends before battle only when the Ascend trigger helps
  // this turn's attacks (a Scorch or Shield) or the champion can't attack anyway.
  function preBattleAscendWorth(pl, c) {
    const next = pl.asc.find((d) => d.canonId === c.def.canonId && d.star === c.def.star + 1);
    if (!next) return false;
    return (next.fx.ascend && rival(pl).field.length > 0) || !canAttack(c);
  }

  function postBattleAscend(pl) {
    if (pl.ascendedOn === turn || policy[pl.i] === 'never' || over) return;
    let best = null;
    for (const c of pl.field) {
      if (c.arrivedTurn >= turn) continue;
      const next = pl.asc.find((d) => d.canonId === c.def.canonId && d.star === c.def.star + 1);
      if (!next || next.cost > pl.cmd) continue;
      let value = baseVal(next) - baseVal(c.def);
      if (!c.exhausted && R.ascendMode === 'exhaust' && policy[pl.i] !== 'always') value -= pl.crown.length <= 2 ? 8 : 3;
      if (!best || value > best.value) best = { c, next, value };
    }
    if (best && (best.value > 0 || policy[pl.i] === 'always')) ascend(pl, best.c, best.next);
  }

  function castTactics(pl, tags) {
    for (const tag of tags) {
      for (const d of pl.hand.filter((x) => x.kind === 'tactic' && !x.swift && x.ai === tag)) {
        if (over) return;
        if (pl.cmd < d.cost || !tacticUseful(pl, d)) continue;
        pl.cmd -= d.cost;
        pl.hand.splice(pl.hand.indexOf(d), 1);
        pl.fallen.push(d);
        stats.p[pl.i].tactics++;
        say(`casts ${d.name}`);
        d.fx.cast?.(g, pl.i);
      }
    }
  }

  // ── clash prediction ──
  function predict(a, d, opts = {}) {
    const am = might(a) + (opts.am ?? 0);
    const ag = guard(a) + (opts.ag ?? 0);
    const dm = might(d) + (opts.dm ?? 0);
    const dg = guard(d) + (opts.dg ?? 0);
    let dDies = am > 0 && am >= dg && !(d.shield || opts.dShield);
    let aDies = dm > 0 && dm >= ag && !(a.shield || opts.aShield);
    if (opts.ambush && dDies) aDies = false;
    return { aDies, dDies };
  }

  function bestAttackValue(a) {
    const q = rival(a.owner);
    let best = 0;
    for (const t of q.field) {
      const r = predict(a, t, { ambush: has(a, 'Ambush') && t.exhausted });
      const v = (r.dDies ? val(t) : 0) - (r.aDies ? val(a) : 0);
      if (v > best) best = v;
    }
    return best;
  }

  // ── bot: battle phase ──
  function battlePhase(pl) {
    const q = rival(pl);
    for (let guardRail = 0; guardRail < 12 && !over; guardRail++) {
      const attackers = pl.field.filter(canAttack);
      if (!attackers.length) return;
      let best = null;
      for (const a of attackers) {
        const blockers = q.field.filter((b) => !b.exhausted && canBlock(b, a));
        // Crown
        let crownV;
        if (!blockers.length) crownV = a.def.crown * 10 + (q.crown.length <= a.def.crown ? 1000 : 0);
        else {
          const outcomes = blockers.map((b) => predict(a, b, { dm: b.def.canonId === 'grizz' ? 2 : 0, ag: b.def.canonId === 'ignara' ? -2 : 0 }));
          const worst = outcomes.some((o) => o.aDies && !o.dDies) ? -val(a) : outcomes.some((o) => o.aDies) ? -val(a) / 2 : 3;
          crownV = attackers.length > blockers.length ? Math.max(worst, a.def.crown * 6) : worst;
        }
        consider(a, 'crown', crownV);
        for (const t of q.field) {
          const r = predict(a, t, { ambush: has(a, 'Ambush') && t.exhausted });
          consider(a, t, (r.dDies ? val(t) + (t.exhausted ? 0 : 2) : 0) - (r.aDies ? val(a) : 0) - (r.dDies ? 0 : 1));
        }
      }
      function consider(a, t, v) { if (!best || v > best.v) best = { a, t, v }; }
      // Holding back: keep a ready blocker when low on shards and the rival has attackers.
      const threat = q.field.length && pl.crown.length <= 2;
      const threshold = threat ? 2 : 0;
      if (!best || best.v <= threshold) return;
      attack(pl, best.a, best.t);
    }
  }

  function attack(pl, a, target) {
    const q = rival(pl);
    stats.attacks++;
    a.exhausted = true;
    say(`${a.def.name} ${'★'.repeat(a.def.star)} attacks ${target === 'crown' ? 'the Crown' : target.def.name}`);
    a.def.fx.attack?.(g, a, target);
    if (!pl.field.includes(a)) return;
    let defender = null;
    const isCrown = target === 'crown';
    if (!isCrown) {
      if (!q.field.includes(target)) return; // defeated by an attack trigger
      defender = target;
      target.def.fx.attacked?.(g, target, a);
    } else {
      const b = chooseBlock(q, a);
      if (b) setBlock(b, a);
      defender = b;
    }
    const wasExhausted = !isCrown && target.exhausted;

    // Response window: defender one Scheme or Swift, then attacker one Swift.
    const veiled = defenderResponds(q, a, defender, isCrown, (b) => { defender = b; });
    if (veiled || over) return finish();
    attackerResponds(pl, a, defender);
    if (over) return finish();
    if (!pl.field.includes(a)) return finish();

    if (defender && q.field.includes(defender)) {
      const am = might(a), ag = guard(a), dm = might(defender), dg = guard(defender);
      const ambush = has(a, 'Ambush') && wasExhausted;
      let dDies = am > 0 && am >= dg;
      let aDies = dm > 0 && dm >= ag;
      if (ambush && dDies) {
        const really = tryDefeat(defender, 'clash');
        if (really) { aDies = false; a.def.fx.defeats?.(g, a, defender); }
        if (aDies && !over) tryDefeat(a, 'clash');
      } else {
        let dGone = false;
        if (dDies) dGone = tryDefeat(defender, 'clash');
        if (aDies && !over) tryDefeat(a, 'clash');
        if (dGone && pl.field.includes(a) && !over) a.def.fx.defeats?.(g, a, defender);
        if (dGone && isCrown && R.breakthrough && pl.field.includes(a) && !over) breakShard(q, 'breakthrough');
      }
      return finish();
    }
    if (isCrown && !over) {
      for (let k = 0; k < a.def.crown && !over; k++) {
        if (isAscendant(a.def)) stats.p[pl.i].asc.shardsBroken++;
        breakShard(q, 'attack');
      }
    }
    return finish();
    function finish() { if (defender) defender.blocking = false; }
  }

  function setBlock(b, a) {
    stats.blocks++;
    b.blocking = true;
    if (!has(b, 'Bulwark')) b.exhausted = true;
    say(`${b.def.name} blocks`);
    b.def.fx.block?.(g, b, a);
  }

  function chooseBlock(q, a) {
    const d = a.def.crown;
    const left = q.crown.length;
    let best = null;
    for (const b of q.field.filter((x) => !x.exhausted && canBlock(x, a))) {
      const r = predict(a, b, { dm: b.def.canonId === 'grizz' ? 2 : 0, ag: b.def.canonId === 'ignara' ? -2 : 0 });
      let s;
      if (!r.dDies && r.aDies) s = 100 + val(a);
      else if (!r.dDies) s = 50;
      else if (r.aDies) s = val(a) - val(b) + (left <= d + 1 ? 30 : 0) + 1;
      else s = left <= d ? 80 : left <= d + 1 ? 8 - val(b) / 2 : -100;
      if (!best || s > best.s) best = { b, s };
    }
    return best && best.s > 0 ? best.b : null;
  }

  function springable(q) {
    return q.schemes.filter((s) => s.setTurn < turn && s.def.cost <= q.cmd);
  }

  function useScheme(q, s) {
    q.schemes.splice(q.schemes.indexOf(s), 1);
    q.cmd -= s.def.cost;
    q.fallen.push(s.def);
    stats.p[q.i].schemes++;
    say(`P${q.i + 1} springs ${s.def.name}`);
  }

  function useSwift(pl, d, target) {
    pl.cmd -= d.cost;
    pl.hand.splice(pl.hand.indexOf(d), 1);
    pl.fallen.push(d);
    stats.p[pl.i].tactics++;
    say(`P${pl.i + 1} casts ${d.name} (Swift)`);
    d.fx.swift(g, target);
  }

  function defenderResponds(q, a, defender, isCrown, setDefender) {
    const left = q.crown.length;
    const r = defender ? predict(a, defender) : null;
    for (const s of springable(q)) {
      const k = s.def.ai;
      if (k === 'schemeVeil' && isCrown && !defender && (a.def.crown === 2 || left <= 3)) { useScheme(q, s); return true; }
      if (k === 'schemeGate' && isCrown && !defender) {
        const cand = q.field.filter((b) => canBlock(b, a)).map((b) => ({ b, r: predict(a, b) }))
          .sort((x, y) => (x.r.dDies - y.r.dDies) || (y.r.aDies - x.r.aDies) || (val(x.b) - val(y.b)))[0];
        if (cand && (!cand.r.dDies || left <= a.def.crown + 1)) {
          useScheme(q, s);
          cand.b.exhausted = false;
          setBlock(cand.b, a);
          setDefender(cand.b);
          return false;
        }
      }
      if (!defender) continue;
      if (k === 'schemeShield' && r.dDies && !defender.shield) { useScheme(q, s); defender.shield = true; return false; }
      if (k === 'schemeGuard' && r.dDies && !predict(a, defender, { dg: 3 }).dDies) { useScheme(q, s); g.buff(defender, 0, 3); return false; }
      if (k === 'schemeWeaken' && (r.dDies && !predict(a, defender, { am: -2 }).dDies)) { useScheme(q, s); g.buff(a, -2, 0); return false; }
      if (k === 'schemeScorch' && !r.aDies && predict(a, defender, { ag: -2 }).aDies) { useScheme(q, s); g.scorch(a, 2); return false; }
    }
    if (!defender) return false;
    for (const d of q.hand.filter((x) => x.swift && x.cost <= q.cmd)) {
      if (d.ai === 'swiftGuard' && r.dDies && !predict(a, defender, { dg: 2 }).dDies) { useSwift(q, d, defender); return false; }
      if (d.ai === 'swiftMight' && !r.aDies && predict(a, defender, { dm: 2 }).aDies) { useSwift(q, d, defender); return false; }
    }
    return false;
  }

  function attackerResponds(pl, a, defender) {
    if (!defender) return;
    const r = predict(a, defender);
    for (const d of pl.hand.filter((x) => x.swift && x.cost <= pl.cmd)) {
      if (d.ai === 'swiftGuard' && r.aDies && !predict(a, defender, { ag: 2 }).aDies) return useSwift(pl, d, a);
      if (d.ai === 'swiftMight' && !r.dDies && predict(a, defender, { am: 2 }).dDies) return useSwift(pl, d, a);
    }
  }

  // ── setup ──
  for (const pl of players) {
    for (let k = 0; k < R.shards; k++) pl.crown.push(pl.deck.pop());
    const handSize = R.secondPlayerCard && pl.i !== first ? 6 : 5;
    for (let k = 0; k < handSize; k++) pl.hand.push(pl.deck.pop());
    if (!pl.hand.some((d) => d.kind === 'champion' && d.cost <= 2)) {
      pl.deck.push(...pl.hand.splice(0));
      shuffle(pl.deck);
      for (let k = 0; k < handSize; k++) pl.hand.push(pl.deck.pop());
    }
  }

  // ── play ──
  for (; !over && turn < 60; turn++) {
    active = (first + turn) % 2;
    const pl = players[active];
    rise(pl);
    if (over) break;
    mainPhase(pl);
    if (!over) battlePhase(pl);
    if (!over && R.ascendAfterBattle) postBattleAscend(pl);
    endTurn(pl);
  }
  stats.rounds = round();
  // Card conservation: every card a player started with is still somewhere.
  stats.cardCounts = players.map((pl) => pl.deck.length + pl.hand.length + pl.crown.length + pl.fallen.length + pl.asc.length
    + pl.schemes.length + pl.field.reduce((n, c) => n + c.cards.length, 0));
  if (!over) { stats.reason = 'turn-cap'; stats.winner = null; }
  return stats;
}
