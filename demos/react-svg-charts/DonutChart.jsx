import { useState } from 'react';
import { arc, pie } from 'd3-shape';

export function DonutChart({ data, width = 280, height = 280 }) {
  const [active, setActive] = useState(null);
  const radius = Math.min(width, height) / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const toPie = pie()
    .sort(null)
    .value((d) => d.value);

  const toArc = arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`} stroke="var(--paper)" strokeWidth="2">
        {/* #region hover */}
        {toPie(data).map((d) => (
          <g
            key={d.index}
            className="arc"
            style={{ '--arc-radius': radius }}
            tabIndex={0}
            onPointerEnter={() => setActive(d.data)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(d.data)}
            onBlur={() => setActive(null)}
          >
            <clipPath id={`donut-clip-${d.index}`}>
              <circle />
            </clipPath>
            <path
              d={toArc(d)}
              fill={`var(--series-${d.index + 1})`}
              clipPath={`url(#donut-clip-${d.index})`}
            />
          </g>
        ))}
        {/* #endregion */}
      </g>
      <text className="donut-label" x={width / 2} y={height / 2} textAnchor="middle">
        <tspan x={width / 2} dy="-0.2em">{active ? active.value : total}</tspan>
        <tspan x={width / 2} dy="1.4em">{active ? active.category : 'total'}</tspan>
      </text>
    </svg>
  );
}
