// Mounts each figure of "What the next session knows" into its `<figure class="demo" data-demo="…">`
// placeholder. Every figure is the same model: what a new session of a coding agent has in front
// of it (Context.jsx), measured from the owner's Home Assistant repo, beside the real text that
// decides it.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Code } from '../shared/Code';
import { Wire } from '../shared/Wire';
import { Context } from './Context';
import { claudeMd, dashboardSkill } from './history';
import { DESCRIPTIONS, ONE_FILE, RULES, SPLIT_FILE, facts, k, loaded, places, sessions, skills, tasks, tokens } from './model';
import { ROWS, initialHost, runNight, versions } from './nightly';
import agentsMd from '../../AGENTS.md?raw';
import siteDesignSkill from '../../.claude/skills/site-design/SKILL.md?raw';
import writeEntrySkill from '../../.claude/skills/write-entry/SKILL.md?raw';
import reviewEntrySkill from '../../.claude/skills/review-entry/SKILL.md?raw';
import styleMd from '../../docs/STYLE.md?raw';
import historyMd from '../../docs/history.md?raw';
import checkSizesSrc from '../../tools/check-sizes.mjs?raw';
import './figures.css';

const chars = (n) => `${n.toLocaleString('en-US')} chars`;

// ——— Section 1: the file that grew ———

const DAY = 86_400_000;
const START = Date.parse('2026-07-24');
const DAYS = Array.from({ length: 72 }, (_, i) => new Date(START + i * DAY).toISOString().slice(0, 10));

// The size of a file at the end of a day: its last commit on or before it.
const sizeOn = (series, day) => series.filter(([d]) => d <= day).at(-1)?.[1] ?? null;
const commitsOn = (day) => claudeMd.filter(([d]) => d === day).length;

// What was happening, from the commit messages. The latest note on or before the day shows.
const NOTES = [
  ['2026-07-24', 'Since February the file has been 221 lines: how the repo is laid out, naming conventions, a list of rooms.'],
  ['2026-07-25', 'Daily work with the agent starts. Each lesson it learns the hard way becomes a paragraph.'],
  ['2026-07-27', `${commitsOn('2026-07-27')} commits change the file in one day. Every trap found gets written down.`],
  ['2026-07-31', 'The first move out: 109 lines of finished work go to a separate file.'],
  ['2026-08-03', 'The peak: 2,286 lines, loaded whole at the start of every session.'],
  ['2026-08-04', 'The split: ten skills and a docs/ page. CLAUDE.md keeps 481 lines.'],
  ['2026-09-23', 'The dashboards skill passes 100,000 characters on its own.'],
  ['2026-10-02', 'Size budgets arrive (section 5). The dashboards skill is split the same way: an index, and reference files read when needed.'],
];

const W = 480;
const H = 240;
const M = { l: 40, r: 8, t: 8, b: 24 };
const xOf = (i) => M.l + (i / (DAYS.length - 1)) * (W - M.l - M.r);
const yOf = (v) => H - M.b - (v / 160_000) * (H - M.t - M.b);
const path = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');

