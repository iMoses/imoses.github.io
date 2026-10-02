# How a lab entry reads: the house style

This is the style every entry on imoses.me follows. It's a living document: the owner's feedback
lands here first, then in the entries. The `write-entry` skill drafts to it and the
`review-entry` skill checks against it, so if a rule isn't written here, it isn't enforced.

**References the owner likes**, and what each one teaches:

- **Bret Victor, *Inventing on Principle*:** one principle, stated up front. Every demo shows the
  problem first, then a tool that makes the hidden thing visible, and then says out loud how that
  serves the principle. The speaker serves the idea; he never sells himself.
- **Josh Comeau, *A Friendly Introduction to SVG*:** starts from what the reader already knows and
  builds one step at a time. Widgets you can move with your hands. Warm, direct voice, and honest
  about what's confusing.
- **Amelia Wattenberger, *React + D3.js*:** each step creates the question the next one answers
  ("But what about many elements?"). Real code, explained in numbered steps. Ends with a recap of
  what was covered and the one rule behind all of it.

---

## 1. An entry is a lesson

The reader comes to learn something they care about. The owner's work is the **evidence and the
running example**, not the subject.

- **One idea per entry, phrased as a principle** the reader can take to their own work (e.g.
  "every pixel on a dashboard is a claim, so make each one true or visibly unsure"). Write it down
  before writing anything else. If it can't be said in one sentence, the entry isn't ready.
- **The reader is the protagonist.** Write to "you", about problems you'll meet. "I" appears when
  a real incident is evidence ("this happened to me, and here's what it shows"), never as a list
  of things I built.
- **Test for self-praise:** if a paragraph would still make sense with "look what I did" in front
  of it, rewrite it around what the reader learns.
- **Explain why, not only what.** Every design choice in the example has a reason, and the reason
  is usually the most useful part (a card exists because it solves a real problem; a metric is
  left off because it never leads to an action). The owner's systems document these reasons in
  their own instruction files (`CLAUDE.md`, skills, `docs/`); read them before writing, and carry
  the reasons into the entry.
- **Teach the general thing through the specific one.** The NAS is an example of remote state;
  MQTT is an example of a message bus. Name the general lesson every time, so readers without a
  NAS still leave with something.

## 2. Structure

Every entry has three parts, in this order.

### Opening (before the first numbered section, 3–5 paragraphs)

