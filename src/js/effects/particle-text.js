import {
  bindActivity,
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

const TAU = Math.PI * 2;

function chooseStep(width) {
  if (width < 420) return 3;
  if (width < 800) return 2.5;
  return 2;
}

function sampleParticles(layout, step) {
  const sample = document.createElement('canvas');
  const width = Math.max(1, Math.ceil(layout.width));
  const height = Math.max(1, Math.ceil(layout.height));
  sample.width = width;
  sample.height = height;
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.font = layout.font;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (const glyph of layout.glyphs) ctx.fillText(glyph.char, glyph.x, glyph.top);
  const image = ctx.getImageData(0, 0, width, height);
  const targets = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = image.data[(Math.floor(y) * width + Math.floor(x)) * 4 + 3];
      if (alpha > 40) targets.push({ x, y });
    }
  }
  return targets;
}

function play(el) {
  if (prefersReducedMotion()) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const layout = measureGlyphs(el);
  layout.font = getComputedStyle(el).font;
  const narrow = layout.width < 700;
  const step = chooseStep(layout.width);
  const targets = sampleParticles(layout, step);
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

  const radius = step * 0.92;
  const scatter = Math.min(narrow ? 72 : 140, Math.max(layout.width, layout.height) * 0.45);
  const gatherMs = narrow ? 900 : 1100;
  const interactive = !window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const pointer = { x: -9999, y: -9999, inside: false };
  let dpr = cappedDpr(narrow ? 1.25 : 1.5);
  let ink = readInk(el);
  let active = true;
  let alive = true;
  let raf = 0;
  let start = 0;

  const particles = targets.map((target, index) => {
    const seed = ((index * 9301 + 49297) % 233280) / 233280;
    const angle = seed * TAU;
    const distance = scatter * (0.45 + seed * 0.55);
    return {
      x: target.x + Math.cos(angle) * distance,
      y: target.y + Math.sin(angle) * distance,
      homeX: target.x,
      homeY: target.y,
      delay: seed * (narrow ? 180 : 280),
    };
  });

  const draw = (now) => {
    fitCanvas(canvas, layout.width, layout.height, dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.fillStyle = ink;
    ctx.beginPath();
    const elapsed = start ? now - start : 0;
    let formed = true;
    for (const particle of particles) {
      const progress = Math.max(0, Math.min(1, (elapsed - particle.delay) / gatherMs));
      if (progress < 1) formed = false;
      const eased = 1 - (1 - progress) ** 3;
      let x = particle.x + (particle.homeX - particle.x) * eased;
      let y = particle.y + (particle.homeY - particle.y) * eased;
      if (progress >= 1) {
        particle.x = particle.homeX;
        particle.y = particle.homeY;
        if (pointer.inside) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const reach = Math.max(110, layout.fontSize * 1.35);
          if (dist < reach) {
            const push = (1 - dist / reach) ** 1.2 * reach * 1.05;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }
      }
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, TAU);
    }
    ctx.fill();
    if (formed) el.dataset.textEffectState = 'settled';
    return formed;
  };

  const frame = (now) => {
    raf = 0;
    if (!alive || !active) return;
    if (!start) start = now;
    const formed = draw(now);
    if (!formed || pointer.inside) raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (raf || !alive || !active) return;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (!alive) return;
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    unbind();
    unlisten();
    untheme();
    window.removeEventListener('pointermove', onMove);
    settle(el, canvas);
  };

  const onMove = (event) => {
    if (!interactive || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    const rect = el.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    const inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    if (inside !== pointer.inside || inside) {
      pointer.inside = inside;
      wake();
    }
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
  });
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      dpr = cappedDpr(narrow ? 1.25 : 1.5);
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
