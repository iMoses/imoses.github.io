---
title: Who draws the chart?
subtitle: Charts in React with SVG and d3, and why every part of the DOM needs exactly one owner.
summary: Build a bar chart, a line, a donut and an axis with React and d3. d3 does the math, React owns the markup, and you animate numbers rather than shapes.
fig: "01"
thumb: react-svg-charts
topics: [rendering, data-viz]
demo: react-svg-charts
---

You add a chart to a React app. You reach for d3, because that's what charts are made with, hand
it a ref, and it draws. A week later the data changes and the chart doesn't. You add the data to
the effect's dependencies, and now every update draws a second chart on top of the first.

Nothing here is a bug in React or in d3. Both are doing exactly what they were told. The problem is
that two libraries each think they own the same piece of the page, and neither knows the other is
there.

This entry is about **who owns what in a chart**. A chart is a pipeline: data goes in, numbers
come out (positions, sizes, angles), and the numbers become shapes in the DOM. Every stage needs
one owner, and when two owners share a stage you get charts that are stale, duplicated, or
correct only until the next render. The same bug shows up wherever an imperative library meets a
declarative framework: maps, rich-text editors, video players.

By the end you'll have built a bar chart, a line, a donut and a set of axes with React and SVG,
using d3 only for the math, and you'll know where any piece of chart code belongs: in d3, in
React, or in CSS. You need to know React; you don't need to know SVG or d3.

The data throughout is real: the UK's electricity generation by source, 1990 to 2025. It's a good
dataset for this, because it has a story in it. In 1990 coal made 65% of the country's
electricity. In 2025 it made 0.1%.

## 1. Two owners, one DOM

Here's the usual first attempt, and the bug it ships with. The figure shows the same bar chart
twice. The top one is d3 inside a `useEffect`, the way most tutorials write it; the bottom one is
the same scales with React doing the rendering. Above them is what's normally hidden:
how often d3's effect has run, and how many bars are really in its `<svg>`.

{% include demo.html id="trap" wide=true caption="UK electricity by source, one bar per source. Next year steps through 1990, 2000, 2010, 2020 and 2025. The checkbox swaps in the same component with its dependencies filled in. Bars left over from earlier runs are greyed." %}

Press **Next year** and only the bottom chart moves. The effect's dependency array is empty,
so it ran once, on mount, and never again. React re-rendered the component, but the `<svg>` it
renders has no children as far as React knows, so there was nothing for it to update. d3's bars
are still showing 1990.

Now tick the checkbox, which is the fix most people try next, and press Next year a few times.
The effect runs on every change, and every run calls `.append('g')`: a new group with eight new
bars, drawn over the old ones. Watch the `<rect>` count climb by eight each time. The new bars are
right, but nothing removes the old ones, and wherever an old bar was taller it sticks out above
the new one. (The figure greys the leftovers so you can see them; in your app they'd be the same
blue, and the chart would look wrong.) You could fix this
too (select the existing group instead of appending, or clear the `<svg>` first), but notice what
you'd be doing: writing, by hand, the reconciliation React already does.

The bottom chart has none of this, and its code is shorter. It's the same two scales, and the
bars are plain JSX:

{% code_file demos/react-svg-charts/BarChart.jsx %}

That's the idea the rest of this entry builds on: **d3 computes, React renders.** d3's scales are
pure functions of your data, and they work anywhere. Its DOM-manipulating half (`d3-selection`)
is a second renderer, and each node can only have one. So if React draws the
chart, what exactly is it drawing?

## 2. A chart is markup

It's drawing SVG, and SVG is ordinary markup: a small set of shapes (`<line>`, `<rect>`,
`<circle>`, `<ellipse>`, `<polyline>`, `<polygon>`, `<path>`) that behave like any other element.
You style them with CSS, attach events to them, and inspect them in DevTools. That's why React can
render them with no help: to React, a `<rect>` is a `<div>` with different attributes.

The one thing SVG adds is a coordinate system. You draw in your own units, and the `viewBox`
decides which part of that plane is on screen and how big it is. Move the pointer over the shapes
and drag the sliders: the readout shows where the pointer is on screen, and where it is in the
drawing's units.

{% include demo.html id="viewbox" wide=true caption="The same seven shapes under a changing viewBox. The element stays 240 pixels square; the window onto the drawing moves." %}

Two things are worth seeing. First, the origin is the top-left corner and **y grows downwards**:
move the pointer down and y goes up. Every chart in this entry flips its y-axis for that reason,
so that a bigger value draws higher. Second, the shapes never change. Only the `viewBox` does,
and the browser maps your units to pixels for you. Shrink `size` to 250 and every unit becomes
almost a pixel; grow it to 1000 and a unit is a quarter of one.

That mapping, from your drawing's units to the screen, is a function the browser runs. A chart
needs one more of those functions, from the data's units to your drawing's: which point in the
drawing stands for "2010"? Which height stands for 382 terawatt-hours?

## 3. A scale is a function

