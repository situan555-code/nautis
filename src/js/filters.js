/**
 * Filter Component
 *
 * Handles category filtering for grids (e.g., Case Studies, Insights).
 * Expects .filter-tab buttons and .case-card elements.
 */

export function initFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('[data-category]');

  if (!filterTabs.length || !cards.length) return;

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Update active state
      filterTabs.forEach((f) => f.classList.remove('is-active'));
      tab.classList.add('is-active');

      const filter = tab.dataset.filter;

      // Filter cards
      cards.forEach((card) => {
        const categories = card.dataset.category.split(' ');

        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = '';
          // Trigger a small delay for opacity if needed, or just let CSS handle it
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          // Wait for transition before hiding
          setTimeout(() => {
            if (card.style.opacity === '0') {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });
}
