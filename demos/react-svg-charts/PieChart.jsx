import { arc, pie } from 'd3-shape';

export function PieChart({ data, width = 280, height = 280, innerRatio = 0 }) {
  const radius = Math.min(width, height) / 2;

  const toPie = pie()
    .sort(null)
    .value((d) => d.value);

  const toArc = arc()
    .innerRadius(radius * innerRatio)
    .outerRadius(radius);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`} stroke="var(--paper)" strokeWidth="2">
        {toPie(data).map((d) => (
          <path key={d.index} d={toArc(d)} fill={`var(--series-${d.index + 1})`} />
        ))}
      </g>
    </svg>
  );
}
