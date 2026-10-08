# Sovereign’s Hand: authoritative prototype rules, version 0.1

Northern Summit Studios · noncanonical Crownfall playtest.

This is the human-readable rules authority for this prototype. `src/game` implements it; tests cover transitions and boundary cases. Any rule change must update this specification and its affected tests together. This document can form the basis of a physical rulebook. None of the temporary champion names, Origins, Classes, items, symbols, or abilities establishes canonical Crownfall lore or Arena rules.

## Objective and components

Two Sovereigns fight over one physical Crown. Control three battlefronts, pull the Crown to your endpoint, and hold your claim through a later battle with positive net influence. There is no Sovereign health total.

For two players, provide:

- Two 30-card champion decks. Each starter contains ten different gameplay identities, three copies each. V0.1 uses the supplied starters; general constructed-deck restrictions are not yet settled.
- Three labelled front areas: **The Wild**, **The Throne**, **The Forge**. Each has two opposing rows, with room for three champion stacks per player. Designate a first position and a back position consistently. Lay cards left to right in your own row; your leftmost card takes damage first. The two rows do not need to align or pair cards.
- A 13-position Crown track, centre plus six positions toward each Sovereign. One Crown marker, two Sovereign endpoint markers, and one claim marker.
- Command counters up to 8 per player; component counters up to 30 per player; a round counter up to 18 and a first-player marker.
- Wound counters or dice (up to 17 on a champion); growth indicators 0/1/2; optional temporary Might counters. Ascension is shown by stacking consumed duplicates under the champion (one, two or three total cards). Separate star indicators can help but are not required.
- A shared reusable item supply: eighteen Tempered Edge cards and eighteen Forged Aegis cards. At most 18 champions can be equipped at once, so either recipe is always available. Items return to the supply when their champion falls.
- The trait reference and these rules. No application, network, secret calculation, or generated card is required.

Tactic cards and Crown Power cards are reserved future component families, not required by this ruleset. Sovereign markers identify endpoints only; commanding a front is intentionally deferred.

## Setup and round refresh

1. Choose different or identical starters; decks may match. Shuffle independently by hand, offer the opponent a cut, and place each deck face down. Digital play uses a seeded Fisher–Yates shuffle instead. No gameplay randomness follows the opening shuffles.
2. Put the Crown at centre. Start with no deployed champions, components, wounds, growth, or claim.
3. Each player draws five cards and receives four Command. Decide the first player by mutual agreement or a coin toss; for comparable testing, alternate first player across rematches. Digital V0.1 makes the human first in round one.
4. The first player acts once, then the other player acts once. Continue alternating. No card has a response window within an action in V0.1.
5. In round two and later, initiative alternates. Give both players `min(8, round + 3)` Command, replacing unspent Command, reset the free Strider move allowance, then each draws two cards.

Maximum hand size is ten. When drawing above ten, reveal and discard the newly drawn excess card(s), one at a time. Do not discard a card of your choice. Empty decks simply stop drawing: no fatigue damage, reshuffle, or loss. Discarded or fallen champion copies do not return to the deck. Hands and deck order are hidden; deck size, discards, resources and all board information are public. Digital AI uses its own hand but never examines the opposing hand contents or either deck order.

## One action

Choose exactly one legal action on your opportunity. Every non-pass action cancels the consecutive-pass count. After the action, the opponent gets the next opportunity. Passing is not conceding: you may act again if your opponent acts instead of passing. Two consecutive passes cause battle resolution immediately.

| Action | Payment | Human sequence |
| --- | --- | --- |
| Deploy | Printed Command cost | Reveal a hand card and place at the **back** of your row on one front. Maximum three champion stacks per row. Resolve its Deploy text immediately; a drawn card cannot be played until a later action. |
| Reposition | 1 Command, or the eligible free Strider move | Move your champion stack and all attached counters/item to the **back** of another front's row with space. It cannot move to its current front or reorder in place. Resolve its Reposition text. |
| Ascend | 1 Command + one matching gameplay card from hand | Tuck the copy under your deployed matching champion. One total card = ★, two = ★★, three = ★★★. Add one star and remove all its wounds. Retain growth, item and row position. Ascending is not deploying; Deploy effects do not fire again. |
| Forge and equip | 1 Command + 2 component counters | Choose one fixed recipe from the shared supply and attach it to one unequipped champion you control. No separate item hand or random item deck. |
| Pass | Nothing | Announce pass. If the preceding action was also a pass, resolve battle. Otherwise give the next opportunity to your opponent. |

