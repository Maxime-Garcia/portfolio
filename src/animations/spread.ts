import { scrollVelocity } from '../stores/velocity';

/** Only fast flings spread the UI; reading-speed scrolls never move the content. */
export function warpFor(intensity: number): number {
  const t = Math.min(1, Math.max(0, (intensity - 0.35) / 0.65));
  return t * t * (3 - 2 * t);
}

/** -1 (left) … 1 (right): which way a block flies off, from where its centre sits on screen. */
export function sideFor(centerX: number, viewportWidth: number): number {
  const side = (centerX - viewportWidth / 2) / (viewportWidth / 2);
  if (Math.abs(side) < 0.12) return centerX < viewportWidth / 2 ? -0.6 : 0.6;
  return Math.max(-1, Math.min(1, side));
}

/** Blocks that fly apart: hero lines and each revealed block, or a grid's cells rather than the grid. */
function targets(): HTMLElement[] {
  const result: HTMLElement[] = [];
  for (const parent of document.querySelectorAll<HTMLElement>('main #hero, main [data-reveal]')) {
    for (const child of parent.children) {
      if (!(child instanceof HTMLElement)) continue;
      const grid = child.matches('.grid')
        ? child
        : child.querySelector<HTMLElement>(':scope > .grid');
      if (grid && grid.children.length > 1) result.push(...([...grid.children] as HTMLElement[]));
      else result.push(child);
    }
  }
  return result;
}

/**
 * Hyperspace "spread": on a fast fling, the HUD lifts away and content blocks fly apart
 * towards their side of the screen, revealing the speed lines and the 3D behind.
 * Driven by one CSS variable (--warp) on <html>; never started under reduced motion.
 */
export function startSpread(): () => void {
  const root = document.documentElement;
  let blocks: HTMLElement[] = [];
  let frame = 0;
  let current = 0;

  const measure = () => {
    blocks = targets();
    for (const block of blocks) {
      block.classList.add('warp-block');
      const rect = block.getBoundingClientRect();
      block.style.setProperty(
        '--side',
        sideFor(rect.left + rect.width / 2, window.innerWidth).toFixed(2),
      );
    }
  };
  measure();
  window.addEventListener('resize', measure);

  const loop = () => {
    frame = requestAnimationFrame(loop);
    const warp = warpFor(scrollVelocity.intensity);
    if (Math.abs(warp - current) < 0.002) return;
    // Sides are measured at rest only (transforms would skew them).
    if (current === 0 && warp > 0) measure();
    current = warp < 0.002 ? 0 : warp;
    root.style.setProperty('--warp', current.toFixed(3));
    root.classList.toggle('warping', current > 0);
  };
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', measure);
    root.style.removeProperty('--warp');
    root.classList.remove('warping');
    for (const block of blocks) block.classList.remove('warp-block');
  };
}
