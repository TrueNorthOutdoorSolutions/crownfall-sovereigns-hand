# Sovereign's Hand: design audit of Set 1 and Set 2
Date 2026-10-12, branch design/set2-season-remix. Report only. Everything marked PROPOSED is for Jerian to decide.
Every card, with its power score and flags, is in `audit-sets-1-2.csv` (526 rows: Set 1's 248 cards plus 8 tokens, Set 2's 266 cards plus 4 tokens).

**Already printed:** Set 2 cards 001–031, 033, 118, 251 and 252. Set 1 is printed and in packs, so Set 1 changes are for a reprint or the digital game only.

**Counts**
- Cards audited: 514 collectible cards plus 12 tokens.
- Set 2 against the rubric: 113 match, 109 one step off, 44 two or more steps off (38 too low, 6 too high).
- Set 1 against the rubric: 89 match, 78 one step off, 81 two or more steps off (20 too low, 61 too high).
- Duplicates: 76 rules clauses appear word for word on 3 or more cards; 31 near-identical templates on 4 or more cards (17 crowded, 8 or more); 10 exact duplicate pairs of spells or Relics.
- Printed Set 2 cards affected: 21 of 35 differ from the rubric, all by one borderline step. No reprint recommended.
- Balance sim (500 games per pairing, read-only): Banner 46.8%, Ember 54.9%, Vault 49.9%, Brood 48.4%. Vault against Ember ends by the round-10 stall rule in 21% of games.

## 1. Top 10 findings

1. **Set 2 Commons and Uncommons are doing Epic work.** 38 Set 2 cards are two or more steps below their power; 13 Commons or Uncommons score at Epic level (e.g. Veilwalker ★ C: a 6/3 Flight + Ambush with a random discard every attack; HEX-3 ★★★ U; Gaia ★★★ U; Titan Rho ★★★ U; ATLAS-Ω ★★ U; Starfire Codex U: draw a card every turn). PROPOSED: promote about 25 unprinted cards one or two steps, which also brings Commons from 117 to about 100.
2. **Identical cards sit at different rarities.** "Ascend: Mend 1. Shield each champion you control." is on Gaia ★★★ (U), Solara ★★★ (E) and Sol ★★ (E); Mirella ★★★ (U) does the same. Titan Rho ★★★ (U) = Varr ★★★ (E). HEX-3 ★★★ (U) = Emberling ★★★ (P) plus a Shield. Set 1 Pandora's Satchel (C) = Merchant Prince (P) plus Shardfall. Set 1 Royal Treasury (P) = Deep Vault (U) at 1 less cost. Set 1 Ascension Rite (P) = Set 2 Crown Hex: Evolution (U). PROPOSED: give one card in each pair a new effect, or the same rarity.
3. **The Mythic Relics are the weakest Mythics.** Crown of the First Realm, Titan's Last Heart, Hourglass of Ash and Fallen King's Blade score Common/Uncommon. Hourglass of Ash (M, 4) = Sanctified Mantle (C, 2) plus 2 Guard; Fallen King's Blade (M) = Crownreaper (U) plus 1 Might and a draw. PROPOSED: redesign as rule-changers, or move to Elite/Epic.
4. **Set 2 Mythics do beat Set 1.** 10 of 11 Mythic champions gain 2.4–6.8 power over the same Set 1 star. Printed Kira ★★★ gains only +0.8 but its repeatable "defeat Guard 4 or less" is rule-bending: keep Mythic. **ATLAS-Ω ★★★ (Epic) is the 8th strongest card in Set 2**: make it Mythic or record why it stays Epic.
5. **Set 2 makes 10 Set 1 ★ cards pointless.** Set 2 Rowan, Kael, Solenne, Shade, Valkara, Ronin, Pyrax, Veilwalker, Veyra and Crownless ★ have Set 1's cost, Might, Guard and keywords plus an ability, so with cross-set Ascension the Set 1 versions are never played (including Set 1 Mythic Veyra/Crownless ★ and Epic Veilwalker/Pyrax ★). Set 2 Mirella ★★ also beats Set 1 Mirella ★★ outright. PROPOSED: −1 Might, −1 Guard or +1 cost on the unprinted Set 2 ★ forms.
6. **Set 1 rarity (= tier) does not match power.** 81 Set 1 cards are two or more steps off: Torren, Bramble and Bolt ★★★ are Common with Epic/Mythic power; Crown of War, Living Arena and Crown of Nothing are Mythic with Common power. PROPOSED: no reprint now; use the Set 1 table (§3.4) for a reprint, the digital pack pool and Set 3.
7. **Seers and Relic-hunters lack fuel.** 12 Set 2 cards make Schemes cheaper (two Mythic: Hexie ★★★, Noctara ★★★) but Set 2 prints only 5 Schemes. 23 Set 2 cards break or steal Relics or break Schemes and are blank against Set 1, which has no Relics. PROPOSED: add 4–6 Schemes; give each breaker a fallback ("If you can't, Scorch 1 a rival champion").
8. **The Sentinel Crown ward stacks without limit.** 14 cards have it and the engine adds them up (−4 to −6 Might on Crown attacks). Vault vs Ember already stalls 21% of games. PROPOSED: "doesn't stack", or a −2 cap.
9. **Channelers + Set 1's free Tactics could break the game.** Zyrak ★ (U: whenever you cast a Tactic, draw) and Zyrak ★★★ (M: also Scorch 1 each rival) with Set 1's eight 0-cost Tactics (Kindling, Steady Coffers, Free Rolls, Coin Flip, Blood Price, Crimson Augury, Soul Tax, Sacrificial Rite). PROPOSED: playtest; consider "the first two Tactics each turn", or Zyrak ★ at Elite.
10. **Documents and wording have drifted.** SETS.md still says 45 Set 2 champions / 240 faces / "Set 2 forms only Ascend into Set 2"; SET2_SEASON_REMIX.md still says one rarity per line, a 25/25/15/20/15 pack mix and "all eight Tier V Mythic". The rulebook doesn't define Break, Take a Relic, discard at random, fighting, attacking a champion. The engine breaks a Scheme **at random** but the text doesn't say so. Steal does nothing if the stealer already holds a Relic. **Queen Vespera's Set 2 ability reuses the Set 1 name "Court of Shadows"** (050, 154; not printed); all 54 other Set 2 names are new.

