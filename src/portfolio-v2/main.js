/**
 * Portfolio V2 — Next-Gen Glass Showroom
 * Dynamically builds the portfolio from caseStudies data.
 * Includes glass sphere background and scroll-driven animations.
 */
import { caseStudies } from '../portfolio/data/caseStudies.js';
import { initGlassSphere } from '../js/glass-sphere.js';
import './styles.css';

// Case study display order
const studyOrder = [
  'prototype_app',
  'mavin_50_years',
  'cgi_configurator',
  'retail_kiosk',
  'polymount_greenscreen',
  'isoshock',
  'product_photography',
  'virtual_tours',
  'lifestyle_photography',
  'portfolio_assets',
];

function init() {
  // Init 3D background
  initGlassSphere();

  const app = document.getElementById('app');
  const portfolio = document.createElement('div');
  portfolio.className = 'portfolio-v2';

  // --- HERO ---
  portfolio.innerHTML = `
    <section class="v2-hero">
      <div class="v2-hero__eyebrow">Creative Technologist — Portfolio</div>
      <h1 class="v2-hero__name">Building at the<br><span>intersection of craft & code</span></h1>
      <p class="v2-hero__role">From 3D product configurators and AI-powered iOS apps to trade show campaigns and retail kiosk systems — I build the tools and visual systems that modern manufacturers need.</p>
      <div class="v2-hero__scroll">
        <span>Scroll</span>
        <div class="v2-hero__scroll-line"></div>
      </div>
    </section>
  `;

  // --- CASE STUDY SECTIONS ---
  let sectionIndex = 1;
  for (const id of studyOrder) {
    const study = caseStudies[id];
    if (!study) continue;

    const section = document.createElement('section');
    section.className = 'v2-section';
    section.id = `study-${id}`;

    const numberLabel = String(sectionIndex).padStart(2, '0');

    section.innerHTML = `
      <div class="v2-section__number">${numberLabel}</div>
      <div class="v2-card" data-animate>
        <div class="v2-card__header">
          <h2 class="v2-card__title">${study.title}</h2>
          <div class="v2-card__meta">
            ${study.role ? `<span><span class="dot"></span>${study.role}</span>` : ''}
            ${study.timeline ? `<span><span class="dot"></span>${study.timeline}</span>` : ''}
          </div>
        </div>
        <div class="v2-card__blocks">
          ${renderBlocks(study.blocks || [])}
        </div>
      </div>
    `;

    portfolio.appendChild(section);
    sectionIndex++;
  }

  // --- FOOTER ---
  const footer = document.createElement('footer');
  footer.className = 'v2-footer';
  footer.innerHTML = `
    <div class="v2-footer__links">
      <a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a>
      <a href="mailto:hello@agency.com">Email</a>
      <a href="/index.html">Agency Site</a>
    </div>
    <div class="v2-footer__retro">
      <a href="/portfolio.html">[ launch retro OS portfolio ]</a>
    </div>
  `;
  portfolio.appendChild(footer);

  app.appendChild(portfolio);

  // --- SCROLL ANIMATION ---
  setupScrollAnimations();
}

function renderBlocks(blocks) {
  return blocks.map(block => {
    switch (block.type) {
      case 'text':
        return `
          <div class="v2-block">
            ${block.heading ? `<h3 class="v2-block__heading">${block.heading}</h3>` : ''}
            <p class="v2-block__text">${escapeHtml(block.content)}</p>
          </div>
        `;

      case 'image':
        return `
          <div class="v2-block">
            <div class="v2-block__image">
              <img src="${block.src}" alt="${escapeHtml(block.caption || '')}" loading="lazy" />
            </div>
            ${block.caption ? `<p class="v2-block__caption">${escapeHtml(block.caption)}</p>` : ''}
          </div>
        `;

      case 'video':
        return `
          <div class="v2-block">
            <div class="v2-block__video">
              <video src="${block.src}" controls muted loop playsinline></video>
            </div>
            ${block.caption ? `<p class="v2-block__caption">${escapeHtml(block.caption)}</p>` : ''}
          </div>
        `;

      case 'iframe':
        return `
          <div class="v2-block">
            <div class="v2-block__iframe">
              <iframe
                src="${block.src}"
                title="${escapeHtml(block.caption || 'Interactive embed')}"
                style="aspect-ratio: ${block.aspectRatio || '4 / 3'};"
                allow="accelerometer; gyroscope"
              ></iframe>
            </div>
            ${block.caption ? `<p class="v2-block__caption">${escapeHtml(block.caption)}</p>` : ''}
          </div>
        `;

      default:
        return '';
    }
  }).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setupScrollAnimations() {
  const cards = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve — allows re-entry animations if desired
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach(card => observer.observe(card));
}

// Boot — handle race condition where DOM may already be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
