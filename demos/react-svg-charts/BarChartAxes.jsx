import { ticks } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import { Axis } from './Axis';

export function BarChart({
  data,
  width = 500,
  height = 300,
  marginTop = 20,
  marginRight = 10,
  marginBottom = 30,
  marginLeft = 40,
}) {
  const scaleX = scaleBand()
    .domain(data.map((d) => d.year))
    .rangeRound([marginLeft, width - marginRight])
    .padding(0.1);

  const scaleY = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.sales))])
    .rangeRound([height - marginBottom, marginTop]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g fill="var(--series-1)">
        {data.map((d) => (
          <rect
            key={d.year}
            x={scaleX(d.year)}
            y={scaleY(d.sales)}
            width={scaleX.bandwidth()}
            height={scaleY(0) - scaleY(d.sales)}
          />
        ))}
      </g>
      {/* #region axes */}
      <Axis
        orientation={Axis.Bottom}
        scale={scaleX}
        transform={`translate(0,${height - marginBottom})`}
        tickValues={ticks(Math.min(...scaleX.domain()), Math.max(...scaleX.domain()), width / 50).filter(
          (v) => scaleX(v) !== undefined,
        )}
        tickSizeOuter={0}
      />
      <Axis
        orientation={Axis.Left}
        scale={scaleY}
        tickArguments={[null, 's']}
        transform={`translate(${marginLeft},0)`}
        noDomain
      />
      {/* #endregion */}
    </svg>
  );
}
