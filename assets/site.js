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

  // Paper (light) / Blueprint (dark) switch. Defaults to the OS setting; a choice is remembered.
  const toggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const osDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ?? (osDark.matches ? 'dark' : 'light')) === 'dark';
  const setToggleLabel = () => {
    toggle.querySelector('span').textContent = isDark() ? 'Paper' : 'Blueprint';
    toggle.setAttribute('aria-label', `Switch to ${isDark() ? 'paper (light)' : 'blueprint (dark)'} theme`);
  };
  toggle.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    setToggleLabel();
  });
  osDark.addEventListener('change', setToggleLabel);
  toggle.hidden = false;
  setToggleLabel();
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
