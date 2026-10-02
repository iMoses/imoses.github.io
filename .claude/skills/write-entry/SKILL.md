---
name: write-entry
description: Plan and draft a lab entry for imoses.me in the house style (docs/STYLE.md): a lesson built around one principle, with an opening, numbered sections that build on each other, explorable figures and a closing recap. Use when asked to write, outline, draft, or rewrite a lab entry or "post" for the site.
---

# Write a lab entry

The style is defined in `docs/STYLE.md`. Read it in full first, every time, along with `AGENTS.md`
and `docs/PROFILE.md`. This skill is the process; the guide is the standard.

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
- **Public safety:** what in the source material must not appear (STYLE.md §9, and AGENTS.md
  decisions for this entry). The repo is public.

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
- Real code via `{% code_file %}`, real screenshots via `_includes/shot.html` (AGENTS.md → How a
  lab entry works).

## 4. Build the figures

Follow AGENTS.md (grid, frames, tokens, no inline styles, works at 390px and without JS, reduced
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
