import { useId } from 'react';
import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';

const defaultGradientSteps = [
  '#D72638', // Very Bad - red
  '#F46036', // Bad - orange-red
  '#FFBD00', // Moderate - amber
  '#A1E44D', // Good - yellow-green
  '#06D6A0', // Very Good - green
];

export function GaugeChart({ label, value = 0, start = 0, end = 100, gradientSteps = defaultGradientSteps }) {
  const id = useId();

  const angleScale = scaleLinear()
    .domain([start, end])
    .range([-Math.PI / 2, Math.PI / 2])
    .clamp(true);

  const gaugeArc = arc()
    .innerRadius(0.7)
    .outerRadius(1)
    .startAngle(-Math.PI / 2);

  return (
    <div className="gauge">
      <svg width="200" viewBox="-1 -1 2 1">
        <defs>
          <linearGradient id={`gauge-gradient-${id}`} gradientUnits="userSpaceOnUse" x1="-1" x2="1">
            {gradientSteps.map((color, index) => (
              <stop key={color} stopColor={color} offset={`${index / (gradientSteps.length - 1)}`} />
            ))}
          </linearGradient>
        </defs>
        <path d={gaugeArc({ endAngle: Math.PI / 2 })} fill="var(--track)" />
        <path d={gaugeArc({ endAngle: angleScale(value) })} fill={`url(#gauge-gradient-${id})`} />
      </svg>
      <div className="gauge-value">{Math.round(value)}</div>
      {label != null && <div className="gauge-label">{label}</div>}
    </div>
  );
}
