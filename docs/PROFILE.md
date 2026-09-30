# Owner profile — source of truth for all site content

About Ido Moshe (iMoses). Agents: use only what's written here; never fill blanks yourself.
Anything under "Open questions" is unanswered — ask the owner, don't guess.
**This repo is public** — only write what the owner is happy for anyone to read.

## 0. What the site is — and isn't [OWNER]

- **The site is not a CV and must not list the owner's past.** LinkedIn does that. Career history
  below is background for agents (to understand who the owner is), **not site content**.
- Audience: potential employers, potential connections. Purpose: a place to showcase the owner's
  talents and work.
- **Not** open to freelance / consulting work — don't offer it anywhere.
- Language: English. Tone: professional, can be whimsical. **Less is more.**

Sources, cited inline:
- **[LI]** LinkedIn profile export (summarised, public-facing) — supplied by owner 2026-09-30.
- **[CV]** Detailed CV (longer narrative version, written for an application) — supplied by owner 2026-09-30.
  Company funding/valuation figures were deliberately left out here (owner: not important).
- **[GIT]** `ag-grid/ag-charts` public git history, author `iMoses`, default branch `latest`,
  read 2026-09-30.
- **[OWNER]** Stated directly by the owner in a session.

When [LI] and [CV] differ, prefer [LI] wording for the public site unless the owner says otherwise.

## 1. Right now

- Senior Software Developer at AG Grid, Aug 2023 – present, Greater London. [LI]
- LinkedIn headline: "Principal Full Stack Engineer", location London, England. [LI]
- Works on **AG Charts** (open source) — "you can see all of my work through GitHub". [OWNER]
- Focus at AG Grid: mainly **optimising and refactoring the library's infrastructure**. [OWNER]
- AG Grid is a flat organisation; most developers there work at staff-engineer level. The owner
  sees "Senior Software Developer" as the role's title, not a measure of level. [OWNER]
- Not open to freelance/consulting work. [OWNER]

## 2. Evidence: AG Charts (2023–present) [GIT]

Repo: https://github.com/ag-grid/ag-charts — JavaScript/TypeScript charting library,
community (MIT) + enterprise packages, with React/Angular/Vue wrappers.

- ~2,300 commits on `latest` from Aug 2023 to Sep 2026 (102 in 2023, 725 in 2024, 615 in 2025,
  876 in 2026 to date). First merged PR: ag-grid/ag-charts#126 (Aug 2023).
- Most-touched areas: core chart engine (`ag-charts-community/src/chart`), enterprise series and
  features, axes, scene graph, options/validation, and the docs website.

