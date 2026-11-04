import type { Lang } from '../i18n/ui';
import { localizePath } from '../i18n/utils';
import type { ProjectData } from './schemas';

/** "fr/exemple-api" → { lang: "fr", slug: "exemple-api" }. */
export function parseProjectId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  if ((lang !== 'fr' && lang !== 'en') || rest.length === 0) {
    throw new Error(`Invalid project id "${id}": expected "<fr|en>/<slug>"`);
  }
  return { lang, slug: rest.join('/') };
}

export function projectPath(lang: Lang, slug: string): string {
  return localizePath(lang, `/projects/${slug}/`);
}

/** Most recent first, then by title. */
export function sortProjects<T extends { data: Pick<ProjectData, 'year' | 'title'> }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

/** Tags used by at least one project, in the canonical order of `order`. */
export function usedTags<T extends string>(
  items: { data: { tags: readonly T[] } }[],
  order: readonly T[],
): T[] {
  const used = new Set(items.flatMap((item) => item.data.tags));
  return order.filter((tag) => used.has(tag));
}
