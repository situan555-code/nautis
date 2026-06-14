const THEME_STORAGE_KEY = 'sunder-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still updates for the current page even if storage is unavailable.
  }
}

function setToggleState(theme) {
  const isLight = theme === 'light';
  document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
    toggle.setAttribute('aria-pressed', String(isLight));
    toggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
  });
}

export function applyTheme(theme, { persist = false } = {}) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark';

  document.documentElement.dataset.theme = normalizedTheme;
  document.documentElement.style.colorScheme = normalizedTheme;

  if (persist) {
    storeTheme(normalizedTheme);
  }

  setToggleState(normalizedTheme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: normalizedTheme } }));
}

export function initTheme() {
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme || document.documentElement.dataset.theme || getSystemTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme, { persist: true });
    });
  });

  const media = window.matchMedia('(prefers-color-scheme: light)');
  const handleSystemThemeChange = () => {
    if (!getStoredTheme()) {
      applyTheme(getSystemTheme());
    }
  };

  if (media.addEventListener) {
    media.addEventListener('change', handleSystemThemeChange);
  } else if (media.addListener) {
    media.addListener(handleSystemThemeChange);
  }
}
