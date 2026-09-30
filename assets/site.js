// Blueprint chrome: page rulers and a coordinate-reading crosshair. Pure decoration —
// the page works the same without it.
(() => {
  const MAJOR = 96;
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
    t.textContent = value;
    return t;
  }

  // Snap every block in a `.snap` container so its top edge sits on a grid line, and round framed
  // boxes up to whole squares (+1px, so the bottom border lands on the line too).
  const U = 24;
  const FRAMED = '.framed, div.highlighter-rouge';

  function snap() {
    const els = [...document.querySelectorAll(`.snap > *, ${FRAMED}`)].filter((el) => {
      const { position, display } = getComputedStyle(el);
      return position !== 'absolute' && position !== 'fixed' && display !== 'none';
    });
    for (const el of els) {
      el.dataset.mt ??= parseFloat(getComputedStyle(el).marginTop) || 0;
      if (el.parentElement.matches('.snap')) el.style.marginTop = `${el.dataset.mt}px`;
      if (el.matches(FRAMED)) el.style.minHeight = '';
    }
    for (const el of els) {
      if (el.parentElement.matches('.snap')) {
        const top = Math.round(el.getBoundingClientRect().top + scrollY);
        const dy = (U - (top % U)) % U;
        if (dy) el.style.marginTop = `${+el.dataset.mt + dy}px`;
      }
      if (el.matches(FRAMED)) {
        el.style.minHeight = `${Math.ceil((el.offsetHeight - 1) / U) * U + 1}px`;
      }
    }
  }

  let queued = false;
  function layout() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      snap();
      drawRulers();
    });
  }

  layout();
  new ResizeObserver(layout).observe(document.body);
  document.fonts?.ready.then(layout);

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
    label.textContent = `(${Math.round(e.pageX) - gx}, ${Math.round(e.pageY)})`;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => ch.classList.remove('on'));
})();
