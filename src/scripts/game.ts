import { isLang, useTranslations } from '../i18n/utils';
import { defaultLang } from '../i18n/ui';
import { progress } from '../lib/achievements';
import { achievements, onUnlock, unlock, visitPlanet } from '../stores/achievements';
import { activeSection, visitedSections } from '../stores/section';
import { soundEnabled } from '../stores/sound';
import { listenKonami } from './konami';
import { showToast } from './toasts';

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

function hyperdrive(): void {
  const root = document.documentElement;
  root.classList.remove('hyperdrive');
  void root.offsetWidth; // restart the CSS animation
  root.classList.add('hyperdrive');
  window.setTimeout(() => root.classList.remove('hyperdrive'), 1600);
}

/** Wires achievements, toasts and the Konami code. Call once. Terminal shortcuts: ./shortcuts.ts. */
export function initGame(): void {
  onUnlock((id) => {
    const tr = t();
    showToast(tr('ach.toast'), tr(`ach.${id}`));
    renderProgress();
  });

  // Replay planets seen before this module loaded, then follow live.
  for (const id of visitedSections) visitPlanet(id);
  activeSection.subscribe((id) => visitPlanet(id));
  soundEnabled.subscribe((on) => {
    if (on) unlock('sound');
  });

  listenKonami(() => {
    hyperdrive();
    unlock('konami');
  });

  document.addEventListener('click', (event) => {
    if ((event.target as Element | null)?.closest('[data-lang-switch]')) unlock('lang');
  });

  const onPage = () => {
    renderProgress();
    if (document.querySelector('[data-page="project"]')) unlock('project');
  };
  onPage();
  document.addEventListener('astro:page-load', onPage);
}
