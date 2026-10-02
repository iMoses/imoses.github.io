// Section 6: the Claude RC card and its sign-in pop-up, with the messages behind them. The buttons
// in the screenshots are pressable; the two switches are the two lines of the relay that the
// section is about.
import { useState } from 'react';
import { Code } from '../shared/Code';
import { Hotspot, Shot, usePreload } from './Shot';
import { Log, useLater, useLog } from './sim';
import { Wire } from '../shared/Wire';

const CARDS = ['healthy', 'update-ready', 'updating', 'sign-in-due', 'offline'];
const STEPS = ['idle', 'asking', 'awaiting-code', 'code-pasted', 'verifying', 'signed-in', 'failed'];
const NAMES = [...CARDS.map((c) => `card-${c}`), ...STEPS.map((s) => `signin-${s}`)];

const URL = 'https://claude.ai/oauth/authorize?…';
const REASON = 'a login is already awaiting its code (480s left); the URL already published is the one to use';

// homelab: publish-claude-rc.py, trimmed.
const SOURCE = `
# What login_url carries when no login is pending. NOT the
# empty string: a zero-byte retained publish DELETES the
# retained message, which serves a new subscriber correctly
# and tells an already-connected one nothing at all.
LOGIN_URL_NONE = ⟨none⟩  «none»
…
def end_login(state, publish, reason=None):
    …
    publish(extra=[(TOPIC_LOGIN_URL, LOGIN_URL_NONE, True)])  «retract»
…
def start_login(publish):
    if _login["proc"] and _login["proc"].poll() is None:  «busy»
        left = max(0, int(LOGIN_CODE_TIMEOUT - (time.time() - _login["started"])))
        _login["reason"] = (f"a login is already awaiting its code ({left}s left); "
                            f"the URL already published is the one to use")
        log(f"login refused: already in progress, {left}s left")
        # never refuse in silence -- the phone must see why
        publish()  «tell»
        return
    …
    publish(extra=[(TOPIC_LOGIN_URL, url, True)])  «url»
`;

