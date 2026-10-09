# Sovereign's Hand — the two sets

Two complete sets, each with two starter decks, built on the same core rules (`RULEBOOK.md`). The new card types are in the rulebook's **Expansion rules** section.
Every card is in the game's card data and is playable by the digital engine and AI. The full per-card lists (rules text, flavour, art brief, suggested art file) are in `MASTER_CARD_LISTS.md`.

| | Set 1: The Shattered Crown | Set 2: Beneath the Arena |
| --- | --- | --- |
| Theme | The war for the broken Crown, above ground. All 55 canonical champions in their canonical forms. | Delving under the Arena: Guardians' lairs, the Vault, buried halls. 45 returning champions as new cards. |
| Card faces | **256** (248 + 8 tokens) | **240** (236 + 4 tokens) |
| Champions | 55 × ★/★★/★★★ = 165 | 45 × ★/★★/★★★ = 135, plus 4 Monsters and 6 Guardians |
| Tactics and Schemes | 77 (all 67 canonical Crown Powers + 10 originals) | 30 (Crown Hexes, Unbinding Charm, encounters, and 21 cards named after canonical announcer lines) |
| Relics | — | 58 (every canonical item except the Crown Shard) |
| Edicts | 6 | 3 |
| Starter decks | Banner of the Realm · Blood & Ember | Vault Delvers · Guardians' Brood |
| Signature mechanic | Ascension, Schemes, Crown Powers (War, Fortune, Creation, Void, Evolution, Chaos) | Relics, Monsters with Loot, Guardians, Summoned tokens |

## Returning champions are different cards

A champion that appears in both sets keeps their canonical name, Origins, Classes and tier. In Set 2 they get a **new title (epithet)**, **new abilities** and a **new art scene**. The engine keeps the two apart: a Set 2 Kael only Ascends into Set 2 Kael forms.
The 10 champions not in Set 2 are Solara, Emberling, Mirella, Bramble, Kira Volt, Pip, Hexie, Bolt, Thorn and HEX-3.

## Starter decks

| Deck | Set | Plan | Ascendant |
| --- | --- | --- | --- |
| Banner of the Realm | 1 | Kingdom and Dawnforged: Shields, blockers, Sol at the top. Unchanged from the paper test. | Sol |
| Blood & Ember | 1 | Elemental, Wildkin and Wyrmblood: fast attacks and Scorch. Unchanged from the paper test. | Aurex |
| Vault Delvers | 2 | Kingdom, Gearbound and Titanborn: arm champions with Relics, hold with the Crystal Golem. | ATLAS-Ω |
| Guardians' Brood | 2 | Monsters, Hollow and Umbral: flood the board with Monsters and Void Spiders, raise the fallen. | The Unwritten King |

Full lists are in `DECKLISTS.md`. Every deck is 30 cards plus an 8-card Ascension Pile.

## Balance (AI vs AI, 1,000 games per pairing, `validation/engine-sim.json`)

| | Banner | Ember | Vault | Brood |
| --- | --- | --- | --- | --- |
| **Banner** | — | 51.0 | 49.8 | 44.2 |
| **Ember** | 49.0 | — | 56.8 | 59.5 |
| **Vault** | 50.2 | 43.2 | — | 54.5 |
| **Brood** | 55.8 | 40.5 | 45.5 | — |

Read across: the row deck's win rate against the column deck. The **same-set** matchups, which are the ones the starter boxes create, are 51/49 and 54.5/45.5. Cross-set, Blood & Ember is the strongest deck and Guardians' Brood is rock-paper-scissors (it beats Banner, loses to Ember). I tried three small Brood buffs; each fixed one matchup by breaking another, so the decks are left as they are for human playtesting. No game lost or duplicated a card (0 conservation failures in 6,000 games). The first player wins 47–51%.

## Needs your approval

1. **45 Set 2 epithets.** All are PROPOSED; they are listed with their Set 1 titles in `MASTER_CARD_LIST_SET2.md`.
2. **21 Set 2 spells named after canonical announcer lines**, for example "Something Stirs Beneath the Arena", "Steady, Sovereign. Not Yet." and "Its Treasure Is Yours". The name and flavour are the canon line; the rules are new.
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
5. **Rules for the new card types** (Relics, Edicts, Monsters, Guardians, tokens), in the rulebook's PROPOSED Expansion rules section.

## Open questions

- **The Crown Shard item** is the only canonical item without a Relic. A card called "Crown Shard" would be confused with the shards in your Crown. Rename it, or leave it out?
- **Draft numbers.** Cards outside the four starter decks are playable but not balance-tested in a deck. Names, art and flavour are settled; Might, Guard and costs may still change.
- **Flavour repeats.** Crownfall gives each champion only 4–5 lines, so 72 Set 2 champion cards reuse a Set 1 line. They are flagged in the CSV for the studio to replace or approve.
- **Mixing sets.** The rules allow a deck to mix both sets. Should constructed play allow it, or should each set stand alone?
