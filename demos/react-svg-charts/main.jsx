// Mounts each figure of "Who draws the chart?" into its `<figure class="demo" data-demo="…">`
// placeholder. Every figure is the same model: the data, what d3 computed from it, and what is in
// the DOM, beside the real source of the chart it draws (imported with ?raw, so it can't drift).
import { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Code, parse } from '../shared/Code';
import { Wire } from '../shared/Wire';
import { count, useDom } from './inspect';
import { coalShare, mix, years } from './data';

import { BarChart as BarChartD3 } from './BarChartD3';
import { BarChart as BarChartD3Fixed } from './BarChartD3Fixed';
import { BarChart } from './BarChart';
import { Shapes } from './Shapes';
import { ScaleBars } from './ScaleBars';
import { LineChart as LineChart1 } from './LineChart1';
import { LineChart as LineChart2 } from './LineChart2';
import { LineChart as LineChart3 } from './LineChart3';
import { LineChart as LineChart4 } from './LineChart4';
import { DonutChart } from './DonutChart';
import { MixDonut } from './MixDonut';
import { GenerationChart } from './GenerationChart';

import barChartD3Src from './BarChartD3.jsx?raw';
import barChartD3FixedSrc from './BarChartD3Fixed.jsx?raw';
import shapesSrc from './Shapes.jsx?raw';
import scaleBarsSrc from './ScaleBars.jsx?raw';
import lineChart1Src from './LineChart1.jsx?raw';
import lineChart2Src from './LineChart2.jsx?raw';
import lineChart3Src from './LineChart3.jsx?raw';
import lineChart4Src from './LineChart4.jsx?raw';
import donutChartSrc from './DonutChart.jsx?raw';
import mixDonutSrc from './MixDonut.jsx?raw';
import generationChartSrc from './GenerationChart.jsx?raw';
import './demos.css';

const twh = (v) => `${v.toFixed(1)} TWh`;

// Section 1: the same bar chart twice, one drawn by d3 inside an effect, one rendered by React.
const DECADES = [1990, 2000, 2010, 2020, 2025];

function Trap() {
  const [step, setStep] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [drawnFrom, setDrawnFrom] = useState(DECADES[0]); // the year the d3 chart was mounted on
  const year = DECADES[step % DECADES.length];
  const data = useMemo(() => mix(year), [year]);
  const ref = useRef();
  const rects = useDom(ref, (el) => count(el, 'rect')) ?? data.length;
  const largest = data.reduce((a, b) => (b.twh > a.twh ? b : a));
  const D3Chart = fixed ? BarChartD3Fixed : BarChartD3;
  const shows = fixed ? year : drawnFrom;

  return (
    <>
      <Wire
        nodes={[
          { name: 'Data', facts: [['year', year], ['largest source', `${largest.source}, ${twh(largest.twh)}`, null, 'bioenergy, 000.0 TWh']] },
          {
            name: 'd3 draws',
            facts: [
              ['<rect>s in its <svg>', rects, rects !== data.length && 'bad', '00'],
              ['bars show', shows, shows !== year && 'bad', '0000'],
            ],
          },
          { name: 'React renders', facts: [['<rect>s in its <svg>', data.length], ['bars show', year]] },
        ]}
      />
      <div className="split">
        <div>
          <h4 className="chart-label">d3 owns the DOM</h4>
          <div className="chart chart-wide" ref={ref}>
            <D3Chart key={fixed} data={data} />
          </div>
          <h4 className="chart-label">React owns the DOM</h4>
          <div className="chart chart-wide">
            <BarChart data={data} />
          </div>
        </div>
        <Code
          file={fixed ? 'BarChartD3Fixed.jsx' : 'BarChartD3.jsx'}
          lang="jsx"
          source={fixed ? barChartD3FixedSrc : barChartD3Src}
          regions={['effect']}
          match={{ join: '.data([null])', deps: '}, [' }}
          hot={fixed ? ['deps', 'join'] : ['deps']}
          notes={{
            deps: fixed ? 'runs on every change' : 'ran once, on mount',
            join: 'the same <g> every run',
          }}
        />
      </div>
      <div className="controls">
        <button type="button" onClick={() => setStep((s) => s + 1)}>
          Next year
        </button>
        <label>
          <input
            type="checkbox"
            checked={fixed}
            onChange={(e) => {
              setFixed(e.target.checked);
              setDrawnFrom(year);
            }}
          />
          fix the effect
        </label>
      </div>
    </>
  );
}

