import { useEffect, useRef, useState } from 'react';

const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2); // cubic in-out
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Moves a value towards `target` over `duration` ms, one frame at a time. What it moves (numbers,
// strings, arrays of either) is up to `interpolate(from, to)`, which returns a function of t ∈ [0, 1].
export function useTween(target, interpolate, duration = 750) {
  const [value, setValue] = useState(target);
  const shown = useRef(value);
  shown.current = value;
  const key = JSON.stringify(target);

  useEffect(() => {
    const between = interpolate(shown.current, target);
    if (reducedMotion()) return setValue(target);
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min((now - start) / duration, 1);
      setValue(between(ease(t)));
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [key, duration]);

  return value;
}
