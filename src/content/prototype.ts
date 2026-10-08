/** NONCANONICAL test content. Replace through a dedicated Crownfall integration pass. */
export type Origin = 'Dawnkin' | 'Ironbound' | 'Wildborn';
export type ChampionClass = 'Vanguard' | 'Arcanist' | 'Strider';
export type Ability = 'bulwark' | 'rally' | 'duelist' | 'seer' | 'smith' | 'veteran' | 'wanderer';
export interface ChampionDefinition {
  id: string; name: string; tier: number; origin: Origin; class: ChampionClass;
  cost: number; might: number; guard: number; ability: Ability; text: string; glyph: string;
}
export const CONTENT_VERSION = 'noncanonical-prototype-0.1';
export const champions: ChampionDefinition[] = [
  { id: 'shp-sunward', name: 'Sunward Sentinel', tier: 1, origin: 'Dawnkin', class: 'Vanguard', cost: 2, might: 2, guard: 5, ability: 'bulwark', text: 'Bulwark · +1 Guard per star.', glyph: '☀' },
  { id: 'shp-ember', name: 'Ember Envoy', tier: 1, origin: 'Dawnkin', class: 'Arcanist', cost: 2, might: 2, guard: 3, ability: 'seer', text: 'Deploy · Draw a card.', glyph: '✧' },
  { id: 'shp-gilded', name: 'Gilded Scout', tier: 1, origin: 'Dawnkin', class: 'Strider', cost: 1, might: 2, guard: 3, ability: 'wanderer', text: 'Reposition · Mend 1 Guard.', glyph: '➶' },
  { id: 'shp-aurora', name: 'Aurora Marshal', tier: 3, origin: 'Dawnkin', class: 'Vanguard', cost: 3, might: 3, guard: 5, ability: 'rally', text: 'Other allies here gain +1 Might.', glyph: '♜' },
  { id: 'shp-solstice', name: 'Solstice Blade', tier: 4, origin: 'Dawnkin', class: 'Strider', cost: 4, might: 5, guard: 5, ability: 'duelist', text: 'Alone on a front · +2 Might.', glyph: '⚔' },
  { id: 'shp-anvil', name: 'Anvil Warden', tier: 1, origin: 'Ironbound', class: 'Vanguard', cost: 2, might: 2, guard: 6, ability: 'bulwark', text: 'Bulwark · +1 Guard per star.', glyph: '⬟' },
  { id: 'shp-cinder', name: 'Cinderwright', tier: 2, origin: 'Ironbound', class: 'Arcanist', cost: 2, might: 2, guard: 4, ability: 'smith', text: 'Deploy · Gain a Forge component.', glyph: '⚒' },
  { id: 'shp-rivet', name: 'Rivet Runner', tier: 1, origin: 'Ironbound', class: 'Strider', cost: 1, might: 2, guard: 3, ability: 'wanderer', text: 'Reposition · Mend 1 Guard.', glyph: '⟐' },
  { id: 'shp-bastion', name: 'Bastion Captain', tier: 3, origin: 'Ironbound', class: 'Vanguard', cost: 3, might: 3, guard: 6, ability: 'veteran', text: 'Ascend · Gain +1 extra Might.', glyph: '♖' },
  { id: 'shp-furnace', name: 'Furnace Oracle', tier: 4, origin: 'Ironbound', class: 'Arcanist', cost: 4, might: 4, guard: 6, ability: 'rally', text: 'Other allies here gain +1 Might.', glyph: '◈' },
  { id: 'shp-briar', name: 'Briar Keeper', tier: 1, origin: 'Wildborn', class: 'Vanguard', cost: 2, might: 2, guard: 5, ability: 'bulwark', text: 'Bulwark · +1 Guard per star.', glyph: '❦' },
  { id: 'shp-moss', name: 'Moss Whisper', tier: 2, origin: 'Wildborn', class: 'Arcanist', cost: 2, might: 2, guard: 4, ability: 'seer', text: 'Deploy · Draw a card.', glyph: '✿' },
  { id: 'shp-thorn', name: 'Thorn Prowler', tier: 1, origin: 'Wildborn', class: 'Strider', cost: 1, might: 2, guard: 3, ability: 'duelist', text: 'Alone on a front · +2 Might.', glyph: '⌁' },
  { id: 'shp-oak', name: 'Oath of Oak', tier: 3, origin: 'Wildborn', class: 'Vanguard', cost: 3, might: 3, guard: 6, ability: 'veteran', text: 'Ascend · Gain +1 extra Might.', glyph: '♣' },
  { id: 'shp-moon', name: 'Moontrail Huntress', tier: 4, origin: 'Wildborn', class: 'Strider', cost: 4, might: 5, guard: 5, ability: 'wanderer', text: 'Reposition · Mend 1 Guard.', glyph: '☽' },
];
export const catalog = Object.fromEntries(champions.map(c => [c.id, c])) as Record<string, ChampionDefinition>;
export const traits = [
  { name: 'Dawnkin', scope: '2 distinct champions on one front', text: '+1 Might to Dawnkin there.' },
  { name: 'Ironbound', scope: '2 distinct champions on one front', text: 'That front blocks 2 incoming damage.' },
  { name: 'Wildborn', scope: '2 distinct champions on one front', text: 'Wildborn there mend 1 before battle.' },
  { name: 'Vanguard', scope: '2 distinct champions across your army', text: 'Each front with a Vanguard blocks 1 incoming damage.' },
  { name: 'Arcanist', scope: '2 distinct champions across your army', text: 'Win the Throne with an Arcanist for +1 Crown influence.' },
  { name: 'Strider', scope: '2 distinct champions across your army', text: 'Your first Strider reposition each round is free.' },
];
export const decks = {
  dawn: { name: 'Dawn & Steel', description: 'Hold the Throne. Rally your guard. Forge a decisive advantage.', ids: ['shp-sunward', 'shp-ember', 'shp-gilded', 'shp-aurora', 'shp-solstice', 'shp-anvil', 'shp-cinder', 'shp-rivet', 'shp-bastion', 'shp-furnace'] },
  wild: { name: 'Root & Ember', description: 'Grow in the Wild. Find new cards. Strike where the enemy yields.', ids: ['shp-briar', 'shp-moss', 'shp-thorn', 'shp-oak', 'shp-moon', 'shp-sunward', 'shp-ember', 'shp-gilded', 'shp-aurora', 'shp-solstice'] },
};
export type DeckId = keyof typeof decks;
export const items = [
  { id: 'shp-item-blade', name: 'Tempered Edge', text: '+2 Might', might: 2, guard: 0 },
  { id: 'shp-item-aegis', name: 'Forged Aegis', text: '+3 Guard', might: 0, guard: 3 },
] as const;
export type ItemId = typeof items[number]['id'];
