# SOVEREIGN'S HAND V0.1 PLAYTEST

Northern Summit Studios · prototype build 0.1.0. Record the exact Git commit from `git rev-parse --short HEAD` when reporting a session. All gameplay identities and visuals are explicitly noncanonical placeholders pending a dedicated original-Crownfall integration pass.

## What you can play

A complete local-AI match: two starters, 15-champion pool, 30-card decks, three fronts, alternating actions, Command, deployment and repositioning, one/two/three-star ascension, six traits, persistent damage, fixed Forge recipes, Crown movement, a hold-to-win claim, victory/defeat/draw, and rematch. Includes menu, teaching rules, card inspection, battle journal, optional Crown audio, skippable eight-second resolution, local resume and deterministic replay export.

## Access and controls

No hosted preview has been verified. The project builds static `dist` output for the intended Vercel project, but no local Vercel linkage or Vercel credential was available. Keep the existing project and connect its normal Git deployment flow; do not replace it. Framework: Vite; build: `npm run build`; output: `dist`. A running cloud development server is internal validation, not a shareable preview.

On your own machine, clone/copy this implementation, install with `npm ci`, and run `npm run dev`. Use the address shown by Vite in that local machine's browser.

1. Choose **Dawn & Steel** or **Root & Ember**, then **Enter the battle**.
2. Select a hand card, then **Deploy here** on a front. Cost is shown on the card.
3. Select a matching hand copy, then **Ascend** on its deployed champion. Costs 1 Command and restores Guard; max three stars.
4. Select a deployed champion to reposition to another front or forge a fixed item. Reposition costs 1 (eligible Strider free move excepted). An item costs 2 components + 1 Command.
5. **Pass action** when ready. Two consecutive passes trigger the battle. **Skip animation** skips presentation only; **Begin round** proceeds after resolution.
6. Reach your Crown endpoint, then win net influence in another battle at the endpoint. Rival influence can reverse the claim. After round 18, Crown position breaks ties; centre draws.
7. Click a rival card to inspect it. **Battle journal** records strikes and casualties; **Export deterministic replay** saves the seed/decks/action stream. The brand button returns to menu with a resume option. Escape dismisses overlays/selections.

## Deliberate omissions

No networking, ranked, matchmaking, full 55-champion roster, all original traits, canonical art/lore, tactic cards, Crown Power draft, exceptional fourth star, commanded Sovereign ability, bosses, Guardian Hunt, campaign, progression, collection economy, paid packs or real-money system. Collector printing metadata exists separately from gameplay; no treatment grants power.

## Evidence and limits

- Frozen `npm ci` completed; TypeScript and production build passed.
- **17 rule/persistence tests passed**, including immutable transitions, legal actions/costs/capacity, ascension, traits, simultaneous damage, Forge, claims/reversals, round cap, replay, corruption rejection, cosmetic equality and AI invariants/privacy.
- **3 Chromium browser tests passed**, including a full seeded match via actual controls through victory and rematch, deployment/AI/resume/export, and a 390px mobile layout with no document overflow.
- **30 seeded AI matches completed**, no stalled matches: 14 first-player wins, 16 second-player wins; median 9 rounds / 107 actions; 90th percentile 13 rounds / 161 actions; six broken claims, 165 ascensions and 61 equipment actions. [Exact simulation output](validation/simulation.json).
- Print kit generated from definitions: two complete starter decks (60 champion cards), 36 reusable items, decklists and reference sheets. Card boxes verified at 2.5 × 3.5 inches without text/footer overlap. Human printing/cutting and physical gameplay have not been tested.

Known limits: balance is provisional; AI models public opposing board replies, not unknown hand plays, and can make tactical mistakes. The UI reveals final board casualties at resolution start and stages front outcomes/Crown movement; it is not a detailed per-champion combat animation. Narrow screens scroll the battlefield sideways and the hand separately. No canonical visual/identity integration or deployed-preview validation has occurred. Physical duration is estimated at 20–31 minutes for a median-sized match; actual tabletop bookkeeping may be slower. Wounds, distinct-identity synergies and locked Might require particular attention in human tests.

## What Jerian should evaluate

**After finishing a match, do you immediately want to play another?**

Play both starters, then compare an early Throne contest with conceding Crown progress to develop the Wild or Forge. Does moving the Crown feel more compelling than watching a health total fall? Does each alternating action force an interesting answer? Are passes, casualties and claims understandable? Does ascension feel earned and satisfying, or does full healing overwhelm counterplay? Can a losing position be recovered without dragging the match out?

For a table test, print the kit and the authoritative [rules](RULES.md). Use physical counters and stacked duplicates. Time decisions and battle resolution separately. Note any step that requires rereading, mental recomputation or an application. Record seed/replay for digital sessions, deck and first player, round count, result, duration, first confusing action and whether you chose a rematch. If replay desire is weak, change the Crown/front loop before adding content.
