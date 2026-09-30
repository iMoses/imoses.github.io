import { useEffect, useRef } from 'react';
import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

export function BarChart({ data, width = 400, height = 200, padding = 10 }) {
  const ref = useRef();

  useEffect(() => {
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const x = scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const y = scaleLinear()
      .domain([0, max(data, (d) => d.value)])
      .range([innerHeight, 0]);

    select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${padding},${padding})`)
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.label))
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.value))
      .attr('fill', 'var(--series-1)');
  }, []);

  return <svg ref={ref} />;
}
