# Validation results: paper prototype 0.2-paper-1

## How to reproduce

```
node prototype-v0.2/tools/snapshot.mjs      # read-only canon + art from Desktop/Crownfall (committed files only)
node prototype-v0.2/tools/validate.mjs      # 475 checks
node prototype-v0.2/tools/sim.mjs 10000 --write
node prototype-v0.2/tools/build-print.mjs   # print kit + PDFs
```

## 1. Structural checks (`validate.mjs`): 475 passed, 0 failed

- **Canon.** All 15 champions match the Crownfall snapshot exactly: name, title, tier, Origins and Classes. Every printed ability name is canonical, and only Tier V champions carry Ascendant.
  - The snapshot covers the full 55-champion roster from Crownfall commit `e07421b`. The Crownfall project was only read (`git show HEAD:`), never modified.
- **Art.** All 31 portraits used (★, ★★, ★★★ for each line) are present and copied from Crownfall's committed assets.
- **Deck legality.** Both decks are exactly 30 cards with at most 2 copies, one Ascendant, an 8-card Ascension Pile, and every Ascension form backed by its earlier form.
- **Truth.** Every *Arrival:*, *Ascend:*, *Attack:*, *Block:* and aura line on a card has a matching implemented effect, and the reverse. Every card fits within 40 words.
- **Determinism.** 300 seeded games replay identically.
- **Conservation.** All 38 cards per player are accounted for at the end of every game. This check caught a real bookkeeping bug (the final broken shard was dropped), which is now fixed.

## 2. Simulation: 10,000 games per variant (bot vs bot)

| Measure | Result | Target |
| --- | --- | --- |
| Banner vs Ember win rate | 53.0% / 47.0% | 48–52% (slightly outside) |
| First-player win rate | 50.8% | 45–55% ✓ |
| Rounds per game (median / 90th percentile / max) | 7 / 10 / 12 | — |
| Estimated length at 60–75 s per turn | median 14–18 min; 90th percentile 20–25 min | 15–20 min (needs a stopwatch) |
| Games that reached the round-10 rule | 11.5% (decided by it: 5.4%) | < 15% ✓ |
| How games ended | normal attack 75.2% · breakthrough 19.4% · stall rule 5.4% | — |
| Players reaching ★★ / ★★★ | 66% / 42% | see note |
| Attacks / blocks / Schemes sprung / Shardfalls per game | 14.8 / 3.9 / 2.8 / 0.6 | — |

**Variants tested** (full numbers in `sim-results.json`):
- Without Breakthrough, the stall rule fires in 16.1% of games instead of 11.5%. Breakthrough stays.
- Without the second player's extra card, the first player wins 57.8%. Without the second player's extra Command, 58.1%. Both compensations stay.
- Tier V and evolution variants are covered in DESIGN_ANSWERS.md.

**Balance changes made from the data:**
- Evolution forms: about +3/+3 per star, and Ascend costs −1.
- Aurex ★: 6/6 → 7/8.
- Firestorm: cost 3 → 2.
- Second player: draws 6 cards at setup.
- Extra Tier V shard penalty: removed.

## 3. What the simulation cannot tell us

- Both seats are played by one heuristic bot. It is cautious with Ascending, plays Schemes greedily, and doesn't bluff. Human win rates, Ascend frequency and game length will differ.
- The time estimate is an assumption. The paper playtest's stopwatch replaces it.
- Fun, clarity and "do you want a rematch?" can only come from people. The PLAYTEST.md gates decide whether to continue.

## 4. Unresolved balance questions to take into the playtest

1. **Banner 53 / Ember 47.** Fen's Guard swings the matchup by about 9 points (Guard 1 vs 2), so Fen is the most sensitive card. Watch it.
2. **Aurex.** Defeated in about half the games where it's played. Does it still *feel* like a dragon landing? (See DESIGN_ANSWERS.md §2.)
3. **Ascendant visibility.** With one copy in 30 cards, each player deploys theirs in only about 35% of games. Should an Ascendant be findable (for example, never placed as a Crown Shard, or a search card)?
4. **★★★ rate is 42%** with a cautious bot. If humans also land below about 50%, lower the ★★★ Ascend costs by 1.
5. **Shardfall fires about 0.6 times per game.** Is that enough for the comeback moments to be felt, or should each deck have more Shardfall cards?
6. **Breakthrough** adds a rule. Do new players understand it on first read?

## 5. Digital vertical slice (added with the playable V0.2)

- **One card source.** `src/v02/content/cards.ts` drives the print kit, the digital engine and the AI. `npm run proto:validate` now runs **616 checks**, including a parity check that every card's stats and text are identical to the paper-tested set (`research/cards.mjs`, the data behind sections 2 and DESIGN_ANSWERS.md).
- **Gameplay tests** (`tests/v02/engine.test.ts`, 28 tests): setup and first-turn bonuses; determinism; the legal-action contract (wrong player, illegal moves rejected with a reason, no mutation); clashes (≥, simultaneous, 0 Might); unblocked hits and ★★★ double hits; blocking, Bulwark, Flight/Reach; Breakthrough; Shield; Ambush; Charge; Ascension rules (on field since the turn began, once per turn, cost, sideways, after-battle window, Ascend effects); Scheme timing, Cinder Veil, Hold the Gate; Shardfall; target choices; the round-10 rule, deck-out, hand limit; victory; and 60 full AI games with card conservation.
- **Engine balance run** (`npm run sim:v02`, 4,000 AI games, `validation/engine-sim.json`): Banner 51.6% / Ember 48.5%, first player 50.5%, rounds median 7 / 90th percentile 10 / max 12, ★★ reached by 65.6% of players and ★★★ by 41.7%. That matches the paper-rules research run (53/47, 50.8%, 7/10/12, 66%, 42%).
- The research simulator that produced the earlier numbers is archived in `research/` for reproducibility (only its import paths changed).
