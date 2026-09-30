import { useEffect, useState } from 'react';

const easeInOut = (t) => (t < 0.5 ? 2 * t ** 2 : 1 - (-2 * t + 2) ** 2 / 2);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useSmoothTransition(targetValue, duration = 600, easing = easeInOut) {
  const [currentValue, setCurrentValue] = useState(targetValue);

  useEffect(() => {
    if (targetValue === currentValue) return;
    if (reducedMotion()) return setCurrentValue(targetValue);

    const startValue = currentValue;
    const startTime = performance.now();
    let rafId = requestAnimationFrame(function step(now) {
      const elapsed = now - startTime;

      if (elapsed < duration) {
        const delta = easing(Math.min(elapsed / duration, 1));
        setCurrentValue(startValue + (targetValue - startValue) * delta);
        rafId = requestAnimationFrame(step);
      } else {
        setCurrentValue(targetValue);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [targetValue, duration, easing]);

  return currentValue;
}
