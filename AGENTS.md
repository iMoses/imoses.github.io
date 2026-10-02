# AGENTS.md — handoff notes for any AI agent working on this repo

Read this file and `docs/PROFILE.md` before doing anything. Before writing or changing a lab
entry, also read `docs/STYLE.md` (the house style) and use the `write-entry` / `review-entry`
skills in `.claude/skills/`. They are the project's memory:
agents do not carry context between sessions, so anything not written here is lost.
When you finish a task, update the "Status" and "Decisions" sections below in the same commit.

## What this project is

`imoses.me` — Ido Moshe's public profile to the world. **Not primarily a blog.**
Its job: tell a visitor who Ido is, what Ido does, show evidence, and make it easy to get in touch.

## Ground rules for agents

- **Source of truth about the owner is `docs/PROFILE.md`, written by the owner.** Do not invent,
  embellish or infer facts about the owner (titles, employers, dates, numbers, skills, availability).
  If something needed isn't there, list it under "Open questions" instead of guessing.
- Keep the owner's time and budget in mind: batch questions, don't ask what the repo already answers.
- This repo is public. Anything in it (including `docs/`) is visible to the world.
- Push work to a feature branch; merge to `main` only when the owner asks. Pushing to `main` deploys.

## Tech

- Jekyll 4.4 static site, Ruby version in `.ruby-version`, deps in `Gemfile` / `Gemfile.lock`
  (plugins: jekyll-seo-tag, plus local `_plugins/code_file.rb` and `_plugins/external_links.rb`,
  which makes every link to another site open in a new tab at build time).
- Interactive figures: React + Vite, sources in `demos/<entry>/`, built by `npm run build` into
  `assets/demos/<entry>.js|.css` (git-ignored, generated). Add each new entry to the `entries` map in
  `demos/vite.config.js`. **Run `npm run build` before `jekyll build`**, locally and in CI.
- Deploy: `.github/workflows/jekyll.yml` runs `npm ci && npm run build`, then Jekyll, then deploys to
  GitHub Pages on every push to `main`.
- Custom domain `imoses.me` is configured in the repo's Settings → Pages (there is no `CNAME` file).
- Local build: `npm ci && npm run build && bundle install && bundle exec jekyll build` (or `serve`).
  On the owner's home server a managed dev server already runs this checkout (`watch` + `serve` on
  port 4000, switched on and off from the owner's dashboard). Don't start your own `jekyll serve`
  on :4000 there; its details live in the owner's private homelab repo, not in this public one.
  If `bundle exec jekyll` reports "command not found", run
  `bundle exec ruby "$(bundle info --path jekyll)/exe/jekyll" build`.
- Styles: single file `css/styles.scss`. All colours are tokens on `:root`, redefined for dark mode.
  Categorical chart colours `--series-1…8` are a validated colour-blind-safe set for both surfaces;
  use them in fixed order and don't add new hues.
