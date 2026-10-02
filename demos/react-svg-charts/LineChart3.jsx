import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

export function LineChart({ data, width = 480, height = 360, padding = 12 }) {
  const x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([padding, width - padding]);

  const y = scaleLinear()
    .domain([0, 100])
    .range([height - padding, padding]);

  // #region render
  const points = data.map((d) => [x(d.year), y(d.share)]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <polyline className="line" points={points.join(' ')} />
      {points.map(([cx, cy], i) => (
        <circle key={i} className="marker" cx={cx} cy={cy} />
      ))}
    </svg>
  );
  // #endregion
}
