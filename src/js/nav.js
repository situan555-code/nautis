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
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
}
