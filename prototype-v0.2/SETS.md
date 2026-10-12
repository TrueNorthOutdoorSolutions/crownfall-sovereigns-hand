# Sovereign's Hand — the two sets

Two complete sets, each with two starter decks, built on the same core rules (`RULEBOOK.md`). The new card types and the Set 2 glossary are in the rulebook's **Expansion rules** and **Glossary** sections.
Every card is in the game's card data and is playable by the digital engine and AI. The full per-card lists (rules text, flavour, art brief, suggested art file) are in `MASTER_CARD_LISTS.md`. Updated 2026-10-12 after the design audit (`AUDIT_SETS_1_2.md`, changes in `AUDIT_CHANGES.md`).

| | Set 1: The Shattered Crown | Set 2: Beneath the Arena |
| --- | --- | --- |
| Theme | The war for the broken Crown, above ground. All 55 canonical champions in their canonical forms. | Crownfall's Season 1 mid-season remix: delving under the Arena (Guardians' lairs, the Vault, buried halls). All 55 champions return as new cards with a new Class. |
| Card faces | **256** (248 numbered + 8 tokens) | **270** (266 numbered + 4 tokens) |
| Champions | 55 × ★/★★/★★★ = 165 | 55 × ★/★★/★★★ = 165, plus 4 Monsters and 6 Guardians |
| Tactics and Schemes | 77 (all 67 canonical Crown Powers + 10 originals) | 30: 20 Tactics and 10 Schemes (Crown Hexes, Unbinding Charm, encounters, and cards named after canonical announcer lines) |
| Relics | — | 58 (every canonical item except the Crown Shard) |
| Edicts | 6 | 3 |
| Starter decks | Banner of the Realm · Blood & Ember | Vault Delvers · Guardians' Brood |
| Signature mechanic | Ascension, Schemes, Crown Powers (War, Fortune, Creation, Void, Evolution, Chaos) | 12 new Classes (Hunter, Rogue, Sapper, Seer …), Relics, Monsters with Loot, Guardians, Summoned tokens |
| Rarity | Printed: by tier. **Digital: by the rarity rubric** (`data/set1-digital-rarity.json`) | By the rarity rubric, per card and per star form |

## Rarity (owner rule, rubric adopted 2026-10-12)

Rarity is set per card, and for champions per star form, by what the card does in play. It is never set by tier. The standard is `RARITY_RUBRIC.md`.

| Rarity | Rubric target | Set 2 | Set 1 digital | Set 1 printed (tier) |
| --- | --- | --- | --- | --- |
| Common | 95–105 (38%) | 99 (001–099) | 74 | 61 |
| Uncommon | 75–85 (30%) | 78 (100–177) | 94 | 67 |
| Elite | 45–55 (19%) | 50 (178–227) | 36 | 36 |
| Epic | 20–26 (9%) | 22 (228–249) | 30 | 51 |
| Mythic | 10–14 (4.5%) | 17 (250–266) | 14 | 33 |

- **Set 2** is numbered in rarity blocks. Printed cards (001–033, 118, 251, 252) keep their numbers, so the Mythic block is 17 cards (a documented exception).
- **Set 1's printed cards keep their old footer letters** (tier I–V = C/U/E/P/M) until a reprint. The digital pack opener and collection use the rubric rarity instead. Set 1 stays Uncommon-heavy because only the Tactics the audit named were moved.

## Returning champions are different cards

A champion that appears in both sets keeps their canonical name, Origins and tier. In Set 2 they get a **new Class**, a **new title (epithet)**, **new abilities** and a **new art scene**. **Ascension works across sets by name** (owner rule 2026-10-11): any ★ Bramble can Ascend into any ★★ Bramble and then any ★★★ Bramble, from either set. A deck holds at most 2 champions of the same name across sets.

## Starter decks

| Deck | Set | Plan | Ascendant |
| --- | --- | --- | --- |
| Banner of the Realm | 1 | Kingdom and Dawnforged: Shields, blockers, Sol at the top. Unchanged from the paper test. | Sol |
| Blood & Ember | 1 | Elemental, Wildkin and Wyrmblood: fast attacks and Scorch. Unchanged from the paper test. | Aurex |
| Vault Delvers | 2 | Kingdom, Gearbound and Titanborn: arm champions with Relics, hold with the Crystal Golem. | ATLAS-Ω |
| Guardians' Brood | 2 | Monsters, Hollow and Umbral: flood the board with Monsters and Void Spiders, raise the fallen. | The Unwritten King |

Full lists are in the game data (`src/v02/content/cards.ts`, `DECKS`). Every deck is 30 cards plus an 8-card Ascension Pile.

## Balance (AI vs AI, 1,000 games per pairing, `validation/engine-sim.json`, 2026-10-12)

| | Banner | Ember | Vault | Brood |
| --- | --- | --- | --- | --- |
| **Banner** | — | 51.0 | 45.1 | 43.5 |
| **Ember** | 49.0 | — | 59.4 | 57.1 |
| **Vault** | 54.9 | 40.6 | — | 51.9 |
| **Brood** | 56.5 | 42.9 | 48.1 | — |

Read across: the row deck's win rate against the column deck. Overall: Banner 46.5, Ember 55.2, Vault 49.1, Brood 49.2. The **same-set** matchups, which the starter boxes create, are 51/49 and 51.9/48.1. Cross-set, Blood & Ember is the strongest deck (it is a printed Set 1 deck, so it is left as it is). Vault vs Ember still ends by the round-10 rule in about 20% of games. No game lost or duplicated a card (0 conservation failures in 6,000 games). The first player wins 46–52%.

## Needs your approval

1. **Set 2 epithets, abilities and rules** are PROPOSED (titles and classes were approved 2026-10-11). The audit changes of 2026-10-12 are listed in `AUDIT_CHANGES.md`.
2. **Set 2 spells named after canonical announcer lines**, for example "Something Stirs Beneath the Arena", "Steady, Sovereign. Not Yet." and "Its Treasure Is Yours". The name and flavour are the canon line; the rules are new. Five of them are now Schemes.
3. **7 Set 1 starter spells renamed to canonical Crown Powers** (rules unchanged):

   | Old working name | Now |
   | --- | --- |
   | Rally the Banners | Sharpened Steel |
   | Reinforcements | Reserve Guard |
   | Shield Wall | Frontline Doctrine |
   | Firestorm | Wildfire |
   | Feral Howl | Wildkin Pact |
   | Return to the Fire | Rebirth Rite |
   | Flare Up | Chaotic Surge |

4. **Art briefs.** Set 1 champion briefs are Crownfall's own descriptions. Everything else (Set 2 scenes, spells, Relics, Monsters, Guardians, tokens, Edicts) is PROPOSED.
5. **Rules for the new card types** (Relics, Edicts, Monsters, Guardians, tokens) and the Set 2 glossary, in the rulebook's PROPOSED sections.

## Open questions

- **The Crown Shard item** is the only canonical item without a Relic. A card called "Crown Shard" would be confused with the shards in your Crown. Rename it, or leave it out?
- **Draft numbers.** Cards outside the four starter decks are playable but not balance-tested in a deck. Names, art and flavour are settled; Might, Guard and costs may still change (never on printed cards).
- **Mixing sets.** The rules allow a deck to mix both sets, and cross-set Ascension is approved. Should sanctioned constructed play allow mixed decks, or should each set stand alone?
