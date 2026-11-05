import { startSectionObserver } from './section-observer';
import { startVelocityTracker } from './warp';

let cleanups: (() => void)[] = [];
let generation = 0;

/** GSAP and Lenis load in their own chunk, off the critical path (see ADR 0008). */
async function start(): Promise<void> {
  stop();
  const current = generation;
  cleanups.push(startSectionObserver(), startVelocityTracker());
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [{ startLenis }, { startTimelines }, speedLines] = await Promise.all([
    import('../animations/lenis'),
    import('../animations/timeline'),
    reduced ? Promise.resolve(undefined) : import('../animations/speedlines'),
  ]);
  if (current !== generation) return; // the page changed while loading
  cleanups.push(startLenis(), startTimelines());
  // Anime speed lines while scrolling fast (never under reduced motion).
  if (speedLines) cleanups.push(speedLines.startSpeedLines());
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
