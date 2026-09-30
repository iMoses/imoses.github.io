// Blueprint chrome: page rulers and a coordinate-reading crosshair. Pure decoration —
// the page works the same without it.
(() => {
  const STEP = 100;
  const rx = document.querySelector('.ruler-x');
  const ry = document.querySelector('.ruler-y');

  function drawRulers() {
    const w = document.documentElement.scrollWidth;
    const h = document.documentElement.scrollHeight;
    rx.replaceChildren(...ticks(w, 'left'));
    ry.replaceChildren(...ticks(h, 'top'));
  }

  function ticks(length, side) {
    const out = [];
    for (let v = STEP; v < length; v += STEP) {
      const t = document.createElement('span');
      t.style[side] = `${v}px`;
      t.textContent = v;
      out.push(t);
    }
    return out;
  }

  drawRulers();
  new ResizeObserver(drawRulers).observe(document.body);

  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const ch = document.querySelector('.crosshair');
  const label = ch.querySelector('.ch-label');
  const quiet = 'a, button, input, select, textarea, .demo, pre';

  addEventListener('pointermove', (e) => {
    const off = e.target.closest?.(quiet);
    ch.classList.toggle('on', !off);
    if (off) return;
    ch.style.setProperty('--x', `${e.clientX}px`);
    ch.style.setProperty('--y', `${e.clientY}px`);
    label.textContent = `(${Math.round(e.pageX)}, ${Math.round(e.pageY)})`;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => ch.classList.remove('on'));
})();
