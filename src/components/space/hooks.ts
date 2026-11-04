import { useSyncExternalStore } from 'react';
import type { ReadableAtom } from 'nanostores';
import type { ThemeName } from './palette';

export function useStore<T>(store: ReadableAtom<T>): T {
  return useSyncExternalStore(
    (callback) => store.listen(callback),
    () => store.get(),
    () => store.get(),
  );
}

function subscribeMedia(query: string) {
  return (callback: () => void) => {
    const media = matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  };
}

export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => matchMedia(query).matches,
    () => false,
  );
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/** The <html data-theme> value, live. */
export function useTheme(): ThemeName {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'),
    () => 'dark',
  );
}