// Section 2: the viewBox is a scale the browser runs, from your drawing's units to the screen.
const SHAPES = ['line', 'rect', 'circle', 'ellipse', 'polyline', 'polygon', 'path'];

function ViewBox() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [size, setSize] = useState(500);
  const [pointer, setPointer] = useState(null);
  const viewBox = `${x} ${y} ${size} ${size}`;

  function move(e) {
    const svg = e.currentTarget.querySelector('svg');
    const box = svg.getBoundingClientRect();
    const at = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const shape = e.target.tagName;
    setPointer({ px: [e.clientX - box.left, e.clientY - box.top], unit: [at.x, at.y], shape: SHAPES.includes(shape) ? shape : null });
  }

  const slider = (label, value, set, min, max) => (
    <label>
      {label}
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} />
    </label>
  );
  const pair = (p) => p.map((v) => Math.round(v)).join(', ');

  return (
    <>
      <Wire
        nodes={[
          { name: 'Screen', facts: [['pointer', pointer ? `${pair(pointer.px)} px` : '—', null, '000, 000 px']] },
          { name: 'viewBox', facts: [['scale', `${(240 / size).toFixed(2)} px per unit`, null, '0.00 px per unit']] },
          {
            name: 'Your drawing',
            facts: [
              ['pointer', pointer ? `${pair(pointer.unit)} units` : '—', null, '-000, -000 units'],
              ['under it', pointer?.shape ? `<${pointer.shape}>` : '—', null, '<polyline>'],
            ],
          },
        ]}
      />
      <div className="split">
        <div className="chart chart-shapes" onPointerMove={move} onPointerLeave={() => setPointer(null)}>
          <Shapes viewBox={viewBox} />
        </div>
        <Code
          file="Shapes.jsx"
          lang="jsx"
          source={shapesSrc}
          match={{ viewBox: 'viewBox={', ...Object.fromEntries(SHAPES.map((s) => [s, `<${s} `])) }}
          hot={[pointer?.shape, 'viewBox']}
          notes={{ viewBox: `"${viewBox}"` }}
        />
      </div>
      <div className="controls">
        {slider('x', x, setX, -250, 250)}
        {slider('y', y, setY, -250, 250)}
        {slider('size', size, setSize, 100, 1000)}
      </div>
    </>
  );
}

// Section 3: a scale is a function, and its domain decides what the bars say.
const totals = years.map((d) => d.total);
const peak = Math.max(...totals);

function Scale() {
  const [fromZero, setFromZero] = useState(true);
  const [year, setYear] = useState(2024);
  const d = years.find((r) => r.year === year);
  const domain = fromZero ? [0, peak] : [Math.min(...totals), peak];
  const ref = useRef();
  const bar = useDom(ref, (el) => {
    const rect = el.querySelector('.selected');
    const full = el.querySelector('svg').viewBox.baseVal.height;
    return { y: +rect.getAttribute('y'), height: +rect.getAttribute('height'), full };
  }) ?? { y: 0, height: 0, full: 1 };
  const pct = (v) => `${Math.round(v * 100)}% of the peak`;

  return (
    <>
      <Wire
        nodes={[
          { name: 'Data', facts: [['year', year], ['total', twh(d.total)], ['says', pct(d.total / peak)]] },
          {
            name: 'd3 computes',
            facts: [
              ['y.domain()', `[${domain.map((v) => v.toFixed(1)).join(', ')}]`, null, '[284.2, 398.4]'],
              [`y(${d.total})`, `${bar.y.toFixed(1)} from the top`, null, '000.0 from the top'],
            ],
          },
          {
            name: 'React renders',
            facts: [
              ['<rect height>', bar.height.toFixed(1), bar.height < 0.5 && 'bad', '000.0'],
              ['looks', pct(bar.height / bar.full), Math.abs(bar.height / bar.full - d.total / peak) > 0.005 && 'bad', '000% of the peak'],
            ],
          },
        ]}
      />
      <div className="split">
        <div className="chart chart-tall" ref={ref}>
          <ScaleBars data={years} fromZero={fromZero} selected={year} />
        </div>
        <Code
          file="ScaleBars.jsx"
          lang="jsx"
          source={scaleBarsSrc}
          regions={['scale', 'bars']}
          match={{ zero: '? [0, max', extent: ': extent(', y: 'y={y(d.total)}', height: 'height={height - y' }}
          hot={[fromZero ? 'zero' : 'extent', 'y', 'height']}
          off={[fromZero ? 'extent' : 'zero']}
          notes={{ y: `${bar.y.toFixed(1)} for ${year}`, height: bar.height.toFixed(1) }}
        />
      </div>
      <div className="controls">
        <label>
          <input type="radio" name="scale-domain" checked={fromZero} onChange={() => setFromZero(true)} />
          domain from zero
        </label>
        <label>
          <input type="radio" name="scale-domain" checked={!fromZero} onChange={() => setFromZero(false)} />
          <span>
            domain = <code>extent</code>
          </span>
        </label>
        <label>
          year
          <input type="range" min={1990} max={2025} value={year} onChange={(e) => setYear(+e.target.value)} />
        </label>
      </div>
    </>
  );
}

