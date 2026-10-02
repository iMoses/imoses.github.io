# History: what was done, and what was decided

Inert record, newest first, moved out of `AGENTS.md` on 2026-10-02 because it was loaded in every
session. Read it before redoing something, or when a rule looks arbitrary and you want the reason.
It describes the world on the day each entry was written; `AGENTS.md`, `docs/STYLE.md` and the
skills win on any disagreement. Every rule that is still actionable lives in one of those, not here.

**New entries go here:** finished work under "Done", decisions under "Decisions". This file holds
the current month; earlier months are in `docs/history/` (see the size rules in `AGENTS.md`).

## Done

- 2026-10-03: Fig. 03 merged to `main` at the owner's request, with the instruction-file split
  (`AGENTS.md` 27.7k → ~11k chars, `site-design` skill, `docs/history.md`), the size budgets shared
  with the owner's other repos, and `npm run check:sizes`.
- 2026-10-02: Fig. 03 "What the next session knows" drafted on branch `fig03-next-session`
  (NOT pushed: awaiting the owner's text approval). Owner picked the subject (agent workflow:
  sessions, scripts, splitting CLAUDE.md) and left every other decision to the agent. One lesson
  ("a session knows only what it loads, so file each thing by when it's needed"), five sections,
  five figures sharing one model: the context window before you type (`demos/next-session/
  Context.jsx`). Evidence is measured from the private home-assistant repo's git history: sizes
  and dates only (`history.js`, `model.js`), plus faithful excerpts of `git-nightly-push.sh` at five
  commits and of `export-inventory.py`. New topic `ai-agents`.
- 2026-10-02: Fig. 01 rewritten to the house style and merged to `main` at the owner's request.
  New title "Who draws the chart?" (slug kept so links don't break). One lesson
  ("every node in the DOM has exactly one owner: d3 computes, React renders, CSS styles and moves"),
  seven sections, seven figures sharing one Data → d3 → DOM model, each with its real source beside
  it. The unsourced sales sample was replaced by UK electricity generation 1990–2025 from Our World
  in Data (CC BY 4.0, credited at the end; extraction described in `data.js`). The owner gave no
  steer on purpose ("see what you come up with"). Gauge and pie figures dropped (pie merged into
  the donut); `d3-axis` and `d3-interpolate` added.
- 2026-10-01: House style written down (`docs/STYLE.md`) from the owner's feedback on the first
  Fig. 02 draft and their references (Bret Victor, Josh Comeau, Amelia Wattenberger). Added the
  `write-entry` and `review-entry` skills, `tools/lint-entry.mjs`, and topics (`_data/topics.yml`,
  `/topics/`, "More on …" at the end of each entry).
- 2026-10-02: Fig. 02 merged to `main` and deployed at the owner's request ("when done, merge
  into main"). `npm run check` now also covers `/lab/nas-dashboard/` and `/topics/`. Screenshot
  boxes round their height up to whole rows (`.shot-box`, container query), so the code panel
  beside them stays on the grid. Claude card renders redone after the dashboard's icon-opacity fix.
- 2026-10-01: Fig. 02 "The button that does nothing" rewritten to the house style. One lesson ("a dashboard is a
  set of claims; make each true or visibly unsure, buttons included"), six sections, seven
  figures sharing one NAS → broker → Home Assistant model (`demos/nas-dashboard/Wire.jsx`), each
  with its real code beside it (`Code.jsx`: lit lines + live values). Code panels are labelled
  excerpts from the owner's private homelab repo. Renders come from a read-only capture harness on
  the NAS, outside this repo (`~/blog-card-export/tools/fig02*.js`); its `raw/` folder holds
  private data, never copy from it. Shared `.demo.wide` / `.split` / `.code-panel` / `.wire` styles
  are in `css/styles.scss` (`{% include demo.html … wide=true %}`).

## Decisions (newest first)

- 2026-10-02: Fig. 03 public-safety choices (agent's, owner delegated): only house-repo material,
  nothing from the home-server repo except its script count; skill names and descriptions shown
  only for skills that reveal no security, network or presence setup (three left out, said so in
  the caption); no session-archive excerpts (they hold pasted credentials). Tokens are estimated
  at 4 chars each against a 200k window, labelled as estimates. Shared `.controls` gained a
  `select` style and `select` joined the pointer-cursor rule; `Code.jsx` highlights `sh`.
- 2026-10-02: Owner asked for figures to stand out from the page: figures sit on their own
  surface, `--figure-bg` (a shade lighter than the paper in light mode, a raised navy in dark),
  and `--code-bg` is a cool gray in light mode so code panels differ from both. Light syntax
  comment/number colors darkened to keep 4.5:1 on it.
  The theme switch uses `--figure-bg` too. Screenshots get a 1px `--rule` outline (no layout
  space), since a light screenshot can match the figure's own background (owner noticed on Fig. 02).
  Home cards use `--figure-bg`; the theme switch gets the cards' hover shadow. Cursors (owner:
  "anything clickable has a pointer") come from one rule in `css/styles.scss`, not per component;
  hover-only things (donut slices) keep the page's cursor.
- 2026-10-02: Fig. 01 data: UK electricity by source (Our World in Data), chosen because it's
  public, licensed, and carries a story (coal 65% → 0.1%) that suits bars, a line and a donut.
  Owner: "use any other data source that meets the goal (ideally public)".
- 2026-10-01: Owner: figures must not make the page jump while you play with them. Anything that
  changes size reserves its largest case (`Wire` facts take a `widest` value; logs are fixed-height,
  newest first; the pop-up keeps its slot; buttons are disabled, never removed). Disk serials in
  renders are invented look-alikes (warranty risk); the real ones were scrubbed from the unpushed
  history with the owner's OK. No-JS fallbacks: a text line is enough (owner:
  the site's point is interactivity).
- 2026-10-01: Style additions (owner): every example interactive, its code beside it when there's
  room and following what the reader does; explain *why* (read the owner's system instructions);
  oblique titles are fine if subtitle and summary are clear. American spelling (owner doesn't mind
  much; it matches the code). Fig. 01 will be revised later; it needs more than the style pass.
- 2026-10-01: Owner on style (first Fig. 02 draft): sections too short and unclear; gamification
  childish; no clear opening or ending; read as praise of the writer, not a lesson; entries need
  continuity. Owner asked for the style to be written down and enforced by a write skill and a
  validate skill. Result: `docs/STYLE.md`, the two skills, the linter, topics.
- 2026-10-01: Fig. 02 is the NAS ↔ Home Assistant entry (owner, via handoff from another session).
  Public-safety rules for it (owner): no container names except Authelia, nothing from the *arr /
  download stack, no VPN; the server's security setup is described in one line, not mapped.
  Screenshots must look identical to the live dashboard; they are made playable with hotspots
  rather than redrawn. Earlier "no interactive figures" for this entry was superseded by the
  owner's later "storytelling + interactivity, gamified where it makes sense".
