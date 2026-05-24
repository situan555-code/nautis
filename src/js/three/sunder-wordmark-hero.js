import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  HERO_RENDER_WHEN_VISIBLE_ONLY,
  MOBILE_ENABLE_3D,
  MOBILE_HERO_MEDIA_QUERY,
  REDUCED_MOTION_DISABLE_ANIMATION,
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

  const isMobile = window.matchMedia(MOBILE_HERO_MEDIA_QUERY).matches;
  if (isMobile && !MOBILE_ENABLE_3D) {
    mount.dataset.sceneReady = 'false';
    return Promise.resolve(false);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED_MOTION_DISABLE_ANIMATION && reducedMotion) {
    mount.dataset.sceneReady = 'false';
    return Promise.resolve(false);
  }

  let sceneRoot = mount.querySelector(':scope > .sunder-wordmark-root');
  if (!sceneRoot) {
    sceneRoot = document.createElement('div');
    sceneRoot.className = 'sunder-wordmark-root';
    mount.prepend(sceneRoot);
  }

  const root = createRoot(sceneRoot);
  let heroInView = true;
  let documentIsVisible = document.visibilityState === 'visible';
  let resolveReady;
  let readySettled = false;
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const markSceneReady = () => {
    if (readySettled) return;
    readySettled = true;
    mount.dataset.sceneReady = 'true';
    resolveReady(true);
  };

  const keepFallback = () => {
    mount.dataset.sceneReady = 'false';
    if (readySettled) return;
    readySettled = true;
    resolveReady(false);
  };

  const updateScrollBlend = () => {
    const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 0.9, 1), 1);
    mount.style.setProperty('--hero-scroll-progress', progress.toFixed(3));
  };

  window.addEventListener('scroll', updateScrollBlend, { passive: true });
  updateScrollBlend();

  const render = () => {
    const isVisible = !HERO_RENDER_WHEN_VISIBLE_ONLY || (heroInView && documentIsVisible);
    root.render(
      React.createElement(SunderWordmarkScene, {
        isVisible,
        isMobile,
        reducedMotion,
        onReady: markSceneReady,
        onFallback: keepFallback,
      }),
    );
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
