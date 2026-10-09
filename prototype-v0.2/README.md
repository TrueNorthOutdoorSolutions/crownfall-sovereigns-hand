# Sovereign's Hand V0.2: paper prototype

A small print-and-play test of the provisionally approved **Model B: The Shattered Crown**.
Its only job is to show whether two people can learn the rules quickly, enjoy a 15–20 minute match, understand why they won or lost, and want a rematch straight away.
A **playable digital version** of the same rules now exists too: see `DIGITAL.md`. Both read the same card file, `src/v02/content/cards.ts`.

| File | What it is |
| --- | --- |
| `RULEBOOK.md` → `print/00-rulebook.pdf` | The exact rules, version 0.2-paper-1, plus a PROPOSED Expansion rules section for Relics, Edicts, Monsters, Guardians and tokens. |
| `SETS.md` | **Start here for the two sets**: Set 1 The Shattered Crown and Set 2 Beneath the Arena, the four starter decks, balance, and what needs your approval. |
| `DECKLISTS.md` | All four starter decks with every card's stats and text (generated). |
| `MASTER_CARD_LISTS.md` | Index of the per-set master lists: `MASTER_CARD_LIST_SET1.md` / `master-card-list-set1.csv` (**256 cards**) and `MASTER_CARD_LIST_SET2.md` / `master-card-list-set2.csv` (**240 cards**), with rules text, flavour, art briefs and a Variants column for alt and full arts (generated: `npm run proto:masterlist`). |
| `print/` | The printable kit for all four starter decks (171 card faces, including Summon tokens and 4 reference cards), backs, tokens, feedback sheet (PDF plus HTML source). |
| `PLAYTEST.md` | How to print, run sessions, and the pass gates. |
| `DESIGN_ANSWERS.md` | Collector rarity, the Tier V penalty test, and the evolution-decision test. |
| `VALIDATION.md` | Validation results and open balance questions. |
| `../src/v02/content/cards.ts` | The single source of card truth, used by the print kit, the digital engine and the AI. |
| `DIGITAL.md` | How to play the digital slice, its architecture and limits. |
| `research/` | The paper-era balance simulator and its results, archived (only its import paths changed). |
| `data/canon-snapshot.json` | Read-only identity snapshot of all 55 Crownfall champions, with the commit hash. |
| `data/canon-extras.json` | Read-only snapshot of Crownfall's Crown Powers, items, Edicts, Monsters, Guardians and summons. |
| `art/` | Star portraits copied from Crownfall's committed assets. |
| `tools/` | `snapshot`, `validate`, `build-print` (run with `npm run proto:*`). |

## Canon rules

- Champions are only the verified Crownfall champions. Their names, titles, tiers, Origins, Classes and ability names are checked against the snapshot.
- Might, Guard, costs and card text are card-game design and are **proposed**.
- Tactic and Scheme names are canonical Crown Powers or announcer lines where one fits; the rest are **working names**. Set 2 champion epithets and every non-canon art brief are marked **PROPOSED**.
- The original Crownfall project is never written to. The V0.1 prototype is preserved at tag `v0.1.0` and branch `prototype/sovereigns-hand-v0.1`.
