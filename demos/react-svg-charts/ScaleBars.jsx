import { extent, max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';

export function ScaleBars({ data, fromZero, selected, width = 480, height = 360 }) {
  const x = scaleBand()
    .domain(data.map((d) => d.year))
    .range([0, width])
    .padding(0.2);

  // #region scale
  const domain = fromZero
    ? [0, max(data, (d) => d.total)]
    : extent(data, (d) => d.total);

  const y = scaleLinear()
    .domain(domain)
    .range([height, 0]);
  // #endregion

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      {data.map((d) => (
        // #region bars
        <rect
          key={d.year}
          className={d.year === selected ? 'bar selected' : 'bar'}
          x={x(d.year)}
          y={y(d.total)}
          width={x.bandwidth()}
          height={height - y(d.total)}
        />
        // #endregion
      ))}
    </svg>
  );
}
