const scratchCanvas = document.createElement('canvas');
const scratchCtx = scratchCanvas.getContext('2d');

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isCoarsePointer() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function cappedDpr(limit = 1.75) {
  const narrow = window.innerWidth < 760;
  const cap = narrow ? Math.min(limit, 1.25) : limit;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export function readFont(el) {
  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize) || 16;
  return {
    font: `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`,
    fontSize,
    color: style.color,
  };
}

export function readInk(el) {
  const active = el.classList.contains('is-text-fx');
  if (active) el.classList.remove('is-text-fx');
  const color = getComputedStyle(el).color || '#111111';
  if (active) el.classList.add('is-text-fx');
  return color;
}

export function cssColorToRgb(input) {
  const match = String(input).match(/[\d.]+/g);
  if (!match || match.length < 3) return { rgb: [1, 1, 1], a: 1 };
  const [r, g, b, a] = match.map(Number);
  return {
    rgb: [r / 255, g / 255, b / 255],
    a: a === undefined ? 1 : a,
  };
}

export function tokenColor(name) {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  probe.style.position = 'absolute';
  probe.style.left = '-9999px';
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return cssColorToRgb(value);
}

export function prepareFonts(el) {
  const font = readFont(el).font;
  const ready = document.fonts?.ready ?? Promise.resolve();
  const load = document.fonts?.load?.(font, el.textContent || ' ') ?? Promise.resolve();
  return Promise.race([
    Promise.all([ready, load]).then(() => undefined),
    new Promise((resolve) => {
      window.setTimeout(resolve, 2500);
    }),
  ]);
}

function textNodeOf(el) {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) return node;
  }
  return null;
}

export function measureGlyphs(el) {
  const node = textNodeOf(el);
  const host = el.getBoundingClientRect();
  const { font, fontSize } = readFont(el);
  if (!node || host.width < 2 || host.height < 2 || !scratchCtx) {
    return { width: host.width, height: host.height, font, fontSize, glyphs: [] };
  }

  scratchCtx.font = font;
  const range = document.createRange();
  const text = node.textContent;
  const glyphs = [];

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (/\s/.test(char)) continue;
    range.setStart(node, index);
    range.setEnd(node, index + 1);
    const rect = range.getBoundingClientRect();
    if (rect.width < 0.2 && rect.height < 0.2) continue;
    const half = Math.max(0, (rect.height - fontSize) / 2);
    glyphs.push({
      char,
      index,
      x: rect.left - host.left,
      y: rect.top - host.top,
      w: rect.width,
      h: rect.height,
      top: rect.top - host.top + half,
    });
  }

  return { width: host.width, height: host.height, font, fontSize, glyphs };
}

export function drawGlyphs(ctx, layout, color, alpha = 1) {
  ctx.font = layout.font;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = alpha;
  for (const glyph of layout.glyphs) {
    ctx.fillText(glyph.char, glyph.x, glyph.top);
  }
  ctx.globalAlpha = 1;
}

export function fitCanvas(canvas, width, height, dpr) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const bw = Math.max(1, Math.round(w * dpr));
  const bh = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  return { width: w, height: h, dpr };
}

export function mountLayer(el) {
  const canvas = document.createElement('canvas');
  canvas.className = 'text-fx__layer';
  canvas.setAttribute('aria-hidden', 'true');
  el.classList.add('is-text-fx');
  el.appendChild(canvas);
  el.dataset.textEffectState = 'running';
  return canvas;
}

export function settle(el, canvas) {
  canvas?.remove();
  el.classList.remove('is-text-fx');
  el.dataset.textEffectState = 'settled';
}

export function whenShown(el, fn) {
  if (prefersReducedMotion()) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  let started = false;
  let inView = false;

  const ancestorsReady = () => {
    let node = el;
    while (node && node !== document.documentElement) {
      const classes = node.classList;
      if (classes?.contains('animate-up') && !classes.contains('visible')) return false;
      if (classes?.contains('reveal') && !classes.contains('is-visible')) return false;
      if (node.hasAttribute?.('data-reveal') && !classes.contains('is-visible')) return false;
      node = node.parentElement;
    }
    return true;
  };

  const tryStart = () => {
    if (started || !inView || !ancestorsReady()) return;
    started = true;
    observer.disconnect();
    mutations.disconnect();
    prepareFonts(el).then(() => {
      if (el.isConnected) fn();
    });
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.25);
      tryStart();
    },
    { threshold: [0, 0.25, 0.6] },
  );
  observer.observe(el);

  const mutations = new MutationObserver(tryStart);
  let node = el;
  while (node) {
    mutations.observe(node, { attributes: true, attributeFilter: ['class'] });
    node = node.parentElement;
  }
  tryStart();
}

export function bindActivity(el, onChange) {
  let onScreen = true;
  let pageOn = !document.hidden;
  const emit = () => onChange(onScreen && pageOn);
  const io = new IntersectionObserver(([entry]) => {
    onScreen = Boolean(entry?.isIntersecting);
    emit();
  });
  io.observe(el);
  const onVis = () => {
    pageOn = !document.hidden;
    emit();
  };
  document.addEventListener('visibilitychange', onVis);
  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
  };
}

export function watchTheme(fn) {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => mo.disconnect();
}

export function listenReduced(fn) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => {
    if (query.matches) fn();
  };
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
