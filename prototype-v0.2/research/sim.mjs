// Batch simulator: runs seeded bot-vs-bot games under rule variants and summarises them.
// Usage: node prototype-v0.2/tools/sim.mjs [gamesPerVariant=2000] [--write]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { playGame } from './engine.mjs';

const N = Number(process.argv[2] ?? 2000);
const WRITE = process.argv.includes('--write');

export function runBatch(rules, n = N, seed0 = 1) {
  const games = [];
  for (let k = 0; k < n; k++) {
    // Alternate seats and first player so neither deck always goes first.
    const swap = k % 2 === 1;
    const first = Math.floor(k / 2) % 2;
    const decks = swap ? ['ember', 'banner'] : ['banner', 'ember'];
    games.push(playGame({ decks, seed: seed0 + k, first, rules }));
  }
  return summarise(games);
}

const pct = (x, n) => (n ? Math.round((1000 * x) / n) / 10 : 0);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const quant = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : null; };

export function summarise(games) {
  const n = games.length;
  const deckWins = { banner: 0, ember: 0 };
  let firstWins = 0, capped = 0;
  const reasons = {};
  const rounds = [];
  const star2 = [], star3 = [];
  let reached2 = 0, reached3 = 0, seats = 0;
  const tierV = { banner: blank(), ember: blank() };
  function blank() { return { games: 0, deployed: 0, deployedRounds: [], defeated: 0, penaltyLast: 0, shardsBroken: 0, winsDeployed: 0, winsNot: 0, notDeployed: 0 }; }
  let attacks = 0, blocks = 0, stall = 0, schemes = 0, shardfalls = 0, ascends = 0;
  for (const s of games) {
    rounds.push(s.rounds);
    reasons[s.reason] = (reasons[s.reason] ?? 0) + 1;
    if (s.winner == null) capped++;
    else {
      deckWins[s.decks[s.winner]]++;
      if (s.winner === s.first) firstWins++;
    }
    attacks += s.attacks; blocks += s.blocks; stall += s.stallBreaks > 0 ? 1 : 0;
    s.p.forEach((p, i) => {
      seats++;
      schemes += p.schemes; shardfalls += p.shardfalls; ascends += p.ascends;
      if (p.maxStar >= 2) { reached2++; star2.push(p.star2Round); }
      if (p.maxStar >= 3) { reached3++; star3.push(p.star3Round); }
      const t = tierV[s.decks[i]];
      t.games++;
      const won = s.winner === i;
      if (p.asc.deployedRound != null) {
        t.deployed++; t.deployedRounds.push(p.asc.deployedRound);
        if (p.asc.defeated) t.defeated++;
        if (p.asc.penaltyWasLast) t.penaltyLast++;
        t.shardsBroken += p.asc.shardsBroken;
        if (won) t.winsDeployed++;
      } else { t.notDeployed++; if (won) t.winsNot++; }
    });
  }
  const tv = (t) => ({
    deployRate: pct(t.deployed, t.games),
    medianDeployRound: median(t.deployedRounds),
    defeatedWhenDeployed: pct(t.defeated, t.deployed),
    penaltyShardWasLast: pct(t.penaltyLast, t.deployed),
    avgShardsBrokenByIt: t.deployed ? Math.round((100 * t.shardsBroken) / t.deployed) / 100 : 0,
    winRateWhenDeployed: pct(t.winsDeployed, t.deployed),
    winRateWhenNot: pct(t.winsNot, t.notDeployed),
  });
  return {
    games: n,
    winRate: { banner: pct(deckWins.banner, n), ember: pct(deckWins.ember, n) },
    firstPlayerWinRate: pct(firstWins, n - capped),
    unfinished: pct(capped, n),
    rounds: { median: median(rounds), p90: quant(rounds, 0.9), max: Math.max(...rounds) },
    endReasons: Object.fromEntries(Object.entries(reasons).map(([k, v]) => [k, pct(v, n)])),
    stallRuleUsed: pct(stall, n),
    evolution: { reachedStar2: pct(reached2, seats), reachedStar3: pct(reached3, seats), medianStar2Round: median(star2), medianStar3Round: median(star3), ascendsPerPlayer: Math.round((100 * ascends) / seats) / 100 },
    perGame: { attacks: Math.round((10 * attacks) / n) / 10, blocks: Math.round((10 * blocks) / n) / 10, schemesSprung: Math.round((10 * schemes) / n) / 10, shardfalls: Math.round((10 * shardfalls) / n) / 10 },
    tierV: { banner: tv(tierV.banner), ember: tv(tierV.ember) },
  };
}

