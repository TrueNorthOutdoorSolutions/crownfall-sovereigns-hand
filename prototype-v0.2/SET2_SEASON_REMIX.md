# Set 2 "Beneath the Arena": the Season 1 mid-season remix

Owner direction 2026-10-11. **APPROVED by Jerian 2026-10-11**: the 12 classes, icons, every champion's class, the titles, cross-set Ascension by name, 2 champions per name per deck, and 12 Set 2 Masterworks (the 4 held-back legends + 8 not done in Set 1). Card rules remain draft until playtested. Nothing here changes Crownfall itself; it is a design document both games can follow.

## The season model

| Crownfall | Sovereign's Hand |
| --- | --- |
| Season 1 launch: 55 champions | **Set 1 The Shattered Crown**: all 55, launch versions |
| Season 1 mid-season patch: same 55, reworked | **Set 2 Beneath the Arena**: all 55 again with a new Class, title, abilities and art |
| Season 2 launch: roster grows (around 60) | **Set 3** |
| Season 2 mid-season patch | **Set 4** |

A Set 2 card's ability name is the name of that champion's new ability in Crownfall's mid-season patch: the card game previews the patch.

## Rules for the remix

1. **Origin stays** (who they are, matches their look and lore). **Class changes** to a brand-new Season 1.5 class. No Season 1 class is reused. **Ascendant stays** on the Tier V legends because it is a deck rule (one per deck), not a fighting style.
2. **Cross-set Ascension by name** (owner rule): any ★ Bramble can Ascend into any ★★ Bramble and then any ★★★ Bramble, from either set. *Done in the engine (2026-10-11).*
3. **Rarity is not tier.** The trait bar still shows TIER I–V (cost and size); the footer letter shows how special the card is. Rarity is set **per card and per star form** by the rarity rubric (`RARITY_RUBRIC.md`, adopted 2026-10-12 for every set). A Tier I can be Mythic; a Tier IV can be Common. Rarity buys *complexity and build-around power*, never raw stats, so packs stay fair.
4. **Same stat budget as Set 1** for each tier and star (about +3 Might / +3 Guard per star, same costs). Sets differ in how they win, not how hard. Target: Set 1 decks vs Set 2 decks 45–55% in simulation, and no champion line a must-play.
5. Set 2 = **55 champions × 3 forms (165)** + 4 Monsters + 6 Guardians + 58 Relics + 30 spells (20 Tactics, 10 Schemes) + 3 Edicts = **266 cards**, plus **34 Alternate Arts** = 300. 4 tokens are numbered separately (T01–T04).

## The 12 new classes

Each class has a Sovereign's Hand job (what its cards do) and a Crownfall mid-season bonus (for the patch). Icons are new and must not resemble any Season 1 icon.

| Class | Sovereign's Hand job | Crownfall patch bonus (PROPOSED) | Icon |
| --- | --- | --- | --- |
| **Sharpshooter** | Scorch *any* rival champion from range, not just the one it fights | First attack each combat hits the farthest enemy for bonus damage | white eye with one sight line |
| **Hunter** | Bonus against Monsters, Guardians and Ascended champions; Loot synergy | Bonus damage to the highest-health enemy and to monsters | red three-slash claw mark |
| **Artificer** | Relics: cheaper, free, stronger, recovered from the Fallen pile | Items held by Artificers give extra stats | bronze anvil |
| **Sentinel** | Guarding the Crown: blocks without tiring, readies to block, punishes Crown attacks | Taunts and reflects a share of damage taken | grey watchtower |
| **Delver** | Card flow: draw, look at the top of the deck, find Relics, cheaper Ascends | Gains energy and loot as combat goes on | amber lantern |
| **Gladiator** | Champion-vs-champion fights: rewards for defeating champions, readies after a kill | Stacking damage per takedown | bronze crested helmet |
| **Seer** | Schemes: set extra Schemes, spring them cheaper, peek at the rival's set Schemes | Starts combat with knowledge: dodges the first ability | indigo crystal orb |
| **Binder** | The Fallen pile and tokens: raise champions back, tokens grow stronger | Fallen allies return as spirits | teal chain link |
| **Channeler** | Tactics: each Tactic you cast powers them up | Abilities echo for part of their damage | violet spiral |
| **Restorer** | Mend (new Crown Shards), Shields, recovery | Healing also restores energy | rose lotus |
| **Sapper** | Breaking things: rival Relics, Schemes, Edicts, extra shard breaks | Abilities shatter shields and armour | black powder keg with a lit fuse |
| **Rogue** | Taking things: steal Relics, make the rival discard, Ambush | Steals a buff from the first enemy hit | crimson domino mask |

