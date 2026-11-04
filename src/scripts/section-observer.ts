import { sections, type SectionId } from '../i18n/ui';
import { activeSection, pickActive } from '../stores/section';

/** Tracks the visible planet and marks it in the HUD with aria-current. Returns a cleanup. */
export function startSectionObserver(): () => void {
  const elements = sections
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (elements.length === 0) return () => {};

  let frame = 0;
  const measure = () => {
    frame = 0;
    const tops = elements.map((el) => ({
      id: el.id as SectionId,
      top: el.getBoundingClientRect().top,
    }));
    const id = pickActive(tops, window.innerHeight);
    if (id) activeSection.set(id);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };

  const unsubscribe = activeSection.subscribe((id) => {
    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-hud-section]')) {
      if (link.dataset.hudSection === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  measure();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    unsubscribe();
  };
}
