export const TERMINAL_EVENT = 'orbite:terminal';

export const GAME_EVENT = 'orbite:game';

/** Loads and opens the Gravité mini-game (its code is fetched on first use only). */
export function openGame(): void {
  void import('../game/gravity/ui').then(({ openGravityGame }) => openGravityGame());
}

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
    const target = event.target as Element | null;
    if (target?.closest('[data-terminal-open]')) openTerminal();
    if (target?.closest('[data-game-open]')) openGame();
  });
  window.addEventListener(GAME_EVENT, openGame);
}
