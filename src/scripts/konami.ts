export const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

/** True when the event comes from a place where typing must not be hijacked. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** Feeds keys one by one; returns true when the last keys typed are the full sequence. */
export function createKonamiMatcher(sequence: readonly string[] = KONAMI) {
  const recent: string[] = [];
  return (key: string): boolean => {
    recent.push(key.length === 1 ? key.toLowerCase() : key);
    if (recent.length > sequence.length) recent.shift();
    const matched = recent.length === sequence.length && recent.every((k, i) => k === sequence[i]);
    if (matched) recent.length = 0;
    return matched;
  };
}

export function listenKonami(onMatch: () => void): () => void {
  const match = createKonamiMatcher();
  const handler = (event: KeyboardEvent) => {
    if (isTypingTarget(event.target)) return;
    if (match(event.key)) onMatch();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
