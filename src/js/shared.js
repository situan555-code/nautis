/**
 * Shared Components & Utilities — [AGENCY]
 * Navigation, Footer, Scroll Reveal, and utilities used across all pages.
 */

/* ============================================================
   NAVIGATION COMPONENT
   ============================================================ */
function createNav(activePage) {
  const pages = [
    { id: 'home',        label: 'Home',        href: 'index.html' },
    { id: 'services',    label: 'Services',    href: 'services.html' },
    { id: 'case-studies', label: 'Case Studies', href: 'case-studies.html' },
    { id: 'about',       label: 'About',       href: 'about.html' },
    { id: 'engagement',  label: 'How We Work',  href: 'engagement.html' },
    { id: 'insights',    label: 'Insights',    href: 'insights.html' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.id = 'main-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  const linksHTML = pages.map(p =>
    `<li><a href="${p.href}" class="nav__link ${p.id === activePage ? 'is-active' : ''}">${p.label}</a></li>`
  ).join('');

  const mobileLinksHTML = pages.map(p =>
    `<a href="${p.href}" class="nav__mobile-link">${p.label}</a>`
  ).join('');

  nav.innerHTML = `
    <div class="nav__inner">
      <a href="index.html" class="nav__logo" aria-label="Home">
        <span>[</span>AGENCY<span>]</span>
      </a>
      <ul class="nav__links">
        ${linksHTML}
      </ul>
      <a href="contact.html" class="btn btn--primary nav__cta desktop-only">Start an Audit</a>
      <button class="nav__toggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav__mobile-menu" id="mobile-menu">
      ${mobileLinksHTML}
      <a href="contact.html" class="btn btn--primary" style="margin-top: var(--space-4); text-align: center; justify-content: center;">Start an Audit</a>
    </div>
  `;

  document.body.prepend(nav);

  // Scroll behavior
  const handleScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  const toggle = nav.querySelector('.nav__toggle');
  const mobileMenu = nav.querySelector('#mobile-menu');
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}


/* ============================================================
   FOOTER COMPONENT
   ============================================================ */
function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.id = 'site-footer';

  footer.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="index.html" class="nav__logo" style="font-size: var(--text-2xl);">
            <span>[</span>AGENCY<span>]</span>
          </a>
          <p>Digital Transformation & Revenue Operations for legacy B2B, manufacturing, and heavy-inventory retail.</p>
        </div>
        <div>
          <h4 class="footer__col-title">Services</h4>
          <ul class="footer__links">
            <li><a href="services.html#martech">MarTech & Data</a></li>
            <li><a href="services.html#3d">3D Commerce</a></li>
            <li><a href="services.html#revops">Revenue Ops</a></li>
            <li><a href="services.html#ai">Applied AI</a></li>
            <li><a href="services.html#brand">Brand Strategy</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__col-title">Company</h4>
          <ul class="footer__links">
            <li><a href="about.html">About</a></li>
            <li><a href="case-studies.html">Case Studies</a></li>
            <li><a href="engagement.html">How We Work</a></li>
            <li><a href="insights.html">Insights</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__col-title">Connect</h4>
          <ul class="footer__links">
            <li><a href="contact.html">Contact</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href="mailto:hello@agency.com">hello@agency.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${new Date().getFullYear()} [AGENCY]. All rights reserved.</p>
        <p>Built with precision.</p>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}


/* ============================================================
   SCROLL REVEAL OBSERVER
   ============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ============================================================
   COUNTER ANIMATION (for stat cards)
   ============================================================ */
function animateCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 2000;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4); // ease-out quartic
          const current = Math.round(target * eased);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
}


/* ============================================================
   SMOOTH ANCHOR SCROLLING
   ============================================================ */
function initSmoothAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}


/* ============================================================
   INIT ALL SHARED COMPONENTS
   ============================================================ */
function initShared(activePage) {
  createNav(activePage);
  createFooter();

  // Wait for DOM paint
  requestAnimationFrame(() => {
    initScrollReveal();
    animateCounters();
    initSmoothAnchors();
  });
}