That second function is a **scale**, and it's the part of d3 worth bringing along. A scale takes
a *domain* (the span of your data) and a *range* (the span of your drawing), and maps one onto
the other. `scaleLinear().domain([0, 400]).range([240, 0])` is a function: give it 200 and it
returns 120. It doesn't touch the DOM. It doesn't know React exists. That's what makes it safe to
call inside a render.

The figure draws the UK's total generation for every year since 1990. The domain is the one choice
in it you have to make: start the bars at zero, or let `extent` take the smallest and largest
values in the data, which is what many examples do.

{% include demo.html id="scale" wide=true caption="Total UK electricity generation per year, 1990–2025. Pick a year to see its value go through the scale." %}

With the domain from zero, a bar's height says what its value says: 2024 generated 71% of the
2005 peak, and its bar is 71% as tall. Switch to `extent` and the same data tells a different
story. The smallest value in the data now maps to the bottom of the chart, so 2024's bar has a
height of zero. It vanishes. A 29% decline now looks like the country switched its power off.

Nothing is wrong with the code; the domain is a decision about meaning, and d3 can't make it for
you. For bars the rule is firm, because a bar encodes its value as *length*, and a length measured
from anywhere but zero lies. For a line, which encodes value as *position*, a tighter domain can
be fair, as long as the axis says where it starts. Scales give you positions and sizes. Next:
what to draw at them.

## 4. A line, one layer at a time

A line chart is the plainest example of React rendering what d3 computed, and building it in four
steps shows where each concern belongs. The data is coal's share of UK electricity. A share
already has a natural domain, 0 to 100%, so the y scale uses that rather than the data's extent.

Step through the figure. The code panel lights the lines each step adds, and the readout above the
chart shows the selected year going through both scales, and what's in the DOM as a result.

{% include demo.html id="line" wide=true caption="Coal's share of UK electricity, 1990–2025. In step 4 the points are clickable and focusable; the checkbox shows their hit areas." %}

The scales never change between steps, and neither does the `[x, y]` readout: every step after
the first draws more things at the same positions. What changes is who handles each new concern.

1. **A line.** Two scales, one array of `[x, y]` pairs, one `<polyline>`. The `points` attribute
   is the scales' output written out as text, and that's the whole chart.
2. **Markers.** A `<circle>` per point. React renders 36 of them the same way it would render 36
   list items, and they're positioned by the same `points` array.
3. **Hover, in CSS.** The markers lose their `r` and `fill` attributes and get a class instead.
   That moves their look into CSS, where a hover state and a transition cost two rules, with no
   state or effect in the component. Since SVG 2, a circle's `r` is a CSS property like any
   other, so it can transition (the rules are below).
4. **Events.** Since the markers are React elements, events are React props. Each marker is
   wrapped in a focusable `<g>` with a bigger, invisible circle to hit: a dot 6 units across is a
   hard target for a finger. Tick "show the hit areas" to see them, and use Tab to move between points.

The hover in step 3 is these two rules, and nothing in the component knows about it:

{% code_file demos/react-svg-charts/demos.css region=marker-css label=demos.css %}

Notice what never appeared: no `select`, no `append`, no effect. Behavior went where it's
cheapest. Geometry came from d3, structure and events from React, looks and motion from CSS.
Lines are points joined up, though. What about shapes that aren't made of points?

## 5. Angles are numbers too

A pie chart doesn't have x and y positions; it has angles. But the split is the same: d3 turns
values into angles with `pie()`, turns angles into path strings with `arc()`, and React renders
the paths. Both are pure functions. `pie()` returns objects with a `startAngle` and an `endAngle`
for each value, and `arc()` turns one of those into the `d` attribute of a `<path>`.

Hover a slice to see its numbers go through both, and drag the year to watch the mix change. The
`innerRadius` slider shows that a pie and a donut are one shape: a pie is a donut with no hole.
The hole is also where a donut keeps its label: the total, or the slice you're on.

{% include demo.html id="donut" wide=true caption="UK electricity by source for one year. Hover or tab through the slices." %}

The `d` string, whose start the readout shows, is the entire slice: a move, an outer arc, a line,
an inner arc back. It's text, and React treats it like any other attribute: when the year changes, React
updates eight attributes and the browser redraws.

The hover effect follows the same rule as the markers. Each slice is clipped by a circle a little
smaller than the chart; on hover, CSS scales the circle to full size and the slice seems to pop
out. React's only part is rendering the clip path:

{% code_file demos/react-svg-charts/demos.css region=arc-css label=demos.css %}

So far, every change has been instant: new data in, new shapes out. Real charts usually move from
one state to the next. Who should own that?

## 6. Animate the numbers, not the shapes

The tempting answer is to animate what's on screen: you have the old path strings and the new
ones, so move one towards the other. d3 even has the function for it, `interpolateString`, which
finds the numbers in two strings and moves each one. The figure does exactly that, and alongside
it the alternative: animate the *data* from the old year to the new, and run every in-between
frame through `pie()` and `arc()`.

