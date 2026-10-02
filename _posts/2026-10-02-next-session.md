---
title: What the next session knows
subtitle: A coding agent starts every session knowing nothing about your project except what it loads. How to decide what it loads, and when.
summary: An agent's instruction file grew ten times in nine days and had to be taken apart. What to load in every session, what to load only for one task, what to keep as history, what to turn into a script, and how big each file may get, measured on real repos.
fig: "03"
thumb: next-session
topics: [ai-agents, home-automation]
demo: next-session
---

You spend an afternoon with a coding agent, and by the end it understands why your repo is laid
out the way it is. It fixes the bug without breaking the layout, and you close the session. The
next morning a new session breaks the layout again, with complete confidence. Nothing carried
over, because nothing does: every session starts from zero.

This entry is about an agent's **working memory**: the files you write so that the next session
starts out knowing what the last one learned. The running example is the git repo that holds my
Home Assistant configuration (the house from [Fig. 02](/lab/nas-dashboard/)). Claude Code has done
most of the work in it since July. Its instruction file grew from 221 lines to 2,286 in nine days,
and then it had to be taken apart.

Writing things down is the right instinct, but it fails in two ways. A lesson that isn't written
down gets learned again, usually by breaking something. A lesson written in the wrong place fails
more quietly. Either it isn't in front of the session that needs it, or it's in front of every
session, and every session pays for it.

By the end you'll have a way to decide where any fact goes, and the measurements behind it. The
principle: **a session knows only what it loads, so file each thing by when it's needed.** What
every task needs loads every time. What one task needs loads with that task. History is read when
someone goes looking. Anything done twice becomes a script.

This is for anyone who works with a coding agent across many sessions. The examples use Claude
Code's `CLAUDE.md` and skills; other agents have the same parts under other names. You'll need to
read a short shell script in section 4, nothing more.

## 1. Nothing carries over

Start with what a session actually has. The model knows the world in general and nothing about
your repo, except what it reads. Claude Code reads one file without being asked: `CLAUDE.md` at
the root, in full, before your first message. Everything else, the session has to go and find.
So `CLAUDE.md` is the obvious place for anything the agent must not forget. It works: write a rule
there and the mistake stops happening.

That's how the file grew. Daily work on the repo started on July 25, and most sessions ended by
writing down what they'd learned: 27 of the 80 commits that changed the file start with "Document"
or "Record". Each paragraph was earned by a real mistake, such as a broken UI editor, a stale
symlink or a silent failure. None of them was wrong. Drag across the chart to see what the file
held each day.

{% include demo.html id="growth" wide=true caption="The size of the Home Assistant repo's CLAUDE.md per day, from its git history, and of the dashboards skill's SKILL.md once it was split out (section 2; from October 2 its detail lives in reference files beside it, read when needed). Drag across the chart or use the slider. The bar is what a session about a dashboard card loads that day, to scale with a 200,000-token context window. Tokens are estimated at four characters each." %}

Nine days took the file from about 9,000 characters to 154,000. Look at the shape of the curve.
It only goes up, because writing a rule down is a step in every session and taking one out is a
step in none. On July 31 the first thing finally moved out: 109 lines of finished work went to a
separate file. Three days later the file peaked at 2,286 lines, about 39,000 tokens. Every session
read all of it before you typed a word.

Thirty-nine thousand tokens is a fifth of the window, so it fit. Why is that a problem?

## 2. Every session pays for every line

This section is about what an always-loaded rule costs. Overflow wasn't the cost. The cost was
the room a long task needs later and the attention of the session reading it.

The room is easy to see. A real task reads files, logs and command output, and all of it lands in
the same window. Start a task with a fifth of the window already gone and it fills up sooner. In a
long session, that brings the point where the agent has to summarize its own history, which is
where details get lost. The attention cost I can't measure directly. The commit that split the
file names the symptom: the file was "crowding out the context it exists to inform". A rule about
Zigbee group IDs is noise in a session about a dashboard card. The more noise surrounds the one
rule that matters, the easier it is to read past.

The fix was **skills**. A skill is a folder with a `SKILL.md` file in it. Every session is shown
each skill's name and description, about a paragraph. The rest of the file loads only when the
session decides the task matches. On August 4 the detail about each part of the house moved into
ten skills. Pick a task to see what a session loads for it, before and after.

{% include demo.html id="load" wide=true caption="What a session of the Home Assistant repo loads before your first message, by task, on the day before the split (untick the box) and on the day of it. Sizes are measured from the repo; tokens are estimated. The panel is the skill index every session is shown: real descriptions, trimmed to their 'use when' part. Three skills, about the house's security, its network and who is home, are left off this page." %}

For a dashboard task, the session went from 154,000 characters, a fifth of them about the task,
to 62,000, nearly half of them about the task. A plain automation, which no skill covers, went
from 154,000 to 33,000. Look at the code panel too: the description is the trigger. Each one says
"Use when…" and names the files, the commands and the symptoms ("a card renders blank") a session
would see. The model decides whether a skill applies by reading that one paragraph, so a vague
description is a skill that never loads.