## 2. Rarity rubric (PROPOSED permanent standard for every set and every card type)

Rarity is set per card (per star form) by its body, its mechanic and what it combos with. Tier never sets it: a Tier I card can be Mythic, a Tier V card Common. A Common ★ with a high-rarity ★★/★★★ is welcome but never required: no fixed patterns. Tactics, Schemes, Relics, Edicts, Monsters and Guardians follow the same five bands.

### 2.1 Benchmarks
Confident about Magic and Yu-Gi-Oh!, fairly confident about Pokémon and One Piece, less sure about Vanguard and Duel Masters details (no web lookups).
- **Magic:** a large set is about 101 C / 80 U / 53–60 R / 15–20 M (≈38/30/22/7%). "New World Order": Commons simple, Uncommons archetype signposts, Rares build-arounds, Mythics splashy and game-defining.
- **Yu-Gi-Oh!:** about half Commons, then Rare, Super, Ultra, Secret; high rarities go to each archetype's boss monsters and engine pieces; reprints often change rarity.
- **Duel Masters:** C/UC/R/VR/SR; bosses VR/SR.
- **Vanguard:** C/R/RR/RRR plus special prints; key Grade 3s RR/RRR.
- **Pokémon:** about 40% C, 30% U; many staples C/U; chase rarities are mostly alternate art of playable cards.
- **One Piece:** C/UC/R/SR/SEC; staples often C/UC; the chase is the parallel art.
- **Lesson:** Sovereign's Hand already has a treatment chase (Alternate Art, Masterwork, Omega, foils), so base rarity can follow the **power model** (Magic, Duel Masters) — the owner's direction.

### 2.2 The five rarities

| | Common | Uncommon | Elite (our Rare) | Epic | Mythic |
| --- | --- | --- | --- | --- | --- |
| **Job** | Fills a deck, teaches the game | Signpost: "this class or Origin does X" | A strong card, or the core of a deck | A big build-around payoff | Game-defining, bends a rule |
| **Rules clauses** | 0–1 | 1–2 | 2 | 2–3 | Any |
| **Effects allowed** | Stats, keywords, a one-off Scorch or Shield, Draw 1, a small buff | Class statics +1/+2, Sentinel −1, one Relic or Scheme interaction, a conditional draw, one token | Repeatable card advantage, whole-board one-offs, Mend, stealing, free deploy or attach | Repeatable whole-board effects, engines (Channeler, Binder ≥ +1/+1), defeat by Guard, Ready effects, extra Zones | Free or instant Schemes, repeatable Defeat, two free deploys, Ready-self on Ascend, break everything |
| **Body vs tier/star median** | Median or 1–2 below; a plain card up to 2 above | ±2 | ±2 with an effect, +3 with none | Any | Any |
| **Power score** | < 1.5 | 1.5–2.9 | 3.0–4.2 | 4.3–5.7 | ≥ 5.8 |

**Floors and limits:** rule-bending is at least Epic; Guardians are Epic by role; Edicts usually Uncommon (they affect both players); no Common should be an automatic include in every deck of its class.

**Stars and Ascend cost:** score each form on its own; a cheaper ↑ cost counts as body. Because of cross-set Ascension, compare each form with the other set's form at the same star: a form strictly worse than its counterpart is never played.

### 2.3 Targets for a set of about 266 cards

| Rarity | Rubric target | Set 2 now | Set 2 by score | Set 1 now | Set 1 by score |
| --- | --- | --- | --- | --- | --- |
| Common | 95–105 (38%) | **117** | 77 | 60 | 74 |
| Uncommon | 75–85 (30%) | 81 | 80 | 68 | 87 |
| Elite | 45–55 (19%) | **31** | 46 | 36 | 47 |
| Epic | 20–26 (9%) | 21 | 45 | 51 | 26 |
| Mythic | 10–14 (4.5%) | 16 | 18 | **33** | 14 |

