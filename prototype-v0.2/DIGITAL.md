# Sovereign's Hand V0.2: digital vertical slice

A playable controlled experiment: you against an AI, with the four starter decks from Set 1 (The Shattered Crown) and Set 2 (Beneath the Arena).
It is not the collectible game. There is no online play, collection, packs, trading or purchases.

## Play it

```
npm ci
npm run dev        # then open the address Vite prints
```

- **Menu:** pick one of the four decks, then **Play vs AI**. The AI plays the other starter deck from the same set. **How to play** shows the quick rules.
- **Relics:** click a Relic in your hand, then click the champion to attach it to (click the Relic again to cancel). The champion shows a gold Relic badge.
- **Edicts:** the Edict in play shows as a gold pill in the middle of the board; hover it to read it. If it allows Cycling, a **Cycle (1)** button appears in your Main step.
- Monsters, Guardians and tokens carry a label on the board. Tokens vanish when defeated.
- **Hand:** gold-outlined cards are playable now. Hover a card to see it full size, along with why it can or can't be played.
- **Battle:** press **To battle**, click one of your ready champions, then pick a target in the right-hand panel. Each target shows the predicted clash before you commit.
- **Ascend:** click your champion and the panel shows its next form, cost and effect, or the reason it can't Ascend yet.
- **Decisions on the rival's turn** (block, respond with a Scheme or Swift Tactic, Shardfall, target choices) appear in the gold panel on the right.
- **Speed** toggles how fast the AI plays. After a match: **Rematch**, **Rematch with decks swapped**, or **Menu**.
- **Test aids:** add `#autoplay` to the address to let the AI play your seat too and watch a whole match. Add `#autoturns` to have it play your turns but leave blocks, responses, Shardfall and target choices to you.
- **Archive:** V0.1 is still playable at `/v0.1.html` (its source in `src/game`, `src/presentation` etc. is unchanged).

## Rules parity

The digital game runs the exact paper rules (`RULEBOOK.md`, version 0.2-paper-1). It uses the same card file as the print kit, `src/v02/content/cards.ts`.
`npm run proto:validate` proves every card's stats and text are identical to the paper-tested set (`research/cards.mjs`).
No rule was changed. One wording was resolved in the printed text's favour:
- **"Attack: Scorch 2 the defender"** (Pyrax ★★★, Aurex ★★) applies to whichever champion defends, including a blocker.
- The paper-era balance bot had only applied it to a champion attacked directly. The digital engine follows the printed card. Balance is unchanged (see VALIDATION.md).

## Architecture

| Layer | Path | Notes |
| --- | --- | --- |
| Card data | `src/v02/content/cards.ts` | Single source for print kit, engine and AI. Effects are data, not code. |
| Rules engine | `src/v02/rules/engine.ts`, `types.ts` | Pure TypeScript with no DOM, clock or `Math.random`. `apply(state, player, action)` validates against `legalActions` and returns a new state. Seeded RNG is stored in the state. Every step is logged in plain language with clash reports. |
| AI | `src/v02/ai/bot.ts` | Chooses one legal action at a time from information a player at the table would have. The same heuristics balanced the paper decks. |
| UI | `src/v02/ui/*` | React. Reads state and sends actions; it never decides outcomes. A fixed 1600×900 stage scales to the window. |
| Tests | `tests/v02/*.test.ts` | 52 gameplay tests across the core rules, Set 1 effects and the Set 2 card types (see VALIDATION.md). |
| Balance run | `scripts/v02-sim.ts` | `npm run sim:v02`. |

The same `apply` contract is what a future server would validate for online play. That isn't built.

## Known limits

- Designed for desktop and tablet in landscape. On a phone it fits but is small.
- Single AI difficulty. The AI is cautious with Ascending and doesn't bluff.
- No sound yet, and no saving a match in progress (closing the tab ends it).
- The art is the 256 px game portraits from Crownfall, so cards look slightly soft when zoomed. Set 2 champions reuse those portraits until the new art exists; Monsters, Guardians, Relics and tokens have no art yet.
