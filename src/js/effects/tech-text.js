import {
  cappedDpr,
  fitCanvas,
  listenReduced,
  measureGlyphs,
  mountLayer,
  prefersReducedMotion,
  readInk,
  settle,
  whenShown,
} from './support.js';

const SWEEP_MS = 1600;

function draw(ctx, canvas, layout, ink, dpr, lens, active) {
  fitCanvas(canvas, layout.width, layout.height, dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, layout.width, layout.height);
  ctx.font = layout.font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  const weight = Math.max(2.25, layout.fontSize * 0.045);
  const dash = Math.max(7, layout.fontSize * 0.16);
  const gap = Math.max(4.5, layout.fontSize * 0.09);
  const reach = Math.max(96, layout.fontSize * 3.2);

  for (const glyph of layout.glyphs) {
    const dist = Math.hypot(glyph.x + glyph.w / 2 - lens.x, glyph.top + layout.fontSize * 0.45 - lens.y);
    const influence = active ? Math.max(0, 1 - dist / reach) : 0;
    const shaped = influence * influence * (3 - 2 * influence);
    ctx.globalAlpha = 1 - shaped;
    ctx.setLineDash([]);
    ctx.fillText(glyph.char, glyph.x, glyph.top);
    if (shaped > 0.08) {
      ctx.globalAlpha = Math.min(1, 0.35 + shaped);
      ctx.lineWidth = weight;
      ctx.setLineDash([dash, gap]);
      ctx.strokeText(glyph.char, glyph.x, glyph.top);
    }
  }
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function play(el) {
  if (prefersReducedMotion()) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  let layout = measureGlyphs(el);
  layout.font = getComputedStyle(el).font;
  if (!layout.glyphs.length) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const canvas = mountLayer(el);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    settle(el, canvas);
    return;
  }

  const dpr = cappedDpr(1.5);
  const ink = readInk(el);
  const pointer = { x: layout.width * 0.5, y: layout.height * 0.45, inside: false };
  let alive = true;
  let raf = 0;
  let start = 0;
  let sweeping = true;

  const showLayer = () => {
    if (!canvas.isConnected) {
      el.classList.add('is-text-fx');
      el.appendChild(canvas);
    }
  };

  const hideLayer = () => {
    canvas.remove();
    el.classList.remove('is-text-fx');
    el.dataset.textEffectState = 'settled';
  };

  const lensAt = (t) => {
    const glyphs = layout.glyphs;
    const pos = Math.min(glyphs.length - 1, Math.max(0, t * (glyphs.length - 1)));
    const index = Math.floor(pos);
    const mix = pos - index;
    const a = glyphs[index];
    const b = glyphs[Math.min(glyphs.length - 1, index + 1)];
    return {
      x: a.x + a.w / 2 + (b.x + b.w / 2 - (a.x + a.w / 2)) * mix,
      y: a.top + layout.fontSize * 0.45,
    };
  };

  const stop = () => {
    if (!alive) return;
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    unlisten();
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    settle(el, canvas);
  };

  const frame = (now) => {
    if (!alive) return;
    raf = 0;
    if (!start) start = now;
    const sweep = Math.min(1, (now - start) / SWEEP_MS);
    const lens = pointer.inside ? pointer : lensAt(sweep);
    showLayer();
    draw(ctx, canvas, layout, ink, dpr, lens, true);
    if (sweep >= 1 && !pointer.inside) {
      sweeping = false;
      hideLayer();
      return;
    }
    if (sweep >= 1) sweeping = false;
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (!alive || raf) return;
    raf = requestAnimationFrame(frame);
  };

  const onMove = (event) => {
    if (!alive || (event.pointerType && event.pointerType !== 'mouse')) return;
    const rect = el.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    if (!pointer.inside) return;
    if (!sweeping) {
      const next = measureGlyphs(el);
      if (next.glyphs.length) {
        next.font = getComputedStyle(el).font;
        layout = next;
      }
    }
    wake();
  };

  const onLeave = () => {
    pointer.inside = false;
    if (!sweeping) hideLayer();
  };

  const unlisten = listenReduced(stop);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  wake();
}

export function init() {
  document.querySelectorAll('[data-text-effect="tech"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
