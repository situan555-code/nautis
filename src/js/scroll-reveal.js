/**
 * Scroll Reveal — IntersectionObserver-based reveal animations
 */

export function initScrollReveal() {
  if (document.documentElement.dataset.scrollRevealReady === 'true') return;
  document.documentElement.dataset.scrollRevealReady = 'true';

  const revealElements = document.querySelectorAll('.reveal, .animate-up, [data-reveal]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach((el) => {
      el.classList.add('is-visible');
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  );

  revealElements.forEach((el) => observer.observe(el));
}
