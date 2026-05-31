/**
 * Main Entry Point — Sunder & Co. Website
 *
 * Performance-optimized initialization.
 * Heavy modules (calculators, search) are deferred until user interaction or viewport visibility.
 */

import { initNav } from './nav.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initCounters } from './counters.js';
import { initSmoothAnchors } from './smooth-anchors.js';
import { initAccordion } from './accordion.js';
import { initFilters } from './filters.js';
import { initForm } from './form.js';
import { initSearch } from './search.js';
import { initCalculators } from './calculators.js';
import { initTheme } from './theme.js';

// Lightweight modules load immediately
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initSmoothAnchors();
  initCounters();
  initAccordion();
  initForm();

  const runWhenIdle = (callback, timeout = 2000, fallbackDelay = 1200) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout });
    } else {
      setTimeout(callback, fallbackDelay);
    }
  };

  const runAfterInitialPaint = (callback) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback);
    });
  };

  // Defer heavy interactive modules until user intent or viewport
  const deferHeavyModules = () => {
    initSearch();
    initFilters();
    initCalculators();
  };

  // Use requestIdleCallback if available, else fallback to setTimeout
  runWhenIdle(deferHeavyModules);

  const heroMount = document.getElementById('sunder-wordmark-hero');
  if (heroMount) {
    const initHero = () => {
      import('./three/sunder-wordmark-hero.js')
        .then(({ initSunderWordmarkHero }) => initSunderWordmarkHero())
        .then(() => {
          runWhenIdle(() => initScrollReveal(), 3000, 500);
        })
        .catch(() => {
          heroMount.dataset.sceneReady = 'false';
          initScrollReveal();
        });
    };

    runAfterInitialPaint(() => runWhenIdle(initHero, 1500, 300));
  } else {
    initScrollReveal();
  }
});
