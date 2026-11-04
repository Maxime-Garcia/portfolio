export const TERMINAL_EVENT = 'orbite:terminal';

export function openTerminal(): void {
  document.documentElement.dataset.terminal = 'requested';
  window.dispatchEvent(new Event(TERMINAL_EVENT));
}

/** Terminal entry points, wired at once (the rest of the game layer loads when idle). */
export function initShortcuts(): void {
  // Ctrl/Cmd+K: a modifier shortcut, so it cannot fire by accident (WCAG 2.1.4).
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openTerminal();
    }
  });
  document.addEventListener('click', (event) => {
    if ((event.target as Element | null)?.closest('[data-terminal-open]')) openTerminal();
  });
}
