# V0.2 design answers: rarity, Tier V and evolution

Answers to the three questions raised after Model B (The Shattered Crown) was provisionally approved.
Numbers come from `validation/sim-results.json` (10,000 seeded bot games per variant; see VALIDATION.md for method and limits).

## 1. Collector rarity, kept separate from champion tiers

**The champion tiers stay exactly as Crownfall has them:** Tier I Common, Tier II Uncommon, Tier III Elite, Tier IV Epic, Tier V Mythic.
They are printed on the card as part of the champion's identity ("Tier II · Uncommon").

**Collector rarity is a separate system.** It never reuses a tier word, and it never uses the ★ glyph (★ means evolution form).
Each printing carries a rarity code and symbol in the collector line, the way premium TCGs do.

| Code | Rarity | What it looks like | Role |
| --- | --- | --- | --- |
| ● C | **Core** | Standard frame, full artwork, matte. | The everyday printing of a card. |
| ◆ S | **Select** | Standard frame, matte. | Less frequent pulls. |
| ✦ R | **Rare** | Standard frame with a gold set mark. | One guaranteed per booster. |
| ✦ HR | **Holo Rare** | **Holographic illustration**; frame stays matte. | First "shine" tier. |
| ▣ FA | **Full Art Rare** | **Borderless, full-card illustration**, text on a translucent panel. | First "full art" tier. |
| ▣ IR | **Illustration Rare** | Full art with a new scene illustration (alternate art), not the standard portrait. | The collector favourite; art-led. |
| ⟁ AR | **Ascension Rare** | Textured full-art foil showing all three star forms (★→★★★) as one triptych. | Unique to Sovereign's Hand, since every champion already has ★/★★/★★★ art. |
| ♛ CSR | **Crownforged Secret Rare** | Gold-etched foil, numbered beyond the set (e.g. 058/055). | Secret chase. |
| ◈ SRR | **Sovereign Rainbow Rare** | Prismatic rainbow foil, embossed, alternate or skin art. Curated champions only. | The pinnacle chase. |

**Finishes and stamps are separate from rarity:**
- **Reverse Holo ("Shardframe"):** a foil-frame parallel of any Core, Select or Rare card, taking its own pack slot. It is a finish, not a rarity.
- **First Edition** and **Founder Edition** stamps, and **Serialized** numbering (e.g. 07/50), are flags on the printing record.

**Rules that keep this fair:**
- Rarity and treatment never change gameplay. A Core Kael and a Sovereign Rainbow Kael are the same card in play.
- A champion's tier doesn't fix its rarity. A Tier I champion can have an Illustration Rare or a Sovereign Rainbow printing.
- Guideline for the base printing only: Tier I–II champions are mostly Core or Select, Tier III–IV mostly Select or Rare, Tier V Rare.
- Pack odds are not set here. They need the economic and legal modelling from the V0.2 proposal first.

## 2. Tier V: is losing an extra shard too risky?

**Test.** We ran each Tier V rule against the same decks, and also swapped each deck's Ascendant out for another card (Sol → a second General Varr; Aurex → a third Pyrax, which breaks the 2-copy limit; experiment only).

| Rule when an Ascendant is defeated | Banner win % | Ember win % | Effect on the Ascendant's deck |
| --- | --- | --- | --- |
| Owner breaks a shard (V0.2 proposal) | 53.4 | 46.6 | Ember −0.4 pts compared with no penalty |
| No extra effect | 53.0 | 47.0 | baseline |
| Rival draws a card | 53.1 | 46.9 | ≈ none |
| Can only be deployed once your Crown is damaged | 52.9 | 47.1 | ≈ none; deploys a little later |
| Sol removed from Banner | 51.6 | 48.4 | Sol is worth about +1.4 pts |
| Aurex removed from Ember | 54.1 | 45.9 | Aurex is worth about +1.1 pts |

Under the shard penalty:
- Aurex was defeated in **49%** of the games where it was played (Sol in 8%).
- In **10%** of Aurex's games, its penalty shard was the Ember player's *last* shard. The player lost the game because their dragon died.

**Conclusion.** The penalty doesn't make Tier V too risky in win-rate terms, since it costs under half a point. But it also does no balancing work: Tier V is already not dominant, adding only 1–1.5 points to its deck. And it creates a feel-bad loss in about 1 of 10 Aurex games.
**Decision for the prototype: no extra penalty.** Ascendants are limited to one per deck and are otherwise normal champions. Restraint comes from the cost (6), late timing (median arrival round 6) and the fact that rivals can answer them.

**Still open:** Aurex underperforms. It is defeated in about half its games, and its deck wins less often when it is played, though that is confounded because Ember tends to deploy it when already behind. Human playtests should tell us whether Aurex *feels* extraordinary. Tested buffs (Guard 9–10) only reduced its defeat rate to about 43%. A real fix probably needs an ability change, such as Flight on ★ or an arrival effect that protects it.

## 3. Evolution: guaranteed access, but a real decision

**Access stays guaranteed:** ★★ and ★★★ forms live in the 8-card Ascension Pile and are never drawn.

**The change: Ascending turns the champion sideways.** It uses up the champion's action, so the champion can't attack or block until your next turn. In return:
- The once-per-turn Ascend can happen **before battle** (to use an *Ascend:* effect, such as a Scorch, for this turn's attacks) or **after battle** (on a champion that has already attacked, which costs nothing extra).
- Evolution jumps are big: about **+3 Might / +3 Guard per star**. Ascend costs went down by 1 to make up for the lost action.

Each turn this sets up three real choices. Ascend early for the effect but lose the attack. Attack first and Ascend afterwards. Or keep the champion standing to guard the Crown.

**Evidence.** Seat A plays a fixed policy against a bot that weighs each Ascend, 10,000 games each:

| Ascending rule | Always Ascend | Never Ascend | Reading |
| --- | --- | --- | --- |
| No drawback | **58.2%** | 36.6% | Ascending is automatic. Always doing it beats thinking about it. |
| Can't attack this turn | 50.8% | 38.6% | Still automatic, and games stall: the round-10 rule fires in 19.6% of games. |
| **Turns sideways + after-battle window (adopted)** | **42.5%** | **43.1%** | Both blind policies lose. Evolution matters, and timing matters. |

With the adopted rule:
- Each player reaches ★★ in 66% of games and ★★★ in 42% (medians: round 4 and round 5).
- Players Ascend about 1.4 times per game.

The bot is a conservative player, so human players will probably Ascend more. The playtest measures this directly.
