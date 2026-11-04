import { atom } from 'nanostores';
import type { SectionId } from '../i18n/ui';
import {
  emptyState,
  parseState,
  unlock as unlockStep,
  visitPlanet as visitStep,
  type AchievementId,
  type GameState,
  type Transition,
} from '../lib/achievements';

const KEY = 'orbite:achievements';

function load(): GameState {
  try {
    return parseState(localStorage.getItem(KEY));
  } catch {
    return emptyState;
  }
}

export const achievements = atom<GameState>(
  typeof localStorage === 'undefined' ? emptyState : load(),
);

type Listener = (id: AchievementId) => void;
const listeners = new Set<Listener>();

/** Called once per newly unlocked achievement (toasts, sounds). */
export function onUnlock(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply({ state, gained }: Transition): void {
  if (state === achievements.get()) return;
  achievements.set(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage blocked: progress lasts for this visit */
  }
  for (const id of gained) for (const listener of listeners) listener(id);
}

export const unlock = (id: AchievementId) => apply(unlockStep(achievements.get(), id));
export const visitPlanet = (id: SectionId) => apply(visitStep(achievements.get(), id));
