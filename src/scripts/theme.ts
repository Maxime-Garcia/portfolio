export type Theme = 'dark' | 'light';

export function currentTheme(root: HTMLElement = document.documentElement): Theme {
  return root.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
}

/** Wires the HUD button. It stays hidden without JavaScript, since it could not work. */
export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button || button.dataset.ready) return;
  button.dataset.ready = 'true';
  button.hidden = false;
  const sync = () => button.setAttribute('aria-pressed', String(currentTheme() === 'light'));
  sync();
  button.addEventListener('click', () => {
    setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    sync();
  });
}
