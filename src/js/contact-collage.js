/**
 * Contact collage interaction
 *
 * Adds subtle scroll drift and fine-pointer parallax without affecting native scrolling.
 */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function initContactCollage() {
  const hero = document.querySelector('.contact-hero');
  if (!hero) return;

  const cards = [...hero.querySelectorAll('.contact-visual-card')];
  if (!cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let frameId = null;

  const resetCards = () => {
    cards.forEach((card) => {
      card.style.setProperty('--card-x', '0px');
      card.style.setProperty('--card-y', '0px');
      card.style.setProperty('--card-scale', '1');
    });
  };

  const updateCards = () => {
    frameId = null;

    if (reducedMotion.matches) {
      resetCards();
      return;
    }

    pointerX += (targetPointerX - pointerX) * 0.12;
    pointerY += (targetPointerY - pointerY) * 0.12;

    const rect = hero.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
    const scrollOffset = progress - 0.5;
    const usePointer = finePointer.matches;

    cards.forEach((card) => {
      const depth = Number.parseFloat(card.dataset.depth || '0.5');
      const driftX = Number.parseFloat(card.dataset.driftX || '0');
      const driftY = Number.parseFloat(card.dataset.driftY || '0');
      const x = scrollOffset * driftX + (usePointer ? pointerX * depth * 14 : 0);
      const y = scrollOffset * driftY + (usePointer ? pointerY * depth * 9 : 0);
      const scale = 1 + (usePointer ? Math.abs(pointerX) + Math.abs(pointerY) : 0) * depth * 0.004;

      card.style.setProperty('--card-x', `${x.toFixed(2)}px`);
      card.style.setProperty('--card-y', `${y.toFixed(2)}px`);
      card.style.setProperty('--card-scale', `${Math.min(scale, 1.016).toFixed(4)}`);
    });

    if (
      Math.abs(targetPointerX - pointerX) > 0.01 ||
      Math.abs(targetPointerY - pointerY) > 0.01
    ) {
      requestFrame();
    }
  };

  const requestFrame = () => {
    if (frameId === null) frameId = requestAnimationFrame(updateCards);
  };

  const updatePointer = (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse') return;

    const rect = hero.getBoundingClientRect();
    targetPointerX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    targetPointerY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    requestFrame();
  };

  const resetPointer = () => {
    targetPointerX = 0;
    targetPointerY = 0;
    requestFrame();
  };

  hero.addEventListener('pointermove', updatePointer, { passive: true });
  hero.addEventListener('pointerleave', resetPointer);
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  reducedMotion.addEventListener('change', requestFrame);
  finePointer.addEventListener('change', resetPointer);

  requestFrame();
}
