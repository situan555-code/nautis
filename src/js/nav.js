/**
 * Navigation — Scroll behavior & mobile toggle
 * No longer creates DOM — the nav HTML is in partials/nav.html
 */

export function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  // Scroll behavior — frosted glass on scroll
  const handleScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    const setMenuOpen = (isOpen) => {
      toggle.classList.toggle('is-open', isOpen);
      mobileMenu.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    };

    toggle.addEventListener('click', () => {
      setMenuOpen(!toggle.classList.contains('is-open'));
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    });
  }
}
