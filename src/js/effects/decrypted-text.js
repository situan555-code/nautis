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

const POOL = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+');
const STEP_MS = 28;
const LEAD = 6;

function paint(ctx, canvas, layout, shown, revealedCount, ink, dpr) {
  fitCanvas(canvas, layout.width, layout.height, dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, layout.width, layout.height);
  ctx.font = layout.font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = ink;
  layout.glyphs.forEach((glyph, index) => {
    const char = index < revealedCount ? glyph.char : shown[index];
    ctx.globalAlpha = index < revealedCount ? 1 : 0.82;
    ctx.fillText(char, glyph.x, glyph.top);
  });
  ctx.globalAlpha = 1;
}

function play(el) {
  if (prefersReducedMotion()) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const layout = measureGlyphs(el);
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

  const ink = readInk(el);
  const dpr = cappedDpr(1.5);
  const shown = layout.glyphs.map((glyph, index) => POOL[(glyph.char.codePointAt(0) + index * 7) % POOL.length]);
  const total = layout.glyphs.length;
  let revealedCount = 0;
  let step = 0;
  let timer = 0;
  let alive = true;

  const finish = () => {
    if (!alive) return;
    alive = false;
    window.clearTimeout(timer);
    window.clearTimeout(safety);
    unlisten();
    settle(el, canvas);
  };

  const tick = () => {
    if (!alive) return;
    for (let i = revealedCount; i < total; i += 1) {
      shown[i] = POOL[Math.floor(Math.random() * POOL.length)];
    }
    if (step >= LEAD) revealedCount = Math.min(total, step - LEAD + 1);
    step += 1;
    paint(ctx, canvas, layout, shown, revealedCount, ink, dpr);
    if (revealedCount >= total) {
      finish();
      return;
    }
    timer = window.setTimeout(tick, STEP_MS);
  };

  const unlisten = listenReduced(finish);
  const safety = window.setTimeout(finish, 2400);
  tick();
}

export function init() {
  document.querySelectorAll('[data-text-effect="decrypted"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
