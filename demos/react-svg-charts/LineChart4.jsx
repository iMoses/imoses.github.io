import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

export function LineChart({ data, width = 450, height = 200, padding = 10, onSelect }) {
  const scaleX = scaleLinear()
    .domain(extent(data.map((d) => d.year)))
    .rangeRound([padding, width - padding]);

  const scaleY = scaleLinear()
    .domain(extent(data.map((d) => d.sales)))
    .rangeRound([height - padding, padding]);

  const points = data.map((d) => [scaleX(d.year), scaleY(d.sales)]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points.join(' ')}
        stroke="var(--series-1)"
        strokeWidth="2"
        fill="none"
      />
      {/* #region markers */}
      {points.map(([cx, cy], i) => (
        <g
          key={i}
          className="marker-hit"
          tabIndex={0}
          role="button"
          aria-label={`${data[i].year}: ${data[i].sales.toLocaleString()}`}
          onClick={() => onSelect?.(data[i])}
          onKeyDown={(e) => e.key === 'Enter' && onSelect?.(data[i])}
        >
          <circle cx={cx} cy={cy} r="10" fill="transparent" />
          <circle className="marker" cx={cx} cy={cy} />
        </g>
      ))}
      {/* #endregion */}
    </svg>
  );
}
