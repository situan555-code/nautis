import Fuse from 'fuse.js';

let fuseInstance = null;
let searchData = [];

export async function initSearch() {
  const searchTrigger = document.getElementById('search-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBackdrop = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('search-input');
  const searchResultsContainer = document.getElementById('search-results');

  if (!searchTrigger || !searchModal) return;

  // Load search data lazily on first click/focus
  const loadSearchData = async () => {
    if (fuseInstance) return;
    try {
      // Import the static JSON file with cache buster
      const res = await fetch(`/data/searchIndex.json?v=${new Date().getTime()}`);
      searchData = await res.json();
      
      fuseInstance = new Fuse(searchData, {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'keywords', weight: 0.5 },
          { name: 'description', weight: 0.3 }
        ],
        threshold: 0.4,
        includeScore: true
      });
    } catch (e) {
      console.error('Failed to load search data', e);
    }
  };

  const openSearch = async () => {
    searchModal.setAttribute('aria-hidden', 'false');
    searchModal.classList.add('is-open');
    searchInput.focus();
    await loadSearchData();
  };

  const closeSearch = () => {
    searchModal.setAttribute('aria-hidden', 'true');
    searchModal.classList.remove('is-open');
    searchInput.value = '';
    renderResults('');
  };

  const renderResults = (query) => {
    if (!query.trim()) {
      searchResultsContainer.innerHTML = '<div class="search-empty-state"><p>Type to search services, case studies, and insights.</p></div>';
      return;
    }

    if (!fuseInstance) return;

    const results = fuseInstance.search(query);

    if (results.length === 0) {
      searchResultsContainer.innerHTML = `<div class="search-empty-state"><p>No results found for "${query}".</p></div>`;
      return;
    }

    const html = results.map(result => {
      const item = result.item;
      return `
        <a href="${item.url}" class="search-result-item" data-search-link>
          <div class="search-result-cat">${item.category}</div>
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-desc">${item.description}</div>
        </a>
      `;
    }).join('');

    searchResultsContainer.innerHTML = html;
  };

  // Event Listeners
  searchTrigger.addEventListener('click', openSearch);
  searchCloseBtn.addEventListener('click', closeSearch);
  searchBackdrop.addEventListener('click', closeSearch);

  // Close search when a result is clicked (Event Delegation)
  searchResultsContainer.addEventListener('click', (e) => {
    if (e.target.closest('[data-search-link]')) {
      closeSearch();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('is-open')) {
      closeSearch();
    }
  });

  // Handle Input
  searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value);
  });
}