No action may spend resources you do not have. Maximum ordinary ascension is ★★★; ★★★★ is not in this prototype. You cannot merge two deployed stacks, reclaim copies, swap/reposition items, equip more than one item, or replace an equipped item. Command does not carry over. Components do carry over.

## Champion statistics and short abilities

Each card has a stable gameplay ID, name, tier, one Origin, one Class, printed cost, base Might, base Guard, and short ability. Champion tier is identity metadata; printed Command cost is the payment. Collector treatment is cosmetic and is never used by these rules.

Calculate current Might by adding printed Might, `2 × (stars − 1)`, growth (0–2), equipment, Rally, applicable Dawnkin bonus, and the card's ability. Calculate maximum Guard by adding printed base Guard, `3 × (stars − 1)`, equipment, and Bulwark. Remaining Guard = maximum Guard minus wounds, minimum zero. Mending removes wound counters; it cannot create extra Guard.

| Ability | Rule |
| --- | --- |
| Bulwark | +1 maximum Guard **per star**. Printed physical cards show base Guard before this bonus; digital cards show computed Guard. |
| Rally | Other friendly champions on this front have +1 Might. Multiple Rally champions stack; each excludes itself. |
| Duelist | +2 Might while it is your only champion on this front. |
| Seer / “Deploy: Draw a card” | Draw one immediately after deploying. Hand-limit rules apply. |
| Smith / “Deploy: Gain a component” | Gain one component counter immediately. |
| Veteran | Each gained star adds +1 extra Might, in addition to the ordinary +2. |
| Wanderer / “Reposition: Mend 1” | Remove one wound after repositioning. This cannot heal beyond maximum Guard. |

Equip **Tempered Edge** for +2 Might or **Forged Aegis** for +3 maximum Guard. These are deliberately fixed, noncanonical recipes. Gaining maximum Guard from equipment increases remaining Guard without removing wound counters.

## Traits

Count **different gameplay identities**, not copies or stars. For example, two Sunward Sentinels count as one distinct Vanguard and one distinct Dawnkin. An identity may contribute to both its Origin and its Class. Ascension stacks never count as multiple champions.

| Trait | Activation | Effect |
| --- | --- | --- |
| Dawnkin | Two distinct Dawnkin in your row on a front | Dawnkin there gain +1 Might. |
| Ironbound | Two distinct Ironbound in your row on a front | Reduce that front's incoming damage by 2 total, minimum zero. |
| Wildborn | Two distinct Wildborn in your row on a front | Those Wildborn mend 1 before battle strikes. |
| Vanguard | Two distinct Vanguards anywhere in your army | Each of your fronts containing a Vanguard reduces incoming damage by 1 total. Stacks with Ironbound. |
| Arcanist | Two distinct Arcanists anywhere in your army | If you win the Throne and at least one of your Arcanists survives there, add 1 influence. |
| Strider | Two distinct Striders anywhere in your army | Your first Strider reposition each round costs 0 Command. Only a free Strider move consumes the allowance. |

Re-evaluate traits after each planning action. At battle start, **lock all trait eligibility and Might values for the entire battle**. Removing casualties on one front does not disable another front's battle trait. Duelist/Rally/Dawnkin Might also stay locked until control is decided. This prevents ambiguous resolution order. Reset temporary values when the full resolution is over.

## Battle resolution: do this by hand

The three fronts strike simultaneously. You may process them Wild → Throne → Forge for clarity, using the same locked starting board and values throughout.

