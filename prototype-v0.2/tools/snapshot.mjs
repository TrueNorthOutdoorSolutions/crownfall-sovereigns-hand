// Read-only canon snapshot from the original Crownfall project.
// Reads committed files only (git show HEAD:...), never the working tree, and never writes there.
// Usage: npx tsx prototype-v0.2/tools/snapshot.mjs [path-to-Crownfall]
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const crownfall = process.argv[2] ?? 'C:/Users/micha/Desktop/Crownfall';
const git = (...args) => execFileSync('git', ['-C', crownfall, ...args], { maxBuffer: 64 << 20 });

const commit = git('rev-parse', 'HEAD').toString().trim();
const src = git('show', 'HEAD:src/data/champions.ts').toString();
const config = git('show', 'HEAD:src/data/config.ts').toString();

const tierNames = Object.fromEntries(
  [...config.match(/TIER_NAMES[^{]*\{([^}]*)\}/)[1].matchAll(/(\d):\s*'([^']+)'/g)].map((m) => [m[1], m[2]]),
);

// Each champion literal starts with "id: '...', name: '...', title: '...', cost: N".
const starts = [...src.matchAll(/\{\s*\n\s*id: '([^']+)', name: '([^']+)', title: '([^']+)', cost: (\d)/g)];
const str = (block, key) => block.match(new RegExp(`${key}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1]?.replace(/\\'/g, "'");
const champions = starts.map((m, i) => {
  const block = src.slice(m.index, starts[i + 1]?.index ?? src.length);
  const list = (key) => [...(block.match(new RegExp(`${key}: \\[([^\\]]*)\\]`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return {
    id: m[1], name: m[2], title: m[3], tier: Number(m[4]), tierName: tierNames[m[4]],
    origins: list('origins'), classes: list('classes'),
    ability: block.match(/name: '([^']+)', kind:/)?.[1],
    star1: str(block, 'star1'), star2: str(block, 'star2'), star3: str(block, 'star3'),
    lore: (() => {
      const m = block.match(/lore:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/);
      return m ? (m[1] ?? m[2]).replace(/\\(['"])/g, '$1') : undefined;
    })(),
  };
});

if (champions.length !== 55) throw new Error(`Expected 55 canonical champions, found ${champions.length}`);
const out = { source: 'Desktop/Crownfall', commit, readAt: new Date().toISOString().slice(0, 10), tierNames, champions };
writeFileSync(join(root, 'data', 'canon-snapshot.json'), JSON.stringify(out, null, 2) + '\n');

// Copy committed star portraits for the champions the prototype uses.
const { CHAMPION_LINES } = await import('../../src/v02/content/cards.ts');
for (const line of CHAMPION_LINES) {
  for (const s of [1, 2, 3]) {
    const rel = `public/assets/champions/${line.canonId}/star_${s}/portrait.webp`;
    let buf;
    try { buf = git('show', `HEAD:${rel}`); } catch { continue; }
    mkdirSync(join(root, 'art', line.canonId), { recursive: true });
    writeFileSync(join(root, 'art', line.canonId, `star_${s}.webp`), buf);
  }
}
console.log(`canon snapshot: ${champions.length} champions from Crownfall ${commit.slice(0, 7)}`);
