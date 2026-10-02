// A code panel that follows the example beside it. The source is real: an excerpt trimmed with
// `…`, or a file of this repo imported whole (`import src from './Chart.jsx?raw'`). The figure says
// which lines just ran and what values they saw.
//
// A line ending in «name» can be referred to by that name, and ⟨name⟩ inside a line is replaced by
// a live value. A file can't carry those marks, so `match` names its lines by their text instead:
//
//   <Code file="x.py" lang="python" source={SRC} hot={['publish']} live={{ retain: 'True' }} />
//   <Code file="Chart.jsx" lang="jsx" source={src} match={{ scale: '.domain(' }} hot={['scale']} />
//
// `regions` shows only those `#region` blocks of a file, the way `{% code_file %}` does. `rows`
// pads the panel to a fixed number of lines, so swapping sources never moves the page.

const KEYWORDS = {
  python: 'def|if|elif|else|return|while|for|in|not|and|or|is|None|True|False|global|try|except|lambda|import',
  yaml: 'true|false|null',
  jinja: 'if|elif|else|endif|set|is|not|in|none|and|or',
  js: 'const|let|return|if|else|true|false|null|undefined',
  jsx: 'import|from|export|function|const|let|return|if|else|new|true|false|null|undefined',
  sh: 'if|then|else|fi|for|in|do|done|exit|export|set|cd|echo|try|except|with|as|not|continue',
};

const JS_COMMENT = /\/\*.*?(?:\*\/|$)|\/\/.*|\s*[^'`]*\*\/$/y; // block comments may span lines
const COMMENT = { python: /#.*/y, yaml: /#.*/y, sh: /#.*/y, jinja: /\{#.*?#\}/y, js: JS_COMMENT, jsx: JS_COMMENT };

// Just enough tokenizing to color an excerpt with the site's syntax classes (.highlight).
function tokens(text, lang) {
  const rules = [
    [COMMENT[lang], 'c1'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`/y, 's2'],
    [lang === 'jsx' ? /<\/?[A-Za-z][\w.]*/y : /(?!)/y, 'nt'],
    [new RegExp(`\\b(?:${KEYWORDS[lang]})\\b`, 'y'), 'k'],
    [/\b\d+(?:\.\d+)?\b/y, 'mi'],
    [/[A-Za-z_][\w-]*(?=:\s)/y, lang === 'yaml' ? 'na' : null],
    [/[A-Za-z_]\w*/y, null],
  ];
  const out = [];
  let i = 0;
  let plain = '';
  while (i < text.length) {
    const hit = rules.find(([re]) => ((re.lastIndex = i), re.test(text)));
    if (!hit) {
      plain += text[i++];
      continue;
    }
    const [re, cls] = hit;
    const word = text.slice(i, re.lastIndex);
    i = re.lastIndex;
    if (cls) {
      if (plain) out.push(plain);
      out.push(<span key={out.length} className={cls}>{word}</span>);
      plain = '';
    } else plain += word;
  }
  if (plain) out.push(plain);
  return out;
}

// Like `{% code_file region=… %}`: the lines of each `#region name` block, in order, each block
// dedented and joined to the next by `…`. Without regions, the whole source minus its markers.
const dedent = (lines) => {
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent));
};

function excerpt(source, regions) {
  const all = source.replace(/^\n|\n\s*$/g, '').split('\n');
  if (!regions) return dedent(all.filter((line) => !/#(end)?region\b/.test(line)));
  return regions.flatMap((name, i) => {
    const start = all.findIndex((l) => new RegExp(`#region ${name}\\b`).test(l));
    if (start < 0) throw new Error(`Code: region ${name} not found`);
    const end = start + all.slice(start).findIndex((l) => /#endregion/.test(l));
    const block = dedent(all.slice(start + 1, end));
    return i ? ['…', ...block] : block;
  });
}

// «name» at the end of a line names it, as does `match`: { name: 'text on the line' }, or
// { name: (line) => boolean }.
// Returns [{ text, name }].
export function parse(source, { match = {}, regions } = {}) {
  return excerpt(source, regions).map((line) => {
    const m = line.match(/^(.*?)\s*«([\w-]+)»$/);
    if (m) return { text: m[1], name: m[2] };
    const name = Object.keys(match).find((k) => (typeof match[k] === 'function' ? match[k](line) : line.includes(match[k])));
    return name ? { text: line, name } : { text: line };
  });
}

function Line({ text, lang, live }) {
  const parts = text.split(/⟨(\w+)⟩/);
  return parts.map((part, i) =>
    i % 2 ? (
      <span key={i} className="live">{live[part]}</span>
    ) : (
      <span key={i}>{tokens(part, lang)}</span>
    ),
  );
}

export function Code({ file, lang, source, match, regions, rows = 0, hot = [], off = [], live = {}, notes = {} }) {
  const lines = parse(source, { match, regions });
  while (lines.length < rows) lines.push({ text: '' });
  return (
    <figure className="code-panel framed">
      <figcaption>{file}</figcaption>
      <pre className="highlight">
        {lines.map(({ text, name }, i) => (
          <code key={i} className={['line', name && hot.includes(name) && 'hot', name && off.includes(name) && 'off'].filter(Boolean).join(' ')}>
            <Line text={text} lang={lang} live={live} />
            {notes[name] && <span className="inline-value">{`  ← ${notes[name]}`}</span>}
          </code>
        ))}
      </pre>
    </figure>
  );
}
