import { atom } from 'nanostores';
import type { SectionId } from '../i18n/ui';

/** The planet currently in view. Drives the HUD (and, later, the 3D camera). */
export const activeSection = atom<SectionId>('hero');

/**
 * Every section seen since the page loaded, kept by this eager module so that
 * listeners loaded later (the idle-loaded game layer) can replay them.
 */
export const visitedSections = new Set<SectionId>();
activeSection.subscribe((id) => visitedSections.add(id));

/**
 * Picks the section whose top edge is closest above the "reading line"
 * (a third of the viewport), from a list of measured tops.
 */
export function pickActive<T extends string>(
  tops: { id: T; top: number }[],
  viewport: number,
): T | undefined {
  const line = viewport / 3;
  let best: T | undefined;
  for (const { id, top } of tops) if (top <= line) best = id;
  return best ?? tops[0]?.id;
}
