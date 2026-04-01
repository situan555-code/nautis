/**
 * Main Entry Point — [AGENCY] Website
 *
 * Single import that initializes all shared modules.
 * Page-specific modules (hero-particles) are imported per-page via separate <script>.
 */

import { initNav } from './nav.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initCounters } from './counters.js';
import { initSmoothAnchors } from './smooth-anchors.js';
import { initAccordion } from './accordion.js';
import { initFilters } from './filters.js';
import { initForm } from './form.js';

// Initialize all shared behavior
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  // Wait for paint before initializing scroll-dependent features
  requestAnimationFrame(() => {
    initScrollReveal();
    initCounters();
    initSmoothAnchors();
    initAccordion();
    initFilters();
    initForm();
  });
});
