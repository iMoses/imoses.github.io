// The model every figure in this entry shares: a session's context window, and what is in it
// before you type your first message. The bar is the whole window to scale; each part is what one
// file costs, at four characters to a token. `rows` reserves the legend's longest case, so adding
// or removing a part never moves the page.
import { WINDOW, k, tokens } from './model';

export function Context({ parts, rows = parts.length, label = 'In the context window before you type' }) {
  const total = parts.reduce((sum, p) => sum + tokens(p.chars), 0);
  let x = 0;
  return (
    <div className="context">
      <p className="context-label">
        <span>{label}</span>
        <span className="context-total">
          ≈ {k(total)} of {k(WINDOW)} tokens
        </span>
      </p>
      <svg viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
        <rect className="context-window" width="1000" height="12" />
        {parts.map((p) => {
          const w = (tokens(p.chars) / WINDOW) * 1000;
          const rect = <rect key={p.name} className={p.cls} x={x} width={w} height="12" />;
          x += w;
          return rect;
        })}
      </svg>
      <ul className="context-legend">
        {parts.map((p) => (
          <li key={p.name} className={p.dim ? 'dim' : undefined}>
            <i className={`swatch ${p.cls}`} />
            <span>{p.name}</span>
            <span className="context-size">≈ {k(tokens(p.chars))}</span>
          </li>
        ))}
        {Array.from({ length: Math.max(0, rows - parts.length) }, (_, i) => (
          <li key={`pad${i}`} aria-hidden="true" />
        ))}
      </ul>
    </div>
  );
}
