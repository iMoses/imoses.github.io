import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';

// A fenced-off node: React renders an empty <g> and never touches its children; d3-axis draws
// them. Safe because the axis joins its ticks to data, so running it again updates, not appends.
export function D3Axis({ axis, transform }) {
  const ref = useRef();

  useEffect(() => {
    select(ref.current).call(axis);
  });

  return <g ref={ref} transform={transform} />;
}
