---
name: site-design
description: The imoses.me design system and page chrome — the 24px grid, vertical rhythm, framed boxes, lines that take no layout space, color tokens, no inline styles, the header title block, the logo and its intro animation, link previews, visit stats, layouts and site.js. Use when editing css/styles.scss, _layouts/, _includes/ (header, footer, logo, icons), assets/site.js, an entry's figure CSS, the og image, or when `npm run check` reports something off the grid.
---

# Site design

Moved here from `AGENTS.md` on 2026-10-02 so it loads only when the task is about how the site
looks. `AGENTS.md` wins on any disagreement. New design rules go here, not back into `AGENTS.md`.

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