1. **Prepare.** Mark active traits across the full board. Mend eligible Wildborn. Calculate and record each champion's current Might and remaining Guard. Add each row's Might. These numbers are public.
2. **Strike simultaneously.** Each row deals its total locked Might as damage to the opposing row on that front. Reduce incoming damage by the defender's Ironbound and Vanguard blocks, if eligible. Apply damage to the first defending champion: add wounds up to its remaining Guard, then spill excess into the next champion, and then the next. Excess after the final champion is lost. No damage is dealt to Sovereigns or the Crown. A champion killed in this strike still contributed its full starting Might.
3. **Remove fallen stacks.** At zero remaining Guard, discard all copies under that champion, remove its wound/growth indicators, and return its item to the supply. Retain survivors and their damage in row order. A unit cannot strike twice and there are no automatic respawns.
4. **Compare surviving Might.** Add the locked Might of each row's survivors. The greater sum wins the front. A tie, including 0–0, awards no winner, no influence and no front benefit. Do not recalculate Rally or other locked Might after casualties for this comparison.
5. **Award all front benefits.** A Wild winner receives 1 influence; each of its survivors there gains one permanent growth (+1 Might, maximum +2 total) and mends 1. A Throne winner receives 2 influence, plus the eligible Arcanist bonus. A Forge winner receives 1 influence and one component. Wild growth does not retroactively change this battle's outcome or another front's score.
6. **Move the Crown once.** Total each player's influence. Subtract the totals. Move that many spaces toward the player with more influence. Equal totals cause no movement. Stop at the endpoint; excess movement is lost. Digital internal coordinates are +6 toward player 0 and −6 toward player 1; the printed track needs no numerical sign convention.
7. **Check the claim.** At an endpoint, place that player's claim marker. Reaching an endpoint does not immediately win. A player with a claim from an earlier resolution wins only if the Crown is still at that player's endpoint **and** that player wins positive net influence in this resolution. Equal influence delays victory even if the marker stays. If the Crown leaves the endpoint, remove that claim. Reaching the opposite endpoint establishes a new claim rather than instantly winning.
8. **Round limit.** If no claim victory occurred and this was round 18, the player nearer the Crown wins immediately. Centre is a draw. This is a clearly announced prototype time cap, subject to playtesting; it does not silently establish an ordinary Crown claim. Claim victory takes priority over this cap.
9. **Refresh.** If nobody has won, advance the round, alternate initiative, reset Command and the free-move allowance, draw two each, and begin alternating actions. Digital animation lasts eight seconds and can be skipped; animation adds no response window or hidden rule.

### Worked combat and Crown examples

Two different Dawnkin with printed Might 2 each gain +1 each: row Might 6. Against a lone Solstice Blade, the Blade has printed Might 5 + Duelist 2 = 7. The Blade deals 7 into the Dawnkin row; they simultaneously deal 6 into its Guard. If the first Dawnkin has 3 Guard, it falls and 4 damage spills to the next. The Blade's 5 Guard is exhausted and it falls. The remaining Dawnkin wins using its locked Might 3, even though its Dawnkin partner has fallen.

You win the Wild and Throne: 1 + 2 = 3 influence. Rival wins Forge: 1. Net 2 moves the Crown two spaces toward you. If this reaches your endpoint, mark a claim. In the next battle a 2–2 influence tie leaves the claim pending; 3–1 seals victory; 1–3 breaks it. Winning Throne alone against both outside fronts gives 2–2, so neither advances without an extra advantage.

## Information, disputes and versioned cards

No random card generation, secret stat modifier, software simulation, target lottery, or hidden probability is a gameplay effect. Only deck shuffling is random. An AI's evaluation scores are decision aids for its controller, not gameplay rules.

Use the same rules version at both ends of a physical table. For a later balance change, preserve a gameplay ID only when referring to the same gameplay identity and publish a versioned errata sheet. Never silently alter already printed card text. Temporary `shp-*` IDs stay assigned to these prototype identities; authoritative Crownfall identities will receive their own stable IDs, with an explicit migration or replacement map. A display name or collector number must never serve as a gameplay key.

Resolve disputes using this sequence and card definitions. Unsettled production questions—mulligans, general deck construction, tactics, Crown Powers, exceptional fourth-star ascension, recipe variety, commanding Sovereigns, tournament timing and errata governance—are outside V0.1 and grant no implied actions.
