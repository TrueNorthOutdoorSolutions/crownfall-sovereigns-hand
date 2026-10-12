// Writes the Set 1 starter decks as JSON for build-deck-printables.py.
// Usage: npx tsx prototype-v0.2/tools/export-decks.ts <out.json>
import { writeFileSync } from 'node:fs';
import { DECKS } from '../../src/v02/content/cards';
const out = Object.fromEntries(['banner', 'ember'].map((id) => [id, DECKS[id]]));
writeFileSync(process.argv[2] ?? 'decks.json', JSON.stringify(out, null, 2));