// Section 4: one line chart in four steps; the code panel lights the lines each step adds.
const STEPS = [
  { name: 'a line', Chart: LineChart1, src: lineChart1Src },
  { name: 'markers', Chart: LineChart2, src: lineChart2Src },
  { name: 'CSS hover', Chart: LineChart3, src: lineChart3Src },
  { name: 'events', Chart: LineChart4, src: lineChart4Src },
];
const STEP_ROWS = Math.max(...STEPS.map((s) => parse(s.src, { regions: ['render'] }).length));

function Line() {
  const [step, setStep] = useState(0);
  const [hits, setHits] = useState(false);
  const [selected, setSelected] = useState(coalShare[0]);
  const { Chart, src } = STEPS[step];
  const ref = useRef();
  const i = coalShare.indexOf(selected);
  const dom = useDom(
    ref,
    (el) => ({
      circles: count(el, 'circle'),
      focusable: count(el, '[tabindex]'),
      point: el.querySelector('polyline').getAttribute('points').split(' ')[i],
    }),
    [i],
  ) ?? { circles: 0, focusable: 0, point: '' };

  // The lines this step added: everything not already in the previous step's file.
  const before = new Set(step ? STEPS[step - 1].src.split('\n').map((l) => l.trim()) : []);
  const match = { added: (line) => line.trim() && !before.has(line.trim()) };

  return (
    <>
      <Wire
        nodes={[
          { name: 'Data', facts: [['rows', `${coalShare.length} years`], ['selected', `${selected.year}: coal ${selected.share.toFixed(1)}%`, null, '0000: coal 00.0%']] },
          { name: 'd3 computes', facts: [[`[x(${selected.year}), y(${selected.share.toFixed(1)})]`, dom.point.split(',').map((v) => (+v).toFixed(1)).join(', '), null, '000.0, 000.0']] },
          {
            name: 'In the DOM',
            facts: [
              ['<polyline>', '1'],
              ['<circle>s', dom.circles, null, '00'],
              ['focusable', dom.focusable ? `${dom.focusable} <g>s` : 'nothing', null, 'nothing'],
            ],
          },
        ]}
      />
      <div className="split">
        <div className={hits ? 'chart chart-tall show-hits' : 'chart chart-tall'} ref={ref}>
          <Chart data={coalShare} onSelect={setSelected} />
        </div>
        <Code file={`LineChart${step + 1}.jsx`} lang="jsx" source={src} regions={['render']} match={match} hot={['added']} rows={STEP_ROWS} />
      </div>
      <div className="controls">
        {STEPS.map((s, k) => (
          <label key={s.name}>
            <input type="radio" name="line-step" checked={step === k} onChange={() => setStep(k)} />
            {k + 1}. {s.name}
          </label>
        ))}
        <label>
          <input type="checkbox" checked={hits} disabled={step < 3} onChange={(e) => setHits(e.target.checked)} />
          show the hit areas
        </label>
      </div>
    </>
  );
}

