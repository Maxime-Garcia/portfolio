/**
 * Scene entrance: every body fades in together once textures are ready, instead of popping.
 * `start` is set by <IntroClock/> (mounted inside the Suspense boundary, so after loading).
 */
export const intro = { start: -1, duration: 1.8 };

/** 0 → 1 over `duration` seconds after the scene became ready (smoothstep). */
export function introFactor(elapsed: number): number {
  if (intro.start < 0) return 0;
  const t = Math.min(1, Math.max(0, (elapsed - intro.start) / intro.duration));
  return t * t * (3 - 2 * t);
}