Why not keep `docs/` pages and link them from `CLAUDE.md`? The repo tried that first, and the split
commit says why it lost: "a docs/ page only helps if someone remembers to open it". A skill puts
its own paragraph in front of every session. A link only helps a session that already knows to
follow it.

That leaves the hard part. Some rules matter in every task, and some matter in one. The split has
to decide which is which, for each of two thousand lines.

## 3. File each fact by when it's needed

This section is the sorting rule. The split didn't sort by topic. It sorted by the moment a fact
is needed, and wrote the rule into `CLAUDE.md`: what stays inline "must be known *before* you know
which subsystem you are in".

That gives three places for three moments. A fact needed **before you know the task** goes in
`CLAUDE.md`. A fact needed **once you know the task** goes in that subsystem's skill. A fact needed
**only when you look back** (what broke, when, how it was fixed) goes in `docs/`, read on request.
One more rule guards the last move: anything still actionable never goes to `docs/`, because
nobody looks there before making a mistake. Below are five real facts from the repo and four
sessions that come after them. File each fact and watch which sessions have it in front of them.

{% include demo.html id="sort" wide=true caption="Five things the repo knows, paraphrased from its CLAUDE.md, skills and fix log, and four sessions that come after. For each session a cell shows used (needed and loaded), MISSED (needed and not loaded), carried (loaded and not needed) or a dot (neither). It starts as on August 3, with everything in CLAUDE.md. The panel is the repo's own rule for this; the lit lines are the ones that decide where the fact you last moved belongs." %}

With everything in `CLAUDE.md`, nothing is ever missed, and facts are carried for nothing 13
times. Filed the way the repo files them today, nothing is missed either, and only five are
carried. Now move the `git add` rule into the deploy skill, where it seems to belong: it's about
the nightly push, after all. Session 3 misses it. Any task can create a file, so the rule is needed
before you know the task, and the test puts it back in `CLAUDE.md`. Move the rename rule to
`docs/` and session 2 misses it. That's why rules never move there.

There's a reasonable objection: some rules are needed both everywhere and in one task. The repo
keeps those in both places on purpose. The split commit lists the cross-cutting safety rules that
"appear both inline and in their skill, deliberately". It's a few lines of duplication, and they
cost far less than one missed rule.

Facts aren't the only thing an agent learns, though. Some of what it learns is a procedure: a
series of steps that has to be done the same way every time. Where do those go?

## 4. Do it twice, make it a script

This section is about the lessons that are procedures. Written as prose, a procedure is executed
afresh by every session: it reads the steps, works out the commands and types them, a little
differently each time. If a session does the same steps twice, they should become a script, and
the instruction file only has to say "run it". The house repo has 11 scripts. The repo for the
home server, which has its own sessions, has 140.

The best example is the nightly push. Home Assistant edits its own configuration through its UI,
so git doesn't see those changes unless something commits them. A script inside Home Assistant
runs at 04:00, commits what changed and pushes it to GitHub. The first version was 22 lines long.
Each later version is a failure that a session found, fixed and explained in a comment. Pick a
version, make some changes during the day, and run the push for a few nights.

{% include demo.html id="nightly" wide=true caption="The repo's nightly push script at five of its commits (excerpts; the SSH setup and the comments are trimmed), run against a model of the host. Make changes during the day, then run the 04:00 push, and keep running it on later nights. The lit lines ran last night. One to try: on the first version, push from the laptop, edit an automation, and run two nights." %}

On the first version, a push from the laptop leaves the host behind GitHub, so the nightly push is
rejected and its commit stays on the host. The next night, nothing new has changed, so the script
says "No changes to sync." and exits 0, reporting success while a commit sits stranded. That
happened on July 31 with six commits. The fix asks two questions separately: is there something to
commit, and is there something to push? On the third version, update Home Assistant: it deletes
one of its own blueprints, and the YAML check fails on the missing file every night. The check
lists files with `git ls-files`, which reads git's index, not the disk, so it blocks the very
deletion the push exists to record. That happened on August 6.

Look at what each fix left behind. The script is now 123 lines, and 58 of them are comments. Each
comment explains a line that looks unnecessary until you know what happened without it, so the
next session won't "simplify" it away. That's the difference from a rule in `CLAUDE.md`. A script
doesn't need a session to load it, or to read it the same way twice. What it learned is applied
every night at 04:00.

A script also does something a rule can't: it can refuse. That turns out to be the answer to the
last problem with the filing rule, which is that files grow back.

## 5. Give every file a budget

This section is about keeping the split from undoing itself. The filing rule says where a fact
goes; it says nothing about how much a place can hold. And every place grows, for the reason the
chart in section 1 showed: writing a lesson down is a step in every session, and trimming is a
step in none.

