import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';

export function BarChart({ data, width = 400, height = 200, padding = 10 }) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const x = scaleBand()
    .domain(data.map((d) => d.source))
    .range([0, innerWidth])
    .padding(0.2);

  const y = scaleLinear()
    .domain([0, max(data, (d) => d.twh)])
    .range([innerHeight, 0]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${padding},${padding})`}>
        {data.map((d) => (
          <rect
            key={d.source}
            x={x(d.source)}
            y={y(d.twh)}
            width={x.bandwidth()}
            height={innerHeight - y(d.twh)}
            fill="var(--series-1)"
          />
        ))}
      </g>
    </svg>
  );
}
