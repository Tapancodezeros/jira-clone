// theme helpers: persistent theme and DOM application
export function getTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
  } catch (e) {
    // ignore localStorage errors
  }
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  try {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  } catch (e) {
    // ignore
  }
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function initTheme() {
  applyTheme(getTheme());
}
