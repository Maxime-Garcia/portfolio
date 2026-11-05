import { sections, type SectionId } from '../i18n/ui';

/** One star fragment per celestial body (= per section). */
export type FragmentId = SectionId;
export const fragmentIds: readonly FragmentId[] = sections;

/** How each fragment is found — used by `hint` and by tests. */
export const fragmentMechanics: Record<FragmentId, 'button' | 'scan' | 'gravity' | 'konami'> = {
  hero: 'button',
  about: 'button',
  skills: 'scan',
  projects: 'gravity',
  passions: 'button',
  contact: 'konami',
};

export function collect(
  found: readonly FragmentId[],
  id: FragmentId,
): { found: FragmentId[]; gained: boolean; complete: boolean } {
  if (found.includes(id))
    return { found: [...found], gained: false, complete: found.length === fragmentIds.length };
  const next = fragmentIds.filter((f) => f === id || found.includes(f));
  return { found: next, gained: true, complete: next.length === fragmentIds.length };
}

/** The first fragment still missing, in voyage order. */
export function nextMissing(found: readonly FragmentId[]): FragmentId | undefined {
  return fragmentIds.find((id) => !found.includes(id));
}

export function parseFragments(raw: string | null): FragmentId[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(data) ? fragmentIds.filter((id) => data.includes(id)) : [];
  } catch {
    return [];
  }
}

/** Celestial body names accepted by `go`, in both languages, to their section. */
export const bodyAliases: Record<string, SectionId> = {
  terre: 'hero',
  earth: 'hero',
  mars: 'about',
  jupiter: 'skills',
  saturne: 'projects',
  saturn: 'projects',
  nebuleuse: 'passions',
  nébuleuse: 'passions',
  nebula: 'passions',
  galaxie: 'contact',
  galaxy: 'contact',
};

export function resolveBody(name: string): SectionId | undefined {
  const key = name.toLowerCase();
  if ((sections as readonly string[]).includes(key)) return key as SectionId;
  return bodyAliases[key];
}