Switch between years with "tween the paths" selected (slow motion helps), then do the same with
"tween the numbers". The readout follows the coal slice, the first one, and checks two things the
browser needs for a correct arc: the arc should end on the circle, 140 units from the center, and
its large-arc flag must be 0 or 1.

{% include demo.html id="tween" wide=true caption="UK electricity by source, moving between years. Under reduced motion the change is instant." %}

Tweening the paths fails in three ways, and the readout shows each one. The arc's endpoint moves
in a straight line from its old position to its new one, cutting inside the circle, so the
slice's edge sags. The large-arc flag, a 0-or-1 switch hidden in the path, gets interpolated too:
between 1990 and 2025 it slides from 1 to 0 through values like 0.72, which the browser refuses,
so coal's slice isn't drawn at all until the move ends. (Open the browser's console and you'll see
it reject every frame.) And slices that were empty in 1990, like solar, start as a path with no
arc in it: `interpolateString` pairs up whatever numbers it finds, and solar's slice flies across
the chart.

Tweening the numbers has none of these problems, because it never produces a shape that `arc()`
didn't draw. Every frame is a real donut of in-between data. The hook behind both is the same, and
small:

{% code_file demos/react-svg-charts/tween.js %}

The lesson generalizes beyond pies. A shape is the *output* of your chart, and outputs don't
interpolate well; inputs do. Animate the stage that has meaning (values, angles, positions), and
let the pure functions draw each frame. That leaves one piece most people still hand to d3's DOM
side: the axes.

## 7. Fences for the exceptions

Axes are where the rule gets tested. An axis is lines and text, tick values and labels, all of
which `d3-axis` will draw for you with `axisBottom(scale)`. It needs a DOM node to draw into, which
looks like section 1's mistake all over again.

It doesn't have to be. The figure draws the same chart's axes two ways: with a React port of
d3-axis (the same tick math, React owns every node), and with d3-axis itself, drawing into a
`<g>` that React renders empty and never touches. Switch between them and drag the start year.

{% include demo.html id="axes" wide=true caption="Total UK electricity generation per year. The axes are drawn by React or by d3-axis; the picture is the same." %}

Both are correct, and the picture doesn't change. The difference is in the readout's last
column: who made the tick nodes. The d3-axis version works because of two properties, and you
need both. The node is **fenced off**: React renders the `<g>` with no children, so it never has
an opinion about what's inside. And the drawing is **idempotent**: d3-axis joins its ticks to data,
so running it again updates the ticks it drew last time instead of appending more. Section 1's
chart had neither.

{% code_file demos/react-svg-charts/D3Axis.jsx %}

The React port is d3-axis's own source, translated: the same tick values, positions and labels,
but every node is a React element.

{% code_file demos/react-svg-charts/Axis.jsx %}

Which one should you use? The fence is quick, and gives you everything d3-axis does, including its
transitions. The port is more code, but its ticks are React elements: you can style them with
props, render them on the server, and test them like any other component. Either way, the rule
held. Every node had exactly one owner.

## What to take with you

1. **Two owners, one DOM:** a library that changes the DOM inside an effect is a second renderer.
   React can't update what it didn't render.
2. **A chart is markup:** SVG shapes are elements, and the `viewBox` is a scale the browser runs
   for you.
3. **A scale is a function:** d3's math is pure and safe to call in a render. The domain is a
   decision about meaning; bars start at zero.
4. **One layer at a time:** geometry from d3, structure and events from React, looks and motion
   from CSS.
5. **Angles are numbers too:** `pie()` and `arc()` are scales for circles; React renders their
   paths.
6. **Animate the numbers, not the shapes:** interpolate the data and let the pure functions draw
   each frame.
7. **Fence the exceptions:** when a library must draw, give it a node React never touches, and
   make its drawing idempotent.

Behind all of it is one rule: **every node in the DOM has exactly one owner.** For charts that
means d3 does the math, React owns the markup, and CSS owns how it looks and moves. When
something must break the rule, it does so inside a fence.

The rule isn't about charts. Anywhere an imperative library lives inside React (a map, a code
editor, a video player, a canvas), ask the same question: which nodes does each side own, and does
the imperative side run safely more than once? Libraries for these things usually have a React
wrapper that answers it for you; when they don't, a fence and an idempotent update are the
pattern.

None of this means you should build every chart yourself. When performance starts to matter,
interactions get complicated, or a team needs consistency, a well-built charting library earns its
weight. I work on one, [AG Charts](https://github.com/ag-grid/ag-charts), and it's open source.
Knowing what a chart is made of is how you tell whether you need one.

---

This entry is adapted from my React Summit 2025 talk,
[Efficient Data Visualisation with React and SVG](https://gitnation.com/contents/efficient-data-visualisation-with-react-and-svg),
and an older meetup demo. The original code is at
[iMoses/svg-react-slides](https://github.com/iMoses/svg-react-slides) and
[iMoses/d3-examples](https://github.com/iMoses/d3-examples).
The data is from [Our World in Data](https://github.com/owid/energy-data), based on Ember's Yearly
Electricity Data and the Energy Institute's Statistical Review of World Energy, licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
