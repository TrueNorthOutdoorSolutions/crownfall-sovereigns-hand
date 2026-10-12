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
| Artillerist | orange-red crosshair target (changed 2026-10-10 so it never looks like Arcanist) |
| Astral | blue four-pointed sparkle |
| Summoner | green four-leaf clover |
| Riftborn | pink diamond-in-a-diamond |
| Commander | yellow flag |
| Wyrmblood | orange trident |
| Ascendant | gold crown (distinct from the blue Kingdom crown) |
| Crownless | grey crossed-out crown |
| Sharpshooter | white eye with a single sight line (locked from the approved Kira Volt sheet) |
| Hunter | red three-slash claw mark |
| Artificer | bronze anvil |
| Sentinel | grey stone watchtower |
| Delver | amber lantern |
| Gladiator | bronze crested gladiator helmet |
| Seer | indigo crystal orb |
| Binder | teal chain link |
| Channeler | violet spiral |
| Restorer | rose-pink lotus |
| Sapper | white powder keg with a lit orange fuse (locked from the approved Bramble sheet) |
| Rogue | crimson domino mask |

For any trait not listed, use its small icon from `trait-icons-crownfall.jpg`, then add it here once Jerian approves it.

## Set symbols (bottom centre, between the Might and Guard shields)

Every set has its own symbol so a card's set is clear at a glance (owner rule 2026-10-11). The rest of the frame stays the same.

| Set | Symbol |
| --- | --- |
| Set 1 · The Shattered Crown | bronze faceted shield crest with a cracked, shattered pattern |
| Set 2 · Beneath the Arena | bronze round-topped arched gateway with a glowing teal keyhole and steps leading down into it (LOCKED from the approved Bramble sheet, 2026-10-11). Keep the small white studio mountain logo below it, as on Set 1. |

Set 2 art is new artwork, not a repaint of Set 1 (owner feedback 2026-10-11): the character keeps its Crownfall appearance, with a completely new pose, action and composition that shows its new class through what it is doing (no gimmicky class props), set beneath the Arena with darker underground lighting. Each Set 2 prompt carries the character's new pose.

## Star symbol in rules text

When rules text mentions a star rank (for example "Return a ★ champion"), draw the ★ as a small solid **gold** star, the same gold as the rank stars in the name bar (decided 2026-10-09).

## Keyword reminder text (exact wording)

Charge *(Can attack the turn it arrives.)* · Bulwark *(Blocking doesn't turn it sideways.)* · Ambush *(Attacking a sideways champion, it strikes first.)* · Flight *(Only Flight or Reach can block it.)* · Reach *(Can block Flight.)* · Ascendant *(One per deck.)* · Guardian *(One per deck.)*

## Rarity letter (footer)

**Set 2 and later:** every card prints its OWN rarity letter, set per card and per star form by the rarity rubric (`RARITY_RUBRIC.md`, adopted 2026-10-12): C Common, U Uncommon, E Elite, P Epic, M Mythic. The three forms of a champion can have different letters; the trait bar still shows the TIER.

**Set 1 as printed:** the letter follows the champion's Crownfall tier, and all three forms of a champion share it (decided 2026-10-09). The digital game uses Set 1's rubric rarity instead (`data/set1-digital-rarity.json`); printed Set 1 footers keep these letters until a reprint:

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

## Token card template (LOCKED 2026-10-10)

Reference: `token-template.jpg` (cards T01 Starling, T02 Arc Turret; left card is Reference B). Champion frame with: GREY hexagon reading "TOKEN" instead of a cost; no stars; grey laurel band "TOKEN • Vanishes when defeated"; trait bar left "Summoned by <card>", right grey "TOKEN" label; keyword chip + reminder only (no flavour); Might/Guard shields; footer `T##/T08 · Northern Summit Studios · Art: Jerian Latawiec`.

Reference inserts (A Keywords, B Effects & Timing): no gem, no stars, no number, short art strip, tall parchment glossary panel, footer "Reference A/B · Northern Summit Studios".

## Alternate Art template (LOCKED 2026-10-10)

Reference: `alt-art-template.jpg` (249 Bramble, 250 Grimm, 251 Pip). Identical to the base card's template (champion, spell, Edict) in every text, gem, stat, band and icon, with: an ornate GOLD FILIGREE border instead of green vines; footer `###/248 · AA · Northern Summit Studios · Art: Jerian Latawiec`; a small gold "ALTERNATE ART" tag under the footer; a NEW illustration of the same on-model character in a different moment. List: card-art/ALT_ART_LIST.md (249–300). Each later also gets a Full Art version numbered `###a/248a`.

## Masterwork template (LOCKED 2026-10-11)

Reference: `masterwork-template.jpg` (MW01 Kira Volt ukiyo-e, MW02 Fen Chinese ink, MW03 Thorn Korean minhwa). Full art, borderless: a genuine East Asian painting fills the card edge to edge. The champion template's game elements stay (gems, ★★★, Might/Guard shields, icons, keyword chips) but the name bar, Ascension band, trait bar and text box are translucent cream rice-paper panels with thin black-lacquer edges. Small red square artist's seal with the studio crest near the bottom; footer `MW##/10 · X/100 · Northern Summit Studios · Art: Jerian Latawiec` with a black-and-gold MASTERWORK tag. List: card-art/MASTERWORKS.md.
