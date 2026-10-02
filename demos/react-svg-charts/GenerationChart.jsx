import { max, ticks } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import { Axis } from './Axis';
import { D3Axis } from './D3Axis';

export function GenerationChart({ data, axes, width = 480, height = 360 }) {
  const margin = { top: 12, right: 12, bottom: 24, left: 36 };

  const x = scaleBand()
    .domain(data.map((d) => d.year))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = scaleLinear()
    .domain([0, max(data, (d) => d.total)])
    .range([height - margin.bottom, margin.top])
    .nice();

  // #region ticks
  const years = ticks(data[0].year, data.at(-1).year, 5).filter((year) => x(year) !== undefined);
  const bottom = `translate(0,${height - margin.bottom})`;
  const left = `translate(${margin.left},0)`;
  // #endregion

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      {data.map((d) => (
        <rect
          key={d.year}
          className="bar"
          x={x(d.year)}
          y={y(d.total)}
          width={x.bandwidth()}
          height={y(0) - y(d.total)}
        />
      ))}
      {/* #region axes */}
      {axes === 'react' ? (
        <>
          <Axis orientation={Axis.Bottom} scale={x} tickValues={years} transform={bottom} />
          <Axis orientation={Axis.Left} scale={y} tickArguments={[5]} transform={left} />
        </>
      ) : (
        <>
          <D3Axis axis={axisBottom(x).tickValues(years)} transform={bottom} />
          <D3Axis axis={axisLeft(y).ticks(5)} transform={left} />
        </>
      )}
      {/* #endregion */}
    </svg>
  );
}
