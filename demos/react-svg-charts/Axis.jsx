// A React port of d3-axis: the same tick maths, but React owns the DOM.

export function Axis({
  orientation,
  scale,
  tickValues,
  tickFormat,
  tickArguments = [],
  tickSizeInner = 6,
  tickSizeOuter = 6,
  tickPadding = 3,
  noDomain,
  ...props
}) {
  const offset = globalThis.devicePixelRatio > 1 ? 0 : 0.5; // as d3-axis; on a server it's undefined
  const values =
    tickValues ?? scale.ticks?.(...tickArguments) ?? scale?.domain();
  const format = tickFormat ?? scale.tickFormat?.(...tickArguments) ?? identity;
  const modifier =
    orientation === Axis.Top || orientation === Axis.Left ? -1 : 1;
  const oppositeAxis =
    orientation === Axis.Left || orientation === Axis.Right ? 'x' : 'y';
  const spacing = Math.max(tickSizeInner, 0) + tickPadding;
  const transform =
    orientation === Axis.Top || orientation === Axis.Bottom
      ? translateX
      : translateY;
  const position = (scale.bandwidth ? center : number)(scale.copy(), offset);

  return (
    <g
      fill='none'
      fontSize={10}
      textAnchor={
        orientation === Axis.Right
          ? 'start'
          : orientation === Axis.Left
          ? 'end'
          : 'middle'
      }
      {...props}
    >
      {!noDomain && (
        <AxisDomain
          orientation={orientation}
          scale={scale}
          offset={offset}
          tickSizeOuter={tickSizeOuter * modifier}
        />
      )}
      {values.map((tick) => (
        <g
          key={tick}
          className='tick'
          transform={transform(position(tick) + offset)}
        >
          <line
            stroke='currentColor'
            {...{ [`${oppositeAxis}2`]: modifier * tickSizeInner }}
          />
          <text
            fill='currentColor'
            dy={
              orientation === Axis.Top
                ? '0em'
                : orientation === Axis.Bottom
                ? '0.71em'
                : '0.32em'
            }
            {...{ [oppositeAxis]: modifier * spacing }}
          >
            {format(tick)}
          </text>
        </g>
      ))}
    </g>
  );
}

Axis.Top = 1;
Axis.Right = 2;
Axis.Bottom = 3;
Axis.Left = 4;

function AxisDomain({ orientation, scale, offset, tickSizeOuter }) {
  const range = scale.range();
  const range0 = Number(range[0]) + offset;
  const range1 = Number(range[range.length - 1]) + offset;
  return (
    <path
      className='domain'
      stroke='currentColor'
      d={
        orientation === Axis.Left || orientation === Axis.Right
          ? tickSizeOuter
            ? `M${tickSizeOuter},${range0}H${offset}V${range1}H${tickSizeOuter}`
            : `M${offset},${range0}V${range1}`
          : tickSizeOuter
          ? `M${range0},${tickSizeOuter}V${offset}H${range1}V${tickSizeOuter}`
          : `M${range0},${offset}H${range1}`
      }
    />
  );
}

function identity(d) {
  return d;
}

function translateX(x) {
  return `translate(${x},0)`;
}

function translateY(y) {
  return `translate(0,${y})`;
}

function number(scale) {
  return (d) => Number(scale(d));
}

function center(scale, offset) {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round()) {
    offset = Math.round(offset);
  }
  return (d) => Number(scale(d)) + offset;
}
