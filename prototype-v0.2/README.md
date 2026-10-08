# Sovereign's Hand V0.2: paper prototype

A small print-and-play test of the provisionally approved **Model B: The Shattered Crown**.
Its only job is to show whether two people can learn the rules quickly, enjoy a 15–20 minute match, understand why they won or lost, and want a rematch straight away.
A **playable digital version** of the same rules now exists too: see `DIGITAL.md`. Both read the same card file, `src/v02/content/cards.ts`.

| File | What it is |
| --- | --- |
| `RULEBOOK.md` → `print/00-rulebook.pdf` | The exact rules, version 0.2-paper-1. |
| `DECKLISTS.md` | Both starter decks with every card's stats and text (generated). |
| `print/` | The printable kit: cards, backs, tokens, feedback sheet (PDF plus HTML source). |
| `PLAYTEST.md` | How to print, run sessions, and the pass gates. |
| `DESIGN_ANSWERS.md` | Collector rarity, the Tier V penalty test, and the evolution-decision test. |
| `VALIDATION.md` | Validation results and open balance questions. |
| `../src/v02/content/cards.ts` | The single source of card truth, used by the print kit, the digital engine and the AI. |
| `DIGITAL.md` | How to play the digital slice, its architecture and limits. |
| `research/` | The paper-era balance simulator and its results, archived (only its import paths changed). |
| `data/canon-snapshot.json` | Read-only identity snapshot of all 55 Crownfall champions, with the commit hash. |
| `art/` | Star portraits copied from Crownfall's committed assets. |
| `tools/` | `snapshot`, `validate`, `build-print` (run with `npm run proto:*`). |

## Canon rules

- Champions are only the verified Crownfall champions. Their names, titles, tiers, Origins, Classes and ability names are checked against the snapshot.
- Might, Guard, costs and card text are card-game design and are **proposed**.
- Tactic and Scheme names are **working names** and are marked as such on the cards.
- The original Crownfall project is never written to. The V0.1 prototype is preserved at tag `v0.1.0` and branch `prototype/sovereigns-hand-v0.1`.
