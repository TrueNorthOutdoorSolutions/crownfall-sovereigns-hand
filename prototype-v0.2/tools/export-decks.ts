// Writes the Set 1 starter decks as JSON for build-deck-printables.py, with the tokens each deck can summon.
// Usage: npx tsx prototype-v0.2/tools/export-decks.ts <out.json>
import { writeFileSync } from 'node:fs';
import { CARDS, DECKS, STARTER_DECK_IDS } from '../../src/v02/content/cards';

/** Token card ids summoned anywhere in a card's effects (searched recursively, so every trigger counts). */
function tokensOf(id: string): string[] {
  const found = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (o.op === 'summon' && typeof o.token === 'string') found.add(o.token);
      Object.values(o).forEach(walk);
    }
  };
  const c = CARDS[id] as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(c ?? {})) if (k !== 'line') walk(v);
  return [...found];
}

const out = Object.fromEntries(STARTER_DECK_IDS.filter((id) => (DECKS[id].set ?? 1) === 1).map((id) => {
  const d = DECKS[id];
  const ids = [...d.main.map(([c]) => c), ...d.ascension];
  return [id, { ...d, tokens: [...new Set(ids.flatMap(tokensOf))].sort() }];
}));
writeFileSync(process.argv[2] ?? 'decks.json', JSON.stringify(out, null, 2));
