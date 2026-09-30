---
title: Charts are just shapes
subtitle: Building charts with React, SVG and a pinch of d3, one step at a time.
summary: A line chart, a donut and a gauge from scratch, with React and plain SVG, and where d3 fits in.
fig: "01"
thumb: react-svg-charts
demo: react-svg-charts
---

A line chart is a line with some dots on it. A pie chart is a few arcs. A gauge is one arc
pretending to be a dashboard. The browser has been able to draw all of these since long before
anyone put "charting" in a `package.json`.

Libraries are great when you need them. But they come with weight, their own mental model, and
assumptions about your data that you'll spend time working around. For a simple chart, doing it
yourself gives you full control over structure and style, a chart that fits your data exactly,
and nothing to integrate.

So let's build a few, and let each step earn its place.

## 1. The trap

The usual first attempt at d3 with React looks like this: give d3 a ref and let it loose.

{% code_file demos/react-svg-charts/BarChartD3.jsx %}

It renders. Then the data changes and nothing happens. The effect ran once, d3 took over that
`<svg>`, and React has no idea what's inside it. Add the missing dependencies and it gets worse:
every run appends *another* group on top of the last one.

{% include demo.html id="trap" caption="Same data, same scales. Press the button." %}

The version on the right is the same maths with React doing the rendering:

{% code_file demos/react-svg-charts/BarChart.jsx %}

That's the whole idea of this post. **d3 computes, React renders.** When d3 owns the DOM, React
becomes a wrapper around it, and a liability.

## 2. SVG is just markup

SVG is a markup format for vector graphics. It has a small set of shapes, and they behave like
any other element: you can style them with CSS, listen to their events and inspect them in
DevTools.

{% code_file demos/react-svg-charts/Shapes.jsx %}

Two things to know about its coordinate system. The origin `(0, 0)` is the top-left corner and
*y grows downwards*, so every chart flips its y-axis at some point. And the `viewBox` decides
which part of that infinite plane you're looking at, and how it's scaled to fit the element.

{% include demo.html id="viewbox" caption="Same shapes, different viewBox. Move the window, not the drawing." %}

Every chart in this post uses a `viewBox`, which is why they all shrink to fit your screen.

Why SVG and not `<canvas>`? SVG is declarative and lives in the DOM, so it fits React's model,
CSS and events without translation. Canvas wins when you need to draw a *lot*, which is a story
for another figure.

## 3. What d3 is actually for

d3 isn't one library. It's a collection of about thirty small modules, and most of them never
touch the DOM. This post uses three:

- `d3-array` finds the extent of the data,
- `d3-scale` maps data values to pixels,
- `d3-shape` turns numbers into path strings for arcs and pies.

A scale is just a function. Give it a year and it returns an x position. Everything else is up
to you.

## 4. A line chart in four steps

### Step one: a polyline

Two scales, one array of points, one element.

{% code_file demos/react-svg-charts/LineChart1.jsx %}

{% include demo.html id="line-1" caption="Sample data: yearly sales, 1988–2017." %}

### Step two: markers

A marker is a `<circle>` per point. Nothing more.

{% code_file demos/react-svg-charts/LineChart2.jsx region=markers label=LineChart2.jsx %}

{% include demo.html id="line-2" %}

### Step three: animation, with CSS

No animation library. SVG elements take CSS transitions, and a circle's `r` has been a CSS
property in every major browser since 2019.

{% code_file demos/react-svg-charts/LineChart3.jsx region=markers label=LineChart3.jsx %}
{% code_file demos/react-svg-charts/demos.css region=marker-css label=demos.css %}

{% include demo.html id="line-3" caption="Hover a point." %}

### Step four: events

The markers are React elements, so events are plain React props. The visible dot is tiny,
so each one gets a bigger invisible circle to hit, and it's focusable too.

{% code_file demos/react-svg-charts/LineChart4.jsx region=markers label=LineChart4.jsx %}

{% include demo.html id="line-4" %}

## 5. Pie, then donut

`pie()` works out the angles and `arc()` turns them into paths. A donut is a pie with an inner
radius.

{% code_file demos/react-svg-charts/PieChart.jsx %}

{% include demo.html id="pie" caption="Drag the slider: a pie is a donut with no hole." %}

For hover, each slice is clipped by a circle slightly smaller than the chart. On hover the circle
grows and the slice seems to pop out. It's all CSS: React only sets a custom property with the
radius.

{% code_file demos/react-svg-charts/DonutChart.jsx region=hover label=DonutChart.jsx %}
{% code_file demos/react-svg-charts/demos.css region=arc-css label=demos.css %}

{% include demo.html id="donut" caption="Hover or tab through the slices." %}

## 6. A gauge

One arc for the track and one for the value, from −90° to +90°. The `viewBox` is set to
`-1 -1 2 1`, so the whole gauge is drawn in a unit coordinate system and scales for free.

{% code_file demos/react-svg-charts/Gauge.jsx %}

{% include demo.html id="gauge" caption="The value eases between targets with a small requestAnimationFrame hook." %}

## 7. Axes, the React way

Axes are where people usually give in and call `d3.axisBottom()`, which puts us back in the trap
from step 1. But an axis is just some lines and some text. Here is d3-axis ported to a React
component: same tick maths, and React owns the DOM.

{% code_file demos/react-svg-charts/Axis.jsx %}

{% code_file demos/react-svg-charts/BarChartAxes.jsx region=axes label=BarChartAxes.jsx %}

{% include demo.html id="axes" %}

## When simplicity isn't enough

All of this stops being simple eventually. Performance starts to matter, interactions get
complicated, a team needs consistency, or the chart becomes a product in its own right. That's
when a battle-tested library pays for itself. I work on one, [AG Charts](https://github.com/ag-grid/ag-charts),
and it's open source.

Until then: charts are a great way to learn React and SVG, reach for a library only when you
need to, and simple solutions go a long way.

---

This entry is adapted from my React Summit 2025 talk,
[Efficient Data Visualisation with React and SVG](https://gitnation.com/contents/efficient-data-visualisation-with-react-and-svg),
and an older meetup demo. The original code is at
[iMoses/svg-react-slides](https://github.com/iMoses/svg-react-slides) and
[iMoses/d3-examples](https://github.com/iMoses/d3-examples).
