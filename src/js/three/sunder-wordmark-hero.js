import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  HERO_RENDER_WHEN_VISIBLE_ONLY,
  MOBILE_ENABLE_3D,
  SunderWordmarkScene,
} from '../../components/three/SunderWordmarkScene.jsx';

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function initSunderWordmarkHero() {
  const mount = document.getElementById('sunder-wordmark-hero');
  if (!mount || !hasWebGL()) {
    if (mount) mount.dataset.sceneReady = 'false';
    return Promise.resolve(false);
  }

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile && !MOBILE_ENABLE_3D) {
    mount.dataset.sceneReady = 'false';
    return Promise.resolve(false);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = createRoot(mount);
  let heroInView = true;
  let documentIsVisible = document.visibilityState === 'visible';
  let resolveReady;
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const markSceneReady = () => {
    mount.dataset.sceneReady = 'true';
    resolveReady(true);
  };

  const updateScrollBlend = () => {
    const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 0.9, 1), 1);
    mount.style.setProperty('--hero-scroll-progress', progress.toFixed(3));
  };

  window.addEventListener('scroll', updateScrollBlend, { passive: true });
  updateScrollBlend();

  const render = () => {
    const isVisible = !HERO_RENDER_WHEN_VISIBLE_ONLY || (heroInView && documentIsVisible);
    root.render(React.createElement(SunderWordmarkScene, { isVisible, reducedMotion, onReady: markSceneReady }));
  };

  const handleDocumentVisibility = () => {
    documentIsVisible = document.visibilityState === 'visible';
    render();
  };

  if (HERO_RENDER_WHEN_VISIBLE_ONLY && 'IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        heroInView = entry.isIntersecting;
        render();
      },
      { rootMargin: '160px 0px' },
    );

    visibilityObserver.observe(mount);
  }

  document.addEventListener('visibilitychange', handleDocumentVisibility);

  render();
  return readyPromise;
}
