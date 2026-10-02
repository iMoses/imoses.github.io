---
name: write-entry
description: Plan, draft and build a lab entry for imoses.me in the house style (docs/STYLE.md): a lesson built around one principle, with an opening, numbered sections that build on each other, explorable figures and a closing recap. Use when asked to write, outline, draft, or rewrite a lab entry or "post" for the site, to pick the next entry's subject, or to change an entry's figures, screenshots, front matter or topics.
---

# Write a lab entry

The style is defined in `docs/STYLE.md`. Read it in full first, every time, along with
`docs/PROFILE.md`. This skill is the process; the guide is the standard. Candidate subjects the
owner has discussed are in `docs/lab-ideas.md`.

## 1. Find the lesson (before any prose)

From the owner's material (their repos, notes, the conversation), write down:

- **The principle:** one sentence a reader can take to their own work. Not "how I built X", but
  what X teaches. If you can't write it, ask the owner what the entry is *for*.
- **The reader:** who they are, what they already know, what they'll leave with.
- **The running example:** the owner's real system or incident that carries the lesson. It's
  evidence, not the subject. **Read that system's own instructions** (its repo's `CLAUDE.md`,
  `.claude/skills/`, `docs/`): they record *why* each part is the way it is, and the why is what
  the entry has to teach.
- **Topics:** 1–3 ids from `_data/topics.yml`. Note earlier entries in those topics; if one is a
  prerequisite, the opening links it.
- **Public safety:** what in the source material must not appear (STYLE.md §9, which lists
  each entry's own rules). The repo is public.

## 2. Outline, and get it approved

Write the outline as a short list and show it to the owner before drafting:

- Opening: hook, subject, why it matters, promise, audience (one line each).
- Each section: heading (names the idea), its one job, the question it ends on, and its figure:
  what hidden state the figure shows and what the reader changes in it.
- Closing: recap items, the principle restated, where else it applies.

Plan each example **interactive, with its code beside it** (STYLE.md §3): say which code panel it
shows and which lines light up for which action. Plan figures as **one model revealed progressively** when sections share a system. A figure is
justified only if it shows something normally hidden or lets the reader change the variable the
section is about (STYLE.md §3). No quizzes, scores or congratulations.

Owner approval of the outline is the gate. Don't draft before it.

## 3. Draft

- Follow the structure in STYLE.md §2 exactly: opening (3–5 paragraphs), numbered sections (each
  at least 3 paragraphs, or 2 plus a figure that carries weight), a closing section with a recap
  list.
- Every section opens by saying its job and ends by raising the next question.
- After every figure, a paragraph that interprets what the reader just saw.
- Write to "you"; "I" only for evidence. Run the self-praise test on every paragraph.
- Real code via `{% code_file %}`, real screenshots via `_includes/shot.html` (see "How a lab entry is built"
  below).

## 4. Build the figures

Follow the `site-design` skill (grid, frames, tokens, no inline styles, works at 390px and without JS, reduced
motion). Calm instrumentation: mono labels, no pulsing. Staged states are labelled in captions.

## 5. Check, then hand over

1. `npm run lint:entry -- _posts/<file>.md` must pass.
2. Run the `review-entry` skill and fix what it finds.
3. Build and check in a browser (AGENTS.md → Before pushing). If the owner's dev server is running
   (see AGENTS.md → Tech), use it instead of starting another server.
4. Tell the owner where to read it and list any open questions. Don't push until they approve
   the text.
5. Owner feedback about style goes into `docs/STYLE.md` (and the linter, if it can be counted) in
   the same commit as the fix, so the next entry gets it for free.

## How a lab entry is built

Moved here from `AGENTS.md` on 2026-10-02. How an entry *reads* is in `docs/STYLE.md`; this is how
it's *built*.


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

### Renders and private material

- Fig. 02's screenshots come from a read-only capture harness on the owner's server, outside this
  repo (`~/blog-card-export/tools/fig02*.js`). Its `raw/` folder holds private data: never copy
  from it.
- Disk serials in renders are invented look-alikes (warranty risk). Real ones must never appear.
- Evidence measured from the owner's private repos goes in as numbers and dates, or as faithful
  excerpts labelled with their file name (Fig. 03's `history.js` and `nightly.js` show how).
