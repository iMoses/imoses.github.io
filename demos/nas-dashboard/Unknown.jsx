// Section 4, first figure: one field of the status document, `containers.down`, from the docker
// call that fills it to the line the dashboard prints. The reader decides what docker answers, and
// can put back the one-word shortcut the publisher's comment warns against.
import { useState } from 'react';
import { Code } from './Code';
import { Wire } from './Wire';

const ANSWERS = {
  exited: { label: 'authelia has exited', allc: '"authelia\\texited\\n…"' },
  running: { label: 'everything is running', allc: '"authelia\\trunning\\n…"' },
  failed: { label: 'docker doesn’t answer', allc: 'None' },
};

// What the publisher sends for each answer, with and without the shortcut.
function down(answer, shortcut) {
  if (answer === 'exited') return ['authelia'];
  if (answer === 'running') return [];
  return shortcut ? [] : null; // `or ""` turns "couldn't ask" into an empty answer
}

// The card's real template, branch by branch (the "outside the expected set" branch is left out).
function row(d) {
  if (d === null) return ['unknown', '⚠ Container state unknown'];
  if (d.length) return ['down', `⚠ ${d.join(', ')}`];
  return ['ok', 'All running'];
}

const PUBLISHER = `
allc = sh("docker ps -a --format '{{.Names}}\\t{{.State}}'")⟨shortcut⟩  «docker»
# \`or ""\` here would be the bug: a failed docker call would
# yield an empty \`down\` list, which reads downstream as
# "nothing is down" -- an unchecked system reporting itself
# healthy. None means "could not determine".
…
down = None  «none»
if allc is not None:  «check»
    down = [l.split("\\t")[0] for l in allc.splitlines()  «list»
            if l and not l.endswith("\\trunning")
            and l.split("\\t")[0] not in optional_set]
`;

const TEMPLATE = `
{% set d = state_attr('sensor.nas_containers_up', 'down') %}
{% if u in ['unknown', 'unavailable', '', 'None'] %}No data
{% elif d is none %}⚠ Container state unknown  «unknown»
{% elif d %}⚠ {{ d | join(', ') }}  «down»
{% elif … %}All running · {{ … }} outside the expected set
{% else %}All running{% endif %}  «ok»
`;

export function Unknown() {
  const [answer, setAnswer] = useState('failed');
  const [shortcut, setShortcut] = useState(false);
  const d = down(answer, shortcut);
  const json = JSON.stringify(d);
  const [branch, text] = row(d);
  const ran = answer === 'failed' && !shortcut ? ['docker', 'none', 'check'] : ['docker', 'none', 'check', 'list'];

  return (
    <>
      <Wire
        nodes={[
          { name: 'NAS', facts: [['docker ps -a', ANSWERS[answer].label, answer === 'failed' && 'bad', 'docker doesn’t answer'], ['down =', json, null, '["authelia"]']] },
          { name: 'Broker', facts: [[`kept on homelab/status`, `{"containers": {"down": ${json}, …}, …}`, null, '{"containers": {"down": ["authelia"], …}, …}']] },
          { name: 'Home Assistant', facts: [['attribute down', d === null ? 'None' : json, null, '["authelia"]'], ['Containers row', text, branch !== 'ok' && 'bad', '⚠ Container state unknown']] },
        ]}
      />
      <div className="split">
        <Code
          file="publish-nas-status.py (excerpt)"
          lang="python"
          source={PUBLISHER}
          hot={ran}
          live={{ shortcut: shortcut ? ' or ""' : '' }}
          notes={{ docker: `allc = ${shortcut && answer === 'failed' ? '""' : ANSWERS[answer].allc}`, [ran.includes('list') ? 'list' : 'none']: `down = ${d === null ? 'None' : json}` }}
        />
        <Code file="The Containers row’s text (dashboard YAML, line-broken)" lang="jinja" source={TEMPLATE} hot={[branch]} />
      </div>
      <div className="controls">
        <span>docker:</span>
        {Object.entries(ANSWERS).map(([k, { label }]) => (
          <label key={k}>
            <input type="radio" name="docker-answer" checked={answer === k} onChange={() => setAnswer(k)} />
            {label}
          </label>
        ))}
        <label>
          <input type="checkbox" checked={shortcut} onChange={(e) => setShortcut(e.target.checked)} />
          add <code>or ""</code>
        </label>
      </div>
    </>
  );
}
