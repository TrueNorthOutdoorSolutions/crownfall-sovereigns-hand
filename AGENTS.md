# Project instructions

## Ground rules

- Create a new branch from `redesign/v0.2` and open a pull request back into `redesign/v0.2`. Never push to, merge into, or change `prototype/sovereigns-hand-v0.1` or the tag `v0.1.0`. Never force-push or delete anything.
- Card names, numbers, stats, rules text and flavour come ONLY from `src/v02/content/cards.ts` and the generated lists `prototype-v0.2/MASTER_CARD_LIST_SET1.md` / `prototype-v0.2/MASTER_CARD_LIST_SET2.md`. Never invent, reword or fix card text. Do not edit `cards.ts`, the rules engine, or the tests.
- Never print or commit tokens, keys or passwords.
- Every card has its OWN text and stats exactly as listed. Never copy text or stats between cards, including forms of the same champion.
- Do not generate card images unless explicitly requested. The user generates images in ChatGPT and sends them back for checking.

## Card art

[champion-template.jpg](prototype-v0.2/card-template/champion-template.jpg) + [CARD_TEMPLATE.md](prototype-v0.2/card-template/CARD_TEMPLATE.md) are the locked default for every champion card in both sets unless the user explicitly says "change the template". The written specification is the source of truth; approved sheets in `prototype-v0.2/card-art/set1/` are style references. The official sheet supplies only traits absent from the approved icon list.

The full layout, icon list, reminder wording, numbering and known mistakes below are copied from that source. Preserve exact card wording; Markdown bold and italic indicate presentation only. In prompts spell Ascend costs as "up-arrow N", never use the arrow character alone.

## Layout, top to bottom

| Area | ★ Champion card | ★★ / ★★★ Ascension card |
| --- | --- | --- |
| Top-left gem | **Green** hexagon with the **Command cost** | **Gold** hexagon with an **up-arrow + Ascend cost** (↑0, ↑1 …). Never a plain number. |
| Name bar | Name (large), title (small) beneath, gold stars top-right | Same |
| Art | Full width | Full width |
| Band under the art | **None.** The art runs straight to the trait bar. | **Dark green band with gold laurel leaves at each end** (never chevrons): `ASCENSION • from [Name] ★` on ★★; `ASCENSION • from [Name] ★★` on ★★★ |
| Trait bar | Origin icon + name · Class icon + name · `TIER` + Roman numeral | Same |
| Text box line 1 | Keyword chip(s) + italic reminder text, only if the card has a keyword | Same. ★★★ cards show **crown icon + 2** at the right end of the first line (the keyword line, or the ability line if there is no keyword). |
| Rules | **Ability name.** in bold, then each trigger on its own line, trigger word + number bold: **Block: Scorch 1** the attacker. | Same |
| Flavour | Thin divider, then italic centred text in curly quotes | Same |
| Stats | Bottom-left **orange** shield with **sword** icon = Might. Bottom-right **blue** shield with **shield** icon = Guard. | Same |
| Frame | **Green-vine gold border**; **shield crest** at bottom centre | Same |
| Footer | `001/248` · rarity letter · Northern Summit Studios mountain logo + name · `Art: Jerian Latawiec` | Same |

## Trait icons (Jerian's choices; use exactly these)

| Trait | Icon |
| --- | --- |
| Verdant | green antlers |
| Warden | green square-in-square |
| Voltborn | blue lightning bolt |
| Ranger | yellow arrow |
| Hollow | teal skull |
| Vanguard | gold shield |
| Gearbound | gold gear |
| Saboteur | green spiky burst |
| Dawnforged | gold-orange sunburst |
| Mystic | cyan ring |
| Wildkin | gold paw print |
| Duelist | orange crossed swords |
| Titanborn | peach-orange triangle |
| Umbral | lilac crescent moon |
| Assassin | lilac four-pointed star |
| Elemental | orange flame |
| Arcanist | blue starburst |
| Kingdom | blue crown |
| Hexbound | purple star outline |
| Bruiser | orange fist |
| Artillerist | yellow sunburst |
| Astral | blue four-pointed sparkle |
| Summoner | green four-leaf clover |
| Riftborn | pink diamond-in-a-diamond |
| Commander | yellow flag |
| Wyrmblood | orange trident |
| Ascendant | gold crown (distinct from the blue Kingdom crown) |
| Crownless | grey crossed-out crown |

For any trait not listed, use its small icon from `trait-icons-crownfall.jpg`, then add it here once Jerian approves it.

## Star symbol in rules text

