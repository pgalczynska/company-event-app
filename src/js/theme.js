const STORAGE_KEY = 'forteTrip.theme';

// null/absent = automatycznie wg systemu (obsługiwane samym CSS przez prefers-color-scheme)
export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

export function getEffectiveTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}
