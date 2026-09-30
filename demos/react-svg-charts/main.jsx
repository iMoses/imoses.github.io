// Mounts each interactive figure into its `<figure class="demo" data-demo="…">` placeholder.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { BarChart as BarChartD3 } from './BarChartD3';
import { BarChart as BarChartReact } from './BarChart';
import { BarChart as BarChartAxes } from './BarChartAxes';
import { Shapes } from './Shapes';
import { LineChart as LineChart1 } from './LineChart1';
import { LineChart as LineChart2 } from './LineChart2';
import { LineChart as LineChart3 } from './LineChart3';
import { LineChart as LineChart4 } from './LineChart4';
import { PieChart } from './PieChart';
import { DonutChart } from './DonutChart';
import { GaugeChart } from './Gauge';
import { useSmoothTransition } from './useSmoothTransition';
import { categories, fruit, sales } from './data';
import './demos.css';

const shuffle = (data) => data.map((d) => ({ ...d, value: 2 + Math.round(Math.random() * 18) }));

function Trap() {
  const [data, setData] = useState(fruit);
  return (
    <>
      <div className="demo-row">
        <div>
          <h4>d3 owns the DOM</h4>
          <BarChartD3 data={data} />
        </div>
        <div>
          <h4>React owns the DOM</h4>
          <BarChartReact data={data} />
        </div>
      </div>
      <div className="controls">
        <button type="button" onClick={() => setData(shuffle)}>
          New data
        </button>
        <span>Only one of them is listening.</span>
      </div>
    </>
  );
}

function ViewBox() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [size, setSize] = useState(500);
  const viewBox = `${x} ${y} ${size} ${size}`;
  const slider = (label, value, set, min, max) => (
    <label>
      {label}
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} />
    </label>
  );
  return (
    <>
      <Shapes viewBox={viewBox} />
      <div className="controls">
        {slider('x', x, setX, -250, 250)}
        {slider('y', y, setY, -250, 250)}
        {slider('size', size, setSize, 100, 1000)}
        <output className="viewbox-code">viewBox="{viewBox}"</output>
      </div>
    </>
  );
}

function LineEvents() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <LineChart4 data={sales} onSelect={setSelected} />
      <p className="readout" aria-live="polite">
        {selected ? `${selected.year} → ${selected.sales.toLocaleString()} sales` : 'Click (or tab to) a point.'}
      </p>
    </>
  );
}

function Legend({ data }) {
  return (
    <ul className="legend">
      {data.map((d, i) => (
        <li key={d.category}>
          <i style={{ background: `var(--series-${i + 1})` }} />
          {d.category} ({d.value})
        </li>
      ))}
    </ul>
  );
}

function PieToDonut() {
  const [ratio, setRatio] = useState(0);
  return (
    <>
      <PieChart data={categories} innerRatio={ratio} />
      <Legend data={categories} />
      <div className="controls">
        <label>
          innerRadius
          <input type="range" min={0} max={0.9} step={0.05} value={ratio} onChange={(e) => setRatio(+e.target.value)} />
        </label>
        <output>radius × {ratio.toFixed(2)}</output>
      </div>
    </>
  );
}

function Donut() {
  return (
    <>
      <DonutChart data={categories} />
      <Legend data={categories} />
    </>
  );
}

function Gauge() {
  const [target, setTarget] = useState(87);
  const value = useSmoothTransition(target);
  return (
    <>
      <GaugeChart value={value} label="Benchmark" />
      <div className="controls" style={{ justifyContent: 'center' }}>
        <label>
          value
          <input type="range" min={0} max={100} value={target} onChange={(e) => setTarget(+e.target.value)} />
        </label>
        <button type="button" onClick={() => setTarget(Math.round(Math.random() * 100))}>
          Surprise me
        </button>
      </div>
    </>
  );
}

const figures = {
  trap: Trap,
  viewbox: ViewBox,
  'line-1': () => <LineChart1 data={sales} />,
  'line-2': () => <LineChart2 data={sales} />,
  'line-3': () => <LineChart3 data={sales} />,
  'line-4': LineEvents,
  pie: PieToDonut,
  donut: Donut,
  gauge: Gauge,
  axes: () => <BarChartAxes data={sales} />,
};

for (const el of document.querySelectorAll('.demo[data-demo]')) {
  const Figure = figures[el.dataset.demo];
  const stage = el.querySelector('.demo-stage');
  if (Figure && stage) createRoot(stage).render(<Figure />);
}
