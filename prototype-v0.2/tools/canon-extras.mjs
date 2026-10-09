// Read-only extraction of Crownfall's non-champion canon (Crown Powers, items, Edicts, monsters, Guardians, summons,
// announcer lines) for the card sets. It exports the COMMITTED source tree (git archive HEAD) into a temp folder and imports
// Crownfall's own data modules from there, so the original project is never touched and names are copied exactly.
// Usage: npx tsx prototype-v0.2/tools/canon-extras.mjs [path-to-Crownfall]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const crownfall = process.argv[2] ?? 'C:/Users/micha/Desktop/Crownfall';
const commit = execFileSync('git', ['-C', crownfall, 'rev-parse', 'HEAD']).toString().trim();
const tmp = mkdtempSync(join(tmpdir(), 'crownfall-canon-'));
try {
  const tar = execFileSync('git', ['-C', crownfall, 'archive', 'HEAD', 'src'], { maxBuffer: 256 << 20 });
  execFileSync('tar', ['-x', '-C', tmp], { input: tar });
  const load = (rel) => import(pathToFileURL(join(tmp, 'src', rel)).href);
  const cp = await load('data/crownPowers.ts');
  const it = await load('data/items.ts');
  const ed = await load('data/edicts.ts');
  const cr = await load('data/creeps.ts');
  const ch = await load('data/champions.ts');
  const chron = await load('lore/chronicle.ts');

  const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
  const arr = (x) => (Array.isArray(x) ? x : Object.values(x ?? {}));
  const findExport = (mod, test) => Object.values(mod).find((v) => arr(v).length && test(arr(v)[0]));

  const powers = arr(findExport(cp, (x) => x && x.school && x.rarity && x.desc)).map((p) => pick(p, ['id', 'name', 'school', 'rarity', 'desc']));
  const schools = cp.SCHOOL_INFO;
  const items = [];
  for (const v of Object.values(it)) {
    for (const x of arr(v)) {
      if (x && typeof x === 'object' && x.id && x.name && !items.some((y) => y.id === x.id)) {
        items.push(pick(x, ['id', 'name', 'kind', 'recipe', 'effect', 'desc', 'stats', 'trait', 'users']));
      }
    }
  }
  const edicts = arr(findExport(ed, (x) => x && x.hostChampionId)).map((e) => pick(e, ['id', 'name', 'category', 'hostChampionId', 'proclamation', 'description', 'text', 'effect']));
  const units = [];
  for (const v of Object.values(cr)) {
    for (const x of arr(v)) {
      if (x && typeof x === 'object' && x.id && x.name && x.ability && !units.some((y) => y.id === x.id)) {
        units.push({ id: x.id, name: x.name, tags: x.tags, ability: x.ability?.name, abilityDesc: x.ability?.desc });
      }
    }
  }
  const waves = arr(findExport(cr, (x) => x && x.units && x.name)).map((w) => pick(w, ['id', 'name', 'boss', 'mechanics']));
  const summons = arr(ch.SUMMONS ?? []).map((s) => ({ id: s.id, name: s.name, origins: s.origins, ability: s.ability?.name }));
  // GUARDIAN_LINES is module-private in chronicle.ts, so read that literal from the source text.
  void chron;
  const chronSrc = (await import('node:fs')).readFileSync(join(tmp, 'src', 'lore', 'chronicle.ts'), 'utf8');
  const block = chronSrc.match(/GUARDIAN_LINES[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? '';
  const guardianLines = Object.fromEntries([...block.matchAll(/(\w+):\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g)].map((m) => [m[1], (m[2] ?? m[3]).replace(/\\(['"])/g, '$1')]));

  const out = { source: 'Desktop/Crownfall', commit, readAt: new Date().toISOString().slice(0, 10), schools, powers, items, edicts, units, waves, summons, guardianLines };
  writeFileSync(join(root, 'data', 'canon-extras.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`canon extras from ${commit.slice(0, 7)}: ${powers.length} Crown Powers, ${items.length} items, ${edicts.length} Edicts, ${units.length} monster units, ${waves.length} waves, ${summons.length} summons, ${Object.keys(guardianLines).length} Guardian lines`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
