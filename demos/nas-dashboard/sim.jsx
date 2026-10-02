// Small helpers shared by the figures: delayed steps that die with the figure, a clock format, and
// the log of what went over the wire.
import { useCallback, useEffect, useRef, useState } from 'react';

// Runs callbacks later, and cancels whatever is still pending when the figure resets or unmounts.
export function useLater() {
  const timers = useRef(new Set());
  const cancel = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current.clear();
  }, []);
  useEffect(() => cancel, [cancel]);
  const later = useCallback((ms, fn) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);
  return [later, cancel];
}

export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// What the broker saw, newest last. Each line is [who, text]; `start` stamps lines with t+seconds.
export function useLog(initial) {
  const start = useRef(Date.now());
  const stamp = (lines) => lines.map(([who, text]) => ({ when: `t+${Math.round((Date.now() - start.current) / 1000)}s`, who, text }));
  const [lines, setLines] = useState(() => stamp(initial));
  const add = useCallback((...more) => setLines((l) => [...l, ...stamp(more)].slice(-8)), []);
  const reset = useCallback((...fresh) => {
    start.current = Date.now();
    setLines(stamp(fresh));
  }, []);
  return [lines, add, reset];
}

// Newest first, in a box of fixed height: a new line never moves the page.
export function Log({ lines }) {
  return (
    <ol className="broker-log" reversed aria-live="polite">
      {[...lines].reverse().map((l, i) => (
        <li key={i} className={`from-${l.who}`}>
          <span className="t">{l.when}</span> {l.text}
        </li>
      ))}
    </ol>
  );
}