if ((process.argv[1] ?? '').endsWith('sim.mjs')) {
  const base = {}; // engine DEFAULT_RULES = the rulebook
  const variants = {
    baseline: base,
    // Core loop
    noBreakthrough: { breakthrough: false },
    secondPlayerNoCommand: { secondPlayerCommand: false },
    secondPlayerNoCard: { secondPlayerCard: false },
    // Q3: evolution drawback
    ascendFree: { ascendMode: 'free' },
    ascendNoAttack: { ascendMode: 'noAttack' },
    // Q2: Tier V downside options (baseline = 'none')
    tierV_shard: { tierV: 'shard' },
    tierV_spoils: { tierV: 'spoils' },
    tierV_crowning: { tierV: 'crowning' },
    // Q2: value of the Tier V card itself (swapped out on one side only)
    noSol: { replaceAscendant: { banner: 'varr' } },
    noAurex: { replaceAscendant: { ember: 'pyrax' } },
    noSol_shard: { tierV: 'shard', replaceAscendant: { banner: 'varr' } },
    noAurex_shard: { tierV: 'shard', replaceAscendant: { ember: 'pyrax' } },
  };
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)?.split(',');
  const results = {};
  for (const [name, rules] of Object.entries(variants)) {
    if (only && !only.includes(name)) continue;
    results[name] = { rules, ...runBatch(rules) };
    const r = results[name];
    console.log(`${name.padEnd(16)} B ${r.winRate.banner}% E ${r.winRate.ember}% | 1st ${r.firstPlayerWinRate}% | rounds ${r.rounds.median}/${r.rounds.p90} | stall ${r.stallRuleUsed}% | ★★ ${r.evolution.reachedStar2}% ★★★ ${r.evolution.reachedStar3}% | Sol dep ${r.tierV.banner.deployRate}% def ${r.tierV.banner.defeatedWhenDeployed}% | Aurex dep ${r.tierV.ember.deployRate}% def ${r.tierV.ember.defeatedWhenDeployed}%`);
  }
  // Q3: is Ascending a decision? Seat 0 plays a fixed policy, seat 1 the weighing bot.
  const decision = {};
  for (const mode of ['free', 'noAttack', 'exhaust']) {
    decision[mode] = {};
    for (const pol of ['always', 'never', 'smart']) {
      let w = 0;
      for (let k = 0; k < N; k++) {
        const swap = k % 2 === 1, first = Math.floor(k / 2) % 2;
        const s = playGame({ decks: swap ? ['ember', 'banner'] : ['banner', 'ember'], seed: 50000 + k, first, rules: { ascendMode: mode }, policy: [pol, 'smart'] });
        if (s.winner === 0) w++;
      }
      decision[mode][pol + 'VsSmart'] = pct(w, N);
    }
    console.log('ascend', mode.padEnd(9), JSON.stringify(decision[mode]));
  }
  results.evolutionDecision = decision;
  if (WRITE) {
    const out = dirname(fileURLToPath(import.meta.url));
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'sim-results.json'), JSON.stringify({ gamesPerVariant: N, seeds: `1..${N}`, results }, null, 2) + '\n');
    console.log(`wrote validation/sim-results.json`);
  }
}
