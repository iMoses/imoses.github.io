// Renders assets/og.png (the 1200×630 link-preview image) from template.html.
// Usage: npm run og   — needs Playwright with a Chromium (not a project dependency).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const tagline = readFileSync(here('../../_config.yml'), 'utf8').match(/^tagline:\s*(.+)$/m)[1].trim();
const logo = readFileSync(here('../../_includes/logo.svg'), 'utf8').replace('<svg ', '<svg class="logo" ');
const html = readFileSync(here('template.html'), 'utf8')
  .replace('<!--LOGO-->', logo)
  .replace('<!--TAGLINE-->', `${tagline}.`);
writeFileSync(here('.render.html'), html);

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${here('.render.html')}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here('../../assets/og.png') });
await browser.close();
console.log('wrote assets/og.png');
