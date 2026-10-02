// A real Home Assistant screenshot in a light and a dark copy (CSS shows the one that matches the
// theme), with optional hotspots laid over the controls in the picture. The outer box rounds the
// picture's height up to whole rows, so whatever follows it stays on the grid.
import { useEffect } from 'react';

const BASE = '/assets/lab/nas-dashboard/';

// The renders are 2x; each family of screenshots shares one CSS size.
export const SIZES = {
  storage: [412, 357],
  update: [412, 520],
  card: [480, 101],
  signin: [472, 184],
};

export function Shot({ name, size, alt, children }) {
  const [width, height] = SIZES[size];
  return (
    <div className={`shot-box shot-${size}`}>
      <div className="shot">
        {['light', 'dark'].map((theme) => (
          <img key={theme} className={`shot-${theme}`} src={`${BASE}${name}-${theme}.png`} width={width} height={height} alt={alt} />
        ))}
        {children}
      </div>
    </div>
  );
}

// A transparent button over a control in the screenshot; `at` names its position in figures.css.
export function Hotspot({ at, label, onPress }) {
  return <button type="button" className={`hotspot hotspot-${at}`} aria-label={label} title={label} onClick={onPress} />;
}

// Swapping screenshots should be instant, so fetch every state up front.
export function usePreload(names) {
  useEffect(() => {
    const theme = document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    for (const name of names) new Image().src = `${BASE}${name}-${theme}.png`;
  }, [names]);
}
