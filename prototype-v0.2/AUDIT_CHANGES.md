# Sovereign's Hand: audit changes (2026-10-12)

What changed after Jerian approved the Set 1 + Set 2 design audit (`AUDIT_SETS_1_2.md`). Branch `design/set2-season-remix`.
**Everything new or changed on a card is PROPOSED** (the master list marks these cards "PROPOSED audit change 2026-10-12"). Printed cards did not change.

## In short

- **Rarity rubric adopted for every set**: `RARITY_RUBRIC.md` (the five rarities' jobs, clause limits, effects, body bands, power score, floors, set mix, collecting pace).
- **Set 2: 97 unprinted cards changed.** 59 got new rules, stats, type or ability name; 56 changed rarity (some both). 220 unprinted cards got new numbers so the rarity blocks stay in order. **No printed card moved or changed** (001–033, 118, 251, 252; 032 Elara keeps its number, text and rarity).
- **5 new Schemes** for the Seers (Set 2 now has 10 Schemes and 20 Tactics). Each replaces a redundant Tactic of the same name, so Set 2 is still exactly **266** cards.
- **4 Mythic Relics redesigned** into rule-changers, and the Sovereign Crown fixed.
- **Set 1 re-rarity (digital only)**: 134 of 248 cards, from the audit's §3.4 table. Printed Set 1 footers keep their old letters until a reprint.
- **Engine**: Sentinel Crown ward capped at −2 in total; Channelers trigger for the first two Tactics each turn; plus the rules the new cards need (fallbacks, Relic swap on steal, shard rules, double Ascend, Scorch-proof, summoned blocker, Hunter-prey and Flight filters).
- **Balance**: all four starter decks inside 45–55% after light tuning; round-10 stalls did not rise.

## Final rarity counts

| Rarity | Rubric target | Set 2 before | **Set 2 now** | Set 2 numbers | Set 1 printed | **Set 1 digital** |
| --- | --- | --- | --- | --- | --- | --- |
| Common | 95–105 | 117 | **99** | 001–099 | 61 | **74** |
| Uncommon | 75–85 | 81 | **78** | 100–177 | 67 | **94** |
| Elite | 45–55 | 31 | **50** | 178–227 | 36 | **36** |
| Epic | 20–26 | 21 | **22** | 228–249 | 51 | **30** |
| Mythic | 10–14 | 16 | **17** | 250–266 | 33 | **14** |

Set 1 targets scale to its 248 cards (about 94/74/47/22/11). Exceptions, both deliberate:
- **Set 2 Mythic = 17.** Printed cards 251 Bramble ★★★ and 252 Kira ★★★ must stay in the Mythic block, so it needs at least 16 cards (251–266). ATLAS-Ω ★★★ was promoted to Mythic (audit priority 1: the 8th strongest card in Set 2), which makes 17 (250–266). The alternative is to keep ATLAS-Ω ★★★ Epic and document why (see "taste calls").
- **Set 1 digital** is Uncommon-heavy and Elite-light because the audit's §3.4 table was applied as written and only the Tactics it named were moved.

Printed card numbers are pinned in `data/set2-printed.json`; `master-list.mjs` places them first and fills every other number in rarity order, and `validate.mjs` fails if a printed card's number, rarity, text, stats or flavour ever drifts. `card-prompts/set2-in-order/DONE.txt` is unchanged (printed numbers did not move).

## Set 2: every changed card

Number before → after, rarity before → after (C Common, U Uncommon, E Elite, P Epic, M Mythic). "same" = only the rarity or number changed. Cards whose only change is a new number are not listed (they are in the master list).

| Card | No. | Rarity | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| Valkara ★ | 036 → 035 | C → C (same) | 3 · 4/3: *Foresight Verdict* Your Schemes cost 1 less to spring. | 3 · 3/3: *Foresight Verdict* Your Schemes cost 1 less to spring. | −1 Might (strictly beat Set 1 Valkara ★). |
| Maeve ★ | 041 → 039 | C → C (same) | 3 · 2/4: *Sleight of Thorns* Arrival: Take a Relic from a rival champion and attach it to Maeve. | 3 · 2/4: *Sleight of Thorns* Arrival: Take a Relic from a rival champion and attach it to Maeve. If you can’t, Scorch 1 a rival champion. | Steal fallback. |
| Ronin Zero ★ | 042 → 040 | C → C (same) | 3 · 4/3: *Arena Draw* +1 Might while attacking a champion. | 3 · 4/2: *Arena Draw* +1 Might while attacking a champion. | −1 Guard (strictly beat Set 1 Ronin ★). |
| Queen Vespera ★ | 050 → 045 | C → C (same) | 4 · 3/4: *Court of Shadows* Arrival: Summon a Court Shade. Your tokens have +1 Might. | 4 · 3/4: *Underhall Court* Arrival: Summon a Court Shade. Your tokens have +1 Might. | Ability renamed (was Set 1's "Court of Shadows"). |
| Lady Volt ★ | 059 → 048 | C → C (same) | 4 · 5/3: *Chain Lightning* Attack: Scorch 2 a rival champion. | 4 · 5/3: *Chain Lightning* Attack: Scorch 1 a rival champion, then Scorch 1 a rival champion. | Chain-lightning identity (was the crowded "Attack: Scorch 2 a rival champion"). |
| Rift Hound | 169 → 053 | U → C | same | same | §3.3 one step high. |
| Crown Hex: War | 170 → 054 | U → C | same | same | §3.3 one step high. |
| Crown Hex: Creation | 171 → 055 | U → C | same | same | §3.3 one step high. |
| It Cannot Be Touched | 076 → 061 | C → C (same) | Scheme 1: Spring when one of your champions is attacked or blocks: Shield one of your champions. | Scheme 1: Spring when one of your champions is attacked or blocks: Shield a champion you control. | Templating: "Shield a champion you control". |
| Steady, Sovereign. Not Yet. | 079 → 063 | C → C (same) | Scheme 1: Spring when a rival champion attacks your Crown and is not blocked: that attack ends. No shards break. | Scheme 1: Spring when a rival champion attacks your Crown and is not blocked: that attack ends. No shards break. Draw a card. | Was strictly worse than Set 1 Cinder Veil; now draws a card. |
| The Tide Will Turn | 074 → 064 | C → C (same) | Tactic 0: If you have fewer shards than your rival, draw 2 cards. | Scheme 1: Spring when a rival champion attacks your Crown: if you have fewer shards than your rival, draw 2 cards. | NEW SCHEME (replaces the Tactic, ≈ The Wounded Choose First). |
| Nyx ★ | 124 → 104 | U → U (same) | 1 · 2/1: *Light Fingers* Attack: Take a Relic from a rival champion and attach it to Nyx. | 1 · 2/1: *Light Fingers* Attack: Take a Relic from a rival champion and attach it to Nyx. If you can’t, Scorch 1 a rival champion. | Steal gets a fallback (never blank vs Set 1). |
| Seren ★★ | 135 → 114 | U → U (same) | ↑1 · 4/6: *Starlit Path* Ascend: Draw a card. Summon a Starling. | ↑1 · 4/6: *Starlit Path* Ascend: Draw 2 cards, then put a card from your hand on the bottom of your deck. | More spin: Delver card selection instead of Set 1's draw + Starling. |
| Thorn ★★ | 136 → 115 | U → U (same) | ↑1 · 5/5: *Creeping Rot* Ascend: Break a rival champion’s Relic. Block: Scorch 2 the attacker. | ↑1 · 5/5: *Creeping Rot* Ascend: Break a rival champion’s Relic. If you can’t, Scorch 1 a rival champion. Block: Scorch 2 the attacker. | Relic-break fallback. |
| HEX-3 ★★ | 035 → 119 | C → U | same | same | §3.2 two steps low. |
| Dreadmouth ★★ | 038 → 121 | C → U | same | same | One step low. |
| Orion ★★ | 144 → 123 | U → U (same) | ↑1 · 7/5: *Charted Shot* Attack: Scorch 2 a rival champion. | ↑1 · 7/5: *Charted Shot* Attack: Scorch 1 a rival champion. Scorch 2 each rival champion with Flight. | More spin: shoots fliers (was Set 1's "Attack: Scorch N" template). |
| Captain Blacktide ★ | 045 → 127 | C → U | 4 · 4/3: *Plunder* Attack: Take a Relic from a rival champion and attach it to Captain Blacktide. | 4 · 4/3: *Plunder* Attack: Take a Relic from a rival champion and attach it to Captain Blacktide. If you can’t, Scorch 1 a rival champion. | Steal fallback; Commons should not steal (rubric: stealing is Elite/Uncommon signpost). |
| Aurelia ★ | 046 → 128 | C → U | same | same | One step low (draw + Kingdom aura). |
| Knuckle ★★ | 048 → 130 | C → U | same | same | One step low. |
| Queen Vespera ★★ | 154 → 131 | U → U (same) | ↑1 · 6/7: *Court of Shadows* Your tokens have +1 Might and +1 Guard. Ascend: Summon two Court Shades. | ↑1 · 6/7: *Underhall Court* Your tokens have +1 Might and +1 Guard. Ascend: Summon two Court Shades. | Ability renamed. |
| Pyrax ★ | 053 → 132 | C → U | 4 · 5/4: *Undermine* Arrival: Break a rival champion’s Relic. | 4 · 5/3: *Undermine* Arrival: Break a rival champion’s Relic. If you can’t, Scorch 2 a rival champion. | −1 Guard (strictly beat Set 1 Pyrax ★) + Relic-break fallback; C→U. |
| Pyrax ★★ | 156 → 133 | U → U (same) | ↑1 · 8/7: *Undermine* Attack: Scorch 1 each rival champion. Break one of your rival’s face-down Schemes. | ↑1 · 8/7: *Undermine* Attack: Scorch 1 each rival champion. Break one of your rival’s face-down Schemes at random. | Scheme break says "at random". |
| Elysian ★ | 054 → 134 | C → U | same | same | Judgment note: Elysian ★ → U. |
| General Varr ★ | 055 → 135 | C → U | same | same | Judgment note: Varr ★ → U. |
| Gaia Prime ★ | 057 → 137 | C → U | same | same | Judgment note: Gaia ★ → U. |
| Gaia Prime ★★ | 058 → 138 | C → U | same | same | §3.2 two steps low (judged U). |
| Lady Volt ★★ | 161 → 139 | U → U (same) | ↑1 · 8/6: *Chain Lightning* Attack: Scorch 2 a rival champion. | ↑1 · 8/6: *Chain Lightning* Attack: Scorch 2 a rival champion, then Scorch 1 a rival champion. | Chain lightning. |
| Aurex ★ | 163 → 141 | U → U (same) | 6 · 7/7: *GUARDIAN’S BANE* Arrival: Scorch 2 each rival champion. +2 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. | 6 · 7/7: *GUARDIAN’S BANE* Arrival: Scorch 3 each rival Monster, Guardian and ★★/★★★ champion. +2 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. | More spin: hits only Hunter prey (was Set 1's Arrival sweep). |
| Noctara ★ | 164 → 142 | U → U (same) | 6 · 6/7: *ECLIPSE SIGHT* Your Schemes cost 1 less to spring. Arrival: Break one of your rival’s face-down Schemes. | 6 · 6/7: *ECLIPSE SIGHT* Your Schemes cost 1 less to spring. Arrival: Break one of your rival’s face-down Schemes at random. If you can’t, Scorch 2 a rival champion. | Scheme break "at random" + fallback. |
| Veyra Sol ★ | 167 → 144 | U → U (same) | 6 · 8/5: *THE HUNT ETERNAL* +2 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. | 6 · 7/5: *THE HUNT ETERNAL* +2 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. | −1 Might (strictly beat Set 1 Veyra Sol ★). |
| Crownless ★ | 226 → 146 | E → U | 6 · 7/7: *UNBOUND* Arrival: Each rival champion gets −2 Might this turn. | 6 · 6/7: *UNBOUND* Arrival: Each rival champion gets −2 Might this turn. | −1 Might (strictly beat Set 1 Crownless ★); E→U (§3.3). |
| Rift Alpha | 227 → 147 | E → U | same | same | §3.3 one step high. |
| Unbinding Charm | 064 → 148 | C → U | same | same | §3.2 two steps low (judged U). |
| Crown Hex: Fortune | 065 → 149 | C → U | same | same | §3.2 two steps low (judged U). |
| Crown Hex: Void | 066 → 150 | C → U | same | same | Judgment note (+3 all for 0 beats Set 1 Soul Tax U). |
| Pack Leader | 067 → 153 | C → U | same | same | §3.2 two steps low (judged U). |
| The Guardian Enrages | 073 → 155 | C → U | same | same | Judgment note (beats Set 1 Backline Doctrine U). |
| The Guardian Keeps Its Treasure | 078 → 157 | C → U | Scheme 1: Spring when one of your champions is attacked or blocks: it gets +3 Guard this turn. | Scheme 1: Spring when one of your champions is attacked or blocks: it gets +3 Guard this turn. Return a Relic from your Fallen pile to your hand. | Was strictly worse than Set 1 Bloodscent; now also returns a Relic. C→U. |
| A Head Splits | 180 → 158 | U → U (same) | Tactic 2: Summon two Hydra Hatchlings. | Scheme 1: Spring when a rival champion attacks: Summon two Hydra Hatchlings. | NEW SCHEME (replaces a third "summon tokens" Tactic). |
| A Guardian Approaches | 176 → 159 | U → U (same) | Tactic 2: Summon a Guardian Construct. | Scheme 2: Spring when a rival champion attacks your Crown and is not blocked: Summon a Guardian Construct. It blocks that attack. | NEW SCHEME (replaces a third "summon a token" Tactic). |
| Crown Tear | 083 → 160 | C → U | same | same | §9.1 priority 2 (repeatable Command). |
| Storm Engine | 186 → 164 | U → U (same) | Relic 3: +1 Might. Attack: Scorch 1 each rival champion. | Relic 3: +2 Might. Whenever you cast a Tactic, Scorch 1 a rival champion. | Was Spellforged Saber at +1 cost; now a Tactic engine on a Relic. |
| Spell Shroud | 101 → 169 | C → U | Relic 2: +3 Guard. | Relic 2: +2 Guard. Scorch has no effect on the holder. | Was "+3 Guard", identical to Titan Heart; now Scorch-proof. C→U. |
| Sanctified Mantle | 108 → 171 | C → U | same | same | §9.1 priority 2 (repeatable Shield). |
| Mountainheart | 193 → 172 | U → U (same) | Relic 3: +4 Guard. | Relic 3: +3 Guard. Rival champions attacking your Crown get −1 Might. | Was "+4 Guard", identical to Bastion of the Deep; now a Crown ward. |
| Solara ★★★ | 199 → 178 | E → E (same) | ↑1 · 6/9: *Lamplight* Ascend: Mend 1. Shield each champion you control. | ↑1 · 6/9: *Lamplight* Ascend: Mend 1. At the start of your turn, Shield a champion you control. | Was "Mend 1. Shield each" (same as Sol ★★, Gaia ★★★); now a Shield every turn. |
| Fen ★★★ | 122 → 179 | U → E | same | same | §3.2 two steps low (4.9). |
| Nyx ★★ | 200 → 180 | E → E (same) | ↑0 · 5/3: *Light Fingers* Attack: Take a Relic from a rival champion and attach it to Nyx. | ↑0 · 5/3: *Light Fingers* Attack: Take a Relic from a rival champion and attach it to Nyx. If you can’t, Scorch 1 a rival champion. | Steal fallback. |
| Mirella ★★★ | 132 → 184 | U → E | ↑2 · 7/10: *Sunken Tide* Ascend: Shield each champion you control, then Mend 1. | ↑2 · 7/10: *Sunken Tide* Ascend: Mend 1. Block: Shield another champion you control. | Was "Shield each, then Mend 1" (Sol ★★ copy); now shields an ally whenever she blocks. U→E. |
| Shade ★★★ | 204 → 185 | E → E (same) | ↑2 · 9/6: *Masked Theft* Attack: Take a Relic from a rival champion and attach it to Shade. When Shade defeats a champion on your turn, your rival discards a card at random. | ↑2 · 9/6: *Masked Theft* Attack: Take a Relic from a rival champion and attach it to Shade. If you can’t, Scorch 1 a rival champion. When Shade defeats a champion on your turn, your rival discards a card at random. | Steal fallback. |
| Seren ★★★ | 205 → 186 | E → E (same) | ↑2 · 7/9: *Starlit Path* Ascend: Draw 2 cards. | ↑2 · 7/9: *Starlit Path* Ascend: Draw a card. At the start of your turn, draw a card, then put a card from your hand on the bottom of your deck. | More spin: repeatable card selection. |
| Thorn ★★★ | 233 → 187 | P → E | ↑2 · 8/8: *Creeping Rot* Ascend: Break one of your rival’s face-down Schemes. Break a rival champion’s Relic. Scorch 2 each rival champion. | ↑2 · 8/8: *Creeping Rot* Ascend: Break one of your rival’s face-down Schemes at random. Break a rival champion’s Relic. Scorch 2 each rival champion. | Scheme break says "at random"; P→E (§3.3). |
| Dax Meridian ★★ | 137 → 188 | U → E | same | same | §3.2 two steps low (4.7). |
| Dreadmouth ★★★ | 142 → 191 | U → E | same | same | §3.2 two steps low (5.3). |
| Orion ★★★ | 209 → 193 | E → E (same) | ↑2 · 10/8: *Charted Shot* Ascend: Scorch 2 each rival champion. Attack: Scorch 2 a rival champion. | ↑2 · 10/8: *Charted Shot* Ascend: Scorch 2 each rival champion. Attack: Scorch 1 a rival champion. Scorch 3 each rival champion with Flight. | More spin: shoots fliers. |
| Maeve ★★★ | 236 → 194 | P → E | ↑2 · 8/10: *Sleight of Thorns* Ascend: Take a Relic from a rival champion and attach it to Maeve. Your rival discards a card at random. | ↑2 · 8/10: *Sleight of Thorns* Ascend: Take a Relic from a rival champion and attach it to Maeve. If you can’t, Scorch 1 a rival champion. Your rival discards a card at random. | Steal fallback; P→E (§3.3, fits Elite). |
| Ignara ★★★ | 147 → 195 | U → E | same | same | §3.2 two steps low (4.3). |
| Captain Blacktide ★★ | 149 → 197 | U → E | ↑1 · 7/6: *Plunder* Attack: Take a Relic from a rival champion and attach it to Captain Blacktide. When Captain Blacktide defeats a champion on your turn, draw a card. | ↑1 · 7/6: *Plunder* Attack: Take a Relic from a rival champion and attach it to Captain Blacktide. If you can’t, Scorch 1 a rival champion. When Captain Blacktide defeats a champion on your turn, draw a card. | Steal fallback; Epic-level power at U (§3.2). |
| Captain Blacktide ★★★ | 211 → 198 | E → E (same) | ↑2 · 10/9: *Plunder* Ascend: Take a Relic from a rival champion and attach it to Captain Blacktide. Attack: Scorch 2 each rival champion. | ↑2 · 10/9: *Plunder* Ascend: Take a Relic from a rival champion and attach it to Captain Blacktide. If you can’t, Scorch 1 a rival champion. Attack: Scorch 2 each rival champion. | Steal fallback. |
| Knuckle ★★★ | 151 → 200 | U → E | same | same | §3.2 two steps low (4.5). |
| Zyrak ★ | 152 → 201 | U → E | same | same | §3.2 + §9.1: Channeler draw engine (with the new two-Tactic cap). |
| Astryon ★★ | 153 → 202 | U → E | same | same | §3.2 two steps low (4.3). |
| Astryon ★★★ | 238 → 203 | P → E | same | same | §3.3 one step high. |
| Queen Vespera ★★★ | 214 → 204 | E → E (same) | ↑2 · 9/10: *Court of Shadows* Your tokens have +2 Might and +1 Guard. Ascend: Summon two Court Shades. | ↑2 · 9/10: *Underhall Court* Your tokens have +2 Might and +1 Guard. Ascend: Summon two Court Shades. | Ability renamed. |
| Titan Rho ★★★ | 155 → 205 | U → E | ↑2 · 9/13: *Bastion Protocol* Rival champions attacking your Crown get −2 Might. Ascend: Shield each champion you control. | ↑2 · 9/13: *Bastion Protocol* Rival champions attacking your Crown get −2 Might. Block: Shield Titan Rho. | Was word-for-word General Varr ★★★; now Shields itself when it blocks. U→E (§3.2 priority 1). |
| Pyrax ★★★ | 215 → 206 | E → E (same) | ↑2 · 11/10: *Undermine* Ascend: Scorch 2 each rival champion. Break a rival champion’s Relic. Break one of your rival’s face-down Schemes. | ↑2 · 11/10: *Undermine* Ascend: Scorch 2 each rival champion. Break a rival champion’s Relic. Break one of your rival’s face-down Schemes at random. | Scheme break says "at random". |
| Elysian ★★ | 157 → 207 | U → E | same | same | §3.2 two steps low (4.8). |
| Veilwalker ★ | 056 → 209 | C → E | 4 · 6/3: *Between the Veils* Attack: Your rival discards a card at random. | 4 · 5/3: *Between the Veils* Attack: Your rival discards a card at random. | −1 Might so it no longer strictly beats Set 1 Veilwalker ★; still Elite power (6/3→5/3 Flight Ambush + discard, §3.2 priority 1). |
| Veilwalker ★★ | 159 → 210 | U → E | same | same | Follows its ★ (Elite power). |
| Gaia Prime ★★★ | 160 → 211 | U → E | ↑2 · 9/13: *Deep Roots* Ascend: Mend 1. Shield each champion you control. | ↑2 · 9/13: *Deep Roots* Ascend: Mend 1. Summon two Wild Saplings. | Was "Mend 1. Shield each" (Sol ★★ copy); now Mend + two Saplings. U→E (§3.2 priority 1). |
| Lady Volt ★★★ | 218 → 212 | E → E (same) | ↑2 · 11/9: *Chain Lightning* Attack: Scorch 2 a rival champion, then Scorch 2 a rival champion. | ↑2 · 11/9: *Chain Lightning* Attack: Scorch 3 a rival champion, then Scorch 2 a rival champion, then Scorch 1 a rival champion. | Chain lightning (3, 2, 1). |
| Aurex ★★ | 220 → 214 | E → E (same) | ↑2 · 9/9: *GUARDIAN’S BANE* +3 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. Attack: Scorch 3 the defender. | ↑2 · 9/9: *GUARDIAN’S BANE* +3 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. When Aurex defeats a champion on your turn, Scorch 2 each rival champion. | More spin: kill → Scorch 2 each. |
| ATLAS-Ω ★★ | 165 → 216 | U → E | same | same | §3.2 two steps low (5.4). |
| The Unwritten King ★ | 223 → 217 | E → E (same) | 6 · 5/7: *BURIED LEGION* Arrival: Summon two Fallen Warriors. Your tokens have +1 Might. | 6 · 5/7: *BURIED LEGION* Arrival: Summon a Fallen Warrior. Your tokens have +1 Might. At the start of your turn, Summon a Fallen Warrior. | More spin: a token every turn (Set 1 already summons two on Arrival); tuned in sim (Arrival token added back). |
| The Unwritten King ★★ | 241 → 218 | P → E | ↑2 · 8/10: *BURIED LEGION* Your tokens have +1 Might and +1 Guard. Ascend: Deploy a ★ champion costing 3 or less from your Fallen pile for free. | ↑2 · 8/10: *BURIED LEGION* Your tokens have +1 Might and +1 Guard. Ascend: Return up to two ★ champions from your Fallen pile to your hand. | More spin: returns two ★ (Set 1 deploys from the Fallen pile). P→E (§3.3). |
| Crown Hex: Evolution | 172 → 221 | U → E | Tactic 2: Ascend one of your ★ champions to ★★ for free. | Tactic 3: Ascend one of your ★★ champions to ★★★ for free. | Was Set 1 Ascension Rite word for word; now the ★★→★★★ step (3 Command). U→E. |
| The Arena Yields Its Prize | 177 → 222 | U → E | same | same | One step low (draw 2 + Command). |
| The Ascension Vault Opens | 178 → 223 | U → E | same | same | §3.2 low (judged E). |
| The Crown Is Divided | 179 → 224 | U → E | same | same | §3.2 two steps low (judged E). |
| Your Crown Is in Danger | 182 → 225 | U → E | Tactic 2: If you have fewer shards than your rival, Mend 1. | Scheme 2: Spring when a rival champion attacks your Crown and is not blocked: Mend 1. | NEW SCHEME (replaces the Tactic, strictly worse than The Crown Is Divided). U→E. |
| Old Power, Newly Yours | 071 → 226 | C → E | Tactic 1: Return a Relic from your Fallen pile to your hand. Gain 2 Command. | Scheme 1: Spring when a rival champion attacks: take its Relic and attach it to one of your champions. If you can’t, Scorch 2 it. | NEW SCHEME (replaces a third "return a Relic" Tactic). C→E. |
| Nyx ★★★ | 230 → 228 | P → P (same) | ↑1 · 9/5: *Light Fingers* Attack: Take a Relic from a rival champion and attach it to Nyx. When Nyx defeats a champion on your turn, your rival discards a card at random. | ↑1 · 9/5: *Light Fingers* Attack: Take a Relic from a rival champion and attach it to Nyx. If you can’t, Scorch 1 a rival champion. When Nyx defeats a champion on your turn, your rival discards a card at random. | Steal fallback. |
| HEX-3 ★★★ | 140 → 232 | U → P | ↑2 · 8/9: *Core Surge* Whenever you cast a Tactic, Shield HEX-3 and Scorch 1 each rival champion. | ↑2 · 8/9: *Core Surge* Whenever you cast a Tactic, Shield HEX-3 and gain 1 Command. | Was Emberling ★★★ plus a Shield; now a Command engine. U→P. |
| Zyrak ★★ | 213 → 235 | E → P | same | same | One step low; Channeler engine is Epic by the rubric. |
| Veilwalker ★★★ | 217 → 237 | E → P | ↑2 · 12/8: *Between the Veils* Attack: Your rival discards a card at random. Take a Relic from a rival champion and attach it to Veilwalker. | ↑2 · 12/8: *Between the Veils* Attack: Your rival discards a card at random. Take a Relic from a rival champion and attach it to Veilwalker. If you can’t, Scorch 2 a rival champion. | Steal fallback; E→P (§3.2). |
| Sol ★★ | 222 → 238 | E → P | same | same | Keeps the only "Mend 1. Shield each" (Epic power). |
| The Guardian Falls | 228 → 247 | E → P | same | same | One step low (defeat by Guard is Epic). |
| Starfire Codex | 188 → 248 | U → P | same | same | §9.1 priority 1 (draw every turn). |
| Sovereign Crown | 250 → 249 | P → P (same) | Relic 3: +1 Might and +1 Guard. You have one more Champion Zone while it is in play. | Relic 2: +1 Might and +1 Guard. You have one more Champion Zone while it is in play. When the holder is defeated, the Sovereign Crown returns to its owner’s hand. | Fix: 2 Command (was 3) and returns to hand when its holder falls, so it earns Epic. |
| Aurex ★★★ | 256 → 255 | M → M (same) | ↑3 · 13/12: *GUARDIAN’S BANE* +3 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. Ascend: Scorch 3 each rival champion. Defeat each rival champion with Guard 3 or less. Your other champions can’t attack this turn. | ↑3 · 13/12: *GUARDIAN’S BANE* +3 Might while fighting a Monster, a Guardian or a ★★/★★★ champion. Ascend: Scorch 2 each rival champion, then defeat each rival Monster, Guardian and ★★/★★★ champion with Guard 6 or less. | More spin: the Guardian-slayer wipe (was Set 1's wipe + "others can't attack"). |
| ATLAS-Ω ★★★ | 240 → 257 | P → M | same | same | 8th strongest card in Set 2 (8.2): Mythic. |
| The Unwritten King ★★★ | 259 → 259 | M → M (same) | ↑3 · 12/13: *BURIED LEGION* Your tokens have +2 Might and +1 Guard. Ascend: Summon two Fallen Warriors. Deploy up to two ★ champions costing 4 or less from your Fallen pile for free. | ↑3 · 12/13: *BURIED LEGION* Your tokens have +2 Might and +2 Guard. Ascend: Summon Fallen Warriors until your Champion Zones are full. | More spin: fills every Champion Zone with Fallen Warriors. |
| The Fallen King's Blade | 262 → 262 | M → M (same) | Relic 4: +2 Might. Once per turn, when the holder defeats a champion on your turn, ready it and draw a card. | Relic 4: +3 Might. When the holder’s attack on your rival’s Crown isn’t blocked, it breaks 1 more shard. | Mythic redesign: was Crownreaper +1 Might + a draw. Now unblocked Crown hits break 1 more shard. +3 Might after sim tuning (Vault). |
| Crown of the First Realm | 263 → 263 | M → M (same) | Relic 4: +1 Might and +1 Guard. The holder counts as every Origin. | Relic 4: +1 Might and +1 Guard. The holder counts as every Origin. You may Ascend twice each turn. | Mythic redesign: you may Ascend twice each turn. |
| Hourglass of Ash | 264 → 264 | M → M (same) | Relic 4: +2 Guard. At the start of your turn, Shield the holder. | Relic 4: +2 Guard. Attack: If the holder is attacking a champion, ready it (once per turn). | Mythic redesign: was Sanctified Mantle + 2 Guard; now attacks a champion and readies. |
| Titan's Last Heart | 265 → 265 | M → M (same) | Relic 4: +4 Guard. When the holder is defeated, Shield each champion you control. | Relic 4: +3 Guard. An unblocked attack on your Crown breaks only 1 shard. | Mythic redesign: caps unblocked hits on your Crown at 1 shard. |

## New Schemes (for the Seers)

Set 2 had 5 Schemes while 12 cards make Schemes cheaper. Each new Scheme replaces a redundant Tactic and keeps its name and canonical announcer line, so no new name needs canon approval and the set stays at 266.

| No. | Scheme | Cost | Springs when | Effect | Rarity | Replaces (why) |
| --- | --- | --- | --- | --- | --- | --- |
| 064 | The Tide Will Turn | 1 | A rival champion attacks your Crown | If you have fewer shards than your rival, draw 2 cards. | C | The Tactic of the same name (≈ The Wounded Choose First, ≈ Set 1 Consolation Prize) |
| 158 | A Head Splits | 1 | A rival champion attacks | Summon two Hydra Hatchlings. | U | The Tactic (a third "summon tokens for 2" beside Crown Hex: Creation and A Guardian Approaches) |
| 159 | A Guardian Approaches | 2 | A rival champion attacks your Crown and is not blocked | Summon a Guardian Construct. It blocks that attack. | U | The Tactic (another "summon a token" card) |
| 225 | Your Crown Is in Danger | 2 | A rival champion attacks your Crown and is not blocked | Mend 1. | E | The Tactic (strictly worse than The Crown Is Divided) |
| 226 | Old Power, Newly Yours | 1 | A rival champion attacks | Take its Relic and attach it to one of your champions. If you can't, Scorch 2 it. | E | The Tactic (a third "return a Relic from the Fallen pile" card) |

Also improved: **The Guardian Keeps Its Treasure** (now returns a Relic too) and **Steady, Sovereign. Not Yet.** (now draws a card), which were strictly worse than Set 1's Bloodscent and Cinder Veil; **It Cannot Be Touched** now says "Shield a champion you control" (one wording for all unprinted cards).

## Mythic Relics: from stat sticks to rule-changers

| Relic (Mythic, legendary, 4 Command) | Before | After | The rule it changes |
| --- | --- | --- | --- |
| The Fallen King's Blade (262) | +2 Might. Once per turn, on a kill, ready it and draw. (= Crownreaper + 1 Might + a draw) | +3 Might. When the holder's attack on your rival's Crown isn't blocked, it breaks 1 more shard. | Shards per hit. (+3 Might is sim tuning for Vault, which plays it.) |
| Crown of the First Realm (263) | +1/+1. The holder counts as every Origin. | +1/+1. The holder counts as every Origin. **You may Ascend twice each turn.** | One Ascend per turn. |
| Hourglass of Ash (264) | +2 Guard. At the start of your turn, Shield the holder. (= Sanctified Mantle + 2 Guard) | +2 Guard. Attack: if the holder is attacking a champion, ready it (once per turn). | One attack per champion per turn. |
| Titan's Last Heart (265) | +4 Guard. When the holder is defeated, Shield each champion you control. | +3 Guard. An unblocked attack on your Crown breaks only 1 shard. | ★★★ hits break 2 shards. (If both the Blade and the Heart apply, the Heart wins.) |
| Sovereign Crown (249, Epic) | 3 Command. +1/+1, one more Champion Zone. (scored Uncommon) | **2 Command.** +1/+1, one more Champion Zone; when the holder is defeated, it returns to its owner's hand. | Extra Champion Zone that you keep. |

The Starless Tome (266: a card and a Command every turn) was already Mythic-strength and is unchanged.

## Duplicates fixed (audit §5)

| Pair | Fix |
| --- | --- |
| "Ascend: Mend 1. Shield each champion" on Gaia ★★★, Solara ★★★, Sol ★★, and Mirella ★★★ | Kept on **Sol ★★** only (now Epic). Solara ★★★: Mend + a Shield every turn. Mirella ★★★: Mend + Shield an ally whenever she blocks. Gaia ★★★: Mend + two Saplings. |
| Titan Rho ★★★ = General Varr ★★★ | Titan Rho ★★★ now Shields itself whenever it blocks. |
| HEX-3 ★★★ ⊃ Emberling ★★★ (Tactic → Scorch 1 each) | HEX-3 ★★★: Tactic → Shield itself and gain 1 Command. |
| Lady Volt ★/★★ in the crowded "Attack: Scorch 2 a rival champion" group | Lady Volt is now a chain: 1+1, 2+1, 3+2+1. Orion ★★/★★★ now shoot fliers. (Rowan ★★★ and Kira ★★ are printed.) |
| Spellforged Saber (C, 2) = Storm Engine (U, 3) | Storm Engine: +2 Might, whenever you cast a Tactic, Scorch 1 a rival champion. |
| Titan Heart = Spell Shroud (+3 Guard) | Spell Shroud: +2 Guard, Scorch has no effect on the holder. |
| Bastion of the Deep = Mountainheart (+4 Guard) | Mountainheart: +3 Guard and a −1 Crown ward (counts toward the −2 cap). |
| Crown Hex: Evolution = Set 1 Ascension Rite | Evolution now Ascends a ★★ to ★★★ for free (3 Command, Elite). |
| The Guardian Keeps Its Treasure < Bloodscent; Not Yet < Cinder Veil | Both improved (above). |
| The Tide Will Turn ≈ The Wounded Choose First; Your Crown Is in Danger < The Crown Is Divided | Both became Schemes (above). |
| Hourglass of Ash ≈ Sanctified Mantle; Fallen King's Blade ≈ Crownreaper | Redesigned (above). |

**Strictly better than Set 1's vanilla ★ (−1 stat):** Valkara 4/3 → 3/3, Ronin Zero 4/3 → 4/2, Pyrax 5/4 → 5/3, Veilwalker 6/3 → 5/3, Veyra Sol 8/5 → 7/5, Crownless 7/7 → 6/7.
**Breakers and stealers never go blank:** every unprinted card that breaks or takes a Relic, or breaks a Scheme as its main effect, now says "If you can't, Scorch 1 a rival champion" (Scorch 2 on Tier IV–V). Every unprinted Scheme-breaker says "at random". A Rogue that already holds a Relic swaps (its old Relic returns to its owner's hand), so stealing never fails.
**More spin:** Mirella ★★★, Aurex (all three), The Unwritten King (all three), Orion ★★/★★★, Seren ★★/★★★ (Rowan 013–015 and Mirella 024/025 are printed).
**Renamed:** Queen Vespera's Set 2 ability "Court of Shadows" → **"Underhall Court"** (PROPOSED). No Set 2 ability name now matches a Set 1 one (the validator checks this).

## Set 1: digital rarity (rubric, AUDIT §3.4)

Stored in `data/set1-digital-rarity.json`; `tools/export-card-images.py` reads it (a full re-export or `export-card-images.py 1 --rarity-only` keeps it), and `src/v02/content/printings.ts` (pack opener, collection) now uses it. **Printed Set 1 footers keep their old tier letters until a reprint. No Set 1 text, stats or image changed.** The pack odds tables pick by rarity pool, not by tier, so they needed no change; a test now checks printings.ts against the JSON.

| Champion | Tier | Printed ★/★★/★★★ | Digital ★/★★/★★★ |
| --- | --- | --- | --- |
| Bramble | I | C/C/C | **C/U/P** |
| Kira Volt | I | C/C/C | **C/C/E** |
| Grimm | I | C/C/C | **C/E/P** |
| Pip | I | C/C/C | **C/C/E** |
| Solara | I | C/C/C | **C/U/E** |
| Fen | I | C/C/C | **C/C/U** |
| Torren | I | C/C/C | **C/E/M** |
| Nyx | I | C/C/C | **C/U/E** |
| Emberling | I | C/C/C | **C/C/E** |
| Rowan | I | C/C/C | **C/U/E** |
| Hexie | I | C/C/C | **C/C/U** |
| Bolt | I | C/C/C | **C/U/P** |
| Kael | I | C/C/C | **C/U/E** |
| Solenne Ash | II | U/U/U | **C/U/E** |
| Grizz | II | U/U/U | **C/E/P** |
| Gearwick-9 | II | U/U/U | **C/E/E** |
| Mirella | II | U/U/U | **C/C/U** |
| Shade | II | U/U/U | **C/C/U** |
| Borin Ironbelly | II | U/U/U | **U/U/P** |
| Seren | II | U/U/U | **C/C/U** |
| Thorn | II | U/U/U | **C/C/U** |
| Dax Meridian | II | U/U/U | **C/U/E** |
| Elara | II | U/U/U | **C/C/E** |
| Rask | II | U/U/U | **C/U/U** |
| HEX-3 | II | U/U/U | **U/U/E** |
| Valkara | III | E/E/E | **C/U/E** |
| Dreadmouth | III | E/E/E | **C/U/E** |
| Professor Spark | III | E/E/E | **C/C/E** |
| Orion | III | E/E/E | **U/E/E** |
| Maeve | III | E/E/E | **C/C/E** |
| Ronin Zero | III | E/E/E | **C/C/U** |
| Ignara | III | E/E/E | **C/C/U** |
| Morrow | III | E/E/E | **C/C/E** |
| Captain Blacktide | III | E/E/E | **C/E/P** |
| Aurelia | III | E/E/E | **C/U/U** |
| Knuckle | III | E/E/E | **U/U/P** |
| Zyrak | III | E/E/E | **C/U/E** |
| Astryon | IV | P/P/P | **U/P/M** |
| Queen Vespera | IV | P/P/P | **U/U/E** |
| Titan Rho | IV | P/P/P | **U/E/P** |
| Pyrax | IV | P/P/P | **C/U/E** |
| Elysian | IV | P/P/P | **U/P/P** |
| General Varr | IV | P/P/P | **U/P/P** |
| Veilwalker | IV | P/P/P | **U/E/M** |
| Gaia Prime | IV | P/P/P | **U/P/M** |
| Lady Volt | IV | P/P/P | **U/U/U** |
| Vessimer | IV | P/P/P | **C/U/P** |
| Aurex | V | M/M/M | **E/U/P** |
| Noctara | V | M/M/M | **U/E/P** |
| ATLAS-Ω | V | M/M/M | **U/E/M** |
| Sol | V | M/M/M | **U/U/M** |
| The Unwritten King | V | M/M/M | **U/U/M** |
| Veyra Sol | V | M/M/M | **U/E/M** |
| Mother Verdant | V | M/M/M | **E/E/M** |
| Crownless | V | M/M/M | **U/P/P** |

| Tactic / Scheme | Printed | Digital |
| --- | --- | --- |
| 172 Hold the Gate | C | **E** |
| 175 Wildfire | P | **U** |
| 176 Wildkin Pact | P | **C** |
| 177 Rebirth Rite | P | **U** |
| 179 Kindling | C | **U** |
| 186 Executioner's Oath | P | **C** |
| 189 Last Stand | P | **U** |
| 190 Crown of War | M | **C** |
| 192 Golden Parting | C | **U** |
| 205 Lucky Draw | C | **U** |
| 212 Star-Touched | P | **C** |
| 215 Pandora's Satchel | C | **P** |
| 217 Coin Flip | C | **U** |
| 221 Dice of the Crownfall | P | **C** |
| 222 Crown of Chaos | M | **U** |
| 223 Crown's Favor | P | **U** |
| 232 Living Arena | M | **C** |
| 238 Void Pact | P | **U** |
| 239 Glass Crown | P | **U** |
| 240 Abyssal Hunger | P | **C** |
| 241 Crown of Nothing | M | **C** |

Set 1 spells (judgment notes): Oath of the Fourth Crown stays Mythic and Ascension Rite stays Epic (the score undervalues free Ascends); Edicts stay Uncommon. Where the audit's score put a cheap spell at Elite or Mythic, I used the next step that keeps same-effect cards together: Pandora's Satchel P (= Merchant Prince P plus Shardfall), Hold the Gate E, and Kindling, Lucky Draw, Coin Flip and Golden Parting U.

## Engine and rules

| Change | Where | Test |
| --- | --- | --- |
| **Sentinel cap** (owner-approved): Crown wards from all sources together give at most −2 Might. | `engine.ts` `WARD_CAP`, `might()` | `tests/v02/audit-rules.test.ts` |
| **Channeler cap** (owner-approved): "Whenever you cast a Tactic" triggers only for your first two Tactics each turn (Swift casts count; resets each turn; applies to Relics too). | `engine.ts` `CHANNEL_CAP`, `castTriggers()`, `PlayerState.tacticsCast` | audit-rules (2 tests) |
| "If you can't, …" fallbacks on break and steal effects | `orElse` on breakRelic / breakScheme / stealRelic / seizeRelic | audit-rules |
| Steal swaps: a taker that already holds a Relic returns it to its owner's hand first | `stealRelic` | audit-rules |
| Scheme: take the attacker's Relic (`seizeRelic`); Scheme: summon a token that blocks the attack (`summon` with `block`) | `engine.ts` | audit-rules |
| Relic rules: Ascend twice (`extraAscend`), +1 shard (`extraCrown`), shard cap (`crownCap`), Scorch-proof (`scorchProof`), return to hand when the holder falls (`returnsToHand`); Relics can carry "whenever you cast a Tactic" | `cards.ts` `RelicDef`, `engine.ts` | audit-rules (6 tests) |
| Filters: Scorch / Defeat "each rival Monster, Guardian and ★★/★★★ champion" (`trait: 'prey'`) and "each rival champion with Flight" (`trait: 'flight'`); "attacking a champion" condition (`when: 'vsChampion'`); free Ascend from ★★ (`minStar`) | `engine.ts` | validator + games |
| AI springs the new Schemes and casts Evolution only when it has a ★★ | `ai/bot.ts` | every-deck AI games |
| Rulebook glossary: Break a Relic, Break a face-down Scheme (at random), Take a Relic and attach it, If you can't, discard at random, Ready, fighting, attacking a champion, "Whenever you cast a Tactic" (Swift counts, Shardfall doesn't), the first-two cap, the Sentinel cap, costs never below 0, Hexie ★★★'s same-turn Schemes, shard rules, Ascend twice | `RULEBOOK.md` | — |

Tools: `master-list.mjs` reads each card's own rarity (no more cost-based guesses for Relics and spells) and pins printed numbers; `card-prompts.mjs` no longer uses the old line-level rarity (removed from `set2.ts` `back(...)` and from the `ChampionLine` type) and removes stale Set 2 prompt files from the old numbering (finished sheets are kept); `validate.mjs` now also checks per-card rarity, 266 cards, numbering 001–266 in rarity blocks, every frozen printed card, fallback and "at random" wording, the new Relic rules, and that no Set 2 ability name reuses a Set 1 one (12,310 checks pass).

## Balance (AI vs AI, `scripts/v02-sim.ts`, 500 games per pairing)

| | Before (audit) | After the card changes | **After tuning (final)** |
| --- | --- | --- | --- |
| Banner of the Realm | 46.8 | 47.6 | **46.1** |
| Blood & Ember | 54.9 | 56.1 | **54.7** |
| Vault Delvers | 49.9 | 48.8 | **49.1** |
| Guardians' Brood | 48.4 | 47.5 | **50.1** |
| Games ending by the round-10 rule (average of 6 pairings) | 10.9% | 10.6% | **10.8%** |
| Ember vs Vault round-10 endings | 21.0% | 21.0% | **20.8%** |

Light tuning (unprinted cards only, both in the Set 2 starter decks): **The Unwritten King ★** keeps an Arrival Fallen Warrior on top of its new "a Fallen Warrior every turn" (Brood fell to 39.8% against Ember without it), and **The Fallen King's Blade** went from +2 to +3 Might (Vault against Ember). The 1,000-game run written to `validation/engine-sim.json`: Banner 46.5, Ember 55.2, Vault 49.1, Brood 49.2, round-10 endings 10.4%, 0 conservation failures. The Sentinel cap alone did not lower the Vault–Ember stall rate much; that matchup is long because Ember's Scorch can't break Vault's high-Guard blockers, not only because of the wards.

All four starter decks are legal (30 cards, 8-card Ascension Pile) and their printed cards are unchanged.

## Skipped because the card is printed (frozen)

| Card | Audit finding left as it is |
| --- | --- |
| 001 Bramble ★, 030 Thorn ★ | Scheme-breakers: no "at random", no fallback (the glossary says breaking is at random) |
| 002 Bramble ★★, 006 Pip ★ | Relic-breakers with no fallback (blank against Set 1) |
| 013–015 Rowan ★/★★/★★★ | "Needs more spin" (still "Attack: Scorch N"); Rowan ★ strictly beats Set 1 Rowan ★ |
| 024–025 Mirella ★/★★ | Word for word Set 1 Mirella; ★★ strictly beats Set 1 ★★ |
| 008 Solara ★, 024 Mirella ★, 032 Elara ★ | The Restorer ★ trio all "Arrival: Shield another champion you control" |
| 018 Kael ★, 019 Solenne ★, 026 Shade ★ | Strictly beat Set 1's vanilla ★ (accept, or fix on the Set 1 side in a reprint) |
| 015 Rowan ★★★, 118 Kira ★★ | In the crowded "Attack: Scorch 2 a rival champion" group; Kira ★★ is weaker than Set 1 Kira ★★ |
| 016 Bolt ★ | "Your Relics cost 1 less" without "(minimum 0)" (the glossary now covers it) |
| 21 printed cards one rarity step off by score | Within the score's noise (audit §9.2) |

Not changed (not in the approved list): Charge on ★★/★★★ forms (nearly blank because an Ascended champion can already attack) and the 8 Emblems (kept Common together).

## Your taste calls (short)

1. **17 Mythics** (ATLAS-Ω ★★★ promoted) or 16 (keep it Epic and say why)?
2. **New names and wordings**: "Underhall Court" (Vespera), and the Hourglass of Ash line "Attack: If the holder is attacking a champion, ready it (once per turn)".
3. **Shardfall and Channelers**: a Tactic cast free by Shardfall does not trigger "Whenever you cast a Tactic" (that is how the engine always worked). Keep, or count it?
4. **Set 1 spell rarities** where I overrode the score: Hold the Gate E, Pandora's Satchel P, Kindling / Lucky Draw / Coin Flip / Golden Parting U.

## 2026-10-20 owner rarity check (during the Set 2 art restart)

Owner: cheap cards with two effects must not be Common. Screened every Set 2 card with the rubric power score; 2+ steps below their band:
- Raised now (not yet drawn, so only undrawn numbers moved): The Tide Will Turn C→U, Crown Hex: Void U→E, The Ascension Vault Opens E→P, Gaia Prime ★★★ E→P.
- Already drawn, left for the full post-art audit (owner decision): Bolt ★★ 017, Grizz ★★ 022, Something Stirs Beneath the Arena 056, Its Treasure Is Yours 057 (all Common, band Uncommon or higher).
Drawn cards 001-057 pinned in data/set2-printed.json; validator 12,530 checks pass; sim unchanged (starters 47.0-52.9%).

## 2026-10-20 owner rarity review (Set 2, approved by Jerian)

Cheap cards with two effects, or effects that repeat, left Common; Elite/Epic power raised; vanilla Relics, Kira Volt ★★, Hexie ★ and Kael ★★ lowered to Common; The Fallen King's Blade and Titan's Last Heart Mythic → Epic. Mix now C 89 · U 75 · E 58 · P 29 · M 15 (leans strong; even out in the balance pass by weakening, not by rarity). Every rarity change is marked `2026-10-20 owner rarity review` in `src/v02/content/set2.ts`.

Drawn cards renumbered once (old → new; footers fixed by GPT edit, art unchanged):

```
004 -> 005 C->C Grimm ★
005 -> 006 C->C Grimm ★★
006 -> 007 C->C Pip ★
007 -> 008 C->C Pip ★★
008 -> 009 C->C Solara ★
009 -> 010 C->C Fen ★
010 -> 011 C->C Fen ★★
011 -> 012 C->C Torren ★
012 -> 013 C->C Torren ★★
013 -> 014 C->C Rowan ★
014 -> 015 C->C Rowan ★★
015 -> 016 C->C Rowan ★★★
016 -> 018 C->C Bolt ★
017 -> 096 C->U Bolt ★★
018 -> 019 C->C Kael ★
019 -> 021 C->C Solenne Ash ★
020 -> 022 C->C Solenne Ash ★★
021 -> 023 C->C Grizz ★
022 -> 100 C->U Grizz ★★
023 -> 102 C->U Gearwick-9 ★
031 -> 108 C->U Dax Meridian ★
032 -> 031 C->C Elara ★
033 -> 032 C->C Rask ★
034 -> 111 C->U HEX-3 ★
035 -> 113 C->U Valkara ★
036 -> 033 C->C Dreadmouth ★
037 -> 115 C->U Professor Spark ★
038 -> 034 C->C Orion ★
039 -> 035 C->C Maeve ★
040 -> 036 C->C Ronin Zero ★
041 -> 120 C->U Ignara ★
042 -> 121 C->U Ignara ★★
043 -> 037 C->C Knuckle ★
044 -> 038 C->C Astryon ★
045 -> 126 C->U Queen Vespera ★
046 -> 039 C->C Titan Rho ★
047 -> 040 C->C Titan Rho ★★
048 -> 041 C->C Lady Volt ★
049 -> 135 C->U Vessimer ★
050 -> 042 C->C ATLAS-Ω ★
051 -> 043 C->C Crystal Mite 
052 -> 044 C->C Shardling 
053 -> 045 C->C Rift Hound 
054 -> 046 C->C Crown Hex: War 
055 -> 047 C->C Crown Hex: Creation 
056 -> 148 C->U Something Stirs Beneath the Arena 
057 -> 149 C->U Its Treasure Is Yours 
```

New cards slotted into drawn ranges: 004 Kira Volt ★★, 017 Hexie ★, 020 Kael ★★.