// Section 5: pie() turns values into angles, arc() turns angles into paths.
const deg = (rad) => `${Math.round((rad * 180) / Math.PI)}°`;

function Legend({ data }) {
  return (
    <ul className="legend">
      {data.map((d, i) => (
        <li key={d.source}>
          <i className={`swatch-${i + 1}`} />
          {d.source}
        </li>
      ))}
    </ul>
  );
}

function Donut() {
  const [year, setYear] = useState(2025);
  const [ratio, setRatio] = useState(0.6);
  const [hovered, setHovered] = useState(null);
  const data = useMemo(() => mix(year), [year]);
  const total = data.reduce((sum, d) => sum + d.twh, 0);
  const ref = useRef();
  const path = useDom(ref, (el) => (hovered ? el.querySelectorAll('path')[hovered.index].getAttribute('d') : null), [hovered, year, ratio]);
  const h = hovered && data[hovered.index];

  return (
    <>
      <Wire
        nodes={[
          { name: 'Data', facts: [['year', year], ['slice', h ? `${h.source}, ${twh(h.twh)} (${((h.twh / total) * 100).toFixed(1)}%)` : '—', null, 'bioenergy, 000.0 TWh (00.0%)']] },
          { name: 'd3 computes', facts: [['pie(): angles', hovered ? `${deg(hovered.startAngle)} → ${deg(hovered.endAngle)}` : '—', null, '000° → 000°'], ['arc(): path', path ? `${path.slice(0, 30)}…` : '—', null, 'M0.000000,-000A000,000,0,0,1,0…']] },
          { name: 'React renders', facts: [['<path>s', data.length], ['clip circle', hovered ? 'full radius' : '90% of the radius', null, '90% of the radius']] },
        ]}
      />
      <div className="split">
        <div>
          <div className="chart chart-round" ref={ref}>
            <DonutChart data={data} innerRatio={ratio} active={hovered} onHover={setHovered} />
          </div>
          <Legend data={data} />
        </div>
        <Code
          file="DonutChart.jsx"
          lang="jsx"
          source={donutChartSrc}
          regions={['shapes', 'slices']}
          match={{ inner: '.innerRadius(', pie: 'toPie(data).map', enter: 'onPointerEnter', arc: 'd={toArc(d)}' }}
          hot={hovered ? ['pie', 'enter', 'arc'] : ['inner']}
          notes={{ inner: `radius × ${ratio.toFixed(2)}` }}
        />
      </div>
      <div className="controls">
        <label>
          year
          <input type="range" min={1990} max={2025} value={year} onChange={(e) => setYear(+e.target.value)} />
        </label>
        {/* Stops short of the clip circle (90% of the radius): a hole that big hides every slice. */}
        <label>
          innerRadius
          <input type="range" min={0} max={0.75} step={0.05} value={ratio} onChange={(e) => setRatio(+e.target.value)} />
        </label>
      </div>
    </>
  );
}

// Section 6: the same change of data, tweened two ways. The coal slice's outer arc should end on
// the circle (140 units out) and its flags should be 0 or 1; the figure reads both from the DOM.
const ARC = /^M[^A]+A140,140,0,([^,]+),1,([^,]+),([^LAZ]+)/;

