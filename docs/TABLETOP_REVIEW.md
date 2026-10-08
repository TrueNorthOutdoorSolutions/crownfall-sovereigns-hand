# Tabletop parity review — V0.1

The screen and table use the same rules in [RULES.md](RULES.md). This review establishes a testable physical component model; it does not claim that a human tabletop session has been conducted.

| Area | Physical execution | V0.1 decision / risk |
| --- | --- | --- |
| Three fronts | Two ordered rows on each labelled front | Three stacks per row, nine champions per player maximum. Need a large table or approximately 24 × 24 inch mat. Printable front labels can replace a mat. |
| Alternating actions | First-player marker, verbal pass, Command counters | No interrupts or hidden action windows. Consecutive passes trigger the battle. Initiative alternates each round. |
| Command | 4 counters initially, rising to 8 | Replace counters each round; no banking. A free move still takes the whole action. |
| Draw / randomness | Shuffle each 30-card deck once; draw 5 then 2 per round | No randomness after shuffling; no generated cards. A coin toss is optional for first player; digital fixes human first. |
| Deployment / movement | Place or move stack to row back | Arrival order is visible. No software ID sorting or complex targeting. |
| Ascension | Tuck matching copy below champion | One, two, three cards = one, two, three stars. Remove wounds on ascent. No ordinary fourth star. |
| Damage | Count row Might, distribute into remaining Guard front-to-back | Maximum three defenders. Wound dice/counters persist. Simultaneous strike retains the attack of killed champions. |
| Traits / control | Six reference entries; count distinct names | Lock starting battle values across all three fronts. Temporary tokens or written totals avoid recalculating effects after each casualty. |
| Wild | Add growth 0–2; remove one wound | Two bounded permanent Might increments per surviving champion. |
| Forge / items | Earn components; exchange two and one Command for fixed recipe | Item cards from open supply, not constructed deck slots. One equipped item per champion. Kit supplies 18 of each recipe. |
| Crown / win | One marker on 13 spaces and one claim marker | Difference of influence moves once; cap at endpoint. Win a later positive-influence battle while holding endpoint. Tie delays, reversal cancels. |
| Round cap | Round counter, 18 maximum | Announced tiebreak by Crown position; centre draws. Keeps depleted-deck matches finite. Review cap after human testing. |
| Sovereigns | Endpoint markers | Physical presence is established; supporting a front is deferred. |
| Tactics / Crown Powers | Future cards with explicit costs and bounded effects | No such effects enabled now. Three-choice offers could be three face-up cards from a fixed Crown Power deck with one discard/redraw reroll. This is a proposal, not a current rule. |
| Collectibility | Printing record references a gameplay ID | Standard/Radiant/Ascended/Sovereign treatments are cosmetics. Champion tier and battlefield stars are independent. No premium stat bonus or paid economy. |

## Simplifications made during review

Ironbound blocks two incoming damage instead of dynamically granting maximum Guard. Removing a trait partner therefore cannot cause a surviving champion's Guard to disappear. Repositioning joins the back of the row instead of using an invisible deployment timestamp. Items use two fixed recipes instead of random software generation. Control uses locked surviving Might, so an ordering choice cannot change a different front's resolution. No engine coupling to Arena exists.

## Remaining bookkeeping and ambiguity review

The implemented action, tie, damage, growth, item, pass, hand-limit, depletion and victory sequences have explicit rules and automated checks. There is no known mechanic that requires a computer. However, 18 champions with persistent wounds and temporary Might modifiers can become tedious. Prefer small dice and a six-entry trait reference; test whether Rally and distinct-identity counting are worth their overhead. If human players struggle, simplify the rules further instead of adding a compulsory companion app.

The most likely confusion is printed **base Guard** versus Bulwark's extra Guard. The kit labels base Guard explicitly; the screen shows effective Guard. A final print design may show an effective one-star stat plus a revised ability, but must ship the same arithmetic and versioned text. Other likely teaching points are passing without ending the round, why a champion killed simultaneously still attacks, and why a first endpoint claim does not win.

Collector “ASCENDED” treatment must be labelled “Collector treatment” to avoid implying ★★/★★★ gameplay. Gameplay fields are in `content/prototype.ts`; printing-only fields are in `content/editions.ts`. Match state accepts only gameplay IDs.

## Match duration estimate

Initial bot sample: 30 matches, median 9 rounds / 107 actions, 90th percentile 13 rounds / 161 actions. Six claim reversals, 165 ascensions and 61 equipment actions occurred. All ended; zero draws. Bots alternate deck assignments; this small sample does not prove balance or AI strength.

At 8–12 seconds per human decision and 35–60 seconds per physical battle, a median-sized match would take roughly **20–31 minutes**, before initial teaching/setup. An inexperienced pair may take 40–50 minutes. These are estimates, not stopwatch results. The digital eight-second battle animation does not define physical resolution speed. Verify against actual tables; target reduced bookkeeping before expanding the roster.

## Probability review

30 cards, three copies per identity, five-card start, two draws per round (excluding extra Seer draws):

| Cards seen | ≥2 copies of a particular identity | All 3 copies |
| --- | ---: | ---: |
| 5 | 6.4% | 0.2% |
| 9 | 20.7% | 2.1% |
| 13 | 39.7% | 7.0% |
| 17 | 60.3% | 16.7% |
| 21 | 79.3% | 32.8% |

These are hypergeometric probabilities for having **drawn** copies, not probabilities of a surviving three-star board champion. Deployment, discards, casualty timing and the hand cap reduce actual ascension availability. Among 10,000 seeded opening samples, 56.52% contained any duplicate; 29.33% lacked a one-cost card. Every starter card costs at most four, so no opening is unplayable from Command cost alone. Empty/capped hands later in the match are possible and intentional test concerns.

Reproduce math and bot observations with `npm run simulate -- 30`. Do not equate simulations or legal openings with replay desire. Initial choices remain hypotheses: 30 cards, two draws, 4→8 Command, ascension healing, Crown ±6, 18-round cap.

## Print kit

`npm run print:cards` generates `public/print-and-play.html` from gameplay definitions and separate Standard printing metadata. It is also generated by the production build. Open the HTML in a browser and print at 100% scale. Cards are 2.5 × 3.5 inches; no canonical artwork is used. Two complete starter decks, fixed-recipe items and reference sheets are included. Use counters, sleeves/backing cards and a labelled table/track. See RULES.md for the complete sequence rather than relying on the abbreviated sheet alone.
