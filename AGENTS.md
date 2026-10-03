# AGENTS.md — handoff notes for any AI agent working on this repo

Agents don't carry context between sessions: what isn't written down is lost. This file is loaded
in full at the start of every session, and nothing else is, so it holds only what you need
**before you know the task**. The rest loads when it's needed (see "Where the rest lives").
When you finish a task, update "Status" below and append to `docs/history.md`, in the same commit.

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
- Before writing anything about the owner, read `docs/PROFILE.md`.
- **The code is part of the showcase (owner).** How the site is written matters as much as how it
  looks: small, consistent, commented where the *why* isn't obvious; review your own diff.

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
- Styles: single file `css/styles.scss`, colors as tokens on `:root`. The grid, frames and every
  other design rule are in the `site-design` skill; read it before touching CSS or layouts.
- Before pushing: `npm run build && bundle exec jekyll build && npm run check`. The check
  (`tools/check-layout.mjs`) renders every page at desktop and phone width, light and dark, and fails
  on anything off the grid, frames that aren't whole rows, in-flow vertical borders, stray inline
  styles, horizontal overflow or console errors. Add new pages to its `pages` list. Also look at
  the pages yourself: the check can't judge whether something looks right.


## Where the rest lives

| Where | What | Loads |
|---|---|---|
| `site-design` skill | Grid, rhythm, frames, lines, tokens, header, logo, og image, layouts, `site.js` | on any design or CSS task |
| `write-entry` skill | Planning, drafting and *building* an entry: front matter, figures, shots, code | on any entry task |
| `review-entry` skill | Checking an entry against the style | on review |
| `docs/STYLE.md` | How an entry reads (the house style) | read by both entry skills |
| `docs/PROFILE.md` | Facts about the owner (owner-written) | before writing about the owner |
| `docs/lab-ideas.md` | Candidate subjects for the next entry | when picking one |
| `docs/history.md` | What was done and decided this month (earlier: `docs/history/`) | when looking back |

Rules that keep this from growing back:
- **This file wins on any disagreement.** A skill or doc describes the world on the day it was
  written.
- **New detail goes in the skill it belongs to.** This file only grows for something every
  session needs before it knows its task.
- **Rules never move into `docs/`.** Anything still actionable lives here, in `docs/STYLE.md` or
  in a skill; only inert history moves.
- **Keep it small.** Size limits shared by the owner's three repos (homelab, home-assistant, this
  one; the stricter rule wins), in characters (`wc -m`). `npm run check:sizes` checks rules 1–3
  and fails on anything over:
  1. This file (always loaded): at most 12,000 characters.
  2. A skill's `SKILL.md`: at most 15,000; split the skill when it passes. Its supporting files
     follow rule 3 (owner, 2026-10-03).
  3. Any other file meant to be read whole (`docs/`, archive parts included): at most 50,000
     characters, safely under one Read's cap (~65 KB, ~25k tokens, measured 2026-10-02). Past
     the cap a session sees a truncated page and may answer from it.
  4. Append-only logs (`docs/history.md`): the current month in the main file, earlier months in
     `docs/history/YYYY-MM.md`; split an archive into date ranges within rule 3, never
     splitting an entry.
  5. The auto-memory index `MEMORY.md` loads every turn too, so rule 1 applies; one line per
     memory.
  6. Before ending a session that grew any of these files, run `npm run check:sizes` (and
     measure `MEMORY.md` by hand; it lives outside the repo) and split what's over.

## Status (update this)

Last updated: 2026-10-03 (repo cleanup merged)

Still open (see also `docs/PROFILE.md` → Open questions):
- Tagline, home "about me" and the talk link in Fig. 01 are accepted "for now" (owner), not final.
- Content format decided (see Direction); the reusable interaction patterns are still being worked out.
- All three entries pass the linter.
- Fig. 02 is live; the owner is still reading the text and may send notes.
- Fig. 01 is live with the review fixes (merged 2026-10-03). Owner: better, but it "still
  requires more work"; ask what, don't guess. The owner found the rewrite too big a change at
  once: keep edits to it small and say what moved. Open choice for them: the "tween
  the paths" mode makes Chrome log an error per frame (invalid arc flag). That is the failure the
  figure shows and the text points at the console, but the owner may prefer a silent page.
- Fig. 03 is live (merged 2026-10-03); the owner may still send notes. Owner: the story may
  simplify the journey; flow beats completeness. Section 5 (budgets) and its figure read this repo's own files
  at build time, so they stay current.
- Three entries once Fig. 03 is approved, which meets the "3 experiments" target.

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
- **Check the live site after a deploy.** Sessions on the owner's home server reach imoses.me
  directly (verified 2026-10-03: curl and Playwright). Only cloud sandboxes can't (egress policy);
  there Google Fonts may be blocked too, so local renders can fall back to other fonts. To test with the real fonts, serve IBM Plex
  from `@fontsource/ibm-plex-*` and intercept the Google Fonts requests in Playwright. Only Chromium is
  available (no WebKit/Safari).
- **Owner preferences:** concise answers, lead with what's verified, don't guess; say plainly what
  couldn't be checked. Push back with evidence when you disagree. Budget is limited, so keep each
  session focused on one goal.


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

- No RSS feed (owner removed it, 2026-09-30). The home intro is a general "about me", with no link
  to the AG Charts repo.

## Open questions for the owner

See the unanswered items in `docs/PROFILE.md`.
