import { useEffect, useRef } from 'react';
import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

export function BarChart({ data, width = 400, height = 200, padding = 10 }) {
  const ref = useRef();

  // #region effect
  useEffect(() => {
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const x = scaleBand()
      .domain(data.map((d) => d.source))
      .range([0, innerWidth])
      .padding(0.2);

    const y = scaleLinear()
      .domain([0, max(data, (d) => d.twh)])
      .range([innerHeight, 0]);

    // One <g>, created on the first run and reused after.
    select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .selectAll('g')
      .data([null])
      .join('g')
      .attr('transform', `translate(${padding},${padding})`)
      .selectAll('rect')
      .data(data, (d) => d.source)
      .join('rect')
      .attr('x', (d) => x(d.source))
      .attr('y', (d) => y(d.twh))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.twh))
      .attr('fill', 'var(--series-1)');
  }, [data, width, height, padding]);
  // #endregion

  return <svg ref={ref} />;
}