- **Layout grid (owner's requirement):** 24px minor / 96px major squares. The content column is a whole
  number of squares (672px on desktop) and the grid's origin is its top-left corner, so rulers and
  the crosshair count from there (negative to the left).
- **Vertical rhythm comes from CSS, not scripts.** Every vertical margin, padding and line-height is
  whole rows (`var(--u)` = 24px), so blocks land on grid lines by themselves and margin collapsing
  is harmless. Don't use one-off pixel values or negative margins to compensate for something;
  size it in rows instead.
- **Frames:** give any bordered box the `framed` class (code blocks get it via `@extend`). The box
  itself is whole rows; its frame is a single 1px border on an `::after` that reaches 1px past the
  right and bottom edges, so all four lines sit on grid lines and render identically at any display
  scaling (don't mix borders and shadows for this — they render differently at 125%/150%).
  Padding is plain `var(--u)`. Recolour with `--frame`, add a drop shadow with `--frame-extra`.
- **Lines never take up layout space.** Browsers round border widths to whole device pixels (on a
  2.625x phone a 1px border is ~0.76 CSS px), so a border in the flow slowly pushes everything below
  it off the grid (owner saw ~1px drift per code block on mobile Chrome). Frames use `::after`;
  dashed rules (`hr`, entry `h2`, footer, code-label divider) use the `rule-above` mixin (`::before`
  line + a row of padding). Never put a vertical border on an in-flow block.
  Line colours (`--rule`, `--rule-dash`) must be opaque (`color-mix` of ink into paper): frames sit
  exactly on grid lines, and a translucent line would darken differently over minor vs major lines.
- **Styles come from CSS classes (owner's requirement).** No inline styles in markup or components.
  `site.js` writes only what CSS can't know: `--gx` (grid origin) on `<html>`, and a `min-height`
  that rounds a framed box up to whole rows when its content height is unknowable (live figures,
  code blocks with a scrollbar).
- **The code is part of the showcase (owner).** The site is the owner's business card: how it's
  written matters as much as how it looks. Keep CSS and JS small, consistent and commented where
  the *why* isn't obvious; prefer one general rule over special cases; review your own diff before
  committing.
- Header is a drawing-style title block: logo, then the owner's name + tagline beside it (name is
  the page's `<h1>` on the home page only; lab entries keep their own title as `<h1>`), and the
  GitHub / LinkedIn / email icons (`_includes/icons/`) and the light/dark switch. The
  icons and switch are fixed-size cells on the grid (1 square each, 1-square spacer, 4-square switch)
  so changing the switch's label never moves anything. Footer repeats the links.
- Logo (`_includes/logo.svg`): one continuous hand-drawn line (open on the right for the text), a
  small circle whose inside is cut out of the line with an SVG mask (so the grid shows through),
  and the lettering. On the home page `site.js` animates it: the line draws in one stroke while
  the small circle rolls along the drawn line on its own ease and glides to a stop at its resting
  place (its duration is ∛(rest/length) of the pen's, so it never overtakes the pen). The inline `<head>` script hides the
  parts before first paint (`.logo-intro`), only when motion is allowed, with a 4s failsafe.
  The viewBox is padded by 12 units left/top/bottom (`-12 -12 222 152`) so the riding circle never
  clips; CSS offsets that padding with negative margins so the drawing stays on the grid. Keep the
  padding if the path or circle changes (the circle reaches radius + half stroke = 11 units out).
- Link previews: `assets/og.png` (1200×630) is set as the default `image` for jekyll-seo-tag.
  Regenerate it with `npm run og` whenever the tagline or logo changes (template in `tools/og/`;
  needs Playwright + Chromium, see `tools/og/render.mjs`).
- Visit stats: GoatCounter (imoses.goatcounter.com; cookieless, no consent banner needed). The script
  is in `root.html` and only rendered when `JEKYLL_ENV=production` (CI sets it), so local builds
  don't count visits. Owner chose it over Google Analytics (GA needs a UK cookie-consent banner).
- Layouts: `root.html` (head, rulers, header/footer, crosshair) → `default.html` (pages) and
  `entry.html` (lab entries). `assets/site.js` draws the page rulers, the crosshair (under the
  text, never over it) and the light/dark switch (sun/moon icon + text) (defaults to the OS setting; the
  visitor's choice is kept in localStorage and applied by an inline script in `<head>`).

### How a lab entry works

- How an entry *reads* is in `docs/STYLE.md`; this section is how it's *built*.
- A lab entry is a Jekyll post: `_posts/YYYY-MM-DD-slug.md` → `/lab/slug/`. Front matter:
  `title`, `subtitle`, `summary` (card text), `fig` (e.g. `"02"`), `thumb` (name of an inline SVG in
  `_includes/thumbs/`, drawn with `currentColor`), `topics` (1–3 ids from `_data/topics.yml`), and
  `demo` (bundle name, if it has figures).
- Topics tie entries together: they show beside the Fig. label (home card and entry header), the
  entry ends with "More on <topic>" lists (`_includes/more-on.html`), and `/topics/` lists them all.
- `npm run lint:entry -- _posts/<file>.md` checks what can be counted (structure, front matter,
  figure captions, banned words, spelling); the `review-entry` skill does the rest.
- Place a live figure with `{% include demo.html id="name" caption="…" %}`; the entry's bundle maps
  `id` → component in `demos/<entry>/main.jsx`. The figure shows a text fallback without JS.
- Screenshots come in a light and a dark copy (`name-light.png` / `name-dark.png`, 2x renders);
  `_includes/shot.html` shows the one matching the theme. A still figure is
  `{% include figure.html src="/assets/lab/<entry>/name" width=… height=… alt="…" caption="…" %}`;
  give `demo.html` the same `shot`/`width`/`height`/`alt` and its no-JS fallback becomes that still.
  Shared figure controls (`.controls`) live in `css/styles.scss`, not in an entry's bundle.
- Figures share `demos/shared/`: `Wire.jsx` (the hidden-state columns above an example) and
  `Code.jsx` (the code panel beside it). A panel can show a file of this repo imported with
  `?raw`, with `regions` like `code_file` and lines named by `match`, so it can't drift from what
  runs (see Fig. 01's `main.jsx`). Readouts in Fig. 01 come from the live DOM (`inspect.js`).
- Show real source code with `{% code_file demos/<entry>/File.jsx %}`; add `region=name` to show only
  the lines between `#region name` / `#endregion` comments, and `label=` to set the file caption.
  Never paste code by hand when the file exists, so the post can't drift from what runs.
- Before pushing: `npm run build && bundle exec jekyll build && npm run check`. The check
  (`tools/check-layout.mjs`) renders every page at desktop and phone width, light and dark, and fails
  on anything off the grid, frames that aren't whole rows, in-flow vertical borders, stray inline
  styles, horizontal overflow or console errors. Add new pages to its `pages` list. Also look at
  the pages yourself: the check can't judge whether something looks right.

## Status (update this)

Last updated: 2026-10-02 (Fig. 01 rewrite)

Done:
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
- 2026-09-30: Blueprint redesign (graph-paper light theme, blueprint-navy dark theme, page rulers,
  coordinate crosshair) and the first lab entry, "Charts are just shapes" (Fig. 01), adapted from
  the owner's React Summit 2025 talk and d3-examples meetup repo. Merged to `main` and deployed
  2026-09-30 at the owner's request ("not done, but good enough to replace the existing content").
- 2026-09-30: Owner answered the profile questions; `docs/PROFILE.md` and "Direction" updated.
- 2026-09-30: `docs/PROFILE.md` filled from the owner's LinkedIn export, detailed CV and the
  public ag-charts git history. Remaining gaps are listed in its "Open questions" section.
- 2026-09-29: Build infrastructure updated (Jekyll 4.4.1, Ruby 3.4, current Pages actions,
  Sass modules). Deployed successfully from `main`.

Still open (see also `docs/PROFILE.md` → Open questions):
- Tagline, home "about me" and the talk link in Fig. 01 are accepted "for now" (owner), not final.
- Content format decided (see Direction); the reusable interaction patterns are still being worked out.
- Both entries pass the linter and a review-entry pass.
- The home intro still calls the lab "small, interactive experiments with the pixels and the
  maths", which no longer matches the content direction.
- Fig. 02 is live; the owner is still reading the text and may send notes.
- Fig. 01 is live; the owner may still send notes on the text. Open choice for them: the "tween
  the paths" mode makes Chrome log an error per frame (invalid arc flag). That is the failure the
  figure shows and the text points at the console, but the owner may prefer a silent page.
- Only one lab entry so far; the "3 experiments" guideline is now a target, not a launch gate.

Drafts worth keeping:
- `_drafts/memoir.md` — short, specific, strongest writing voice in the repo. Good basis for the About.
- `_drafts/scalable-vector-graphics.md` — half-finished tutorial, partly paraphrased from MDN.

## Working with the owner

- **Loop:** work on the session's feature branch; the owner reviews and says "merge"; then
  fast-forward `main` to the branch and push, which deploys. Watch the run with
  `curl https://api.github.com/repos/iMoses/imoses.github.io/actions/runs?per_page=1` (the GitHub
  API is reachable from the sandbox even when the MCP tools aren't). GitHub occasionally returns a
  500 on push: retry with backoff.
- **The owner reviews on Windows desktop (display scaling, e.g. 125–150%) and on mobile Chrome.**
  Several bugs only showed up there: uneven frame edges at fractional scaling, and ~1px drift per
  bordered block on mobile. Desktop Chromium at 100% doesn't reproduce these, so reason about
  device-pixel rounding and don't trust a clean local render alone.
- **The sandbox can't reach imoses.me or github.io** (egress policy), and Google Fonts may be
  blocked, so local renders can fall back to other fonts. To test with the real fonts, serve IBM Plex
  from `@fontsource/ibm-plex-*` and intercept the Google Fonts requests in Playwright. Only Chromium is
  available (no WebKit/Safari).
- **Owner preferences:** concise answers, lead with what's verified, don't guess; say plainly what
  couldn't be checked. Push back with evidence when you disagree. Budget is limited, so keep each
  session focused on one goal.

## Lab ideas (not started)

Candidates discussed with the owner for the next entries; the owner hasn't picked yet.
- **SVG vs Canvas, live:** render N points both ways, drag N up and watch frame rate. Ties to the
  owner's performance/rendering work and follows Fig. 01's "canvas wins when you draw a lot".
- **"Keep these display settings?":** a whimsical Windows 3.11 resolution dialog that distorts the
  page, counts down and reverts (from the owner's memoir draft). Shows personality; not a chart.
- **Labels that avoid each other:** drag shapes, labels re-place to stay clear. Must be built from
  scratch; don't copy AG Charts code.
- **SVG shapes playground:** turn `_drafts/scalable-vector-graphics.md` into something interactive.

## Direction

Confirmed by owner (2026-09-30):
- **Not a CV.** Don't list the owner's past; LinkedIn does that. Career data in `docs/PROFILE.md`
  is agent context only.
- Audience: potential employers and connections. Purpose: showcase talents and work.
- No freelance / consulting / "open to work" offer.
- English. Professional, can be whimsical. Less is more.

Structure chosen by owner (2026-09-30): **Lab.**
- Homepage: title block in the header (name + tagline beside the logo), a short general "about me"
  (not just the current job), then the list of experiments, then links.
- Each entry (owner, 2026-09-30): **large and meaningful, less is more.** A story built on the
  owner's own real work, with one idea at its core; concepts appear as what the story taught, never
  as a standalone lecture. Interactivity and storytelling matter: where it makes sense the reader
  *does* something (predicts, breaks, solves) and the reading can be gamified. The format bends to
  the content; there's no fixed template. Topics are open: working with AI, home automation,
  integrations, reverse engineering, development views; AG Charts experience is fair game but not
  the main gist (owner finds "build it yourself" / modularity / refactoring talk overdone).
- Figures must work on mobile and without breaking if JS fails to load. Plain HTML/CSS/JS, no
  framework unless the figure needs one.
- Aim for at least 3 experiments: one entry reads as a start, three as a practice. (Owner chose to
  launch with one; this is a target, not a gate.)
- Experiments are the owner's own from-scratch work. Don't copy AG Charts code (the enterprise
  package is commercially licensed).
- No 3DFY work, no CV content on the site. The React Summit talk is used as source material for
  Fig. 01 (owner's choice) and credited at the end of that entry.
- Design (owner's choice, 2026-09-30): blueprint / graph paper. Mono headings (IBM Plex Mono),
  IBM Plex Sans body, entries labelled "Fig. NN", figures framed like drawings.

## Decisions (append; newest first)

- 2026-10-02: Owner asked for figures to stand out from the page: figures sit on their own
  surface, `--figure-bg` (a shade lighter than the paper in light mode, a raised navy in dark),
  and `--code-bg` is a cool gray in light mode so code panels differ from both. Light syntax
  comment/number colors darkened to keep 4.5:1 on it.
  The theme switch uses `--figure-bg` too. Screenshots get a 1px `--rule` outline (no layout
  space), since a light screenshot can match the figure's own background (owner noticed on Fig. 02).

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
- 2026-09-30: Content format (owner): entries are large, story-led pieces with one core idea,
  interactive and gamified where it makes sense; format varies by content. Topics widened beyond
  charts (AI, home automation, integrations, reverse engineering, development views).
- 2026-09-30: Added `npm run check` (tools/check-layout.mjs) so layout rules are verified by a
  committed script, not ad-hoc ones; documented the owner's review setup and lab ideas.
- 2026-09-30: Crosshair coordinates update on scroll, not only on pointer move.
- 2026-09-30: Logo intro smoothed (owner): the circle used to ride the pen tip and halt at full speed;
  it now has its own ease and decelerates to zero at its resting place.
- 2026-09-30: Mobile Chrome drift (~1px per code block/figure): borders in the flow rounded to device
  pixels. All dashed rules moved to a no-layout `rule-above` mixin; `roundFrames` uses exact
  fractional heights; added unprefixed `text-size-adjust`.
- 2026-09-30: Rule colours made opaque (owner noticed edges differing in dark mode: translucent
  lines blended with the grid lines underneath).
- 2026-09-30: Border+shadow frames looked uneven at fractional display scaling (owner noticed on the
  theme switch); frames are now one border on an ::after, which also simplified padding.
- 2026-09-30: Owner: vertical margins should be whole rows so collapsing doesn't matter; removed the
  flex `snap` containers and the script's nudging. Frames reworked (inside top/left border + outside
  right/bottom shadow) so boxes are exactly whole rows. Owner: code quality is part of the showcase.
- 2026-09-30: Owner: no unnecessary inline styles; h2 is `margin: var(--u) 0` (24px line-height comes from the shared heading rule) and
  the lab list has no special margin. Framed boxes, card thumbnails, post headings and `hr` resized
  in CSS so the snapping script only nudges live figures.
- 2026-09-30: Added GoatCounter visit stats (owner's account); theme-aware custom crosshair cursor
  (OS crosshairs ignore the theme); home intro opener changed to present work, no childhood backstory.
- 2026-09-30: Design feedback round 5 (owner): boxed LinkedIn icon (balances the GitHub mark);
  dashed separators use their own stronger token `--rule-dash`; tighter lab-entry rhythm (date
  right under the subtitle, section line 24px after the previous block, heading straight into text).
- 2026-09-30: Owner asked for the name to be smaller, like a subtitle beside the logo: the big
  headline was replaced by a title block in the header (on every page).
- 2026-09-30: Design feedback round 4 (owner): logo line made continuous, small circle masks the
  line inside it, intro animation reworked (single stroke + circle rides into place); tighter
  Lab-title/card/footer spacing; header controls fixed on the grid.
- 2026-09-30: Design feedback round 3 (owner): background grid aligned to the layout, and every
  block/box/button snapped to it (spacing may flex to make that work). Added link-preview image,
  logo draw-in animation, contact icons in the header.
- 2026-09-30: Design feedback round 2 (owner): external links open in a new tab; home intro is a
  general "about me" (LinkedIn-summary style), not current-job-only and no link to the AG Charts
  repo; standard light/dark toggle with icon + text.
- 2026-09-30: Design feedback round 1 (owner): crosshair moved under the text, bigger logo,
  visible Paper/Blueprint theme switch, RSS removed (no feed), tagline broadened to not box the
  owner in as charts-only — owner is a full-stack engineer across many fields.
- 2026-09-30: Owner chose the blueprint design and a storytelling first entry built from the
  React Summit talk (github.com/iMoses/svg-react-slides) and the meetup sandbox
  (github.com/iMoses/d3-examples). Demo code was adapted: plain CSS instead of styled-components/
  Tippy, validated palette colours, `viewBox` on every chart so it scales.
- 2026-09-30: Owner chose the Lab structure; talk and 3DFY work stay off the site.
- 2026-09-30: The site is not a CV (owner). Career history stays in `docs/PROFILE.md` as context.
- 2026-09-30: The owner's current work is AG Charts (open source, AG Grid). Their public GitHub
  history there is the primary evidence for the site; to refresh it, clone
  `https://github.com/ag-grid/ag-charts` (blobless) and use `git log origin/latest --author=iMoses`.
- 2026-09-30: The source CV/LinkedIn PDFs are not stored in the repo (it's public). Their relevant
  facts are summarised in `docs/PROFILE.md` with source tags.
- 2026-09-30: Repo files (this file + `docs/PROFILE.md`) are the handoff mechanism between agents.

## Open questions for the owner

See the unanswered items in `docs/PROFILE.md`.
