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
import { initSearch } from './search.js';
import { initCalculators } from './calculators.js';
import { initTheme } from './theme.js';
import { initContactTracking } from './contact-tracking.js';

function initCopyUrlButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-url]');
  if (!copyButtons.length) return;

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const url = button.getAttribute('data-copy-url-value') || window.location.href;
      const originalLabel = button.textContent;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const input = document.createElement('input');
          input.value = url;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        }
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      }

      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1800);
    }, { once: false });
  });
}

// Lightweight modules load immediately
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initSmoothAnchors();
  initCounters();
  initAccordion();
  initContactTracking();
  initCopyUrlButtons();

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
