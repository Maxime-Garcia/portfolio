/** A project matches when "all" is active or when it carries the active tag. */
export function matchesFilter(projectTags: readonly string[], active: string): boolean {
  return active === 'all' || projectTags.includes(active);
}

export function formatCount(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

export function initFilters(): void {
  const root = document.querySelector<HTMLElement>('[data-filters]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  root.hidden = false;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-project]')];
  const counter = root.querySelector<HTMLElement>('[data-filter-count]');
  const template = root.dataset.countTemplate ?? '{count}';

  const apply = (active: string) => {
    let visible = 0;
    for (const card of cards) {
      const show = matchesFilter((card.dataset.tags ?? '').split(' '), active);
      card.hidden = !show;
      if (show) visible += 1;
    }
    for (const button of buttons)
      button.setAttribute('aria-pressed', String(button.dataset.filter === active));
    if (counter) counter.textContent = formatCount(template, visible);
  };

  for (const button of buttons)
    button.addEventListener('click', () => apply(button.dataset.filter ?? 'all'));
  apply('all');
}
