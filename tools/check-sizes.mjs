// Size check for the files agents read (AGENTS.md → "Keep it small"): measures each one in
// characters, like `wc -m`, and exits non-zero if any is over its cap. The caps are shared with
// the owner's other repos; where they differ, the stricter wins.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

const caps = [
  ['loaded every session', ['CLAUDE.md', 'AGENTS.md'], 12_000],
  ['skill instructions', files('.claude/skills').filter((f) => f.endsWith('SKILL.md')), 15_000],
  ['skill supporting files', files('.claude/skills').filter((f) => !f.endsWith('SKILL.md')), 50_000],
  ['read whole (docs/)', files('docs').filter((f) => f.endsWith('.md')), 50_000],
];

let over = 0;
for (const [kind, paths, cap] of caps) {
  for (const path of paths) {
    const size = [...readFileSync(path, 'utf8')].length;
    const bad = size > cap;
    over += bad;
    console.log(`${bad ? '✗' : '✓'} ${String(size).padStart(6)} / ${cap}  ${path}  (${kind})`);
  }
}
if (over) {
  console.error(`\n${over} file(s) over their cap: split them (AGENTS.md → "Where the rest lives").`);
  process.exit(1);
}
