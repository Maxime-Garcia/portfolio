import Lenis from 'lenis';
import { gsap } from 'gsap';
import { setScroller } from '../scripts/scroller';

/**
 * Smooth scroll driven by GSAP's ticker. Lenis honours prefers-reduced-motion
 * by itself (1:1 scroll, instant jumps). Anchor links are handled by ../scripts/anchors.ts,
 * not by Lenis, so the ClientRouter and Lenis never both react to the same click.
 * Returns a cleanup function.
 */
export function startLenis(): () => void {
  const lenis = new Lenis({ autoRaf: false });
  const update = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(update);
  gsap.ticker.lagSmoothing(0);
  setScroller((target) => lenis.scrollTo(target));
  return () => {
    setScroller(undefined);
    gsap.ticker.remove(update);
    lenis.destroy();
  };
}
