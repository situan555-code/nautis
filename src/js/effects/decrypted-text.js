import {
  cappedDpr,
  fitCanvas,
  listenReduced,
  measureGlyphs,
  mountLayer,
  prefersReducedMotion,
  readInk,
  settle,
  watchTheme,
  whenShown,
} from './support.js';

const POOL = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+');
const STEP = 36;
const LEAD = 8;

function scramble(glyphs, shown, revealed) {
  for (let i = 0; i < glyphs.length; i += 1) {
    if (revealed[i]) continue;
    shown[i] = POOL[Math.floor(Math.random() * POOL.length)];
  }
}

function paint(ctx, canvas, layout, shown, revealed, ink, dpr) {
  fitCanvas(canvas, layout.width, layout.height, dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, layout.width, layout.height);
  ctx.font = layout.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = ink;
  layout.glyphs.forEach((glyph, index) => {
    const char = revealed[index] ? glyph.char : shown[index];
    const width = ctx.measureText(char).width;
    const scale = width > glyph.w + 0.4 ? glyph.w / Math.max(width, 0.01) : 1;
    ctx.save();
    ctx.translate(glyph.x + glyph.w / 2, glyph.top);
    ctx.scale(scale, 1);
    ctx.globalAlpha = revealed[index] ? 1 : 0.86;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

function play(el) {
  if (prefersReducedMotion()) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const canvas = mountLayer(el);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    settle(el, canvas);
    return;
  }

  let layout = measureGlyphs(el);
  let ink = readInk(el);
  const dpr = cappedDpr(1.75);
  if (!layout.glyphs.length) {
    settle(el, canvas);
    return;
  }

  const revealed = layout.glyphs.map(() => false);
  const shown = layout.glyphs.map((glyph, index) => POOL[(glyph.char.codePointAt(0) + index * 7) % POOL.length]);
  const queue = [...Array(LEAD).fill(null), ...layout.glyphs.map((_, index) => index)];
  let timer = 0;
  let alive = true;

  const stop = () => {
    if (!alive) return;
    alive = false;
    window.clearTimeout(timer);
    unlisten();
    untheme();
    settle(el, canvas);
  };

  const tick = () => {
    if (!alive) return;
    layout = measureGlyphs(el);
    if (layout.glyphs.length !== revealed.length) {
      stop();
      return;
    }
    scramble(layout.glyphs, shown, revealed);
    const next = queue.shift();
    if (typeof next === 'number') revealed[next] = true;
    paint(ctx, canvas, layout, shown, revealed, ink, dpr);
    if (!queue.length) {
      stop();
      return;
    }
    timer = window.setTimeout(tick, STEP);
  };

  const unlisten = listenReduced(stop);
  const untheme = watchTheme(() => {
    ink = readInk(el);
  });
  window.setTimeout(stop, 8000);
  tick();
}

export function init() {
  document.querySelectorAll('[data-text-effect="decrypted"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