## Every champion's Set 2 class

Origins unchanged. Titles from the earlier Set 2 list; the 10 champions newly added to Set 2 get new titles here. All PROPOSED.

| Tier | Champion | Origin | Set 1 class | **Set 2 class** | Set 2 title |
| --- | --- | --- | --- | --- | --- |
| I | Bramble | Verdant | Warden | **Sapper** | The Rootbreaker |
| I | Kira Volt | Voltborn | Ranger | **Sharpshooter** | The Long Shot |
| I | Grimm | Hollow | Vanguard | **Sentinel** | The Last Sentry |
| I | Pip | Gearbound | Saboteur | **Sapper** | Tunnel Blaster |
| I | Solara | Dawnforged | Mystic | **Restorer** | Lamp of the Lost |
| I | Fen | Wildkin | Duelist | **Hunter** | Pack Hunter |
| I | Torren | Titanborn | Warden | **Sentinel** | Keeper of the Deep Vault |
| I | Nyx | Umbral | Assassin | **Rogue** | Vault Thief |
| I | Emberling | Elemental | Arcanist | **Channeler** | Ember Conduit |
| I | Rowan | Kingdom | Ranger | **Sharpshooter** | Archer of the Deep Gate *(was "Warden of the Deep Gate"; Warden is a Season 1 class)* |
| I | Hexie | Hexbound | Arcanist | **Seer** | Reader of Bones |
| I | Bolt | Gearbound | Vanguard | **Artificer** | Scrap Smith |
| I | Kael | Kingdom | Duelist | **Delver** | Relic Seeker |
| II | Solenne Ash | Dawnforged | Vanguard | **Delver** | Lantern of the Underways |
| II | Grizz | Wildkin | Bruiser | **Hunter** | Breaker of Beasts |
| II | Gearwick-9 | Gearbound | Artillerist | **Artificer** | Relic Engineer |
| II | Mirella | Elemental | Mystic | **Restorer** | Tide of the Sunken Halls |
| II | Shade | Umbral | Assassin | **Rogue** | Mask of the Depths |
| II | Borin Ironbelly | Titanborn | Bruiser | **Artificer** | Forgemaster of the Deep |
| II | Seren | Astral | Summoner | **Delver** | Starlight in the Dark |
| II | Thorn | Verdant | Saboteur | **Sapper** | Rot Beneath the Stone |
| II | Dax Meridian | Riftborn | Ranger | **Hunter** | Guardian Hunter |
| II | Elara | Kingdom | Mystic | **Restorer** | Healer of the Fallen Deep |
| II | Rask | Wildkin | Duelist | **Gladiator** | Champion of the Underpits |
| II | HEX-3 | Gearbound | Arcanist | **Channeler** | Core Conduit |
| III | Valkara | Astral | Duelist | **Seer** | Judge of the Depths |
| III | Dreadmouth | Hollow | Bruiser | **Hunter** | Devourer of Guardians |
| III | Professor Spark | Gearbound | Summoner | **Artificer** | Relic Inventor |
| III | Orion | Astral | Ranger | **Sharpshooter** | Star-Charter of the Deep |
| III | Maeve | Verdant · Hexbound | Mystic | **Rogue** | Broker of Relics |
| III | Ronin Zero | Voltborn | Duelist | **Gladiator** | Blade Beneath the Arena |
| III | Ignara | Elemental | Vanguard | **Channeler** | Heart of the Forge |
| III | Morrow | Hollow | Summoner | **Binder** | Lord of the Buried Halls |
| III | Captain Blacktide | Riftborn | Artillerist | **Rogue** | Plunderer of the Vault |
| III | Aurelia | Kingdom | Commander | **Delver** | Leader of the Descent *(was "Commander of the Descent"; Commander is a Season 1 class)* |
| III | Knuckle | Titanborn | Bruiser | **Gladiator** | King Under the Pit |
| III | Zyrak | Riftborn | Arcanist | **Channeler** | Shard of the Broken Vault |
| IV | Astryon | Astral | Duelist | **Gladiator** | Blade That Fell Beneath |
| IV | Queen Vespera | Umbral | Summoner | **Binder** | Empress of the Underhalls |
| IV | Titan Rho | Gearbound | Warden | **Sentinel** | Vault Bastion |
| IV | Pyrax | Elemental | Bruiser | **Sapper** | Wyrm of the Deep Forge |
| IV | Elysian | Astral | Mystic | **Seer** | Light of the Lost Halls |
| IV | General Varr | Kingdom | Commander · Vanguard | **Sentinel** | Holder of the Gate |
| IV | Veilwalker | Riftborn | Assassin | **Rogue** | The Rift Below |
| IV | Gaia Prime | Verdant | Warden | **Restorer** | Root of the Arena |
| IV | Lady Volt | Voltborn | Duelist | **Sharpshooter** | Storm in the Deep |
| IV | Vessimer | Hexbound | Saboteur | **Artificer** | Alchemist of Relics |
| V | Aurex | Wyrmblood | Ascendant · Bruiser | **Ascendant · Hunter** | Bane of the Guardians |
| V | Noctara | Umbral | Ascendant · Arcanist | **Ascendant · Seer** | Shadow Beneath the Crown |
| V | ATLAS-Ω | Gearbound | Ascendant · Warden | **Ascendant · Sentinel** | The Vault Engine |
| V | Sol | Dawnforged | Ascendant · Mystic | **Ascendant · Restorer** | Dawn Beneath the World |
| V | The Unwritten King | Hollow | Ascendant · Summoner | **Ascendant · Binder** | Lord of the Buried Crown |
| V | Veyra Sol | Riftborn | Ascendant · Assassin | **Ascendant · Hunter** | Hunter of Guardians |
| V | Mother Verdant | Verdant | Ascendant · Summoner | **Ascendant · Binder** | Root of All Things |
| V | Crownless | Crownless | Ascendant | **Ascendant** (still refuses a class) | The Unbound |

