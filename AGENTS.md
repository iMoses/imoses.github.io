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

## Direction (proposed, not yet confirmed by owner)

1. One-page profile first: one-line positioning, 3–5 work highlights (problem → what was done →
   outcome), working style / availability (only if current), contact.
2. Rewrite About in the memoir's voice, sourced only from `docs/PROFILE.md`.
3. The site itself is proof of front-end/UX craft: fast, accessible, well-designed.
4. Hide blog/categories until there are 3+ real posts; keep the infrastructure.
5. Housekeeping: remove the lorem post, add `jekyll-seo-tag`, real meta description, drop empty JS.

## Decisions (append; newest first)

- 2026-09-30: Repo files (this file + `docs/PROFILE.md`) are the handoff mechanism between agents.

## Open questions for the owner

See the unanswered items in `docs/PROFILE.md`.
