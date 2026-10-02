// Sections 1–3: the NAS publishing its status through the broker to Home Assistant, and the
// Storage card that Home Assistant draws from it. One model, shown in three stages; each stage
// reveals one more thing the broker holds and gives the reader the switch that section is about.
//
//   copy    the card is a copy, as old as the last publish
//   retain  the broker keeps the last copy for whoever subscribes next
//   will    the broker can speak for a client that died without a word
//
// Simulated time runs ten times fast: one second of the clock is a tenth of a real second.
import { useEffect, useReducer } from 'react';
import { Code } from './Code';
import { Shot, usePreload } from './Shot';
import { Log, mmss } from './sim';
import { Wire } from './Wire';

const SPEED = 10;
const INTERVAL = 60; // INTERVAL_HEALTH: seconds between status publishes
const HA_BOOT = 20; // seconds Home Assistant takes to come back, here
const WILL_AFTER = 3; // seconds from kill -9 to the broker publishing the will (measured)
const LIT = 15; // seconds a line stays lit after it runs

const STATUS = 'homelab/status';
const AVAIL = 'homelab/availability';

// ——— The model ———

function initial({ retain = true, will = true } = {}) {
  const s = {
    t: 0,
    retain,
    will,
    pool: 'ONLINE', // the truth, on the NAS
    proc: 'running', // publisher: running | stopped | crashed
    nextAt: 0,
    broker: { status: null, avail: null, will: null }, // retained copies and the registered will
    ha: { up: true, status: null, avail: null, heard: null },
    queue: [], // [{ at, type }]
    log: [],
    hot: [],
    litUntil: 0,
  };
  return connect(s);
}

function say(s, who, text) {
  return { ...s, log: [...s.log, { when: mmss(s.t), who, text }].slice(-5) };
}

function light(s, ...names) {
  return { ...s, hot: names, litUntil: s.t + LIT };
}

// A message on a topic: the broker keeps it if retained, and Home Assistant hears it if it's up.
function deliver(s, topic, value, retained) {
  const key = topic === STATUS ? 'status' : 'avail';
  const broker = retained ? { ...s.broker, [key]: value } : s.broker;
  const ha = s.ha.up ? { ...s.ha, [key]: value, heard: s.t } : s.ha;
  return { ...s, broker, ha };
}

function publishStatus(s) {
  s = deliver(s, STATUS, { health: s.pool }, s.retain);
  s = say(s, 'nas', `${STATUS} {"pool": {"health": "${s.pool}"}, …}${s.retain ? ' retained' : ''}`);
  return light({ ...s, nextAt: s.t + INTERVAL }, 'zpool', 'publish');
}

function connect(s) {
  s = { ...s, proc: 'running', broker: { ...s.broker, will: s.will ? 'offline' : null } };
  s = deliver(s, AVAIL, 'online', s.retain);
  s = say(s, 'nas', `${AVAIL} online${s.retain ? ' retained' : ''}`);
  s = publishStatus(s); // the loop's first pass publishes straight away
  return light(s, 'will', 'online', 'publish');
}

function reduce(s, action) {
  switch (action.type) {
    case 'tick': {
      s = { ...s, t: s.t + 1 };
      if (s.t >= s.litUntil && s.hot.length) s = { ...s, hot: [] };
      for (const ev of s.queue.filter((e) => e.at <= s.t)) s = reduce({ ...s, queue: s.queue.filter((e) => e !== ev) }, ev);
      if (s.proc === 'running' && s.t >= s.nextAt) s = publishStatus(s);
      return s;
    }
    case 'pool':
      return { ...s, pool: action.value };
    case 'skip':
      return s.proc === 'running' ? { ...s, nextAt: s.t } : s;
    case 'restart-ha': {
      if (!s.ha.up) return s;
      s = say(s, 'ha', 'Home Assistant restarts and forgets everything');
      return { ...s, ha: { up: false, status: null, avail: null, heard: null }, queue: [...s.queue, { at: s.t + HA_BOOT, type: 'ha-up' }] };
    }
    case 'ha-up': {
      const held = [s.broker.avail && AVAIL, s.broker.status && STATUS].filter(Boolean);
      s = { ...s, ha: { up: true, status: s.broker.status, avail: s.broker.avail, heard: held.length ? s.t : null } };
      return say(s, 'broker', held.length ? `hands the new subscriber ${held.length} retained message${held.length > 1 ? 's' : ''}` : 'has nothing retained to hand over');
    }
    case 'stop': {
      if (s.proc !== 'running') return s;
      s = deliver(s, AVAIL, 'offline', true);
      s = say(s, 'nas', `${AVAIL} offline retained, then disconnects`);
      return light({ ...s, proc: 'stopped', broker: { ...s.broker, will: null } }, 'goodbye', 'disconnect');
    }
    case 'kill': {
      if (s.proc !== 'running') return s;
      return { ...s, proc: 'crashed', hot: [], queue: [...s.queue, { at: s.t + WILL_AFTER, type: 'dropped' }] };
    }
    case 'dropped': {
      if (!s.broker.will) return say(s, 'broker', 'connection lost; no will registered');
      s = deliver(s, AVAIL, s.broker.will, true);
      s = say(s, 'broker', `connection lost; publishes the will: ${AVAIL} offline retained`);
      return light({ ...s, broker: { ...s.broker, will: null } }, 'will');
    }
    case 'start':
      return s.proc === 'running' ? s : connect(s);
    case 'code': // editing the code restarts everything with the new code
      return initial({ retain: s.retain, will: s.will, ...action.value });
    default:
      return s;
  }
}

