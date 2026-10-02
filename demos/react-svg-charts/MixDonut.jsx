import { interpolateNumberArray, interpolateString } from 'd3-interpolate';
import { arc, pie } from 'd3-shape';
import { useTween } from './tween';

const radius = 140;
const toPie = pie().sort(null);
const toArc = arc().innerRadius(radius * 0.6).outerRadius(radius);
const shapes = (values) => toPie(values).map(toArc);

// #region tween
// Each slice's path string, number by number.
const interpolatePaths = (from, to) => (t) => from.map((d, i) => interpolateString(d, to[i])(t));

export function MixDonut({ data, tween, duration }) {
  const values = data.map((d) => d.twh);

  // Tween the numbers: every frame is a real pie of in-between data.
  const tweenedValues = useTween(values, interpolateNumberArray, duration);
  const fromNumbers = shapes(tweenedValues);

  // Tween the shapes: move the path strings from the old pie to the new one.
  const fromPaths = useTween(shapes(values), interpolatePaths, duration);

  const paths = tween === 'numbers' ? fromNumbers : fromPaths;
  // #endregion

  return (
    <svg viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}>
      {paths.map((d, i) => (
        <path key={data[i].source} d={d} className={`fill-${i + 1}`} />
      ))}
    </svg>
  );
}
