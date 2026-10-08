# Sovereign's Hand V0.2: paper prototype

A small print-and-play test of the provisionally approved **Model B: The Shattered Crown**.
Its only job is to show whether two people can learn the rules quickly, enjoy a 15–20 minute match, understand why they won or lost, and want a rematch straight away.
**This is not the digital game.** The `tools/` scripts exist only to validate and balance the paper rules.

| File | What it is |
| --- | --- |
| `RULEBOOK.md` → `print/00-rulebook.pdf` | The exact rules, version 0.2-paper-1. |
| `DECKLISTS.md` | Both starter decks with every card's stats and text (generated). |
| `print/` | The printable kit: cards, backs, tokens, feedback sheet (PDF plus HTML source). |
| `PLAYTEST.md` | How to print, run sessions, and the pass gates. |
| `DESIGN_ANSWERS.md` | Collector rarity, the Tier V penalty test, and the evolution-decision test. |
| `VALIDATION.md` | Validation results and open balance questions. |
| `data/cards.mjs` | The single source of card truth, used by both the print kit and the simulator. |
| `data/canon-snapshot.json` | Read-only identity snapshot of all 55 Crownfall champions, with the commit hash. |
| `art/` | Star portraits copied from Crownfall's committed assets. |
| `tools/` | `snapshot`, `validate`, `engine` + `sim` (bot simulator), `build-print`. Node only, no dependencies. |

## Canon rules

- Champions are only the verified Crownfall champions. Their names, titles, tiers, Origins, Classes and ability names are checked against the snapshot.
- Might, Guard, costs and card text are card-game design and are **proposed**.
- Tactic and Scheme names are **working names** and are marked as such on the cards.
- The original Crownfall project is never written to. The V0.1 prototype is preserved at tag `v0.1.0` and branch `prototype/sovereigns-hand-v0.1`.