// ——— What Home Assistant draws ———

function card(s) {
  if (!s.ha.up) return null;
  if (s.ha.avail !== 'online' || !s.ha.status) return 'storage-offline';
  return s.ha.status.health === 'DEGRADED' ? 'storage-degraded' : 'storage-online';
}

const ALT = {
  'storage-online': 'The Storage card: pool online, both disks healthy.',
  'storage-degraded': 'The Storage card: pool degraded with 14 errors, disk 2 “Check SMART”, a critical alert. All in red.',
  'storage-offline': 'The Storage card, gray: every row says No data.',
};

// ——— The code beside it (homelab: publish-nas-status.py, trimmed) ———

const LOOP = `
health, alloc, size = out.split("\\t")[:3]  «zpool»
pool = {"health": health, …}
…
while running:
    client.publish(TOPIC_STATUS, json.dumps(payload.build()),  «publish»
                   qos=0, retain=⟨retain⟩)
    for _ in range(INTERVAL_HEALTH):  # 60 s  «sleep»
        …
        time.sleep(1)
`;

const CONNECT = `
def on_connect(c, _u, _f, rc, _p=None):
    if rc == 0:
        c.publish(TOPIC_AVAIL, "online", qos=1, retain=⟨retain⟩)  «online»
`;

const WILL = `
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2,
                     client_id="homelab-nas")
# The whole availability design rests on this line: an
# ungraceful death leaves \`offline\` retained, so HA shows
# unavailable instead of a stale healthy reading.
client.will_set(TOPIC_AVAIL, "offline", qos=1, retain=True)  «will»

def on_connect(c, _u, _f, rc, _p=None):
    if rc == 0:
        c.publish(TOPIC_AVAIL, "online", qos=1, retain=True)  «online»
…
while running:
    client.publish(TOPIC_STATUS, json.dumps(payload.build()),  «publish»
                   qos=0, retain=True)
    …
# Deliberate, graceful shutdown: say offline rather than
# relying on the will, which only fires when the connection
# drops badly.
client.publish(TOPIC_AVAIL, "offline", qos=1, retain=True)  «goodbye»
client.loop_stop()
client.disconnect()  «disconnect»
`;

// ——— The figure ———

const NAMES = ['storage-online', 'storage-degraded', 'storage-offline'];

