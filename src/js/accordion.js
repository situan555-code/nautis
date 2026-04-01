/**
 * Accordion Component
 *
 * Handles toggle state for accordion UI patterns.
 * Expects .accordion__item with .accordion__trigger and .accordion__body.
 */

export function initAccordion() {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    const triggers = accordion.querySelectorAll('.accordion__trigger');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion__item');
        const body = item.querySelector('.accordion__body');
        const isOpen = item.classList.contains('is-open');

        // Close other items in the same accordion group
        accordion.querySelectorAll('.accordion__item').forEach((i) => {
          if (i !== item) {
            i.classList.remove('is-open');
            const otherBody = i.querySelector('.accordion__body');
            if (otherBody) otherBody.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('is-open');
          body.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  });
}
