// A code panel that follows the example beside it. The source is real (an excerpt, trimmed with
// `…`); the figure says which lines just ran and what values they saw.
//
// Lines are written as plain text. A line ending in «name» can be referred to by that name, and
// ⟨name⟩ inside a line is replaced by a live value:
//
//   <Code file="x.py" lang="python" source={SRC} hot={['publish']} live={{ retain: 'True' }} />

const KEYWORDS = {
  python: 'def|if|elif|else|return|while|for|in|not|and|or|is|None|True|False|global|try|except|lambda|import',
  yaml: 'true|false|null',
  jinja: 'if|elif|else|endif|set|is|not|in|none|and|or',
  js: 'const|let|return|if|else|true|false|null|undefined',
};

const COMMENT = { python: /#.*/y, yaml: /#.*/y, jinja: /\{#.*?#\}/y, js: /\/\*.*?(?:\*\/|$)|\/\/.*|\s*[^'`]*\*\/$/y }; // block comments may span lines

// Just enough tokenizing to color an excerpt with the site's syntax classes (.highlight).
function tokens(text, lang) {
  const rules = [
    [COMMENT[lang], 'c1'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y, 's2'],
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

// «name» at the end of a line names it; returns [{ text, name }].
export function parse(source) {
  return source
    .replace(/^\n|\n\s*$/g, '')
    .split('\n')
    .map((line) => {
      const m = line.match(/^(.*?)\s*«([\w-]+)»$/);
      return m ? { text: m[1], name: m[2] } : { text: line };
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

export function Code({ file, lang, source, hot = [], off = [], live = {}, notes = {} }) {
  const lines = parse(source);
  return (
    <figure className="code-panel framed">
      <figcaption>{file}</figcaption>
      <pre className="highlight">
        {lines.map(({ text, name }, i) => (
          <code key={i} className={['line', hot.includes(name) && 'hot', off.includes(name) && 'off'].filter(Boolean).join(' ')}>
            <Line text={text} lang={lang} live={live} />
            {notes[name] && <span className="inline-value">{`  ← ${notes[name]}`}</span>}
          </code>
        ))}
      </pre>
    </figure>
  );
}
