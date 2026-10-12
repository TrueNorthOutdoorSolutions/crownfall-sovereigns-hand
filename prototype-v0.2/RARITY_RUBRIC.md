# Sovereign's Hand: the rarity rubric

**Adopted by Jerian on 2026-10-12 as the permanent standard for every set** (Set 1 digital, Set 2, Set 3 and later).
It comes from the Set 1 + Set 2 design audit (`AUDIT_SETS_1_2.md` §2–3). Use it whenever you design a card, change a card or plan a new set.

## The one rule

**Rarity is set per card, and for champions per star form, by what the card does in play.** It is never set by tier, cost or star.

- A Tier I card can be Mythic; a Tier V card can be Common.
- The three star forms of one champion are scored separately. A Common ★ with an Elite ★★ and a Mythic ★★★ is fine. So is the reverse. There is **no required pattern** (not "★ Common, ★★ Uncommon, ★★★ rare").
- It applies to **every card type**: champions, Monsters, Guardians, Tactics, Schemes, Relics and Edicts all use the same five rarities.
- The **tier** still shows on the trait bar (it means cost and size). The **footer letter** shows rarity.
- Collector chase lives in the printings (Alternate Art, Masterwork, Omega, foils), not in base rarity. Base rarity follows power, like Magic and Duel Masters.

## The five rarities

| | Common (C) | Uncommon (U) | Elite (E) | Epic (P) | Mythic (M) |
| --- | --- | --- | --- | --- | --- |
| **Its job** | Fills a deck and teaches the game | Signposts a plan: "this Class or Origin does X" | A strong card, or the heart of a deck | A big build-around payoff | Game-defining: it bends a rule |
| **Rules clauses** | 0–1 | 1–2 | 2 | 2–3 | Any |
| **Effects it may use** | Stats, keywords, a one-off Scorch or Shield, Draw 1, a small one-turn buff | Class statics at +1/+2, a −1 Sentinel ward, one Relic or Scheme interaction, a conditional draw, one token | Repeatable card advantage, whole-board one-offs, Mend, stealing, free deploy or free attach | Repeatable whole-board effects, engines (Channelers, Binder auras of +1/+1 or more), defeat by Guard, Ready effects, extra Champion Zones | Free or instant Schemes, repeatable Defeat, two free deploys, Ready itself on Ascend, break everything, any card that changes a rule of the game |
| **Body against the tier/star median** | At or 1–2 below the median; a card with no text may be up to 2 above | Within 2 | Within 2 with an effect, up to 3 above with none | Any | Any |
| **Power score** | below 1.5 | 1.5 to 2.9 | 3.0 to 4.2 | 4.3 to 5.7 | 5.8 or more |

A **clause** is one sentence of rules text ("Arrival: Draw a card." is one clause; a keyword is not a clause).

## Floors and limits

- Anything that **bends a rule** of the game is at least **Epic** (for example: you may Ascend twice, an attack breaks extra shards, Schemes can be sprung the turn they are set).
- **Guardians** are Epic by their role (one per deck, a boss).
- **Edicts** are usually **Uncommon**: they affect both players.
- **No Common should be an automatic include** in every deck of its Class or Origin. If it is, raise its rarity or weaken it.
- **Never strictly better at a lower rarity.** If two cards do the same thing, the better one is at least the same rarity. Better still, give one of them a new effect.
- **Cross-set check.** Any ★ can Ascend into any ★★ of the same name from any set, so compare each form with the other set's form at the same star. A form that is strictly worse than its counterpart will never be played; a new form that strictly beats an older vanilla form makes the old card pointless (fix with −1 Might, −1 Guard or +1 cost).

## The power score (how to measure a card)

`Power = Body + Keywords + Mechanic + Combo`, in rough Command points. It is a screening tool: one step away from the expected rarity means "look at it", two or more means "probably wrong". Always read the card before deciding.

