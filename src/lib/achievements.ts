import { sections, type SectionId } from '../i18n/ui';

export const achievementIds = [
  'planets',
  'terminal',
  'konami',
  'sound',
  'lang',
  'project',
] as const;

export type AchievementId = (typeof achievementIds)[number];

export interface GameState {
  unlocked: AchievementId[];
  visited: SectionId[];
}

export const emptyState: GameState = { unlocked: [], visited: [] };

export interface Transition {
  state: GameState;
  /** Achievements unlocked by this step, to announce. */
  gained: AchievementId[];
}

export function unlock(state: GameState, id: AchievementId): Transition {
  if (state.unlocked.includes(id)) return { state, gained: [] };
  return { state: { ...state, unlocked: [...state.unlocked, id] }, gained: [id] };
}

/** Records a visited planet; visiting all six unlocks "planets". */
export function visitPlanet(state: GameState, id: SectionId): Transition {
  if (state.visited.includes(id)) return { state, gained: [] };
  const next = { ...state, visited: [...state.visited, id] };
  if (sections.every((section) => next.visited.includes(section))) return unlock(next, 'planets');
  return { state: next, gained: [] };
}

export function progress(state: GameState): { done: number; total: number } {
  return { done: state.unlocked.length, total: achievementIds.length };
}

/** Parses persisted state defensively: unknown ids and malformed data are dropped. */
export function parseState(raw: string | null): GameState {
  if (!raw) return emptyState;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return emptyState;
    const { unlocked, visited } = data as Partial<Record<keyof GameState, unknown>>;
    const keep = <T extends string>(value: unknown, allowed: readonly T[]): T[] =>
      Array.isArray(value)
        ? [...new Set(value.filter((v): v is T => allowed.includes(v as T)))]
        : [];
    return { unlocked: keep(unlocked, achievementIds), visited: keep(visited, sections) };
  } catch {
    return emptyState;
  }
}
