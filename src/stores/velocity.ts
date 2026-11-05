/**
 * Scroll speed, written once per frame by ../scripts/warp.ts and read by the speed lines,
 * the 3D camera and the wind sound. Plain mutable object: no re-render at 60 fps.
 * `intensity` is 0 at rest and 1 at a fast fling, smoothed.
 */
export const scrollVelocity = { pixelsPerFrame: 0, intensity: 0 };

/** Maps a raw speed (px/frame) to 0..1, ignoring slow reading scrolls. */
export function intensityFor(pixelsPerFrame: number): number {
  const speed = Math.abs(pixelsPerFrame);
  return Math.min(1, Math.max(0, (speed - 6) / 55));
}

/** Exponential approach towards a target: fast attack, slower release. */
export function smoothTowards(current: number, target: number): number {
  const rate = target > current ? 0.35 : 0.08;
  return current + (target - current) * rate;
}
