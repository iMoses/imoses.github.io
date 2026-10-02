// Section 4, second figure: the icon color of a NAS card, computed by its first draft and by the
// version that replaced it, in the four situations the card has to survive.
import { useState } from 'react';
import { Code } from '../shared/Code';
import { Wire } from '../shared/Wire';

// What Home Assistant holds in each situation: the availability sensor and the problem sensor.
const SITUATIONS = {
  healthy: { label: 'disk healthy', online: 'on', problem: 'off' },
  failing: { label: 'disk failing', online: 'on', problem: 'on' },
  off: { label: 'NAS switched off', online: 'off', problem: 'unavailable' },
  missing: { label: 'sensors not created yet', online: undefined, problem: undefined },
};

const draft = ({ problem }) => (problem === 'on' ? ['red', 'draft-red'] : ['green', 'draft-green']);
const CLAIMS = { green: 'healthy', red: 'a fault', gray: 'no data' };
const threeState = ({ online, problem }) =>
  online !== 'on' ? ['gray', 'gray'] : problem === 'on' ? ['red', 'red'] : ['green', 'green'];

const DRAFT = `
/* WRONG -- green whenever nothing is reporting a problem,
   including when nothing is reporting */
color: \${[...problems].some(e => hass.states[e]?.state === 'on')
  ? 'var(--red-color)'  «draft-red»
  : 'var(--green-color)'} !important;  «draft-green»
`;

const FIXED = `
color: \${hass.states['binary_sensor.nas_online']?.state !== 'on'
  ? 'var(--secondary-text-color)'  «gray»
  : ([...problems].some(e => hass.states[e]?.state === 'on')
      ? 'var(--red-color)'  «red»
      : 'var(--green-color)')} !important;  «green»
`;

const show = (v) => (v === undefined ? 'doesn’t exist' : v);

export function Color() {
  const [key, setKey] = useState('off');
  const sit = SITUATIONS[key];
  const [a, aLine] = draft(sit);
  const [b, bLine] = threeState(sit);

  return (
    <>
      <Wire
        nodes={[
          { name: 'Home Assistant', facts: [['nas_online', show(sit.online), null, 'doesn’t exist'], ['disk_2_problem', show(sit.problem), null, 'doesn’t exist']] },
          { name: 'First draft', facts: [['icon', <Swatch color={a} />, null, <Swatch color="green" />], ['claims', CLAIMS[a], a !== b && 'bad', 'no data']] },
          { name: 'Three-state', facts: [['icon', <Swatch color={b} />, null, <Swatch color="green" />], ['claims', CLAIMS[b], null, 'no data']] },
        ]}
      />
      <div className="split">
        <Code file="The card’s first draft (from the dashboard skill)" lang="js" source={DRAFT} hot={[aLine]} />
        <Code file="The three-state version" lang="js" source={FIXED} hot={[bLine]} />
      </div>
      <div className="controls">
        {Object.entries(SITUATIONS).map(([k, { label }]) => (
          <label key={k}>
            <input type="radio" name="color-situation" checked={key === k} onChange={() => setKey(k)} />
            {label}
          </label>
        ))}
      </div>
    </>
  );
}

function Swatch({ color }) {
  return <span className={`swatch swatch-${color}`}>{color}</span>;
}
