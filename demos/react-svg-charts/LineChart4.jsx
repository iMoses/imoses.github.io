import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

export function LineChart({ data, width = 480, height = 360, padding = 12, onSelect }) {
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
        <g
          key={i}
          className="marker-hit"
          tabIndex={0}
          role="button"
          aria-label={`${data[i].year}: ${data[i].share.toFixed(1)}%`}
          onClick={() => onSelect(data[i])}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(data[i])}
        >
          <circle className="hit" cx={cx} cy={cy} r="10" />
          <circle className="marker" cx={cx} cy={cy} />
        </g>
      ))}
    </svg>
  );
  // #endregion
}