Main threads of work, by commit history (ticket IDs are AG Grid's internal Jira keys):

| Theme | When | Examples |
|---|---|---|
| New series types | 2023 | Box-plot series: series, tooltips, highlighting, docs (AG-9150, AG-9027, AG-9159, AG-9023) |
| Docs / API reference tooling | 2023 → 2026 | Rebuilt options API-reference generation; generic type resolution; e2e tests for the API-ref page (AG-15245) |
| Licensing | 2023 → 2026 | Enterprise watermark on unlicensed charts (AG-9506); enterprise-feature warnings in community (AG-9098); licence validation (AG-18426) |
| Axes | 2024 → 2026 | Nested / grouped categories (AG-4416), made `grouped-category` an official axis type, high-density label handling (AG-15896), grouped-category for heatmaps (AG-17123) |
| Architecture / modularity | 2024 → 2026 | Tree-shakable entry points (AG-13035); unified module registries (AG-15977); per-instance module registration (AG-18379); module-declared option contributions (AG-18504); detached DOM manager from the scene (#2353); `ChartState` |
| Text rendering | 2025 → 2026 | Multiple font styles in one text element (AG-9686, AG-15580); multi-segment series labels (AG-15906); inline images in labels (AG-15933); wrapping/truncating rich text (AG-15582) |
| Label placement | 2026 | Collision-aware label placement engine / `LabelManager`, onboarded across line, area, range-area, bar, pie/donut, map (AG-16578, AG-17661, AG-17844, AG-18004, AG-18340, AG-18341) |
| RTL support | 2026 | Right-to-left captions, numbers and docs (AG-5279, AG-18113) |
| Options & validation | 2023 → 2026 | Fuzzy-matching for mistyped options (AG-9896); union / value-level deprecation validators (AG-18140, AG-17863); async `throwOn` (AG-18439) |
| Large refactors | 2023 → 2026 | Series properties management; removing reactive decorators and `BaseProperties` in favour of plain options (AG-17392, AG-18619, AG-18620) |

Owner's own summary of this work: infrastructure optimisation and refactoring. [OWNER]

## 3. Career history

| Years | Company | Role [LI] | Domain [CV] |
|---|---|---|---|
| 2023 – now | AG Grid | Senior Software Developer | Data grid / charting libraries |
| 2022 – 2023 | Freelance — 3DFY.ai [OWNER] | — | AI text-to-3D-model generation |
| 2021 – 2022 | Apiiro | Front End Lead / Guild Master | Application security |
| 2019 – 2021 | Authomize | Full Stack Architect / Technical Lead | Identity security |
| 2015 – 2019 | Twiggle | Senior Full Stack Engineer / Technical Lead | NLP e-commerce search |
| 2011 – 2015 | Slidely (the company was EasyHi when the owner joined; renamed Slidely with the product pivot; renamed Promo after the owner left) [OWNER] | Senior Full Stack Engineer / Technical Lead | Slideshow / video creation |
| 2010 – 2011 | Yedioth Aharonot | Full Stack Engineer / Lead Engineer | News portal |
| 2009 – 2010 | John Bryce | Front End Lecturer | Training |

Highlights per role (keep to what's supported):

- **3DFY.ai (freelance, Nov 2022 – Aug 2023)** — built a canvas-based viewer and a payment
  control / CMS for an AI company that generates 3D models from prompts. [OWNER]
- **Apiiro** — established a frontend guild and owned client architecture across teams; mentored
  via code review and pair programming; drove an in-house design system with design & product;
  refactored the legacy client; built SVG charts with React, d3 and MobX; optimised data tables
  for very large record sets. [LI][CV]
- **Authomize** — first employee; owned most code and DevOps. CI/CD with Jenkins, Kubernetes,
  Helm, Argo CD/GitOps; ETL on Python/k8s/Argo integrating Google, Okta, AWS, Azure into a data
  warehouse; Dask-on-k8s tooling for data science; graph databases (Neo4j, ArangoDB);
  integration APIs and SDKs for customer data. [LI][CV]
- **Twiggle** — 4th employee. User-facing products, high-impact demos and POCs for clients and
  investors (in-browser search engine, Chrome extensions, e-commerce chatbot); led the team that
  built an ontology-modelling IDE (Electron, React, MobX); production ETL (Docker, Terraform,
  AWS, GCP, k8s); helped establish DevOps. [LI][CV] [CV] also says: analytics SDK adopted by
  Walmart, Flipkart and AliExpress.
- **Slidely** — joined as PHP developer, became frontend lead then web-division lead;
  rewrote the client for millions of monthly users; canvas editors with Web Workers and
  audio/video APIs; moved image manipulation from servers to the client, cutting costs. [LI][CV]
- **Yedioth Aharonot** — one of Israel's largest news portals; led two teams (13 engineers)
  that later merged; wrote an MVC framework for a TCL-based CMS; drag-and-drop grid on IE6. [LI]
- **John Bryce** — lectured web design & development; wrote the syllabus. [LI]

Also:
- Co-author on patents [US20180046703A1](https://patents.google.com/patent/US20180046703A1/en)
  and [US20220121665A1](https://patents.google.com/patent/US20220121665A1/en). [CV]
- Talk: "Efficient Data Visualisation with React and SVG", React Summit 2025 (13 Jun 2025, ~27 min).
  [GitNation](https://gitnation.com/contents/efficient-data-visualisation-with-react-and-svg) ·
  [YouTube](https://www.youtube.com/watch?v=0lcQ-d2oII8). Owner is "not super proud" of it. [OWNER]
- Has given meetup talks in Tel Aviv in the past. [OWNER]
- Largely self-taught: a few Open University courses as a teenager, then web-dev forums and IRC.
  Long-time volunteer with young people; prefers small study groups. [CV]
- Hebrew (native), English (full professional). [LI]
- LinkedIn top skills: TypeScript, Charts, Performance Improvement. [LI]
- Quotes used on LinkedIn: Einstein ("as simple as possible, but not simpler") and Martin
  Golding ("code as if the maintainer is a violent psychopath…"). [LI]

## 4. Links

- GitHub: https://github.com/iMoses
- LinkedIn: https://www.linkedin.com/in/imoses
- Stack Overflow: https://stackoverflow.com/users/1145124/imoses (still wanted? see below)
- Email (site uses): imoses.g+website@gmail.com

## 5. Owner decisions (2026-09-30)

- Site structure: Lab (showcase of experiments). See AGENTS.md → Direction.
- 3DFY.ai work: not showable publicly.
- React Summit 2025 talk: leave off the site; focus on the Lab.

## 6. Open questions (owner to answer; delete each once answered)

1. Which experiments to build first (candidates proposed in the session of 2026-09-30).
2. Stack Overflow link: keep only if the profile is still active or has notable reputation
   (agents couldn't check it from their environment).
