import { isLang, useTranslations } from '../i18n/utils';
import { defaultLang } from '../i18n/ui';
import { progress } from '../lib/achievements';
import { achievements, onUnlock, unlock, visitPlanet } from '../stores/achievements';
import { activeSection, visitedSections } from '../stores/section';
import { soundEnabled } from '../stores/sound';
import { listenKonami } from './konami';
import { collectFragment, fragments, FRAGMENT_EVENT } from '../stores/fragments';
import type { FragmentId } from '../lib/fragments';
import { GRAVITY_WIN_EVENT } from '../game/gravity/events';
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
  const found = fragments.get();
  for (const el of document.querySelectorAll<HTMLElement>('[data-fragments-progress]')) {
    el.textContent = `${found.length}/6`;
  }
  for (const button of document.querySelectorAll<HTMLElement>('[data-fragment]')) {
    if (found.includes(button.dataset.fragment as FragmentId)) button.dataset.collected = '';
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
    collectFragment('contact');
  });

  // Star fragments: hidden buttons, the terminal scan, Gravité wins, the Konami code.
  window.addEventListener(GRAVITY_WIN_EVENT, () => collectFragment('projects'));
  window.addEventListener(FRAGMENT_EVENT, (event) => {
    const { id, complete } = (event as CustomEvent<{ id: FragmentId; complete: boolean }>).detail;
    const tr = t();
    showToast(
      tr('fragment.toast').replace('{n}', String(fragments.get().length)),
      tr('fragment.name').replace('{body}', tr(`body.${id}`)),
    );
    if (complete) showToast(tr('journal.title'), tr('fragment.complete'));
    renderProgress();
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-lang-switch]')) unlock('lang');
    const fragment = target?.closest<HTMLElement>('[data-fragment]');
    if (fragment) collectFragment(fragment.dataset.fragment as FragmentId);
  });

  const onPage = () => {
    renderProgress();
    if (document.querySelector('[data-page="project"]')) unlock('project');
  };
  onPage();
  document.addEventListener('astro:page-load', onPage);
}
