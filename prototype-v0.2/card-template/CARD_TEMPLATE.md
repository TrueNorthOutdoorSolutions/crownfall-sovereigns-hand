# Champion card template (LOCKED)

Approved by Jerian, 2026-10-09. **Every champion card in both sets uses this design unless Jerian explicitly says "change the template".**

| File | What it is |
| --- | --- |
| `champion-template.jpg` | **The locked reference.** Bramble ★/★★/★★★ (Set 1 cards 001–003). |
| `../card-art/set1/` | Finished, approved card sheets (3 cards per image, one champion each). Also valid style references. |
| `trait-icons-crownfall.jpg` | Crownfall's official Origin and Class icon sheet. Only used for traits not yet in the icon list below. |

Master art lives on Jerian's PC at `Desktop\Crownfall Art\10 Sovereign's Hand\`. The repo holds JPG copies.

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
