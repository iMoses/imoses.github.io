# AGENTS.md — handoff notes for any AI agent working on this repo

Read this file and `docs/PROFILE.md` before doing anything. They are the project's memory:
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

- Jekyll 4.4 static site, Ruby version in `.ruby-version`, deps in `Gemfile` / `Gemfile.lock`.
- Deploy: `.github/workflows/jekyll.yml` builds and deploys to GitHub Pages on every push to `main`.
- Custom domain `imoses.me` is configured in the repo's Settings → Pages (there is no `CNAME` file).
- Local build: `bundle install && bundle exec jekyll build` (or `jekyll serve`). If `bundle exec jekyll`
  reports "command not found", run `bundle exec ruby "$(bundle info --path jekyll)/exe/jekyll" build`.
- Styles: `css/styles.scss` + `_sass/` (Dart Sass module syntax, `@use` — don't reintroduce `@import`).
- Layouts: `_layouts/root.html` → `default.html` (sidebar + content) → `article.html` / `category.html`.
- Homepage `index.md` renders `README.md` as the About section, then recent posts.
- Contact links live in `_data/contact.yml`. Sidebar text in `_includes/sidebar.html`.
- `docs/`, `README.md`, `LICENSE`, `AGENTS.md`, `CLAUDE.md` are excluded from the built site.

## Status (update this)

Last updated: 2026-09-30

Done:
- 2026-09-30: Owner answered the profile questions; `docs/PROFILE.md` and "Direction" updated.
- 2026-09-30: `docs/PROFILE.md` filled from the owner's LinkedIn export, detailed CV and the
  public ag-charts git history. Remaining gaps are listed in its "Open questions" section.
- 2026-09-29: Build infrastructure updated (Jekyll 4.4.1, Ruby 3.4, current Pages actions,
  Sass modules). Deployed successfully from `main`.

Known problems on the live site:
- The only published post, `_posts/2022-12-01-going-rouge.md`, is lorem-ipsum placeholder text.
- `README.md` (the About text) is a 2023 cover letter addressed to a hiring manager, with three
  duplicated drafts of the "Open to Work" paragraph. Availability info may be stale.
- Sidebar lists 7 self-titles with no supporting evidence on the site.
- Meta description is "Personal website"; no Open Graph / social preview tags.
- `js/scripts.js` is empty but loaded on every page. 404 page embeds a Giphy iframe.

Drafts worth keeping:
- `_drafts/memoir.md` — short, specific, strongest writing voice in the repo. Good basis for the About.
- `_drafts/scalable-vector-graphics.md` — half-finished tutorial, partly paraphrased from MDN.

## Direction

Confirmed by owner (2026-09-30):
- **Not a CV.** Don't list the owner's past; LinkedIn does that. Career data in `docs/PROFILE.md`
  is agent context only.
- Audience: potential employers and connections. Purpose: showcase talents and work.
- No freelance / consulting / "open to work" offer.
- English. Professional, can be whimsical. Less is more.

Structure chosen by owner (2026-09-30): **Lab.**
- Homepage: a few lines of intro (who, and one line on "now": AG Charts infrastructure,
  performance and refactoring, linking to the owner's public contributions), then a grid of
  experiments, then links (GitHub, LinkedIn for the CV, email).
- Each experiment: a small, self-contained, interactive piece (SVG / canvas / charting /
  performance) with a one-paragraph "what and why". Plain HTML/CSS/JS, no framework unless the
  experiment needs one. Must work on mobile and without breaking if JS fails to load.
- Don't launch the Lab with fewer than 3 finished experiments; an empty or 1-item lab reads as
  abandoned.
- Experiments are the owner's own from-scratch work. Don't copy AG Charts code (the enterprise
  package is commercially licensed).
- No React Summit talk, no 3DFY work, no CV content on the site.

Whichever is chosen: drop the sidebar of titles, the categories and the blog listing; remove the
lorem post; add `jekyll-seo-tag` and a real meta description; drop the empty JS file.

## Decisions (append; newest first)

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
