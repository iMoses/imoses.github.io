// What a session of the Home Assistant repo loads, measured in characters on 2026-10-02 from the
// private repo (`wc -m`), on the day before the split (Aug 3) and the day of it (Aug 4). Tokens are
// estimated at four characters each; the real count depends on the text and the tokenizer.

export const CHARS_PER_TOKEN = 4;
export const WINDOW = 200_000; // tokens: a common context window size, used as the scale
export const tokens = (chars) => Math.round(chars / CHARS_PER_TOKEN);
export const k = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

export const ONE_FILE = 154_378; // CLAUDE.md on Aug 3, everything in it
export const SPLIT_FILE = 29_709; // CLAUDE.md on Aug 4, after the split
export const DESCRIPTIONS = 3_087; // the ten skills' descriptions, which every session is shown

// Skills as split out on Aug 4: size of the whole SKILL.md, and its real description, trimmed to
// the part that says when to use it. Three skills, about the house's security, its network and who
// is home, are left out of this public page; they count in DESCRIPTIONS.
export const skills = {
  'ha-dashboard-cards': {
    chars: 28_871,
    when: 'Use when creating, editing, styling, moving or debugging ANY dashboard card or view, or when a card renders blank, unstyled, or shows literal {{ }}.',
  },
  'ha-zha-quirks': {
    chars: 7_738,
    when: 'Use when writing or editing a device quirk, diagnosing a device that has fewer entities than an identical twin, working with Tuya manufacturer-specific attributes, or creating and choosing a ZHA group ID.',
  },
  'ha-google-assistant': {
    chars: 3_979,
    when: 'Use when exposing or unexposing entities to Google, changing voice names, aliases or room hints, or debugging why a voice command reaches the wrong entity.',
  },
  'ha-logbook-attribution': {
    chars: 10_038,
    when: "Use when building any template entity, script, or custom control a person can press, and whenever a logbook row reads 'By state change' or the context user_id is None instead of naming a person.",
  },
  'ha-deploy-sync': {
    chars: 8_859,
    when: 'Use when pushing changes to the live instance, running ha core check, SSHing to the host, renaming entities or devices in bulk over the WebSocket API, or working on the nightly git sync script.',
  },
  'ha-esphome-terma': {
    chars: 14_066,
    when: 'Use when editing esphome/*.yaml, compiling or OTA-flashing a device, rotating an API key or OTA password, debugging BLE bonding, or changing packages/terma.yaml, …',
  },
  'ha-browser-probe': {
    chars: 3_404,
    when: 'Use whenever a question can only be answered by a RENDERED page — did this card draw, what does the logbook actually say, what request does this web UI send — and always before asking the user what they see on screen …',
  },
};

export const tasks = [
  { name: 'Restyle a dashboard card', skill: 'ha-dashboard-cards' },
  { name: 'Add a quirk for a Zigbee plug', skill: 'ha-zha-quirks' },
  { name: 'Rename the hallway lights', skill: 'ha-deploy-sync' },
  { name: 'Give a light a voice name', skill: 'ha-google-assistant' },
  { name: 'Write a plain automation', skill: null },
];

// Section 3: five things the repo knows, paraphrased from its CLAUDE.md, skills and docs/fixed.md,
// and four sessions that come after. Each fact names the sessions that need it and the skill it
// would go in. CLAUDE.md loads in every session; a skill in the sessions whose task matches it;
// docs/ only in a session that goes looking for the past.
export const sessions = [
  { name: 'Restyle a card', skills: ['ha-dashboard-cards'] },
  { name: 'Rename 30 entities', skills: ['ha-deploy-sync'] },
  { name: 'Add a new package file', skills: [] },
  { name: 'Why did the push stop?', skills: ['ha-deploy-sync'], docs: true },
];

export const facts = [
  {
    text: 'The repo root is the config folder. Never move it: the UI editors ignore !include paths.',
    needed: [0, 1, 2],
    skill: 'ha-deploy-sync',
    home: 'claude',
  },
  {
    text: 'After editing a dashboard resource, bump its ?v= or phones keep the old copy.',
    needed: [0],
    skill: 'ha-dashboard-cards',
    home: 'skill',
  },
  {
    text: 'Grep the dashboards for the old entity IDs before a rename, not after.',
    needed: [1],
    skill: 'ha-deploy-sync',
    home: 'skill',
  },
  {
    text: 'git add new files by hand: the nightly push only stages tracked ones.',
    needed: [2],
    skill: 'ha-deploy-sync',
    home: 'claude',
  },
  {
    text: 'Aug 6: a blueprint deleted by an update wedged the nightly push. The gate now skips missing files.',
    needed: [3],
    skill: 'ha-deploy-sync',
    home: 'docs',
  },
];

export const places = [
  ['claude', 'CLAUDE.md'],
  ['skill', 'a skill'],
  ['docs', 'docs/'],
];

// Is fact `f`, filed in `place`, in front of session `s`?
export function loaded(f, place, s) {
  if (place === 'claude') return true;
  if (place === 'skill') return s.skills.includes(f.skill);
  return Boolean(s.docs);
}

// The rules the repo's CLAUDE.md keeps for this, trimmed with `…`. Lines are named by the place
// they decide.
export const RULES = `Four rules keep this from rotting:

- CLAUDE.md wins on any disagreement. A skill or docs/
  page describes the world on the day it was written;
  a rule here is current.
- New detail goes in the skill, not back in here. «skill»
  The default home for anything learned about a
  subsystem is that subsystem's skill. This file only «claude»
  grows for a rule that must be known before you know «claude»
  which subsystem you are in. «claude»
- Rules never move into docs/. If something is still «docs»
  actionable — a constraint, a "do not", a gotcha that «docs»
  will bite the next person — it belongs in this file «docs»
  or a skill. Only inert history moves. «docs»
- git add new files by hand. …`;
