/** Deterministic pseudo-random (mulberry32): the sky looks the same on every visit. */
export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Roughly normal sample in [-1, 1] (sum of uniforms), for soft, centre-weighted clouds. */
export function gaussian(random: () => number) {
  return (random() + random() + random() - 1.5) / 1.5;
}
