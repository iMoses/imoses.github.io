// Blueprint chrome: page rulers and a coordinate-reading crosshair. Pure decoration —
// the page works the same without it.
(() => {
  const MAJOR = 96;
  const fmt = new Intl.NumberFormat('en-US'); // 1,248 — always commas, whatever the visitor's locale
  const root = document.documentElement;
  const rx = document.querySelector('.ruler-x');
  const ry = document.querySelector('.ruler-y');
  let gx = 0; // x of the grid origin: the content column's left edge

  function drawRulers() {
    gx = Math.round(document.querySelector('main').getBoundingClientRect().left + scrollX);
    root.style.setProperty('--gx', `${gx}px`);
    const w = root.scrollWidth;
    const h = root.scrollHeight;
    const xs = [];
    for (let x = gx % MAJOR; x < w; x += MAJOR) if (x > 0) xs.push(x);
    const ys = [];
    for (let y = MAJOR; y < h; y += MAJOR) ys.push(y);
    rx.replaceChildren(...xs.map((x) => tick('left', x, x - gx)));
    ry.replaceChildren(...ys.map((y) => tick('top', y, y)));
  }

  function tick(side, pos, value) {
    const t = document.createElement('span');
    t.style[side] = `${pos}px`;
    t.textContent = fmt.format(value);
    return t;
  }

  // Everything is sized in whole rows by CSS, except content whose height can't be known in
  // advance (live figures, code blocks with a scrollbar). Round those framed boxes up to whole
  // rows so what follows them still starts on a grid line.
  const U = 24;
  const FRAMED = '.framed, div.highlighter-rouge';

  function roundFrames() {
    for (const el of document.querySelectorAll(FRAMED)) {
      el.style.removeProperty('min-height');
      if (!el.getAttribute('style')) el.removeAttribute('style');
      // Exact (fractional) height: scaled SVGs can be e.g. 336.3px tall, which offsetHeight would
      // round to 336 and treat as whole rows, leaving everything below a fraction off the grid.
      const h = el.getBoundingClientRect().height;
      const rows = Math.ceil(h / U - 0.001);
      if (Math.abs(h - rows * U) > 0.001) el.style.minHeight = `${rows * U}px`;
    }
  }

  let queued = false;
  function layout() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      roundFrames();
      drawRulers();
    });
  }

  layout();
  new ResizeObserver(layout).observe(document.body);
  document.fonts?.ready.then(layout);

  // Logo intro: the line draws itself in one stroke while the small circle rolls along the drawn
  // line and eases to a stop at its resting place.
  if (root.classList.contains('logo-intro')) {
    const svg = document.querySelector('.site-header .logo svg');
    const line = svg.querySelector('.logo-stroke');
    const dot = svg.querySelector('.logo-dot');
    const hole = svg.querySelector('.logo-hole');
    const text = svg.querySelector('.logo-fill');
    const home = { x: +dot.getAttribute('cx'), y: +dot.getAttribute('cy') };
    const L = line.getTotalLength();

    let rest = 0;
    for (let i = 0, best = Infinity; i <= 400; i++) {
      const p = line.getPointAtLength((L * i) / 400);
      const d = Math.hypot(p.x - home.x, p.y - home.y);
      if (d < best) [best, rest] = [d, (L * i) / 400];
    }
    const restPoint = line.getPointAtLength(rest);
    const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
    const place = (x, y) => {
      for (const c of [dot, hole]) { c.setAttribute('cx', x); c.setAttribute('cy', y); }
    };

    // The circle has its own ease so it decelerates to a stop instead of halting with the pen still
    // at full speed. Both eases start with 4t³, so the circle never overtakes the pen as long as its
    // duration is at least ∛(rest / L) of the pen's (the start is the tightest point).
    const DURATION = 1800;
    const DOT_DURATION = DURATION * Math.cbrt(rest / L) * 1.02;
    const start = performance.now();
    line.style.strokeDasharray = `0 ${L}`;
    dot.style.opacity = 1;
    text.style.opacity = 0;
    root.classList.remove('logo-intro');

    requestAnimationFrame(function frame(now) {
      const t = Math.min((now - start) / DURATION, 1);
      const drawn = ease(t) * L;
      line.style.strokeDasharray = `${drawn} ${L}`;
      const along = ease(Math.min((now - start) / DOT_DURATION, 1)) * rest;
      const p = line.getPointAtLength(along);
      const k = rest ? along / rest : 1; // ease the tiny path-to-centre offset in over the ride
      place(p.x + (home.x - restPoint.x) * k, p.y + (home.y - restPoint.y) * k);
      if (t > 0.75) text.style.opacity = 1;
      if (now - start < Math.max(DURATION, DOT_DURATION)) return requestAnimationFrame(frame);
      line.style.strokeDasharray = '';
      dot.style.opacity = '';
      text.style.opacity = '';
      place(home.x, home.y);
    });
  }

  // Light (paper) / dark (blueprint) switch. Defaults to the OS setting; a choice is remembered.
  const toggle = document.querySelector('.theme-toggle');
  const osDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ?? (osDark.matches ? 'dark' : 'light')) === 'dark';
  const setToggleLabel = () => {
    toggle.querySelector('span').textContent = isDark() ? 'Light' : 'Dark';
    toggle.dataset.target = isDark() ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} mode`);
  };
  toggle.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    setToggleLabel();
  });
  osDark.addEventListener('change', setToggleLabel);
  toggle.hidden = false;
  setToggleLabel();

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
    label.textContent = `(${fmt.format(Math.round(e.pageX) - gx)}, ${fmt.format(Math.round(e.pageY))})`;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => ch.classList.remove('on'));
})();
