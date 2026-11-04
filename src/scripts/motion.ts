import { startSectionObserver } from './section-observer';

let cleanups: (() => void)[] = [];
let generation = 0;

/** GSAP and Lenis load in their own chunk, off the critical path (see ADR 0008). */
async function start(): Promise<void> {
  stop();
  const current = generation;
  cleanups.push(startSectionObserver());
  const [{ startLenis }, { startTimelines }] = await Promise.all([
    import('../animations/lenis'),
    import('../animations/timeline'),
  ]);
  if (current !== generation) return; // the page changed while loading
  cleanups.push(startLenis(), startTimelines());
}

function stop(): void {
  generation += 1;
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
}

/** Bundled scripts run once under the ClientRouter: restart on every page, clean up before each swap. */
export function initMotion(): void {
  document.addEventListener('astro:page-load', () => void start());
  document.addEventListener('astro:before-swap', stop);
}
