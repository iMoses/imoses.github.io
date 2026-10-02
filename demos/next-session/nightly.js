// Section 4: the nightly push script, as it stood after each of the commits that changed it, and a
// model of what each version does on a given night. The excerpts are faithful to the private
// repo's `scripts/git-nightly-push.sh` at those commits, trimmed with `…` (the SSH setup and the
// comments). `«name»` names a line so the figure can light it; see demos/shared/Code.jsx.

const HEAD = `set -eu
…
cd /config
`;

const UNTRACKED = `untracked="$(git ls-files --others --exclude-standard)" «untracked»
if [ -n "$untracked" ]; then
  echo "UNTRACKED:"
  echo "$untracked"
fi
`;

const gate = (skip) => `python3 scripts/export-inventory.py >/dev/null «export»
git ls-files -z '*.yaml' '*.yml' | python3 -c ' «gate»
…${skip ? `
    if not os.path.exists(path): «skip»
        continue` : ''}
    try:
        with open(path, encoding="utf-8") as fh: «open»
            yaml.load(fh, Loader=L)
    …
    print("YAML parse errors, refusing to commit:", …) «refuse»
    sys.exit(1)
'
`;

const SIMPLE_END = `git add -u «add»
if git diff --cached --quiet; then «nothing»
  echo "No changes to sync."
  exit 0 «exit0»
fi

git commit -m "Nightly auto-sync: $(date …)" «commit»
git push origin main «push»
echo "Pushed successfully." «pushed»`;

const RECONCILE_END = `git add -u «add»
if git diff --cached --quiet; then «nothing»
  echo "No changes to sync."
else
  git commit -m "Nightly auto-sync: $(date …)" «commit»
fi

git fetch origin main «fetch»

if [ "$(git rev-list --count origin/main..HEAD)" -eq 0 ]; then «ahead»
  echo "Nothing to push."
  exit 0 «exit0»
fi

if ! git rebase origin/main; then «rebase»
  git rebase --abort || true
  echo "Rebase onto origin/main failed -- …" >&2
  exit 1
fi

git push origin main «push»
echo "Pushed successfully." «pushed»`;

// `untracked`: reports new files. `gate`: exports inventory/ and refuses unparseable YAML.
// `reconcile`: commits and pushes are separate questions; rebases onto GitHub first.
// `skip`: the gate ignores tracked files that are gone from disk.
export const versions = [
  { date: 'Jul 25', title: 'first version', source: HEAD + SIMPLE_END },
  { date: 'Jul 25', title: 'report new files', source: HEAD + UNTRACKED + SIMPLE_END, untracked: true },
  { date: 'Jul 25', title: 'export inventory/, refuse broken YAML', source: HEAD + UNTRACKED + gate(false) + SIMPLE_END, untracked: true, gate: true },
  { date: 'Jul 31', title: 'reconcile with GitHub', source: HEAD + UNTRACKED + gate(false) + RECONCILE_END, untracked: true, gate: true, reconcile: true },
  { date: 'Aug 6', title: 'survive a deleted file', source: HEAD + UNTRACKED + gate(true) + RECONCILE_END, untracked: true, gate: true, reconcile: true, skip: true },
];

export const ROWS = Math.max(...versions.map((v) => v.source.split('\n').length));

export const initialHost = {
  changes: [], // what changed in /config today: 'edit' | 'rename' | 'deleted'
  broken: false, // a tracked YAML file is half-written
  newFile: false, // an untracked file is sitting in /config
  local: 0, // commits on the host that GitHub doesn't have
  behind: false, // GitHub has commits the host hasn't pulled (a push from the laptop)
  arrived: [], // what reached GitHub, newest first
};

// One night: run version `v` against the host. Returns the new host, the lines that ran (by name),
// a note for the line it stopped on, what it printed last, and a verdict about what really happened.
export function runNight(v, host) {
  const ran = [];
  const h = { ...host, changes: [...host.changes] };
  const finish = (line, note, said, verdict, bad) => ({ host: h, ran, stop: line, note, said, verdict, bad });

  if (v.untracked) ran.push('untracked');
  if (v.gate) {
    ran.push('export', 'gate', 'open');
    const missing = h.changes.includes('deleted') && !v.skip;
    if (v.skip && h.changes.includes('deleted')) ran.push('skip');
    if (missing || h.broken) {
      ran.push('refuse');
      const why = missing ? 'FileNotFoundError: a tracked file is gone' : 'a file does not parse';
      return finish('refuse', why, 'YAML parse errors, refusing to commit', missing ? 'exit 1. Nothing will change by tomorrow, so it fails again' : 'exit 1. Nothing committed until the file is fixed', true);
    }
  }

  // What `git add -u` can see: tracked files only. A rename lives in .storage, which isn't tracked;
  // only the inventory/ export turns it into a tracked change.
  ran.push('add', 'nothing');
  const staged = h.changes.filter((c) => c !== 'rename' || v.gate);
  const lost = h.changes.includes('rename') && !v.gate;
  const brokenStaged = h.broken; // only reachable without the gate
  const changed = staged.length > 0 || brokenStaged;
  h.changes = [];

  if (!v.reconcile) {
    if (!changed) {
      ran.push('exit0');
      const stranded = h.local;
      return finish('exit0', 'exit 0: success', 'No changes to sync.',
        stranded ? `exit 0, reported as success. ${stranded} commit${stranded > 1 ? 's' : ''} never left the host` : lost ? 'exit 0. The rename was never recorded' : 'exit 0. Nothing to do', stranded > 0 || lost);
    }
    ran.push('commit', 'push');
    h.local += 1;
    if (h.behind) return finish('push', 'rejected: GitHub has newer commits', 'rejected (fetch first)', 'exit 1. The commit stays on the host', true);
    ran.push('pushed');
    h.arrived = [{ commits: h.local, broken: brokenStaged }, ...h.arrived];
    h.local = 0;
    return finish('push', `${h.arrived[0].commits} commit${h.arrived[0].commits > 1 ? 's' : ''}`, 'Pushed successfully.',
      brokenStaged ? 'pushed, including the half-written file' : lost ? 'pushed. The rename is not in it' : 'pushed', brokenStaged || lost);
  }

  if (changed) {
    ran.push('commit');
    h.local += 1;
  }
  ran.push('fetch', 'ahead');
  if (!h.local) {
    ran.push('exit0');
    return finish('exit0', 'nothing to push', 'Nothing to push.', 'exit 0. Nothing to do', false);
  }
  ran.push('rebase', 'push', 'pushed');
  h.behind = false;
  h.arrived = [{ commits: h.local, broken: false }, ...h.arrived];
  const n = h.local;
  h.local = 0;
  const verdict = n > 1 ? `pushed, ${n - 1} of them from earlier nights` : staged.includes('deleted') ? 'pushed, the deletion included' : 'pushed';
  return finish('push', `${n} commit${n > 1 ? 's' : ''}`, 'Pushed successfully.', verdict, false);
}
