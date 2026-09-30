import { scaleBand, scaleLinear } from 'd3-scale';

export function BarChart({ data, width = 400, height = 200, padding = 10 }) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const x = scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, innerWidth])
    .padding(0.2);

  const y = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.value))])
    .range([innerHeight, 0]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${padding},${padding})`}>
        {data.map((d) => (
          <rect
            key={d.label}
            x={x(d.label)}
            y={y(d.value)}
            width={x.bandwidth()}
            height={innerHeight - y(d.value)}
            fill="var(--series-1)"
          />
        ))}
      </g>
    </svg>
  );
}
