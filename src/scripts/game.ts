import { isLang, useTranslations } from '../i18n/utils';
import { defaultLang } from '../i18n/ui';
import { progress } from '../lib/achievements';
import { achievements, onUnlock, unlock, visitPlanet } from '../stores/achievements';
import { activeSection } from '../stores/section';
import { soundEnabled } from '../stores/sound';
import { listenKonami } from './konami';
import { showToast } from './toasts';

const TERMINAL_EVENT = 'orbite:terminal';

function t() {
  const lang = document.documentElement.lang;
  return useTranslations(isLang(lang) ? lang : defaultLang);
}

function renderProgress(): void {
  const { done, total } = progress(achievements.get());
  for (const el of document.querySelectorAll<HTMLElement>('[data-achievements-progress]')) {
    el.textContent = `${done}/${total}`;
  }
}

export function openTerminal(): void {
  document.documentElement.dataset.terminal = 'requested';
  window.dispatchEvent(new Event(TERMINAL_EVENT));
}

function hyperdrive(): void {
  const root = document.documentElement;
  root.classList.remove('hyperdrive');
  void root.offsetWidth; // restart the CSS animation
  root.classList.add('hyperdrive');
  window.setTimeout(() => root.classList.remove('hyperdrive'), 1600);
}

/** Wires achievements, toasts, the Konami code and the terminal shortcut. Call once. */
export function initGame(): void {
  onUnlock((id) => {
    const tr = t();
    showToast(tr('ach.toast'), tr(`ach.${id}`));
    renderProgress();
  });

  activeSection.subscribe((id) => visitPlanet(id));
  soundEnabled.subscribe((on) => {
    if (on) unlock('sound');
  });

  listenKonami(() => {
    hyperdrive();
    unlock('konami');
  });

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
    if (target?.closest('[data-lang-switch]')) unlock('lang');
  });

  const onPage = () => {
    renderProgress();
    if (document.querySelector('[data-page="project"]')) unlock('project');
  };
  onPage();
  document.addEventListener('astro:page-load', onPage);
}
