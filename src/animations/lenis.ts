import Lenis from 'lenis';
import { gsap } from 'gsap';

/**
 * Smooth scroll driven by GSAP's ticker. Lenis honours prefers-reduced-motion
 * by itself (1:1 scroll, instant anchor jumps). Returns a cleanup function.
 */
export function startLenis(): () => void {
  const lenis = new Lenis({ autoRaf: false, anchors: { offset: -96 } });
  const update = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(update);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(update);
    lenis.destroy();
  };
}
