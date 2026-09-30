// Layout check for the built site (_site/): renders every page in Chromium at desktop and phone
// widths, light and dark, and fails if anything breaks the site's rules:
//   - a block's top edge off the 24px grid, or a framed box that isn't whole rows
//   - an in-flow block with a vertical border (see AGENTS.md: lines never take up layout space)
//   - inline styles other than the ones site.js is allowed to write
//   - horizontal overflow, or console / page errors
//
// Usage: npm run build && bundle exec jekyll build && npm run check
// Needs Playwright with a Chromium (not a project dependency); set PLAYWRIGHT_MODULE / CHROMIUM_PATH
// if they aren't where Node would find them.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../_site/', import.meta.url));
const pages = ['/', '/lab/charts-are-just-shapes/'];
const views = [
  { width: 1100, scheme: 'light', deviceScaleFactor: 1 },
  { width: 390, scheme: 'dark', deviceScaleFactor: 2.625, isMobile: true },
];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (path.endsWith('/')) path += 'index.html';
  try {
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(await readFile(join(root, path)));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;

for (const url of pages) {
  for (const { width, scheme, ...device } of views) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, colorScheme: scheme, ...device });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !/fonts\.g/.test(m.location().url) && errors.push(m.text()));
    await page.goto(base + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500); // fonts, figures and the logo intro settle

    const problems = await page.evaluate(() => {
      const U = 24;
      const off = (v) => { const d = ((v % U) + U) % U; return Math.min(d, U - d) > 0.05; };
      const gx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gx'));
      const name = (e) => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '');
      const out = [];

      for (const e of document.querySelectorAll('main > *, .intro > *, .lab > *, .entry > *, .entry-header > *, .site-footer')) {
        const r = e.getBoundingClientRect();
        if (off(r.top + scrollY) || off(r.left - gx)) out.push(`off grid: ${name(e)}`);
      }
      for (const e of document.querySelectorAll('.framed, div.highlighter-rouge')) {
        const r = e.getBoundingClientRect();
        if ([r.top + scrollY, r.left - gx, r.width, r.height].some(off)) out.push(`frame not whole rows: ${name(e)}`);
      }
      for (const e of document.querySelectorAll('body *')) {
        if (e.closest('.demo-stage, svg, .ruler, .crosshair')) continue;
        const cs = getComputedStyle(e);
        if (cs.display.startsWith('inline') || ['absolute', 'fixed'].includes(cs.position)) continue;
        if (parseFloat(cs.borderTopWidth) || parseFloat(cs.borderBottomWidth)) out.push(`in-flow vertical border: ${name(e)}`);
      }
      for (const e of document.querySelectorAll('[style]')) {
        if (e.closest('.ruler, .crosshair, svg, .demo-stage')) continue;
        const style = e.getAttribute('style').replace(/--gx:[^;]+;?|min-height:[^;]+;?/g, '').trim();
        if (style) out.push(`inline style: ${name(e)} {${style}}`);
      }
      if (document.documentElement.scrollWidth > innerWidth) out.push('horizontal overflow');
      return out;
    });

    const all = [...problems, ...errors.map((e) => `console: ${e}`)];
    console.log(`${all.length ? '✗' : '✓'} ${url} @ ${width}px ${scheme}`);
    for (const p of all) console.log(`    ${p}`);
    failures += all.length;
    await page.close();
  }
}

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
