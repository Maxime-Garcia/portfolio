import { intensityFor, scrollVelocity, smoothTowards } from '../stores/velocity';

/** Measures scroll speed every frame (works with Lenis or native scrolling). Returns a cleanup. */
export function startVelocityTracker(): () => void {
  let last = window.scrollY;
  let frame = 0;
  const loop = () => {
    const y = window.scrollY;
    scrollVelocity.pixelsPerFrame = y - last;
    last = y;
    scrollVelocity.intensity = smoothTowards(
      scrollVelocity.intensity,
      intensityFor(scrollVelocity.pixelsPerFrame),
    );
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(frame);
    scrollVelocity.pixelsPerFrame = 0;
    scrollVelocity.intensity = 0;
  };
}
