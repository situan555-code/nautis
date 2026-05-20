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
  initScrollReveal();
  initCounters();
  initAccordion();
  initForm();

  // Defer heavy interactive modules until user intent or viewport
  const deferHeavyModules = () => {
    initSearch();
    initFilters();
    initCalculators();
  };

  // Use requestIdleCallback if available, else fallback to setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(deferHeavyModules, { timeout: 2000 });
  } else {
    setTimeout(deferHeavyModules, 1200);
  }

  const heroMount = document.getElementById('sunder-wordmark-hero');
  if (heroMount) {
    import('./three/sunder-wordmark-hero.js')
      .then(({ initSunderWordmarkHero }) => initSunderWordmarkHero())
      .catch(() => {
        heroMount.dataset.sceneReady = 'false';
      });
  }
});
