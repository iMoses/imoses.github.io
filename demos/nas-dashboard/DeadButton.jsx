// Section 5: Home Assistant's own update dialog for one container, the updater service that does
// the installing, and the availability topics that decide whether the Update button is offered.
// The reader can kill the updater, press Update, and add the third availability source.
import { useState } from 'react';
import { Code } from '../shared/Code';
import { Hotspot, Shot, usePreload } from './Shot';
import { Log, useLater, useLog } from './sim';
import { Wire } from '../shared/Wire';

const CMD = 'homelab/updates/authelia/install';
const NAMES = ['update-available', 'update-unavailable', 'update-done'];

// homelab: homelab-updater.py, trimmed. The discovery config Home Assistant builds the entity from,
// and the handler that acts on a press.
const SOURCE = `
"command_topic": command_topic(name),
"payload_install": "install",
"availability": [
    {"topic": AVAIL_TOPIC},  «a1»
    {"topic": avail_topic(name)},  «a2»
    {"topic": RESULT_AVAIL},  «a3»
],
"availability_mode": "all",  «mode»
…
def on_message(client, userdata, msg):
    …
    if msg.topic.startswith(f"{BASE}/") and msg.topic.endswith("/install"):  «recv»
        name = msg.topic[len(BASE) + 1:-len("/install")]
        if name not in CONTAINERS:
            log(f"ignoring install on unknown topic {msg.topic}")
            return
        …
        enqueue(client, name)  «enqueue»
`;

export function DeadButton() {
  usePreload(NAMES);
  const [third, setThird] = useState(false); // the entity also requires the updater's own topic
  const [alive, setAlive] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hot, setHot] = useState([]);
  const [lines, log, resetLog] = useLog([['nas', 'updater connected; will: service_availability offline']]);
  const [later, cancel] = useLater();

  const service = alive ? 'online' : 'offline';
  const available = alive || !third;

  function reset(nextThird, nextAlive) {
    cancel();
    setThird(nextThird);
    setAlive(nextAlive);
    setInstalled(false);
    setBusy(false);
    setHot(nextAlive === alive ? [] : ['a3', ...(nextThird ? ['mode'] : [])]);
    if (nextAlive !== alive) {
      log(
        nextAlive
          ? ['nas', 'updater connected; service_availability online retained']
          : ['broker', 'updater connection lost; publishes its will: service_availability offline'],
      );
    } else resetLog(['nas', `entity config republished with ${nextThird ? 'three' : 'two'} availability sources`]);
  }

  function press() {
    if (busy) return;
    log(['ha', `${CMD} install`]);
    if (!alive) {
      setHot([]);
      later(500, () => log(['broker', '0 subscribers. The publish still succeeds.']));
      return;
    }
    setBusy(true);
    setHot(['recv', 'enqueue']);
    later(800, () => log(['nas', 'backup, pull, restart, wait until ready, verify']));
    later(2600, () => {
      log(['nas', 'homelab/updates/last_result {"ok": true, …} retained']);
      setInstalled(true);
      setBusy(false);
      setHot([]);
    });
  }

  const name = !available ? 'update-unavailable' : installed ? 'update-done' : 'update-available';

  return (
    <>
      <Wire
        nodes={[
          { name: 'NAS', facts: [['updater', alive ? 'running' : 'killed (kill -9)', !alive && 'bad', 'killed (kill -9)']] },
          {
            name: 'Broker',
            facts: [
              ['subscribers on …/authelia/install', alive ? '1 (the updater)' : '0', !alive && 'bad', '1 (the updater)'],
              ['homelab/availability', 'online'],
              ['…/authelia/availability', 'online'],
              ['…/service_availability', service, !alive && 'bad', 'offline'],
            ],
          },
          {
            name: 'Home Assistant',
            facts: [
              ['availability sources', third ? 'all three' : 'the first two', null, 'the first two'],
              ['Authelia update', available ? 'available' : 'unavailable', !available && 'muted', 'unavailable'],
            ],
          },
        ]}
      />
      <div className="split">
        <div>
          <Shot name={name} size="update" alt={ALT[name]}>
            {name === 'update-available' && <Hotspot at="update" label="Update" onPress={press} />}
          </Shot>
          <Log lines={lines} />
        </div>
        <Code
          file="homelab-updater.py (excerpt)"
          lang="python"
          source={SOURCE}
          hot={hot}
          off={third ? [] : ['a3']}
          notes={{ a1: 'online', a2: 'online', a3: third ? service : null, recv: alive ? null : 'nothing is running this' }}
        />
      </div>
      <div className="controls">
        <button type="button" disabled={!alive} onClick={() => reset(third, false)}>
          kill -9 the updater
        </button>
        <button type="button" disabled={alive} onClick={() => reset(third, true)}>
          systemctl start
        </button>
        <label>
          <input type="checkbox" checked={third} onChange={(e) => reset(e.target.checked, alive)} />
          <span>
            require <code>RESULT_AVAIL</code> too
          </span>
        </label>
      </div>
    </>
  );
}

const ALT = {
  'update-available': 'Update dialog for Authelia: update available, with Skip and Update buttons.',
  'update-unavailable': 'Update dialog for Authelia: unavailable, no buttons.',
  'update-done': 'Update dialog for Authelia: up to date, buttons grayed out.',
};