1. **The hook:** a situation the reader recognizes, concrete and a little uncomfortable ("You've
   seen a dashboard say everything is fine while the thing it describes is dead").
2. **The subject:** what this entry is about, in plain words.
3. **Why it matters:** what goes wrong when you get it wrong, and who it bites.
4. **The promise:** what you'll understand or be able to do by the end.
5. **Who it's for and what you need to know already**, in one line. Link earlier entries if they
   cover the prerequisite.

### Body: numbered sections that build on each other

- **Each section has one job, said in its first two sentences.** The reader should know why
  they're reading it before the details start. Say it in the section's own words; a formula
  repeated at the top of every section ("This section is about…") reads as a template.
- **A section is at least three paragraphs**, or two paragraphs plus a figure or code block that
  carries real weight. One paragraph is a note, not a section: merge it or grow it.
- **Order sections from foundation to consequence.** Each one ends on the question or limitation
  that the next one answers ("This works until the server dies. What then?"). The reader should
  feel pulled forward, not handed a list.
- **Shape of a section:** the problem (shown, ideally in a figure the reader can break) → why it
  happens → the idea that fixes it → how that serves the entry's principle.
- **Anticipate the objection.** When a reasonable reader would push back ("Why not just poll it?"),
  say it for them and answer it.
- Headings name the idea, not the step ("Silence isn't health", not "Adding a Last Will").

### Closing (a section of its own, last)

1. **A recap** of what we covered, as a short list in the order taught.
2. **The principle again**, now earned, in one or two sentences.
3. **Where else it applies**, beyond this example.
4. **Where to go next:** the entry's topics link related entries automatically (see §7); point at
   one by name if it's the natural next read.

No "thanks for reading", no sign-off, no call to follow me.

## 3. Figures and interaction

### Examples: interactive, with their code beside them

Taken from all three references (owner, 2026-10-01):

- **Every example is interactive.** A still is the no-JS fallback, not the figure.
- **Code and example sit side by side** when there's room: wide figures break out of the text
  column on large screens (`.demo.wide`) with the example on one side and its code on the other.
  On narrow screens the code goes under the example.
- **The code follows the example.** When the reader does something, the code panel highlights
  the lines that just ran or changed, and values in the code are the live values. The reader
  should be able to point at a line and say "that's why the card went grey".
- Code in a figure is the real code: from this repo via `{% code_file %}`, or, when it lives in
  the owner's private repos, a faithful excerpt trimmed with `…` and labelled with its file name.
  Never invented.

### What makes a figure worth it

The bar is Victor's: **an immediate connection to the thing being explained.** A figure earns its
place when it lets the reader *see something that is normally hidden*, or *change the one variable
the section is about* and watch the consequence right away.

- **Explorables, not quizzes.** No "guess, then get told you were right", no points, no
  congratulations, no badges. That reads as childish. The engagement comes from the system itself
  being interesting to poke at.
- **Show the hidden state.** If the lesson is about messages, show the messages on the wire, what
  the broker keeps, who is subscribed. If it's about rendering, show the geometry. The screenshot
  (or chart) is the *output*; the model behind it should be on screen too.
- **The reader does real operations,** named as they are in real life (`kill -9`,
  `systemctl stop`, "restart Home Assistant"), not invented game verbs.
- **A challenge is allowed when it's the lesson,** phrased in plain prose as a goal: "Find a way
  to make the dashboard show a healthy pool for a machine that's off." The figure doesn't
  announce success; the reader sees it happen.
- **One model, revealed progressively.** When several sections share a system, use one figure
  component and switch on more of its internals as the entry goes on. The reader learns the
  diagram once.
- **The figure comes right after the text sets up the problem.** The text after it explains what
  the reader just saw. Never leave a figure without a sentence that interprets it.
- **Calm instrumentation.** Mono labels, the site's tokens, no pulsing or bouncing. Pressable
  things look pressable on hover and focus, and the caption says what can be pressed.
- **Real material only:** real screenshots, payloads, logs, measurements. When a state is staged
  for the figure, the caption says so.
- **Playing never moves the page.** Anything in a figure that changes size reserves room for its
  largest case; buttons are disabled rather than removed.
- Every figure works at 390px and respects reduced motion. Without JS, a still or a sentence is
  enough (owner: the site's point is interactivity).

## 4. Titles

The title may be oblique ("The button that does nothing") as long as the **subtitle and the card
summary say plainly what the entry teaches**. A reader skimming the home page should know the
subject from the summary alone.

## 5. Voice

- Conversational and precise. Short sentences. "You" for the reader, "I" for evidence, "we" when
  walking through something together.
- Warm and a little whimsical (an aside, a dry joke), never cute. No emoji.
- Honest about difficulty: say what confused you, what you got wrong first, what's still unknown.
  A measured number beats an adjective ("the will fired in about 3 seconds", not "quickly").
- No marketing words (powerful, seamless, robust, simply, just), no hype, no "in this post we
  will", no "let's dive in".
- American spelling (owner, 2026-10-01): color, behavior, optimize, gray. It matches the code the
  entries show (`color`, `center`), so prose and code read the same.

## 6. Code

- Real code from files that run (`{% code_file %}`), never pasted by hand.
- Show it in steps when it grows; after each block, explain the parts that matter as a short
  numbered list, keyed to what changed.
- Configuration and payloads count as code: show the real ones, trimmed with `…` where noise.

## 7. Continuity: topics

Entries are tied together by **topics**, a small fixed vocabulary in `_data/topics.yml`. Each entry
lists one to three in its front matter (`topics: [home-automation, integrations]`). The entry page
shows them under the title and ends with "More on …" lists of the other entries in each topic;
`/topics/` lists every topic and its entries in reading order.

- Use existing topics; add a new one only when a second entry is planned for it, and give it a
  one-line description in `_data/topics.yml`.
- When an entry builds on another, say so in the opening and link it.

## 8. Length and scale

Large and meaningful (owner): an entry takes 15–30 minutes to read and play with. Typically 5–8
body sections and 4–8 figures or code blocks. Less is more applies to words inside a section, not
to depth: cut repetition, never cut the explanation.

## 9. Public-safety (this repo is public)

No hostnames, IPs, internal URLs, account details, or maps of the owner's security setup. Describe
security in one line. The owner decides per entry what else stays private (Fig. 02: no container
names except Authelia, nothing from the download stack, no VPN. Fig. 03: from the owner's
repos only sizes, dates and faithful excerpts; no skill that reveals the security, network or
presence setup; nothing from the session archive, which holds pasted credentials).

---

*Owner feedback this guide is built from:*

- 2026-10-01, on the first Fig. 02 draft: sections too short and unclear; gamification childish
  (good idea, bad execution); no clear opening or ending; read as praise of the writer rather than
  a lesson; entries need continuity across subjects.
- 2026-10-01: examples side by side with their code, code follows the example, examples
  interactive; read the owner's system instructions to explain *why*; oblique titles are fine if
  the subtitle and summary are clear. American spelling.
