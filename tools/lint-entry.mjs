// Mechanical checks for a lab entry against docs/STYLE.md. Judgement (is it a lesson, is the
// figure worth it) is the review-entry skill's job; this catches what a script can count.
//
//   node tools/lint-entry.mjs _posts/2026-10-01-nas-dashboard.md [more posts…]
//
// Exits 1 if any check fails. Warnings are printed but don't fail.
import { existsSync, readFileSync } from 'node:fs';

const topics = [...readFileSync('_data/topics.yml', 'utf8').matchAll(/^- id: (\S+)/gm)].map((m) => m[1]);
const bundles = readFileSync('demos/vite.config.js', 'utf8');

const BANNED = /\b(just|simply|seamless(ly)?|powerful|robust|let's dive|dive in|in this (post|article))\b/gi;
const BRITISH = /\b(colours?|coloured|behaviours?|optimis\w*|visualis\w*|analys(e|ed|es|ing)|grey|centre[ds]?|recognis\w*|favour\w*|maths)\b/gi;
const EMOJI = /\p{Extended_Pictographic}/u;

let failed = false;

for (const file of process.argv.slice(2)) {
  const results = [];
  const fail = (msg) => results.push(['FAIL', msg]);
  const warn = (msg) => results.push(['warn', msg]);

  const src = readFileSync(file, 'utf8');
  const [, front = '', body = ''] = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const meta = Object.fromEntries([...front.matchAll(/^(\w+):\s*(.*)$/gm)].map((m) => [m[1], m[2].replace(/^"|"$/g, '')]));

  // Front matter
  for (const key of ['title', 'subtitle', 'summary', 'fig', 'thumb', 'topics']) if (!meta[key]) fail(`front matter: missing \`${key}\``);
  // The home card shows the whole summary, so it's kept short rather than cut off: about three
  // lines on desktop, which also keeps the cards the same height.
  if (meta.summary?.length > 160) fail(`front matter: summary is ${meta.summary.length} characters, want at most 160`);
  const own = (meta.topics ?? '').replace(/[[\]]/g, '').split(',').map((t) => t.trim()).filter(Boolean);
  if (own.length < 1 || own.length > 3) fail(`front matter: ${own.length} topics, want 1–3`);
  for (const t of own) if (!topics.includes(t)) fail(`front matter: unknown topic \`${t}\` (see _data/topics.yml)`);
  if (meta.thumb && !existsSync(`_includes/thumbs/${meta.thumb}.svg`)) fail(`thumb _includes/thumbs/${meta.thumb}.svg not found`);
  if (body.includes('demo.html') && !(meta.demo && bundles.includes(`'${meta.demo}'`))) fail('live figures need `demo:` registered in demos/vite.config.js');

  // Prose only: drop fenced code, Liquid tags and inline code before reading words.
  const prose = (text) => text.replace(/```[\s\S]*?```/g, '').replace(/\{%[\s\S]*?%\}/g, '').replace(/`[^`]*`/g, '');
  const blocks = (text) => text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const isParagraph = (b) => !/^(#|- |\d+\. |\{%|```|>|\|)/.test(b);
  const isFigure = (b) => /^\{%\s*(include (demo|figure)\.html|code_file)/.test(b) || b.startsWith('```');

  // Opening: everything before the first section
  const [opening, ...sections] = body.split(/^## /m);
  const openingParas = blocks(opening).filter(isParagraph).length;
  if (openingParas < 3) fail(`opening: ${openingParas} paragraph(s) before the first section, want 3–5`);
  if (openingParas > 5) warn(`opening: ${openingParas} paragraphs, guide says 3–5`);

  // Sections
  if (sections.length < 4) warn(`${sections.length} sections; a full entry usually has 5–8 plus the closing`);
  sections.forEach((section, i) => {
    const [heading, ...rest] = section.split('\n');
    const bs = blocks(rest.join('\n'));
    const paras = bs.filter(isParagraph).length;
    const figures = bs.filter(isFigure).length;
    const last = i === sections.length - 1;
    if (last) {
      // The closing: a recap list, then the principle and where else it applies.
      if (!bs.some((b) => /^(- |\d+\. )/.test(b))) fail(`closing "${heading}": no recap list`);
      if (paras < 2) fail(`closing "${heading}": ${paras} paragraph(s); want the principle and where else it applies`);
    } else if (paras < 3 && !(paras >= 2 && figures > 0)) {
      fail(`section "${heading}": ${paras} paragraph(s) and ${figures} figure(s); want 3 paragraphs, or 2 plus a figure`);
    }
    // A figure must be followed by prose that interprets it.
    bs.forEach((b, j) => {
      if (/^\{%\s*include (demo|figure)\.html/.test(b) && !(bs[j + 1] && isParagraph(bs[j + 1]))) {
        fail(`section "${heading}": a figure isn't followed by a paragraph that explains it`);
      }
      if (/^\{%\s*include (demo|figure)\.html/.test(b) && !/caption="/.test(b)) warn(`section "${heading}": figure without a caption`);
      if (/^\{%\s*include figure\.html/.test(b) && !/alt="/.test(b)) fail(`section "${heading}": still figure without alt text`);
    });
  });

  // Words
  const text = prose(body);
  for (const m of text.matchAll(BANNED)) warn(`word: "${m[0]}"`);
  for (const m of text.matchAll(BRITISH)) warn(`spelling: "${m[0]}" (American spelling)`);
  if (EMOJI.test(text)) fail('emoji in the prose');
  const words = text.split(/\s+/).filter(Boolean).length;

  console.log(`\n${file}: ${words} words, ~${Math.round(words / 230)} min of reading, ${sections.length} sections`);
  for (const [level, msg] of results) console.log(`  ${level}  ${msg}`);
  if (!results.length) console.log('  ok');
  if (results.some(([level]) => level === 'FAIL')) failed = true;
}

process.exit(failed ? 1 : 0);