function Growth() {
  const [i, setI] = useState(DAYS.indexOf('2026-08-03'));
  const day = DAYS[i];
  const doc = sizeOn(claudeMd, day);
  const dash = sizeOn(dashboardSkill, day);
  const note = NOTES.filter(([d]) => d <= day).at(-1)[1];

  const pick = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    setI(Math.max(0, Math.min(DAYS.length - 1, Math.round(((x - M.l) / (W - M.l - M.r)) * (DAYS.length - 1)))));
  };

  const docLine = path(DAYS.map((d, j) => [xOf(j), yOf(sizeOn(claudeMd, d))]));
  const dashLine = path(DAYS.map((d, j) => [d, j]).filter(([d]) => d >= '2026-08-04').map(([d, j]) => [xOf(j), yOf(sizeOn(dashboardSkill, d))]));

  return (
    <>
      <Wire
        nodes={[
          { name: 'That day', facts: [['date', day], ['commits to CLAUDE.md', commitsOn(day), null, '00']] },
          { name: 'CLAUDE.md', facts: [['size', chars(doc), null, chars(154_378)], ['loaded', 'every session']] },
          { name: 'Dashboards skill', facts: [['size', dash ? chars(dash) : 'still inside CLAUDE.md', null, 'still inside CLAUDE.md'], ['loaded', dash ? 'when the task is a card' : '—', null, 'when the task is a card']] },
        ]}
      />
      <div className="split">
        <div className="chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="CLAUDE.md size per day, July to October 2026" onPointerDown={pick} onPointerMove={(e) => e.buttons && pick(e)}>
            {[0, 40_000, 80_000, 120_000, 160_000].map((v) => (
              <g key={v} className="tick">
                <line x1={M.l} x2={W - M.r} y1={yOf(v)} y2={yOf(v)} />
                <text x={M.l - 6} y={yOf(v) + 4} textAnchor="end">{v ? `${v / 1000}k` : '0'}</text>
              </g>
            ))}
            {['2026-08-01', '2026-09-01', '2026-10-01'].map((d) => (
              <text key={d} x={xOf(DAYS.indexOf(d))} y={H - 6} textAnchor="middle">
                {d.slice(5) === '08-01' ? 'Aug' : d.slice(5) === '09-01' ? 'Sep' : 'Oct'}
              </text>
            ))}
            <line className="milestone" x1={xOf(DAYS.indexOf('2026-08-04'))} x2={xOf(DAYS.indexOf('2026-08-04'))} y1={M.t} y2={H - M.b} />
            <path className="series-1" d={docLine} />
            <path className="series-2" d={dashLine} />
            <line className="cursor" x1={xOf(i)} x2={xOf(i)} y1={M.t} y2={H - M.b} />
            <circle className="dot-1" cx={xOf(i)} cy={yOf(doc)} r="4" />
            {dash && <circle className="dot-2" cx={xOf(i)} cy={yOf(dash)} r="4" />}
          </svg>
        </div>
        <div>
          <p className="note">{note}</p>
          <Context
            label="A session about a dashboard card loads"
            rows={2}
            parts={[
              { name: 'CLAUDE.md', chars: doc, cls: 'part-1' },
              ...(dash ? [{ name: 'the dashboards skill', chars: dash, cls: 'part-2' }] : []),
            ]}
          />
        </div>
      </div>
      <div className="controls">
        <label>
          <span>Day</span>
          <input type="range" min="0" max={DAYS.length - 1} value={i} onChange={(e) => setI(+e.target.value)} aria-label="Day" />
          <output>{day}</output>
        </label>
      </div>
    </>
  );
}

// ——— Section 2: what a session loads ———

