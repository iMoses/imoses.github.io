import { useEffect, useState } from 'react';

// Reads the live DOM under `ref` whenever it changes: `read(element)` returns what the figure shows
// (node counts, an attribute). The figures report what is really on the page, not what the code
// is supposed to have put there.
export function useDom(ref, read, deps = []) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const el = ref.current;
    // Only a changed reading re-renders: d3-axis rewrites its attributes on every render, and
    // reacting to every mutation would render the figure forever.
    const update = () => {
      const next = read(el);
      setValue((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, deps);

  return value;
}

export const count = (el, selector) => el.querySelectorAll(selector).length;