Class sizes: Hunter 6 (2 legends); Artificer, Sentinel, Restorer, Rogue 5; Sharpshooter, Delver, Gladiator, Seer, Binder, Channeler, Sapper 4. Every class has a Tier I or II entry point so a deck can be built around it from commons.

## Rarity in Set 2 (how a Tier I becomes Mythic)

Updated 2026-10-12. Each card (each star form) gets its own rarity from the rarity rubric (`RARITY_RUBRIC.md`); there is no line-level rarity and no fixed pattern across the three forms. Current counts (target in brackets): **99 Common** (95–105), **78 Uncommon** (75–85), **50 Elite** (45–55), **22 Epic** (20–26), **17 Mythic** (10–14; printed cards 251 and 252 force the Mythic block to be at least 16, see `AUDIT_CHANGES.md`). Cards are numbered in those blocks; printed numbers never move. Every Mythic is justified in `SET2_RELIST.md`.

The job descriptions above are the classes' long-term identity. Not all of them have cards yet: the Sentinel "readies to block", the Seer "sets extra Schemes / peeks", the Delver "looks at the top of the deck" and the Sapper "breaks Edicts / extra shard breaks" are ideas for Set 3 (`AUDIT_SETS_1_2.md` Appendix A). Set 2 adds 5 Schemes for the Seers (10 in all).

## Still to decide

- DECIDED: at most **2 champions of the same name** per deck across all sets; Ascension Pile at most 2 of each name and star.
- DECIDED: **12 Set 2 Masterworks** (ATLAS-Ω, The Unwritten King, Veyra Sol, Mother Verdant + 8 champions not featured as Set 1 Masterworks). Omegas: 10 or 12 still open.
- Balance (1,000 games per pairing, 2026-10-12, after the audit changes): Banner 46.5, Ember 55.2, Vault 49.1, Brood 49.2. Ember is strongest against Set 2 (57–59%); left as is because it is a printed Set 1 deck.

Done since approval: all 165 Set 2 champion cards designed to the budget, cross-set Ascension in the engine, Set 2 numbered /266 by rarity block, art prompts regenerated, Set 1 vs Set 2 simulations run, and the 2026-10-12 audit fixes applied (`AUDIT_CHANGES.md`).