// The skill index as every session sees it: one line per skill, and the matching skill's "use
// when" wrapped under it.
const wrap = (text, width = 54) =>
  text.split(' ').reduce((lines, word) => {
    const last = lines.at(-1);
    if (last && last.length + word.length + 1 <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, []);

const LONGEST_WHEN = Math.max(...Object.values(skills).map((s) => wrap(s.when).length));
const INDEX_ROWS = Object.keys(skills).length + LONGEST_WHEN + 1;

function skillIndex(open) {
  return [
    ...Object.entries(skills).flatMap(([name, s]) => [
      `${name}: «${name}»`,
      ...(name === open ? wrap(s.when).map((l) => `  ${l} «${name}»`) : []),
    ]),
    '… and 3 more',
  ].join('\n');
}

function Load() {
  const [t, setT] = useState(0);
  const [split, setSplit] = useState(true);
  const task = tasks[t];
  const skill = task.skill && skills[task.skill];
  const about = skill ? skill.chars : 0;
  const parts = split
    ? [
        { name: 'CLAUDE.md', chars: SPLIT_FILE, cls: 'part-1' },
        { name: 'every skill’s description', chars: DESCRIPTIONS, cls: 'part-3' },
        ...(skill ? [{ name: task.skill, chars: skill.chars, cls: 'part-2' }] : []),
      ]
    : [{ name: 'CLAUDE.md, all of it', chars: ONE_FILE, cls: 'part-1' }];
  const total = parts.reduce((s, p) => s + p.chars, 0);
  const share = about ? `${Math.round((about / total) * 100)}%` : '—';

  return (
    <>
      <Wire
        nodes={[
          { name: 'The task', facts: [['asked', task.name, null, 'Add a quirk for a Zigbee plug'], ['skill it matches', task.skill ?? 'none', null, 'ha-logbook-attribution']] },
          { name: 'Loaded', facts: [['before you type', `≈ ${k(tokens(total))} tokens`, null, '≈ 00.0k tokens'], ['instructions', split ? 'CLAUDE.md, then the skill' : 'CLAUDE.md, whole', null, 'CLAUDE.md, then the skill']] },
          { name: 'About this task', facts: [['of what loaded', skill ? `≈ ${k(tokens(about))} tokens` : 'CLAUDE.md’s conventions', null, 'CLAUDE.md’s conventions'], ['share', share, null, '00%']] },
        ]}
      />
      <div className="split">
        <Context rows={3} parts={parts} />
        <Code
          file={split ? 'the skill index every session is shown, Aug 4' : 'the skill index: none yet, Aug 3'}
          lang="yaml"
          source={skillIndex(split ? task.skill : null)}
          hot={split && task.skill ? [task.skill] : []}
          off={split ? [] : Object.keys(skills)}
          rows={INDEX_ROWS}
        />
      </div>
      <div className="controls">
        <label>
          <span>Task</span>
          <select value={t} onChange={(e) => setT(+e.target.value)}>
            {tasks.map((x, j) => (
              <option key={x.name} value={j}>{x.name}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
          <span>split into skills (Aug 4)</span>
        </label>
      </div>
    </>
  );
}

// ——— Section 3: where a fact goes ———

const CELL = { used: 'used', missed: 'MISSED', carried: 'carried', none: '·' };

function cell(f, place, s, j) {
  const need = f.needed.includes(j);
  const has = loaded(f, place, s);
  return need ? (has ? 'used' : 'missed') : has ? 'carried' : 'none';
}

function Sort() {
  const [where, setWhere] = useState(facts.map(() => 'claude'));
  const [last, setLast] = useState(0);
  const grid = facts.map((f, i) => sessions.map((s, j) => cell(f, where[i], s, j)));
  const flat = grid.flat();
  const missed = flat.filter((c) => c === 'missed').length;
  const carried = flat.filter((c) => c === 'carried').length;
  const used = flat.filter((c) => c === 'used').length;
  const file = (i, place) => {
    setWhere((w) => w.map((p, j) => (j === i ? place : p)));
    setLast(i);
  };

  return (
    <>
      <Wire
        nodes={[
          { name: 'Four sessions later', facts: [['a rule was there when needed', used, null, '00'], ['a rule was needed and missing', missed, missed && 'bad', '00']] },
          { name: 'Carried for nothing', facts: [['loaded, not needed', carried, null, '00']] },
          { name: 'Sessions', facts: sessions.map((s, j) => [`S${j + 1}`, s.name, null, 'Why did the push stop?']) },
        ]}
      />
      <div className="split">
        <ol className="facts">
          <li className="fact-row fact-head" aria-hidden="true">
            <span>written in</span>
            {sessions.map((x, j) => (
              <span key={j}>{`S${j + 1}`}</span>
            ))}
          </li>
          {facts.map((f, i) => (
            <li key={f.text}>
              <p className="fact-text">{f.text}</p>
              <div className="fact-row">
                <fieldset className="places" aria-label="Where this is written">
                  {places.map(([id, name]) => (
                    <label key={id}>
                      <input type="radio" name={`fact-${i}`} checked={where[i] === id} onChange={() => file(i, id)} />
                      {name}
                    </label>
                  ))}
                </fieldset>
                {grid[i].map((c, j) => (
                  <span key={j} className={`cell ${c}`} title={`S${j + 1}: ${sessions[j].name}`}>
                    {CELL[c]}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <Code file="CLAUDE.md, “Where the rest of this lives”" lang="yaml" source={RULES} hot={[where[last]]} />
      </div>
      <div className="controls">
        <button type="button" onClick={() => setWhere(facts.map(() => 'claude'))}>
          Everything in CLAUDE.md (Aug 3)
        </button>
        <button type="button" onClick={() => setWhere(facts.map((f) => f.home))}>
          Filed as the repo does today
        </button>
      </div>
    </>
  );
}

// ——— Section 4: the nightly push ———

const EVENTS = [
  ['edit', 'Edit an automation in the UI'],
  ['rename', 'Rename an entity'],
  ['deleted', 'Update HA (it deletes a blueprint)'],
];

function Nightly() {
  const [v, setV] = useState(0);
  const [host, setHost] = useState(initialHost);
  const [nights, setNights] = useState([]);
  const version = versions[v];
  const last = nights[0];
  const lastArrival = host.arrived.length ? nights.find((n) => n.pushed)?.n : null;

  const change = (kind) => setHost((h) => (h.changes.includes(kind) ? h : { ...h, changes: [...h.changes, kind] }));
  const run = () => {
    const r = runNight(version, host);
    setHost(r.host);
    setNights((ns) => [{ ...r, n: ns.length + 1, pushed: r.ran.includes('pushed') }, ...ns]);
  };
  const choose = (j) => {
    setV(j);
    setHost(initialHost);
    setNights([]);
  };

  return (
    <>
      <Wire
        nodes={[
          {
            name: 'The house today',
            facts: [
              ['changed', host.changes.length ? host.changes.join(', ') : 'nothing', null, 'edit, rename, deleted'],
              ['half-written file', host.broken ? 'yes' : 'no', host.broken && 'bad'],
              ['new untracked file', host.newFile ? 'yes' : 'no', host.newFile && !version.untracked && 'bad'],
            ],
          },
          {
            name: 'Git on the host',
            facts: [
              ['commits GitHub lacks', host.local, host.local && 'bad', '00'],
              ['behind GitHub', host.behind ? 'yes, a laptop push' : 'no', null, 'yes, a laptop push'],
            ],
          },
          {
            name: 'GitHub',
            facts: [
              ['last push arrived', lastArrival ? `night ${lastArrival}` : 'never', null, 'night 00'],
              ['nights run', nights.length, null, '00'],
            ],
          },
        ]}
      />
      <div className="split">
        <div>
        <div className="controls controls-rows">
          <label>
            <span>Version</span>
            <select value={v} onChange={(e) => choose(+e.target.value)}>
              {versions.map((x, j) => (
                <option key={j} value={j}>{`${x.date}: ${x.title}`}</option>
              ))}
            </select>
          </label>
          {EVENTS.map(([kind, name]) => (
            <button key={kind} type="button" disabled={host.changes.includes(kind)} onClick={() => change(kind)}>
              {name}
            </button>
          ))}
          <button type="button" disabled={host.behind} onClick={() => setHost((h) => ({ ...h, behind: true }))}>
            Push from the laptop
          </button>
          <button type="button" disabled={host.newFile} onClick={() => setHost((h) => ({ ...h, newFile: true }))}>
            Add a new file
          </button>
          <label>
            <input type="checkbox" checked={host.broken} onChange={(e) => setHost((h) => ({ ...h, broken: e.target.checked }))} />
            <span>a YAML file is half-written</span>
          </label>
          <button type="button" onClick={run}>
            Run the 04:00 push
          </button>
        </div>
          <ol className="night-log" reversed aria-live="polite">
            {nights.length === 0 && <li className="t">Nothing has run yet.</li>}
            {nights.slice(0, 8).map((n) => (
              <li key={n.n}>
                <span className="t">{`night ${n.n} · `}</span>
                <span>{`${n.said} `}</span>
                <span className={n.bad ? 'bad' : undefined}>{`→ ${n.verdict}`}</span>
              </li>
            ))}
          </ol>
        </div>
        <Code
          file={`scripts/git-nightly-push.sh, ${version.date}: ${version.title}`}
          lang="sh"
          source={version.source}
          hot={last ? last.ran : []}
          notes={last ? { [last.stop]: last.note } : {}}
          rows={ROWS}
        />
      </div>
    </>
  );
}

// ——— Section 5: a budget per file, and a check that says no ———

// This repo's own instruction files, measured when the site is built, so the figure can't drift
// from them. A "lesson" is a real one: the Frames rule from the site-design skill.
const size = (text) => [...text].length;
const LESSON = siteDesignSkill.slice(siteDesignSkill.indexOf('- **Frames:**'), siteDesignSkill.indexOf('- **Lines never'));
const description = (skill) => skill.match(/^description: (.*)$/m)[1];
const DESCRIPTIONS_HERE = [siteDesignSkill, writeEntrySkill, reviewEntrySkill].map(description).join('\n');

const CAP_LINES = { always: "'loaded every session'", skill: "'skill instructions'", docs: "'read whole" };

function Budget() {
  const [written, setWritten] = useState(0); // lessons a session added to AGENTS.md
  const [moved, setMoved] = useState(0); // of those, how many were moved into the skill
  const extra = LESSON.repeat(written - moved);
  const rows = [
    ['AGENTS.md', size(agentsMd) + size(extra), 12_000, 'always'],
    ['.claude/skills/site-design/SKILL.md', size(siteDesignSkill) + size(LESSON) * moved, 15_000, 'skill'],
    ['.claude/skills/write-entry/SKILL.md', size(writeEntrySkill), 15_000, 'skill'],
    ['docs/STYLE.md', size(styleMd), 50_000, 'docs'],
    ['docs/history.md', size(historyMd), 50_000, 'docs'],
  ];
  const over = rows.filter(([, n, cap]) => n > cap);

  return (
    <>
      <Wire
        nodes={[
          { name: 'Every session', facts: [['loads AGENTS.md', chars(rows[0][1]), over.some((r) => r[3] === 'always') && 'bad', chars(19_999)], ['cap', chars(12_000)]] },
          { name: 'Design tasks', facts: [['also load the skill', chars(rows[1][1]), null, chars(19_999)], ['cap', chars(15_000)]] },
          { name: 'npm run check:sizes', facts: [['exit code', over.length ? 1 : 0, over.length > 0 && 'bad'], ['over their cap', over.length, over.length > 0 && 'bad', '0']] },
        ]}
      />
      <div className="split">
        <div>
          <Context
            rows={2}
            parts={[
              { name: 'AGENTS.md', chars: rows[0][1], cls: 'part-1' },
              { name: 'every skill’s description', chars: size(DESCRIPTIONS_HERE), cls: 'part-3' },
            ]}
          />
          <ul className="check-output" aria-live="polite">
            {rows.map(([path, n, cap]) => (
              <li key={path} className={n > cap ? 'bad' : undefined}>
                {`${n > cap ? '✗' : '✓'} ${String(n).padStart(6, ' ')} / ${cap}  ${path}`}
              </li>
            ))}
          </ul>
        </div>
        <Code
          file="tools/check-sizes.mjs"
          lang="js"
          source={checkSizesSrc}
          match={{ ...CAP_LINES, exit: 'process.exit(1)' }}
          hot={[...new Set(over.map((r) => r[3])), ...(over.length ? ['exit'] : [])]}
        />
      </div>
      <div className="controls">
        <button type="button" onClick={() => setWritten((w) => w + 1)}>
          A session writes down a lesson
        </button>
        <button type="button" disabled={written === moved} onClick={() => setMoved(written)}>
          Move them to the site-design skill
        </button>
        <button
          type="button"
          disabled={!written}
          onClick={() => {
            setWritten(0);
            setMoved(0);
          }}
        >
          Start over
        </button>
      </div>
    </>
  );
}

// ——— Section 6: making hidden state readable ———

const OLD = 'light.ikea_of_sweden_tradfri_bulb_e14_cws_globe_806lm';
const NEW = 'light.master_bedroom_wall_1';

// Rewrapped to fit the panel; the words are the file's.
const EXPORT_DOC = `"""Export the parts of .storage that the tracked YAML
actually depends on.

The registries in .storage are not committable -- they
are large, churn on every restart, and hold auth tokens.
But the YAML in this repo addresses entities *by the IDs
and names those registries assign*, so a checkout on its
own can't tell you whether
\`${OLD}\`
is the Master Bedroom wall light or a stale reference.
…
  * a rename shows up as a one-line diff in the «diff»
    nightly commit «diff»
  * \`git log -p inventory/entities.csv\` answers «log»
    "when did this ID change?" «log»
…
"""`;

function Inventory() {
  const [renamed, setRenamed] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [exported, setExported] = useState(true);
  const id = renamed ? NEW : OLD;
  const recorded = pushed && renamed && exported;

  return (
    <>
      <Wire
        nodes={[
          { name: '.storage (not in git)', facts: [['the light is', id, null, OLD]] },
          {
            name: 'automations.yaml (in git)',
            facts: [
              ['turns on', OLD],
              ['which', renamed ? 'no longer exists' : 'exists', renamed && 'bad', 'no longer exists'],
            ],
          },
          {
            name: 'inventory/ (in git)',
            facts: [['row', exported ? (pushed ? id : OLD) : 'not exported', !exported && 'muted', OLD]],
          },
        ]}
      />
      <div className="split">
        <ul className="diff" aria-live="polite">
          <li className="file">{pushed ? 'git log -p, the next morning:' : 'git log -p: nothing new yet'}</li>
          <li className="ref">{pushed ? (recorded ? 'inventory/entities.csv' : 'no tracked file changed') : '·'}</li>
          <li className={recorded ? 'del' : undefined}>{recorded ? `-${OLD},,zha,Master Bedroom,` : '·'}</li>
          <li className={recorded ? 'ins' : undefined}>{recorded ? `+${NEW},,zha,Master Bedroom,` : '·'}</li>
        </ul>
        <Code file="scripts/export-inventory.py" lang="python" source={EXPORT_DOC} hot={recorded ? ['diff', 'log'] : []} />
      </div>
      <div className="controls">
        <button type="button" disabled={renamed} onClick={() => setRenamed(true)}>
          Rename it in the UI
        </button>
        <button type="button" disabled={pushed} onClick={() => setPushed(true)}>
          Run the 04:00 push
        </button>
        <label>
          <input type="checkbox" checked={exported} disabled={pushed} onChange={(e) => setExported(e.target.checked)} />
          <span>
            export <code>inventory/</code> before committing
          </span>
        </label>
        <button
          type="button"
          onClick={() => {
            setRenamed(false);
            setPushed(false);
          }}
        >
          Start over
        </button>
      </div>
    </>
  );
}

const figures = { growth: Growth, load: Load, sort: Sort, nightly: Nightly, budget: Budget, inventory: Inventory };

for (const el of document.querySelectorAll('.demo[data-demo]')) {
  const Figure = figures[el.dataset.demo];
  const stage = el.querySelector('.demo-stage');
  if (Figure && stage) createRoot(stage).render(<Figure />);
}
