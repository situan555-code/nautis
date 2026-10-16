import {
  bindActivity,
  cappedDpr,
  fitCanvas,
  listenReduced,
  measureGlyphs,
  mountLayer,
  readInk,
  settle,
  watchTheme,
  whenShown,
} from './support.js';

const TAU = Math.PI * 2;

function budgetFor(width) {
  if (width < 420) return 340;
  if (width < 800) return 680;
  return 1200;
}

function easeOut(t) {
  return 1 - (1 - t) ** 3;
}

function sampleParticles(layout) {
  const sample = document.createElement('canvas');
  sample.width = Math.max(1, Math.ceil(layout.width));
  sample.height = Math.max(1, Math.ceil(layout.height));
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.font = layout.font;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (const glyph of layout.glyphs) ctx.fillText(glyph.char, glyph.x, glyph.top);
  const image = ctx.getImageData(0, 0, sample.width, sample.height);
  const narrow = layout.width < 700;
  const step = narrow ? 4 : 3;
  const targets = [];
  for (let y = 0; y < sample.height; y += step) {
    for (let x = 0; x < sample.width; x += step) {
      const alpha = image.data[(y * sample.width + x) * 4 + 3];
      if (alpha > 48) targets.push({ x, y, weight: alpha / 255 });
    }
  }
  const cap = budgetFor(layout.width);
  const stride = Math.max(1, Math.ceil(targets.length / cap));
  return targets.filter((_, index) => index % stride === 0);
}

function play(el) {
  const layout = measureGlyphs(el);
  const targets = sampleParticles(layout);
  if (!targets.length) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const canvas = mountLayer(el);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    settle(el, canvas);
    return;
  }

  const narrow = layout.width < 700;
  const scatter = Math.min(narrow ? 42 : 88, layout.width * 0.18);
  const duration = narrow ? 1300 : 1600;
  const stagger = narrow ? 220 : 380;
  const radius = narrow ? 1.15 : 1.45;
  let dpr = cappedDpr(1.75);
  let ink = readInk(el);
  let active = true;
  let raf = 0;
  let start = 0;
  let settled = false;

  const particles = targets.map((target, index) => {
    const seed = ((index * 9301 + 49297) % 233280) / 233280;
    const angle = seed * TAU;
    const depth = 0.45 + ((index * 17) % 100) / 100;
    const distance = scatter * (0.35 + depth * 0.65);
    return {
      x: Math.min(layout.width - 1, Math.max(1, target.x + Math.cos(angle) * distance)),
      y: Math.min(layout.height - 1, Math.max(1, target.y + Math.sin(angle) * distance)),
      targetX: target.x,
      targetY: target.y,
      seed,
      delay: seed * stagger,
    };
  });

  const draw = (now) => {
    const box = el.getBoundingClientRect();
    fitCanvas(canvas, box.width, box.height, dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = ink;
    ctx.beginPath();
    let done = true;
    for (const particle of particles) {
      const progress = settled ? 1 : Math.max(0, Math.min(1, (now - start - particle.delay) / duration));
      if (progress < 1) done = false;
      const eased = easeOut(progress);
      const x = particle.x + (particle.targetX - particle.x) * eased;
      const y = particle.y + (particle.targetY - particle.y) * eased;
      if (progress >= 1) {
        particle.x = particle.targetX;
        particle.y = particle.targetY;
      }
      const dot = Math.max(0.7, radius * (0.75 + particle.seed * 0.35));
      ctx.moveTo(x + dot, y);
      ctx.arc(x, y, dot, 0, TAU);
    }
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    return done;
  };

  const frame = (now) => {
    raf = 0;
    if (!start) start = now;
    const done = draw(now);
    if (done) {
      settled = true;
      el.dataset.textEffectState = 'settled';
      return;
    }
    if (active) raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (raf || !active || settled) return;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    unbind();
    unlisten();
    untheme();
    settle(el, canvas);
  };

  const unbind = bindActivity(el, (on) => {
    active = on;
    if (on) wake();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  const unlisten = listenReduced(stop);
  const untheme = watchTheme(() => {
    ink = readInk(el);
    if (settled) draw(performance.now());
  });

  window.addEventListener(
    'resize',
    () => {
      dpr = cappedDpr(1.75);
      if (settled) draw(performance.now());
    },
    { passive: true },
  );

  wake();
}

export function init() {
  document.querySelectorAll('[data-text-effect="particle"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