### 2.4 Collecting pace
From odds.ts a pack holds on average 5.5 Commons, 3.28 Uncommons, 0.77 Elites, 0.29 Epics, 0.075 Mythics (the Hero slot becomes a special printing 8.6% of the time).

| Average packs to see one particular card | C | U | E | P | M |
| --- | --- | --- | --- | --- | --- |
| Set 1 now | 11 | 21 | 47 | 176 | **441** |
| Set 2 now | 21 | 25 | 40 | 73 | 214 |
| Rubric set (100/80/50/24/12) | 18 | 24 | 65 | 83 | 160 |

- Set 2's 13 Epic-power Commons/Uncommons arrive within about 25 packs: **that breaks the pacing goal.** Fix with rarity moves, not odds.
- Set 1's 33 Mythics (many weak) take about 441 packs each.
- Set 2's top 10 are all Mythic except ATLAS-Ω ★★★ (Epic); 11th–20th include HEX-3 ★★★, Gaia ★★★, Titan Rho ★★★ and ATLAS-Ω ★★, all Uncommon.
- Set 1's top cards include Torren, Bolt and Bramble ★★★ (Common) and Borin ★★★ (Uncommon).
- packs.ts currently opens Set 1 only.

## 3. Power against rarity

### 3.1 The power score
`Power = Body + Keywords + Mechanic + Combo` in rough Command points.
- **Body (champions):** ½ × (Might + Guard − tier/star median − 2 × (cost − median cost)). Medians from Tier I ★ 4 stats at cost 1, ★★ 9 at ↑0, ★★★ 15 at ↑1, up to Tier V ★ 13 at 6, ★★ 18.5 at ↑2, ★★★ 25 at ↑3. Relics: 0.6 per stat − 0.9 × cost + 1. Spells: −0.8 × cost − 0.4, +0.5 Swift, +0.4 Shardfall.
- **Keywords:** Flight 1, Charge 1 (0.2 on ★★/★★★), Ambush 0.8, Bulwark 0.8, Reach 0.4.
- **Mechanic (one-off):** Scorch N one 0.5N, each 1.0N; Shield 1, Shield each 2; Draw 1.3/card; Command 0.7; Mend 2.5; Defeat each Guard ≤ N 1.2N, Defeat one 0.6N+0.5; Steal 1.5; discard 0.8; Break Relic 0.8; Break Scheme 0.7; Ready another 1.5, Ready itself 2; tokens 0.7–1.6; free deploy/attach 0.6–0.8 per Command.
- **Frequency:** Arrival/Ascend ×1; Attack ×1.6; Block ×1; on a kill ×0.8; when defeated ×0.7; start of turn ×4; whenever you cast a Tactic ×2.5.
- **Statics:** aura +1 Might 1.2, +1 Guard 0.8; Sentinel 0.7/point; Hunter 0.4; Gladiator 0.5; token aura 0.4/point; Scheme discount 0.5/point (cap 3); free or instant Schemes 2; Relic discount 0.6.
- **Combo (cap 2.5):** +1 repeatable card/resource advantage; +0.75 build-around static; +0.5 Tactic engine; +0.5 cross-card synergy (text naming Relics, Schemes, Fallen, tokens, Monsters, Tactics or an Origin); +0.25 class payoff.
- Rule-bending sets an Epic floor. Spells are banded against spells (38/30/19/9/4.5% pyramid). Edicts Uncommon, Guardians Epic by role.
- **Limits:** a screening tool. It ignores the card pool (Relic-breakers blank against Set 1) and undervalues free-Ascend spells. One step = "look at it"; two or more = "probably wrong". §9 recommendations were checked by reading each card.

### 3.2 Set 2, unprinted: rarity too low (PROPOSED band in brackets)
**Two or more steps low**
- Champions: 140 HEX-3 ★★★ U→M (6.0); 160 Gaia ★★★ U→M (5.8); 056 Veilwalker ★ C→P (4.6); 217 Veilwalker ★★★ E→M (6.5); 155 Titan Rho ★★★ U→P (5.4); 165 ATLAS-Ω ★★ U→P (5.4); 142 Dreadmouth ★★★ U→P (5.3); 149 Blacktide ★★ U→P (5.3); 122 Fen ★★★ U→P (4.9); 157 Elysian ★★ U→P (4.8); 137 Dax ★★ U→P (4.7); 132 Mirella ★★★ U→P (4.5); 151 Knuckle ★★★ U→P (4.5); 147 Ignara ★★★ U→P (4.3); 152 Zyrak ★ U→P (4.3); 153 Astryon ★★ U→P (4.3); 035 HEX-3 ★★ C→E (3.8); 054 Elysian ★ C→E (3.6); 055 Varr ★ C→E (3.5); 045 Blacktide ★ C→E (3.3); 057 Gaia ★ C→E (3.3); 058 Gaia ★★ C→E (3.3).
- Relics: 188 Starfire Codex U→P (4.5); 108 Sanctified Mantle C→E; 083 Crown Tear C→E.
- Spells (the score overrates these): 178 The Ascension Vault Opens U→M; 068 Something Stirs, 071 Old Power, 066 Crown Hex: Void, 069 Its Treasure Is Yours C→P; 179 The Crown Is Divided U→P; 073 The Guardian Enrages, 065 Crown Hex: Fortune, 074 The Tide Will Turn, 064 Unbinding Charm, 067 Pack Leader C→E.

