const LOADERS = {
  tech: () => import('./tech-text.js'),
  particle: () => import('./particle-text.js'),
  warp: () => import('./warp-text.js'),
  'cursor-grid': () => import('./cursor-grid.js'),
};

export function initEffects() {
  const kinds = new Set();
  document.querySelectorAll('[data-text-effect]').forEach((node) => {
    if (node.dataset.textEffect) kinds.add(node.dataset.textEffect);
  });
  document.querySelectorAll('[data-decor]').forEach((node) => {
    if (node.dataset.decor) kinds.add(node.dataset.decor);
  });
  kinds.forEach((kind) => {
    const load = LOADERS[kind];
    if (!load) return;
    load()
      .then((mod) => mod.init())
      .catch(() => {});
  });
}