export function ClaudeCard() {
  usePreload(NAMES);
  const [card, setCard] = useState('sign-in-due');
  const [beforeOffline, setBeforeOffline] = useState(null);
  const [step, setStep] = useState(null); // the pop-up, when open
  const [confirming, setConfirming] = useState(false);
  const [tell, setTell] = useState(true); // refusals are published
  const [sentinel, setSentinel] = useState(true); // the URL is retracted with "none", not ""
  const [login, setLogin] = useState({ proc: null, state: 'idle', reason: null }); // on the NAS
  const [broker, setBroker] = useState('none'); // retained login_url; null once deleted
  const [haUrl, setHaUrl] = useState('none'); // what Home Assistant's sensor holds
  const [haReason, setHaReason] = useState(null);
  const [hot, setHot] = useState([]);
  const [lines, log] = useLog([]);
  const [later, cancel] = useLater();

  function publishUrl(value) {
    setBroker(value === '' ? null : value);
    if (value !== '') setHaUrl(value); // an empty retained message deletes; subscribers hear nothing
    log(['nas', value === '' ? 'homelab/claude/login_url "" retained (deletes the copy)' : `homelab/claude/login_url ${value === 'none' ? '"none"' : 'a fresh URL'} retained`]);
  }

  // Opening the pop-up presses the re-login button: the link is made when someone arrives for it.
  function open() {
    setStep('idle');
    log(['ha', 'pop-up opened: presses Re-login']);
    if (login.proc) {
      setHot(tell ? ['busy', 'tell'] : ['busy']);
      if (tell) {
        setHaReason(REASON);
        log(['nas', 'refused, and says why in homelab/claude/status']);
      } else log(['nas', 'refused (only in its own log)']);
      setStep('awaiting-code');
      return;
    }
    setLogin({ proc: 'waiting', state: 'awaiting_url', reason: null });
    setHaReason(null);
    setStep('asking');
    later(1500, () => {
      setLogin({ proc: 'waiting', state: 'awaiting_code', reason: null });
      publishUrl(URL);
      setHot(['url']);
      setStep('awaiting-code');
    });
  }

  function end(state, nextStep, reason = null) {
    setLogin({ proc: null, state, reason });
    setHaReason(reason); // end_login publishes the outcome's reason, or clears the refusal
    publishUrl(sentinel ? 'none' : '');
    setHot(['retract']);
    setStep(nextStep);
  }

  function submit() {
    setStep('verifying');
    later(1500, () => end('success', 'signed-in'));
    later(3000, () => {
      setStep(null);
      setCard('healthy');
    });
  }

  function update() {
    setConfirming(false);
    setCard('updating');
    later(3000, () => setCard('healthy'));
  }

  function unplug() {
    cancel();
    setStep(null);
    setConfirming(false);
    setBeforeOffline(card === 'updating' ? 'healthy' : card);
    setCard('offline');
  }

  const can = (...states) => !step && !confirming && states.includes(card);
  const showUrl = (v) => (v == null ? 'nothing (deleted)' : v === 'none' ? '"none"' : v);

  return (
    <>
      <Wire
        nodes={[
          {
            name: 'NAS',
            facts: [
              ['claude rc', card === 'offline' ? 'not reporting' : card === 'update-ready' ? '2.1.285 running, 2.1.286 installed' : '2.1.286 running', null, '2.1.285 running, 2.1.286 installed'],
              ['login process', login.proc ? `waiting for the code (${login.state})` : 'none', null, 'waiting for the code (awaiting_code)'],
            ],
          },
          { name: 'Broker', facts: [['kept on login_url', showUrl(broker), broker == null && 'muted', URL]] },
          {
            name: 'Home Assistant',
            facts: [
              ['login_url sensor', showUrl(haUrl), haUrl === URL && !login.proc && 'bad', URL],
              ['last reason', haReason ?? '—', !haReason && 'muted', REASON],
            ],
          },
        ]}
      />
      <div className="split">
        <div>
          <Shot name={`card-${card}`} size="card" alt={`Claude RC card: ${card.replaceAll('-', ' ')}.`}>
            {can('update-ready') && <Hotspot at="sub-button" label="Update" onPress={() => setConfirming(true)} />}
            {can('sign-in-due') && <Hotspot at="sub-button" label="Sign in" onPress={open} />}
          </Shot>
          {/* The pop-up's place is kept while it's closed, and holds the restart prompt. */}
          <div className="popup-slot shot-box shot-signin">
            {step && (
              <Shot name={`signin-${step}`} size="signin" alt={`Sign-in pop-up: ${step.replaceAll('-', ' ')}.`}>
                {step === 'awaiting-code' && <Hotspot at="field" label="Paste the code" onPress={() => setStep('code-pasted')} />}
                {step === 'code-pasted' && <Hotspot at="send" label="Submit" onPress={submit} />}
                {step === 'failed' && <Hotspot at="title" label="Try again" onPress={open} />}
                {step !== 'verifying' && step !== 'asking' && <Hotspot at="close" label="Close" onPress={() => setStep(null)} />}
              </Shot>
            )}
            {confirming && (
              <div className="controls">
                <span>Restart Claude RC? It interrupts 2 live sessions.</span>
                <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
                <button type="button" onClick={update}>Restart</button>
              </div>
            )}
          </div>
          <Log lines={lines} />
        </div>
        <Code
          file="publish-claude-rc.py (excerpt)"
          lang="python"
          source={SOURCE}
          hot={hot}
          off={tell ? [] : ['tell']}
          live={{ none: sentinel ? '"none"' : '""' }}
        />
      </div>
      <div className="controls">
        <button type="button" disabled={!can('healthy')} onClick={() => setCard('update-ready')}>Install a newer version</button>
        <button type="button" disabled={!can('healthy')} onClick={() => setCard('sign-in-due')}>Let a few weeks pass</button>
        <button type="button" disabled={step !== 'awaiting-code' && step !== 'code-pasted'} onClick={() => end('failed', 'failed', 'code rejected')}>
          Paste the wrong code
        </button>
        {card === 'offline' ? (
          <button type="button" onClick={() => setCard(beforeOffline)}>Plug the NAS back in</button>
        ) : (
          <button type="button" onClick={unplug}>Unplug the NAS</button>
        )}
        <label>
          <input type="checkbox" checked={tell} onChange={(e) => setTell(e.target.checked)} />
          publish refusals
        </label>
        <label>
          <input type="checkbox" checked={sentinel} onChange={(e) => setSentinel(e.target.checked)} />
          <span>
            retract with <code>"none"</code>
          </span>
        </label>
      </div>
    </>
  );
}
