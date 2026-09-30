export function Shapes({ viewBox = '0 0 500 500' }) {
  return (
    <svg viewBox={viewBox} width="240" height="240">
      <g stroke="currentColor" strokeWidth="2">
        <line x1="50" y1="50" x2="200" y2="50" />
        <rect x="50" y="100" width="150" height="100" fill="var(--series-8)" />
        <circle cx="125" cy="275" r="50" fill="var(--series-1)" />
        <ellipse cx="300" cy="125" rx="75" ry="50" fill="var(--series-3)" />
        <polyline points="400,200 425,225 450,200 475,225 500,200" fill="none" />
        <polygon points="300,300 325,350 350,325 375,375 400,350 400,300" fill="var(--series-4)" />
        <path d="M50,400 L150,400 L100,475 Z" fill="var(--series-7)" />
      </g>
    </svg>
  );
}