The dashboards skill is the clearest case. Scrub the chart to October 1: it went from 29,000
characters to 115,000 in two months, and a dashboard session loaded 165,000 characters, more than
the whole of `CLAUDE.md` at its peak. A fifth of the skill was the design of one pop-up, which a
session restyling any other card loaded too. It isn't the only one. The `AGENTS.md` of this site,
the file that tells agents how to write entries like this one, reached 27,700 characters in four
days. The home server's reached 24,000.

So each kind of file now has a budget, set by how often it loads. A file loaded in every session
gets 12,000 characters, about 3,000 tokens. A skill's `SKILL.md` gets 15,000; its detail goes into
reference files beside it, which the skill's own index says when to read. Anything read whole gets
50,000. That last one isn't about cost but about truncation: an agent reads a file up to a limit,
and past it the session sees part of a page and can answer from the half it saw. Logs keep the
current month and archive the rest. The three sessions, one per repo, compared their rules and
kept the strictest of each.

{% include demo.html id="budget" wide=true caption="This site's own instruction files, measured when the page was built, and the check that holds them to their budgets. Have a session write a lesson into AGENTS.md (each lesson is a real rule from the site's design skill, 485 characters) until the check fails, then move the lessons where they belong. The panel is the check itself; the lit lines are the budgets being broken." %}

A budget in prose is a wish. "Check sizes before ending the session" is followed when a session
remembers, which is when it matters least. As a script that exits 1, it runs with the rest of the
checks, and the over-budget file fails them. Moving the lessons into the skill passes the check
without deleting a word, which is the point: the budget doesn't ask you to know less, only to
file it for the moment it's needed.

The check doesn't fix anything on its own. When the house repo got its version, the first run
failed on its `CLAUDE.md`, the file this entry started with, which has grown back to 46,000
characters. The dashboards skill passed after one more split: an 11,000-character index of core
rules, pointing at twelve reference files. What the check guarantees is that no session can
believe the files are fine when they aren't. It reports the truth, and a person or a session acts
on it.

Size is something a script can measure, because it's in the repo. Some of what the next session
needs isn't in the repo at all.

## 6. The repo is the memory

This section is about the one memory every session shares: the repo and its history. Each purpose
here has its own repo and its own long-lived agent session: the house, the home server, and this
site. Nothing in one session's context reaches another, except through files. What isn't in git
doesn't exist for the next session.

Home Assistant keeps entity IDs, names and areas in a folder called `.storage`. It isn't
committed, because it's large, it changes on every restart, and it holds login tokens. But the
committed YAML refers to entities by those IDs. Rename a light in the UI and every automation that
uses its old ID breaks, and no diff shows it. The fix is a script that writes a small, sorted copy
of the parts the YAML depends on into `inventory/`. The nightly push runs it before committing.

{% include demo.html id="inventory" wide=true caption="A rename made in Home Assistant's UI, and what the next session can read about it in git. The entity IDs are real (a bulk rename on July 25); the automation is staged. Rename the light, then run the push, with and without the export. The panel is the export script's own explanation." %}

Without the export, the push commits nothing and `git log` shows nothing. The next session finds
an automation that names a light and has no way to know that the light was renamed last night,
short of asking the running instance. With the export, the rename is one line in the same nightly
commit. On July 25 that diff was 445 lines long, a whole bulk rename, and every later session can
read it with `git log -p`.

The principle is the same one again. The agent reads files, so whatever the next session needs
has to be a file, and in git. The same goes for the reasons behind a change: the commit that split
`CLAUDE.md` explains in its message what moved, why skills beat `docs/`, and how every line was
checked to have arrived. It loads in no session, and any session can find it.

## What to take with you

1. A session knows only what it loads. `CLAUDE.md` loads in full every time, so it grows by
   default: adding a rule is a step in every session, and removing one is a step in none.
2. Everything that loads costs every session, whether its task needs it or not. Measure it.
3. File each fact by when it's needed. Before you know the task, it goes in `CLAUDE.md`. Once you
   know the task, it goes in that task's skill, whose description names the trigger. Looking
   back, it goes in `docs/`. Rules never move to `docs/`.
4. Steps done twice become a script, with the reasons in its comments.
5. Give every file a budget by how often it loads, and a check that fails when it's over.
6. State the agent can't see becomes a file in git, so the next session can read what changed.

The principle, now with the numbers behind it: **a session knows only what it loads, so file each
thing by when it's needed.** It's also cheap to check. Measure what a session loads for a typical
task, and how much of it is about that task.

None of this is specific to agents. A team wiki where everything is on the front page, a runbook
nobody opens until after the outage, a README that has become a changelog: each is a fact filed
for the wrong moment. People pay for that with their attention. Agents pay with their context, and
with the same attention problem. [Fig. 02](/lab/nas-dashboard/) shows the dashboard these sessions
built.
