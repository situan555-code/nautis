import {
  cappedDpr,
  fitCanvas,
  listenReduced,
  measureGlyphs,
  mountLayer,
  readInk,
  settle,
  whenShown,
} from './support.js';

const SWEEP_MS = 1900;

function lensPoint(glyphs, t) {
  if (!glyphs.length) return { x: 0, y: 0 };
  const pos = Math.min(glyphs.length - 1, Math.max(0, t * (glyphs.length - 1)));
  const index = Math.floor(pos);
  const mix = pos - index;
  const a = glyphs[index];
  const b = glyphs[Math.min(glyphs.length - 1, index + 1)];
  return {
    x: a.x + a.w / 2 + (b.x + b.w / 2 - (a.x + a.w / 2)) * mix,
    y: a.top + (b.top - a.top) * mix,
  };
}

function play(el) {
  const canvas = mountLayer(el);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    settle(el, canvas);
    return;
  }

  const dpr = cappedDpr(1.75);
  let alive = true;
  let raf = 0;
  let start = 0;
  const pointer = { x: 0, y: 0, inside: false };

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
    if (!start) start = now;
    const layout = measureGlyphs(el);
    const ink = readInk(el);
    if (!layout.glyphs.length) {
      stop();
      return;
    }
    const sweep = Math.min(1, (now - start) / SWEEP_MS);
    const lens = pointer.inside ? pointer : lensPoint(layout.glyphs, sweep);
    const reach = Math.max(78, layout.fontSize * 2.5);
    fitCanvas(canvas, layout.width, layout.height, dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.font = layout.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.35;
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;

    for (const glyph of layout.glyphs) {
      const dist = Math.hypot(glyph.x + glyph.w / 2 - lens.x, glyph.top + layout.fontSize * 0.35 - lens.y);
      const influence = sweep >= 1 && !pointer.inside ? 0 : Math.max(0, 1 - dist / reach);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1 - influence * 0.92;
      ctx.fillText(glyph.char, glyph.x, glyph.top);
      if (influence > 0.04) {
        ctx.globalAlpha = influence;
        ctx.setLineDash([4, 2.5]);
        ctx.strokeText(glyph.char, glyph.x, glyph.top);
      }
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    if (sweep >= 1 && !pointer.inside) {
      stop();
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const onMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.inside = true;
  };
  const onLeave = () => {
    pointer.inside = false;
  };

  const unlisten = listenReduced(stop);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  window.setTimeout(stop, 9000);
  raf = requestAnimationFrame(frame);
}

export function init() {
  document.querySelectorAll('[data-text-effect="tech"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
