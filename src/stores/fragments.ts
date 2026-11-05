import { atom } from 'nanostores';
import { collect as collectStep, parseFragments, type FragmentId } from '../lib/fragments';

const KEY = 'orbite:fragments';

function load(): FragmentId[] {
  try {
    return parseFragments(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export const fragments = atom<FragmentId[]>(typeof localStorage === 'undefined' ? [] : load());

export const FRAGMENT_EVENT = 'orbite:fragment';

/** Collects a fragment; announces it with a window event `{ id, complete }` when new. */
export function collectFragment(id: FragmentId): void {
  const { found, gained, complete } = collectStep(fragments.get(), id);
  if (!gained) return;
  fragments.set(found);
  try {
    localStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent(FRAGMENT_EVENT, { detail: { id, complete } }));
}