function Tween() {
  const [year, setYear] = useState(1990);
  const [tween, setTween] = useState('paths');
  const [slow, setSlow] = useState(false);
  const data = useMemo(() => mix(year), [year]);
  const ref = useRef();
  const coal = useDom(ref, (el) => el.querySelector('path').getAttribute('d')) ?? '';
  const [, flag, ex, ey] = coal.match(ARC) ?? [];
  const reach = flag === undefined ? null : Math.hypot(+ex, +ey);
  const flagOk = flag === '0' || flag === '1';

  return (
    <>
      <Wire
        nodes={[
          { name: 'Data', facts: [['year', year], ['tweening', tween === 'numbers' ? 'the numbers' : 'the path strings', null, 'the path strings']] },
          {
            name: 'd3 computes',
            facts: [
              ['coal’s arc ends', reach === null ? 'no arc in the path' : `${reach.toFixed(1)} units out`, reach !== null && Math.abs(reach - 140) > 0.5 && 'bad', 'no arc in the path'],
              ['large-arc flag', flag ?? '—', flag !== undefined && !flagOk && 'bad', '0.000000'],
            ],
          },
          { name: 'React renders', facts: [['coal <path d>', `${coal.slice(0, 26)}…`, null, 'M0,-140A140,140,0,1,1,000.00…']] },
        ]}
      />
      <div className="split">
        <div>
          <div className="chart chart-round" ref={ref}>
            <MixDonut data={data} tween={tween} duration={slow ? 4000 : 750} />
          </div>
          <Legend data={data} />
        </div>
        <Code
          file="MixDonut.jsx"
          lang="jsx"
          source={mixDonutSrc}
          regions={['tween']}
          match={{ numbers: 'useTween(values,', paths: 'useTween(shapes(values)', strings: 'interpolateString(d' }}
          hot={tween === 'numbers' ? ['numbers'] : ['paths', 'strings']}
        />
      </div>
      <div className="controls">
        {DECADES.map((y) => (
          <button key={y} type="button" disabled={y === year} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
        <label>
          <input type="radio" name="tween" checked={tween === 'paths'} onChange={() => setTween('paths')} />
          tween the paths
        </label>
        <label>
          <input type="radio" name="tween" checked={tween === 'numbers'} onChange={() => setTween('numbers')} />
          tween the numbers
        </label>
        <label>
          <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
          slow motion
        </label>
      </div>
    </>
  );
}

// Section 7: the same axes drawn by a React port of d3-axis, or by d3-axis in a fenced-off <g>.
function Axes() {
  const [axes, setAxes] = useState('react');
  const [from, setFrom] = useState(1990);
  const data = useMemo(() => years.filter((d) => d.year >= from), [from]);
  const ref = useRef();
  const dom = useDom(ref, (el) => ({
    ticks: count(el, '.tick'),
    years: [...el.querySelectorAll('svg > g:first-of-type .tick text')].map((t) => t.textContent), // the bottom axis
  })) ?? { ticks: 0, years: [] };

  return (
    <>
      <Wire
        nodes={[
          { name: 'Data', facts: [['years', `${from}–2025 (${data.length})`, null, '0000–2025 (00)']] },
          { name: 'd3 computes', facts: [['ticks() for years', dom.years.join(' '), null, '1990 1995 2000 2005 2010 2015 2020 2025']] },
          {
            name: 'In the DOM',
            facts: [
              ['tick <g>s', `${dom.ticks}, made by ${axes === 'react' ? 'React' : 'd3-axis'}`, null, '00, made by d3-axis'],
              ['React rendered', axes === 'react' ? 'every axis node' : '2 empty <g>s', null, 'every axis node'],
            ],
          },
        ]}
      />
      <div className="split">
        <div className="chart chart-tall" ref={ref}>
          <GenerationChart data={data} axes={axes} />
        </div>
        <Code
          file="GenerationChart.jsx"
          lang="jsx"
          source={generationChartSrc}
          regions={['ticks', 'axes']}
          match={{ react: '<Axis ', d3: '<D3Axis ', years: 'const years =' }}
          hot={[axes, 'years']}
          off={[axes === 'react' ? 'd3' : 'react']}
        />
      </div>
      <div className="controls">
        <label>
          <input type="radio" name="axes" checked={axes === 'react'} onChange={() => setAxes('react')} />
          React port
        </label>
        <label>
          <input type="radio" name="axes" checked={axes === 'd3'} onChange={() => setAxes('d3')} />
          d3-axis
        </label>
        <label>
          from
          <input type="range" min={1990} max={2015} value={from} onChange={(e) => setFrom(+e.target.value)} />
        </label>
      </div>
    </>
  );
}

const figures = { trap: Trap, viewbox: ViewBox, scale: Scale, line: Line, donut: Donut, tween: Tween, axes: Axes };

for (const el of document.querySelectorAll('.demo[data-demo]')) {
  const Figure = figures[el.dataset.demo];
  const stage = el.querySelector('.demo-stage');
  if (Figure && stage) createRoot(stage).render(<Figure />);
}
