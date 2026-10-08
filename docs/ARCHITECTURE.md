# Architecture and integration boundary

Sovereign's Hand is its own game, with a shared-universe integration boundary rather than an Arena match-engine dependency. The initial repository was verified empty with an unborn `work` branch. No tracked Vercel configuration or local project linkage existed. The original Crownfall project is on Jerian's Windows machine and has not been inspected here. This is a deliberate prototype implementation, not a data/brand integration claim.

| Layer | Location | Responsibility |
| --- | --- | --- |
| Gameplay content | `src/content/prototype.ts` | Fifteen explicitly noncanonical champions, two starter decks, six traits, two recipes. Stable `shp-*` champion IDs. No Arena imports. |
| Collectible printing | `src/content/editions.ts` | Printing ID, gameplay reference, rules version, set, collector number, edition, treatment, artwork variant, foil, optional serialization. No gameplay stats or stat overrides. |
| State and actions | `src/game/types.ts` | Serializable public state, player zones, ordered units, action union, structured battle report. Rendering state is excluded. |
| Rules | `src/game/rules.ts` | Immutable validated transitions, bounded legal actions, stats, trait checks, damage, front benefits, Crown claims, time cap. Mirrors the single human spec in `docs/RULES.md`. |
| Randomness | `src/game/random.ts` | Seeded deck shuffle. No dependence on clock, browser, rendering or `Math.random`. |
| AI | `src/game/ai.ts` | Deterministic capped one-response lookahead. Values Crown urgency, fronts, survivors, traits, cards, equipment and resources. Does not inspect opposing hand identities/deck order. Hypothetical journals are omitted for performance. |
| Presentation | `src/presentation` | React interface, menu, selection, rules teaching, eight-second skippable resolution, sound, Crown animation, rematch. Does not determine combat results. Placeholder vector/symbol art, no external asset service. |
| Persistence | `src/persistence/journal.ts` | Versioned seeded action journal. Replay-based loading rejects incompatible or illegal journals. Local browser storage is optional; exportable JSON. No account or server. |
| Print generation | `scripts/print.ts` | Standard-size printable cards and tabletop reference from gameplay content plus cosmetic printing records. Rebuilt with production assets. |
| Validation | `tests`, `e2e`, `scripts/simulate.ts` | Rule boundaries/invariants, actual browser gameplay, probability math, seeded bot matches. |

The rules module has no UI, filesystem, network, timers or audio dependencies. Actions are accepted only from the active player through the legal-action contract. A future authoritative server can validate the same action stream; future clients must receive redacted opponent information rather than the full local-AI state. Event history supports deterministic replays, but rollback protocols, reconnection and anti-cheat are intentionally absent.

## Gameplay and collectible identities

Stable gameplay ID ≠ champion tier ≠ battlefield star level ≠ collector treatment ≠ printing ID.

A **SOVEREIGN** printing resolves to exactly the same gameplay definition as a **STANDARD** printing. `RADIANT` and `ASCENDED` are printing treatments only. Artwork, foil, set/collection, edition, collector number and optional serial are stored on the printing. General account collections may later reference printing IDs; legal decks and the match engine reference gameplay IDs. Statistics and abilities belong only to the versioned gameplay definition.

Tactics, Crown Powers and recipe cards should gain their own stable gameplay IDs when introduced, with discriminated card-type definitions and short bounded actions. Do not add unconstrained scripting or a collector-rarity multiplier to the rules. Current prototype traits are direct rules, not an extensible effect-language framework.

## Later Crownfall data and visual integration

Perform a dedicated read-only inspection of the actual current original project first. Locate current source ownership, schemas, complete champion/trait/item/Crown Power records, Codex and brand assets; record original commit/content version or file provenance. Do not assume historical paths or claim the 55 champions have been imported.

Safe candidate shared concepts: champion IDs/names, tier, Origin/Class identity, approved lore, artwork/brand tokens and eventually cosmetic account metadata. Sovereign's Hand owns its costs, Might/Guard, card text, turn/action economy, combat, Crown track and AI. Never import Arena round/shop/combat/economy functions into this engine. Use explicit versioned content snapshots or a shared schema/package containing identity-only records. Cross-mode rewards must remain cosmetic; neither mode's progression grants competitive power in the other.

Replace placeholders through a reviewed mapping, not by silently relabelling established `shp-*` IDs as canonical characters. Preserve provenance and content version. Migrate saved journals only with an explicit compatibility policy; current prototype saves are invalidated by a different content version. Confirm asset rights/source and print legibility as part of that later pass.

## Hosting and environment

Vite builds a static `dist` directory compatible with Vercel's Vite preset. No secrets, database, server functions or paid services are needed to run the prototype. No existing GitHub remote or Vercel project setting is rewritten. Publication/deployment is distinct from local validation; absent Vercel project credentials or linkage, a production build alone is not a deployed preview.