**Body**
- Champions: ½ × (Might + Guard − the tier/star median − 2 × (cost − median cost)). Medians: Tier I ★ 4 total stats at cost 1, ★★ 9 at ↑0, ★★★ 15 at ↑1, rising to Tier V ★ 13 at 6, ★★ 18.5 at ↑2, ★★★ 25 at ↑3. A cheaper ↑ cost counts as body.
- Relics: 0.6 per stat point − 0.9 × cost + 1.
- Tactics and Schemes: −0.8 × cost − 0.4; +0.5 for Swift; +0.4 for Shardfall.

**Keywords:** Flight 1, Charge 1 (0.2 on ★★ and ★★★, which can already attack), Ambush 0.8, Bulwark 0.8, Reach 0.4.

**Mechanic (one use):** Scorch N on one champion 0.5 × N, on each rival 1.0 × N; Shield one 1, Shield each 2; Draw 1.3 per card; Command 0.7 each; Mend 2.5; Defeat each with Guard ≤ N 1.2 × N; Defeat one 0.6 × N + 0.5; Steal a Relic 1.5; a random discard 0.8; Break a Relic 0.8; Break a Scheme 0.7; Ready another 1.5, Ready itself 2; tokens 0.7–1.6; a free deploy or attach 0.6–0.8 per Command saved.

**How often it happens (multiply the mechanic):** Arrival or Ascend × 1; Attack × 1.6; Block × 1; on a kill × 0.8; when defeated × 0.7; at the start of your turn × 4; whenever you cast a Tactic × 2.5 (Channelers trigger for at most two Tactics a turn).

**Statics:** aura +1 Might 1.2, +1 Guard 0.8; Sentinel ward 0.7 per point; Hunter +1 Might 0.4; Gladiator +1 Might 0.5; token aura 0.4 per point; Scheme discount 0.5 per point (up to 3); free or instant Schemes 2; Relic discount 0.6.

**Combo (up to 2.5):** +1 for repeatable card or Command advantage; +0.75 for a build-around static; +0.5 for a Tactic engine; +0.5 when the text names another card group (Relics, Schemes, the Fallen pile, tokens, Monsters, Tactics or an Origin); +0.25 for a Class payoff.

**Known blind spots:** the score ignores the card pool (a Relic-breaker is blank against a set without Relics, which is why breakers now have a fallback) and it undervalues free-Ascend Tactics. Spells are compared with other spells.

## Set mix targets

For a set of about 266 numbered cards:

| Rarity | Share | Cards | Packs to see one particular card* |
| --- | --- | --- | --- |
| Common | about 38% | 95–105 | about 18 |
| Uncommon | about 30% | 75–85 | about 24 |
| Elite | about 19% | 45–55 | about 65 |
| Epic | about 9% | 20–26 | about 83 |
| Mythic | about 4.5% | 10–14 | about 160 |

\*From the pack odds in `src/v02/economy/odds.ts`: an average pack holds 5.5 Commons, 3.28 Uncommons, 0.77 Elites, 0.29 Epics and 0.075 Mythics.

**Why these numbers (collecting pace).** A player should meet every Common and Uncommon within the first few dozen packs, so the cards that teach the game and signpost each deck are easy to get. Elite and Epic cards arrive steadily over a season. Mythics stay special but reachable: about 160 packs for one particular Mythic, not 400+. Two things break this pace and must be fixed with rarity, not odds: Epic-power cards printed at Common or Uncommon (they arrive in 25 packs and make the chase meaningless), and too many weak Mythics (each one gets rarer and none feels special).

## Numbering

From Set 2 on, cards are numbered in rarity blocks: Commons first, then Uncommons, Elites, Epics and Mythics. Inside a block the order is champions (by tier), Monsters, Guardians, Tactics and Schemes, Relics, Edicts. Printed cards never change number: if a later rarity change would move one, the block sizes bend around it instead (see `AUDIT_CHANGES.md` for Set 2's exception: 17 Mythics, because printed cards 251 and 252 must stay in the Mythic block).

## Checklist for a new card

1. Write the card. Count its clauses.
2. Score it with the power score and find its band.
3. Check the floors (rule-bending is Epic+, Guardians Epic, Edicts Uncommon).
4. Compare it with every card that does the same thing in every set, and with the same champion's other-set form at the same star.
5. Set its rarity. If the score and your judgment disagree by two steps, write down why.
6. After a batch of changes, count the set against the mix targets above.