When rules text mentions a star rank (for example "Return a ★ champion"), draw the ★ as a small solid **gold** star, the same gold as the rank stars in the name bar (decided 2026-10-09).

## Keyword reminder text (exact wording)

Charge *(Can attack the turn it arrives.)* · Bulwark *(Blocking doesn't turn it sideways.)* · Ambush *(Attacking a sideways champion, it strikes first.)* · Flight *(Only Flight or Reach can block it.)* · Reach *(Can block Flight.)* · Ascendant *(One per deck.)* · Guardian *(One per deck.)*

## Rarity letter (footer)

The letter follows the champion's Crownfall tier, and all three forms of a champion share it (decided 2026-10-09):

| Tier | Name | Letter |
| --- | --- | --- |
| I | Common | **C** |
| II | Uncommon | **U** |
| III | Elite | **E** |
| IV | Epic | **P** |
| V | Mythic | **M** |

Collector printings (alt art, full art, holo) are a separate system, still to be designed.

## Numbering

Set 1 is numbered out of **248**, Set 2 out of **236** (tokens are numbered separately). Numbers, text and stats come only from `MASTER_CARD_LIST_SET1.md` / `MASTER_CARD_LIST_SET2.md` (generated from `src/v02/content/cards.ts`).

## Mistakes seen so far (check every new sheet for these)

- Text or stats copied from one card to another (Kira ★★/★★★ got the ★ flavour).
- A keyword added to a card that has none (Bramble ★ got Bulwark).
- A word changed ("I grew!" became "I grow!").
- `↑0` read as `10`. Write "up-arrow 0" in prompts.
- Ascend costs are not always ↑0 on ★★ (Pip ★★ is ↑1).
- Frame drift: chevron Ascension band, plain black border, different bottom crest, or an empty band on a ★ card.
- Invented trait icons.

## Spell card template (LOCKED 2026-10-10)

Reference: `spell-template.jpg` (Set 1 cards 166 Sharpened Steel, 170 First Light, 171 Dawnward Oath). Same frame, parchment, fonts, crest and footer as the champion template, with these differences:

| Area | Spell card |
| --- | --- |
| Top-left gem | **Green** hexagon with the Command cost (every spell). |
| Name bar | Name large; card type in small caps underneath (TACTIC / SWIFT TACTIC / SCHEME). |
| Top-right | Gold type symbol instead of stars: ✦ Tactic, ⚡ Swift Tactic, ◈ Scheme. |
| Art | **Taller** than champion art (no Might/Guard shields on spells). |
| Type band under the art | Same shape and laurels as the Ascension band. Tactic = dark green "TACTIC • Cast on your turn"; Swift Tactic = deep blue "SWIFT TACTIC • Cast on your turn or in a fight"; Scheme = deep purple "SCHEME • Set face-down for free • spring on your rival's turn". |
| Trait bar | Left: Crown Power school icon + name (empty if the spell has no school). Right: RARITY word (COMMON / RARE / EPIC / EXALTED). Never repeat the card type here. |
| Text box | Keyword chips (e.g. Shardfall) with reminder text if any, rules text, thin divider, italic centred flavour in curly quotes. |
| Stats | None. |
| Footer | `###/248 · rarity letter · Northern Summit Studios · Art: Jerian Latawiec`. |

Crown Power school icons: War Crown = red sword (⚔) · Fortune Crown = gold coin (◉) · Evolution Crown = green sparkle (✧) · Chaos Crown = pink burst (✺) · Creation Crown = cyan cross-flower (✥) · Void Crown = violet crescent (☾).

Spell rarity: the canon Crown Power rarity; non-canon spells are COMMON. Rarity label colours (locked): COMMON plain, RARE blue, EPIC purple, EXALTED gold with dark text. Footer letter (PROPOSED): Common C · Rare R · Epic P · Exalted X.

Shardfall reminder: *(If this breaks from your Crown, cast or set it for free.)*

Spell flavour lines have no canon source; they are written by Claude and marked PROPOSED until Jerian approves them.

## Edict card template (LOCKED 2026-10-10)

Reference: `edict-template.jpg` (right-hand card, 243 Crown's Bounty). Same frame as the spell template, with: green cost gem; gold ♛ crown top-right; "EDICT" under the name; a ROYAL GOLD type band with laurels and dark text "EDICT • Stays in play for both players"; trait bar left "Proclaimed by <host champion>", right the rarity (Edicts are RARE, footer R); rules text, then the small italic reminder "(A new Edict replaces this one.)"; flavour = the canonical Crownfall Edict proclamation; art = the host champion proclaiming the Edict.