export function Broker({ stage }) {
  usePreload(NAMES);
  const [s, dispatch] = useReducer(reduce, undefined, initial);

  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'tick' }), 1000 / SPEED);
    return () => clearInterval(t);
  }, []);

  const shown = card(s);
  const ago = s.ha.heard == null ? 'never' : `${mmss(s.t - s.ha.heard)} ago`;
  const proc = { running: 'running', stopped: 'stopped (systemctl stop)', crashed: 'killed (kill -9)' }[s.proc];
  const retained = (v) => (v == null ? ['nothing', 'muted'] : [typeof v === 'string' ? v : `{"health": "${v.health}", …}`, null]);

  // Every stage shows the same facts throughout, each with its widest value reserved.
  const up = s.ha.up;
  const nodes = [
    {
      name: 'NAS',
      facts: [
        ['zpool says', s.pool, s.pool === 'DEGRADED' && 'bad', 'DEGRADED'],
        ['publisher', proc, s.proc !== 'running' && 'bad', 'stopped (systemctl stop)'],
        ['next publish in', s.proc === 'running' ? mmss(Math.max(0, s.nextAt - s.t)) : '—', null, '0:00'],
      ],
    },
    {
      name: 'Broker',
      facts: [
        stage === 'copy'
          ? [STATUS, 'passes each message to 1 subscriber']
          : [`kept on ${STATUS}`, ...retained(s.broker.status), '{"health": "DEGRADED", …}'],
        stage !== 'copy' && [`kept on ${AVAIL}`, ...retained(s.broker.avail), 'nothing'],
        stage === 'will' && ['will', s.broker.will ? `${AVAIL} offline, if the NAS vanishes` : 'none registered', !s.broker.will && 'muted', `${AVAIL} offline, if the NAS vanishes`],
      ].filter(Boolean),
    },
    {
      name: 'Home Assistant',
      facts: [
        ['pool', !up ? 'restarting…' : s.ha.status ? s.ha.status.health : 'no data', !(up && s.ha.status) && 'muted', 'restarting…'],
        stage !== 'copy' && ['NAS availability', !up ? '—' : (s.ha.avail ?? 'unknown'), s.ha.avail !== 'online' && 'muted', 'unknown'],
        ['last heard from the NAS', ago, null, '00:00 ago'],
      ].filter(Boolean),
    },
  ];

  let code;
  if (stage === 'will') {
    code = <Code file="publish-nas-status.py (excerpt)" lang="python" source={WILL} hot={s.hot} off={s.will ? [] : ['will']} />;
  } else {
    const live = { retain: s.retain ? 'True' : 'False' };
    const notes = { zpool: `health = "${s.pool}"`, sleep: s.proc === 'running' ? `${s.nextAt - s.t} s left` : null };
    code = (
      <Code
        file="publish-nas-status.py (excerpt)"
        lang="python"
        source={stage === 'retain' ? `${CONNECT.trim()}\n…\n${LOOP.trim()}` : LOOP}
        hot={s.hot.length ? s.hot : ['sleep']}
        live={live}
        notes={notes}
      />
    );
  }

  return (
    <>
      <Wire nodes={nodes} />
      <div className="split">
        <div>
          {shown ? (
            <Shot name={shown} size="storage" alt={ALT[shown]} />
          ) : (
            <div className="shot-box shot-storage">
              <div className="shot shot-blank">Home Assistant is restarting.</div>
            </div>
          )}
          <Log lines={s.log} />
        </div>
        <div>{code}</div>
      </div>
      <div className="controls">
        {stage === 'copy' && (
          <>
            <button type="button" disabled={s.pool !== 'ONLINE'} onClick={() => dispatch({ type: 'pool', value: 'DEGRADED' })}>
              Fail disk 2
            </button>
            <button type="button" disabled={s.pool === 'ONLINE'} onClick={() => dispatch({ type: 'pool', value: 'ONLINE' })}>
              Replace disk 2
            </button>
            <button type="button" onClick={() => dispatch({ type: 'skip' })}>Skip to the next publish</button>
          </>
        )}
        {stage === 'retain' && (
          <>
            <label>
              <input type="checkbox" checked={s.retain} onChange={(e) => dispatch({ type: 'code', value: { retain: e.target.checked } })} />
              retain=True
            </label>
            <button type="button" disabled={!s.ha.up} onClick={() => dispatch({ type: 'restart-ha' })}>Restart Home Assistant</button>
          </>
        )}
        {stage === 'will' && (
          <>
            <label>
              <input type="checkbox" checked={s.will} onChange={(e) => dispatch({ type: 'code', value: { will: e.target.checked } })} />
              will_set(…)
            </label>
            <button type="button" disabled={s.proc !== 'running'} onClick={() => dispatch({ type: 'stop' })}>systemctl stop</button>
            <button type="button" disabled={s.proc !== 'running'} onClick={() => dispatch({ type: 'kill' })}>kill -9</button>
            <button type="button" disabled={s.proc === 'running'} onClick={() => dispatch({ type: 'start' })}>systemctl start</button>
          </>
        )}
        <span>clock: {mmss(s.t)} (ten times fast)</span>
      </div>
    </>
  );
}
