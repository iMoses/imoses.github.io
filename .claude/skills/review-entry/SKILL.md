---
name: review-entry
description: Review a lab entry for imoses.me against the house style (docs/STYLE.md) and report every deviation with evidence and a fix. Use when asked to review, check, validate, critique or proofread a lab entry or post, or before handing a draft to the owner.
---

# Review a lab entry

You are checking an entry against `docs/STYLE.md`. Read the guide in full first. Report; don't
edit unless asked.

## 1. Mechanical checks

Run `npm run lint:entry -- <post>`. Include its FAILs and warnings in the report as they are.
A warning about a banned word or spelling needs judgement: inside a quote or a name it's fine.

## 2. Judgement checks

Read the whole entry, play every figure (in the browser if possible), then answer each question
with PASS or FAIL, a short quote or location as evidence, and a concrete fix for every FAIL.

**Lesson**
1. Can you state the entry's principle in one sentence from the text alone? Quote where it's
   stated in the opening and where it's restated in the closing.
2. Is it a lesson for the reader, or a tour of what the writer did? List every paragraph that
   fails the self-praise test (it'd read naturally after "look what I did").
3. Is the general lesson named each time, beyond the specific example?

**Structure**
4. Opening: hook, subject, why it matters, promise, audience. Which are missing?
5. For each section: is its job clear from its first two sentences? Does it end on the question
   the next section answers? Is the order foundation → consequence?
6. Closing: recap list in the order taught, principle restated, where else it applies.
7. Is there a reasonable objection the entry never addresses?

**Figures**
8. For each figure: what hidden thing does it reveal, or what variable does the reader change?
   If neither, it fails.
9. Any quiz, score, congratulation, "you were right", pulsing or cute copy? (Fails STYLE.md §3.)
10. Is each figure set up by the text before it and interpreted by the text after it?
11. Do figures share one model where the system is shared? Are staged states labelled?
11a. Is every example interactive, with its code beside it (or below, on narrow screens), and does
    the code panel follow what the reader does? Is the code real (repo file or labelled excerpt)?
11b. Does the entry explain *why* each design choice was made, not only what it is?

**Voice and safety**
12. Voice and titles: an oblique title is fine only if the subtitle and summary say plainly what
    the entry teaches. direct, warm, precise, measured numbers, honest about difficulty; no hype words, no
    emoji, American spelling.
13. Public safety: any hostname, IP, internal URL, account detail, security map, or anything the
    owner ruled private for this entry (AGENTS.md decisions)?
14. Continuity: right topics; prerequisites linked in the opening.

## 3. Report

Start with a one-line verdict (ready / needs work / needs a rethink), then the FAILs ordered by
how much they hurt the reader, then the PASSes in one line each. Keep quotes short. If the same
problem appears in several places, report it once with every location.

If the review reveals a rule the guide doesn't cover but the owner clearly cares about, propose
the new rule for `docs/STYLE.md` at the end of the report.
