import { useId } from 'react';
import { arc, pie } from 'd3-shape';

export function DonutChart({ data, innerRatio, active, onHover, width = 280, height = 280 }) {
  const id = useId(); // clip-path ids must be unique on the page
  const radius = Math.min(width, height) / 2;
  const total = data.reduce((sum, d) => sum + d.twh, 0);
  const label = active ? active.data : { source: 'total', twh: total };

  // #region shapes
  const toPie = pie()
    .sort(null)
    .value((d) => d.twh);

  const toArc = arc()
    .innerRadius(radius * innerRatio)
    .outerRadius(radius);
  // #endregion

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {toPie(data).map((d) => (
          // #region slices
          <g
            key={d.data.source}
            className="arc"
            tabIndex={0}
            onPointerEnter={() => onHover(d)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(d)}
            onBlur={() => onHover(null)}
          >
            <clipPath id={`${id}-${d.index}`}>
              <circle r={radius} />
            </clipPath>
            <path
              d={toArc(d)}
              className={`fill-${d.index + 1}`}
              clipPath={`url(#${id}-${d.index})`}
            />
          </g>
          // #endregion
        ))}
        {innerRatio >= 0.5 && ( // the label needs a hole to sit in
          <text className="donut-label" textAnchor="middle">
            <tspan x="0" dy="-0.2em">{Math.round(label.twh)} TWh</tspan>
            <tspan x="0" dy="1.4em">{label.source}</tspan>
          </text>
        )}
      </g>
    </svg>
  );
}