**One step low**
- Champions: 240 ATLAS-Ω ★★★ P→M (8.2); 234 Dax ★★★ P→M; 230 Nyx ★★★ P→M. E→P: 211 Blacktide ★★★, 224 Veyra ★★, 204 Shade ★★★, 213 Zyrak ★★, 222 Sol ★★, 200 Nyx ★★, 220 Aurex ★★, 216 Varr ★★★, 221 Noctara ★★, 199 Solara ★★★, 209 Orion ★★★, 225 Mother ★★. U→E: 124 Nyx ★, 163 Aurex ★, 141 Valkara ★★, 119 Grimm ★★★, 127 Bolt ★★★, 134 Borin ★★★, 168 Mother ★, 159 Veilwalker ★★, 123 Torren ★★★, 129 Solenne ★★★, 167 Veyra ★, 120 Pip ★★★, 130 Grizz ★★★, 156 Pyrax ★★, 154 Vespera ★★. C→U: 038 Dreadmouth ★★, 046 Aurelia ★, 036 Valkara ★, 052 Titan Rho ★★, 059 Lady Volt ★, 034 HEX-3 ★, 043/044 Ignara ★/★★, 048 Knuckle ★★, 049 Astryon ★, 051 Titan Rho ★, 061 ATLAS-Ω ★, 050 Vespera ★, 060 Vessimer ★, 042 Ronin ★, 047 Knuckle ★, 053 Pyrax ★, 037 Dreadmouth ★, 041 Maeve ★.
- Relics C→U: 090 Crownsworn Blade, 087 Fate Gauntlet, 110/111/114 Emblems.
- Spells: 177 The Arena Yields Its Prize U→E, 174 Boss Encounter U→E, 228 The Guardian Falls E→P, 072 The Wounded Choose First C→U, 070 The Vault Remembers C→U.

**Judgment notes**
- Promote with confidence: Veilwalker ★ (→E), HEX-3/Gaia/Titan Rho ★★★ (→P or new text), ATLAS-Ω ★★ (→E), Starfire Codex (→P), Dreadmouth/Fen/Knuckle/Mirella ★★★ and Blacktide/Dax/Elysian ★★ (→E), Elysian/Varr/Gaia ★ (→U), Sanctified Mantle and Crown Tear (→U), ATLAS-Ω ★★★ (→M), Veilwalker ★★★ (→P), Crown Hex: Void and The Guardian Enrages (→U).
- Leave as they are: the Relic-recovery and catch-up Common spells.

### 3.3 Set 2, unprinted: rarity too high
- Two or more steps high: 263 Crown of the First Realm M→C (0.1); 265 Titan's Last Heart M→C; 262 Fallen King's Blade M→U; 264 Hourglass of Ash M→U; 236 Maeve ★★★ P→U; 250 Sovereign Crown P→U.
- One step high: spells Crown Hex: Creation, Your Crown Is in Danger, Crown Hex: War, A Head Splits, A Guardian Approaches (U→C); monster Rift Hound (U→C); Relics Crownreaper, Rallying Standard, Reaper's Grasp, Bloodoath Blade, Storm Engine, Astral Diadem, Aegis Codex, Tempest Engine, Bastion of the Deep, Mountainheart, Fate's Edge (U→C); champions 126 Hexie ★, 128 Kael ★★, 161 Lady Volt ★★ (U→C); 227 Rift Alpha, 201 Emberling ★★, 226 Crownless ★, 202 Hexie ★★, 203 Kael ★★★, 210 Morrow ★★, 218 Lady Volt ★★★ (E→U); 231 Emberling ★★★, 233 Thorn ★★★, 238 Astryon ★★★, 241 Unwritten ★★ (P→E).
- Judgment: the Mythic Relics and Sovereign Crown are the real problem; Maeve ★★★ fits better at Elite. Keep the class engines (Emberling, Hexie, Kael) and promote their look-alikes instead. The Uncommon stat Relics and Tactics are fine as signposts, so moving them down is optional.

### 3.4 Set 1 under the rubric (PROPOSED; printed and in packs)
Printed rarity, then proposed ★ / ★★ / ★★★ (power in brackets).
- **Tier I (printed C):** Bramble C/U(2.3)/P(4.8); Kira C/C/E(3.4); Grimm C/E(3.0)/P(4.3); Pip C/C/E; Solara C/U/E; Fen C/C/U; Torren C/E(3.4)/**M(5.9)**; Nyx C/U/E; Emberling C/C/E; Rowan C/U/E; Hexie C/C/U; Bolt C/U/P(4.9); Kael C/U/E.
- **Tier II (printed U):** Solenne C/U/E; Grizz C/E/P(4.8); Gearwick C/E/E; Mirella C/C/U; Shade C/C/U; Borin U/U/**P(5.5)**; Seren C/C/U; Thorn C/C/U; Dax C/U/E; Elara C/C/E; Rask C/U/U; HEX-3 U/U/E.
- **Tier III (printed E):** Valkara C/U/E; Dreadmouth C/U/E; Spark C/C/E; Orion U/E/E; Maeve C/C/E; Ronin C/C/U; Ignara C/C/U; Morrow C/C/E; Blacktide C/E/P(5.6); Aurelia C/U/U; Knuckle U/U/P; Zyrak C/U/E.
- **Tier IV (printed P):** Astryon U/P/**M(6.4)**; Vespera U/U/E; Titan Rho U/E/P; Pyrax C/U/E; Elysian U/P/P; Varr U/P/P; Veilwalker U/E/M(5.8); Gaia U/P/M(5.9); Lady Volt U/U/U; Vessimer C/U/P.
- **Tier V (printed M):** Aurex E/U/P(3.1, weakest Tier V ★★★); Noctara U/E/P; ATLAS-Ω U/E/M(10.0, strongest card in Set 1); Sol U/U/M; Unwritten U/U/M; Veyra U/E/M; Mother E/E/M; Crownless U/P/P.
- **Set 1 spells too high:** Crown of War (M→C), Living Arena (M→C), Crown of Nothing (M→C), Crown of Chaos (M→U), Dice of the Crownfall, Glass Crown, Abyssal Hunger, Star-Touched, Executioner's Oath, Wildkin Pact (P→C/U), Wildfire, Rebirth Rite, Last Stand, Crown's Favor, Void Pact (P→U).
- **Set 1 spells too low:** Pandora's Satchel (C; = Merchant Prince P + Shardfall), Hold the Gate, Kindling, Lucky Draw, Coin Flip (C).
- **Keep:** Oath of the Fourth Crown and Ascension Rite stay M/P (the score undervalues free Ascends). Edicts fine at U.

## 4. Set 1 → Set 2 per champion
Spin compares abilities at the same star: Same = identical text; Light = at least half the effects shared; Real = mostly new.

| Champion | Spin ★/★★/★★★ | Line | Set 2 rarity | ★★★ power S1→S2 | Notes |
| --- | --- | --- | --- | --- | --- |
| Bramble | Real/Real/Light | Real | C/C/M | 4.8→7.5 | Mythic clearly stronger |
| Kira Volt | Real/Light/Real | Real | C/U/M | 3.4→4.2 | Mythic only +0.8 |
| Grimm | Real/Real/Real | Real | C/C/U | 4.3→3.9 | |
| Pip | Real/Light/Real | Real | C/C/U | 3.1→3.3 | |
| Solara | Same/Real/Real | Real | C/U/E | 3.6→4.5 | ★ text identical to Set 1 |
| Fen | Real/Real/Real | Real | C/C/U | 2.9→4.9 | |
| Torren | Real/Real/Real | Real | C/C/U | 5.9→3.5 | ★★★ weaker (−2.4) |
| Nyx | Real/Real/Real | Real | U/E/P | 3.4→5.8 | |
| Emberling | Real/Real/Real | Real | U/E/P | 3.1→3.0 | |
| Rowan | Real/Light/Light | **Light** | C/C/C | 3.5→2.5 | ★ strictly better |
| Hexie | Real/Real/Real | Real | U/E/M | 1.5→6.9 | Mythic clearly stronger |
| Bolt | Real/Real/Real | Real | C/C/U | 4.9→3.7 | |
| Kael | Real/Real/Real | Real | C/U/E | 4.1→2.6 | ★ strictly better; ★★★ weaker |
| Solenne | Real/Real/Real | Real | C/C/U | 3.2→3.5 | ★ strictly better |
| Grizz | Real/Real/Real | Real | C/C/U | 4.8→3.3 | ★★★ weaker |
| Gearwick-9 | Real/Real/Real | Real | C/U/P | 3.6→4.4 | |
| Mirella | Same/Same/Real | **Same** | C/C/U | 2.8→4.5 | ★★ strictly better |
| Shade | Real/Real/Real | Real | C/U/E | 2.2→5.3 | ★ strictly better |
| Borin | Real/Real/Real | Real | C/C/U | 5.5→3.7 | ★★★ weaker |
| Seren | Real/Light/Light | **Light** | C/U/E | 2.2→3.1 | |
| Thorn | Real/Real/Real | Real | C/U/P | 2.0→3.5 | |
| Dax | Light/Real/Real | Real | C/U/P | 4.2→6.1 | |
| Elara | Real/Real/Real | Real | C/U/E | 3.3→3.5 | |
| Rask | Real/Real/Real | Real | C/U/E | 2.9→4.0 | |
| HEX-3 | Real/Real/Real | Real | C/C/U | 3.2→6.0 | |
| Valkara | Real/Real/Real | Real | C/U/P | 3.5→5.2 | ★ strictly better |
| Dreadmouth | Real/Real/Real | Real | C/C/U | 3.9→5.3 | |
| Spark | Real/Light/Real | Real | C/U/E | 3.4→3.7 | |
| Orion | Light/Light/Light | **Light** | C/U/E | 4.0→4.5 | ★★ weaker |
| Maeve | Real/Real/Real | Real | C/U/P | 3.0→2.3 | |
| Ronin | Real/Light/Real | Real | C/U/P | 2.7→4.3 | ★ strictly better |
| Ignara | Real/Real/Real | Real | C/C/U | 2.6→4.3 | |
| Morrow | Light/Real/Real | Real | U/E/M | 3.5→8.3 | Mythic clearly stronger |
| Blacktide | Real/Real/Real | Real | C/U/E | 5.6→5.6 | |
| Aurelia | Real/Real/Real | Real | C/U/E | 2.8→4.1 | |
| Knuckle | Real/Real/Real | Real | C/C/U | 4.7→4.5 | |
| Zyrak | Real/Real/Real | Real | U/E/M | 3.0→9.8 | Mythic clearly stronger |
| Astryon | Real/Real/Real | Real | C/U/P | 6.4→4.0 | ★★★ weaker (−2.4) |
| Vespera | Light/Real/Real | Real | C/U/E | 3.0→3.5 | Ability name reused from Set 1 |
| Titan Rho | Real/Real/Real | Real | C/C/U | 5.7→5.4 | ★★ weaker |
| Pyrax | Real/Real/Real | Real | C/U/E | 4.1→4.0 | ★ strictly better |
| Elysian | Real/Real/Real | Real | C/U/P | 5.5→5.3 | Keeps "Ascend: Shield each" |
| Varr | Real/Real/Real | Real | C/U/E | 5.7→5.0 | ★★ weaker (−2.1) |
| Veilwalker | Real/Real/Real | Real | C/U/E | 5.8→6.5 | ★ strictly better |
| Gaia | Real/Real/Real | Real | C/C/U | 5.9→5.8 | ★★ weaker |
| Lady Volt | Real/Light/Real | Real | C/U/E | 2.9→2.9 | |
| Vessimer | Real/Real/Real | Real | C/U/E | 4.3→3.6 | |
| Aurex | Light/Light/Light | **Light** | U/E/M | 3.1→8.1 | Mythic clearly stronger |
| Noctara | Real/Real/Real | Real | U/E/M | 4.3→10.1 | Mythic clearly stronger |
| ATLAS-Ω | Real/Real/Real | Real | C/U/P | 10.0→8.2 | ★★★ Epic and weaker than Set 1 Mythic |
| Sol | Real/Light/Real | Real | U/E/M | 6.5→11.0 | Mythic clearly stronger |
| Unwritten King | Light/Light/Light | **Light** | E/P/M | 6.9→11.3 | Mythic clearly stronger |
| Veyra Sol | Real/Real/Real | Real | U/E/P | 5.9→5.0 | ★ strictly better |
| Mother Verdant | Real/Real/Real | Real | U/E/M | 7.4→9.8 | Mythic clearly stronger |
| Crownless | Real/Light/Real | Real | E/P/M | 5.0→8.8 | ★ strictly better; Mythic clearly stronger |

**Totals:** 49 lines real spin, 5 light, 1 same. Of 165 forms: 138 real, 24 light, 3 same.

**Needs more spin (PROPOSED):** Mirella (★ and ★★ word for word Set 1); the Restorer ★ trio Solara/Mirella/Elara all "Arrival: Shield another champion you control" (5 cards across both sets); Aurex (Arrival "Scorch 2 each" and ★★★ sweep carried over); Unwritten King (deploy-from-Fallen carried over); Rowan and Orion (still "Attack: Scorch N"); Seren (still draws and summons a Starling); "Ascend: Shield each champion you control" carried over on Elysian ★★/★★★, Gaia ★★, Titan Rho ★★★, Varr ★★★, Sol ★★, Solenne ★★★.

**Weaker Set 2 forms** (not dead, but decks will take the Set 1 form via cross-set Ascension): Torren ★★★, Astryon ★★★, Varr ★★, Borin ★★★, ATLAS ★★★, Gaia ★★, Kael ★★★, Grizz ★★★, Titan Rho ★★, Orion ★★, Kira ★★ (printed).

## 5. Duplicated effects

| Template | Total | S1 / S2 |
| --- | --- | --- |
| Attack: Scorch N the defender | 32 | 21 / 11 |
| Attack: Scorch N each rival champion | 30 | 22 / 8 |
| Ascend: Scorch N each rival champion | 28 | 22 / 6 |
| +N Might (Relic) | 25 | 0 / 25 |
| Hunter "+N Might while fighting…" | 18 | 0 / 18 (the class's only mechanic) |
| +N Guard (Relic) | 16 | 0 / 16 |
| Block: Scorch N the attacker | 14 | 10 / 4 |
| Sentinel Crown ward | 14 | 0 / 14 (9 exactly −1) |
| Your other champions have +N Guard | 13 | 12 / 1 |
| Attack: Scorch N a rival champion | 12 | 1 / 11 |
| Gain N Command | 12 | 9 / 3 |
| Gladiator "+N Might while attacking a champion" | 12 | 0 / 12 |
| Scheme discount | 10 | 0 / 10 |
| Relic discount | 9 | 0 / 9 |
| Ascend: Defeat each with Guard ≤ N | 8 | 4 / 4 |
| Your champions get +N Might this turn | 8 | 4 / 4 |
| Token aura | 8 | 0 / 8 |

| Cards (rarity) | Shared effect | PROPOSED fix |
| --- | --- | --- |
| Gaia ★★★ U, Solara ★★★ E, Sol ★★ E, + Mirella ★★★ U | Mend 1 + Shield each | Keep it on Sol only |
| Titan Rho ★★★ U = Varr ★★★ E | Same text | Titan Rho "Block: ready it" |
| HEX-3 ★★★ U ⊃ Emberling ★★★ P | Tactic → Scorch 1 each (+Shield) | Change HEX-3 |
| Kira ★★, Orion ★★, Lady Volt ★/★★, Rowan ★★★, others (7) | "Attack: Scorch 2 a rival champion" | Lady Volt chain effect |
| Merchant Prince P = Pandora's Satchel C + Shardfall | Draw 2, put 1 on the bottom | |
| Royal Treasury P (1) = Deep Vault U (2) | Gain 2 Command, draw | |
| Golden Parting C = Lucky Draw C + Shardfall | Draw, gain 1 Command | |
| Ascension Rite S1 P = Crown Hex: Evolution S2 U | Ascend ★→★★ free | |
| Wounded Choose First C ≈ Tide Will Turn C (0) ≈ S1 Consolation Prize P | Draw 2 when behind | |
| Spellforged Saber C (2) = Storm Engine U (3) | Same effect | Uncommon strictly worse |
| Titan Heart = Spell Shroud (C, +3 Guard); Bastion of the Deep = Mountainheart (U, +4 Guard) | Pure stats | |
| S2 Guardian Keeps Its Treasure C < S1 Bloodscent C | +3 Guard | S2 card strictly worse |
| S2 Not Yet C < S1 Cinder Veil C | Cancel a Crown attack | S2 card strictly worse |
| Guardian Enrages C (+4, Swift) > S1 Backline Doctrine U (+3) > Chaotic Surge U (+2) | Single pump | |
| Crown Hex: Void C (+3 all) > S1 Soul Tax U (+2 all) | Shard-break pump | |
| Crown Is Divided U > S1 Crown's Favor P; Your Crown Is in Danger U strictly worse than a same-set U | Mend | |
| Clash of Sovereigns U > S1 Battle Hymn U | Ready another | |
| Hourglass of Ash M ≈ Sanctified Mantle C + 2 Guard | Shield holder each turn | |
| Fallen King's Blade M ≈ Crownreaper U + 1 Might + draw | Ready on a kill | |

- Ability names: only Queen Vespera's "Court of Shadows" is reused. Rename it.
- Flavour: no word-for-word repeats across sets.
- Code tidy-up: the line-level rarity argument at the end of each `back(...)` line in set2.ts no longer matches per-card rarity; card-prompts.mjs uses it only as a fallback. Remove it.

## 6. Mechanics inventory (Set 1 / Set 2) and class identity
- Scorch one 40/32; Scorch each 45/18; Shield one 19/18; Shield each 18/14; Draw 25/45; Mend 4/13; Defeat each ≤ N 5/7.
- Summon 18/19; return from Fallen 9/12; deploy from Fallen 5/3; Ready itself on a kill 14/7.
- Set 2 only: Steal 0/10; discard 0/9; Break Relic 0/7; Break Scheme 0/6; free attach 0/5; Scheme discount 0/12; Relic discount 0/9; token aura 0/12; Hunter/Gladiator/Sentinel statics 0/18, 0/12, 0/14; "when defeated" 0/13; start of turn 0/9; Tactic triggers 0/12.
- Spells and Schemes: coin flips 5/0; extra Zones 3/0; team pumps 11/4; break your own shard 8/1; Swift 3/1; Shardfall 9/2; **Schemes 9/5**.
- Keywords: Flight 30/39, Bulwark 25/26, Ambush 18/23, Reach 18/21, Charge 15/21.
- Under-used: Block triggers, "when attacked" (1), Ready another (2 per set), Shardfall and Swift in Set 2, single-target Defeat (1).
- Classes: ✔ Artificer, Gladiator, Binder, Channeler, Rogue. ✔ but one-note: Hunter (18 copies of one static), Sharpshooter (close to Set 1 Ranger). ✔ but duplicated: Restorer. ⚠ Sentinel: no "readies to block", static stacks. ⚠ Delver: mostly "Draw a card". ⚠ Seer: no extra Schemes or peeking, too few Schemes. ⚠ Sapper: never breaks Edicts or adds shard breaks; blank against Set 1.

## 7. Cross-set play
**Best synergies:** (1) Seers + Set 1's 9 Schemes (Hexie ★★★ makes Cinder Veil, Hold the Gate, Bloodscent free and instant); (2) Set 2 Binder token auras + Set 1 Summoners (Seren, Spark, Vespera, Summoner's Pact, Living Arena, Crown Dummy); (3) Morrow / Unwritten King ★★★ deploy-from-Fallen + Set 1 Arrival champions (Emberling, Pip); (4) mix-and-match Ascension (Set 1 Kira ★ → Set 2 Kira ★★/★★★; Set 2 Fen ★ → Set 1 Fen ★★★); (5) Kingdom across sets (Kingdom Emblem, Aurelia ★ and Varr ★ auras, Set 1 Crest of the Kingdom); (6) Channelers + Set 1's 68 Tactics.

**Broken or pointless when mixed:** possibly broken — Zyrak/Channelers with Set 1's 0-cost Tactics; stacked Sentinels from both sets (stalls). Pointless — 10 Set 1 vanilla ★ forms replaced by Set 2 ★ forms; Relic/Scheme breakers and stealers against Set 1; Ascension Rite and Crown Hex: Evolution are the same card.

## 8. Rules and wording
1. Add a glossary: Break a Relic, Break a face-down Scheme, Take a Relic and attach it, discard at random, Ready, fighting, attacking a champion, "Whenever you cast a Tactic" (engine counts Swift casts).
2. breakScheme picks at random but the text doesn't say "at random".
3. Steal does nothing if the taker already holds a Relic (Nyx, Shade, Blacktide, Veilwalker go blank after the first steal). Fix: "If ~ has no Relic," or allow a swap.
4. Sentinel Crown ward stacks in the engine.
5. Charge on ★★/★★★ forms is nearly blank (an Ascended champion can already attack). Affected: Set 1 Kira, Solenne, Ronin, Lady Volt, Crownless, Rask; Set 2 Kira ★★★ (printed), Solenne, Rask, Ronin, Lady Volt, Crownless.
6. Templating: "Shield a champion you control" (4) vs "Shield one of your champions" (3); "Your Relics cost 1 less" vs the Edict's "(minimum 0)"; Hexie ★★★ overrides "can't spring the turn you set it" — the rulebook should say so.
7. SETS.md and SET2_SEASON_REMIX.md out of date; SET2_RELIST.md accurate.
8. The engine matches the text everywhere else (Hunter, Gladiator, Loot, Defeat after Scorch, Shields stop Defeat).

## 9. Recommendations (all PROPOSED)
### 9.1 Safe now (not printed)
- **Priority 1:** Veilwalker ★ C→E; HEX-3 ★★★ U→P or new text; Gaia ★★★ and Titan Rho ★★★ U→E plus new text; ATLAS-Ω ★★★ P→M (or document why Epic); redesign the four Mythic Relics or move them to Elite/Epic; Starfire Codex U→P; rename Vespera's Set 2 ability.
- **Priority 2:** ATLAS-Ω ★★, Blacktide ★★, Dax ★★, Fen ★★★, Dreadmouth ★★★, Knuckle ★★★, Mirella ★★★, Elysian ★★ U→E; Elysian ★, Varr ★, Gaia ★, HEX-3 ★★, Blacktide ★ C→U; Sanctified Mantle, Crown Tear, Crown Hex: Void, Guardian Enrages C→U; Zyrak ★ U→E with a two-Tactics-per-turn cap; −1 stat or +1 cost on unprinted Set 2 ★ forms that beat Set 1 vanilla (Valkara, Ronin, Pyrax, Veilwalker, Veyra, Crownless); Sentinel ward no stacking or −2 cap; fallbacks on Relic/Scheme breakers.
- **Priority 3:** fix the exact duplicates in §5; more spin for Mirella, Aurex, Unwritten King, Rowan, Orion, Seren; add 4–6 Schemes; Maeve ★★★ P→E; update documents, add the glossary, remove line-level rarities.

### 9.2 Already printed: no reprint needed
| Card | Advice |
| --- | --- |
| 017 Bolt ★★, 022 Grizz ★★ | Common, borderline Uncommon/Elite; a fine "Common ★★ that rewards its class". |
| 002, 005, 007, 009, 010, 012, 015, 019, 020, 021, 023, 025, 026, 028, 029, 031, 033 | One step, within the score's noise. |
| 118 Kira ★★ (U) | Scores Common, weaker than Set 1 Kira ★★. Optional: Common in a future reprint. |
| 252 Kira ★★★ | Keep Mythic (repeatable "defeat Guard 4 or less" is rule-bending). |
| 251 Bramble ★★★ | Correct. |
| 013, 018, 019, 026 Rowan, Kael, Solenne, Shade ★ | Creep over Set 1's vanilla forms. Accept, or fix on the Set 1 side in a reprint. |

## Appendix A. Set 3 mechanic ideas (PROPOSED)
1. **Fortify:** a Sentinel blocks, then readies.
2. **Scout:** look at the top 2 cards of your deck, put any on the bottom (Delver).
3. **Overcharge:** pay 2 more when you cast a Tactic for a bonus line (Channelers without loops).
4. **Echo:** when defeated, put a same-name ★ from your Ascension Pile into play.
5. **Pact Relics:** Mythic Relics that change a rule while attached.
6. **Peek:** look at a rival's face-down Scheme (Seer).
7. **Undermine:** break the Edict in play (Sapper).
8. **Bounty:** a marked rival champion gives its attacker a card when defeated (Hunter, Rogue).

## Appendix B. Method
Card data read with tsx (cards.ts, printings.ts); card numbers from the master list CSVs; scoring per §3.1; balance from the sim (500 games per pairing), run read-only.
