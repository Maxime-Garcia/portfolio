import { Color } from 'three';
import type { ParticleData } from './Particles';
import { gaussian, seeded } from './random';

export interface GalaxyOptions {
  count: number;
  radius: number;
  arms: number;
  /** How much the arms wind around the core. */
  twist: number;
  inner: Color;
  outer: Color;
  /** Star-forming regions sprinkled along the arms. */
  glow: Color;
}

/**
 * Spiral galaxy: a dense glowing bulge, stars along winding arms (tighter near the arm centre),
 * and soft pink star-forming regions. Particles are sorted by role through their size.
 */
export function galaxy({
  count,
  radius,
  arms,
  twist,
  inner,
  outer,
  glow,
}: GalaxyOptions): ParticleData {
  const random = seeded(7);
  const bulge = Math.floor(count * 0.12);
  const regions = Math.floor(count * 0.008);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const color = new Color();
  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let z: number;
    if (i < bulge) {
      // Bulge: a squashed, very dense ball of old yellowish stars.
      const r = Math.pow(random(), 2) * radius * 0.22;
      const a = random() * Math.PI * 2;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      y = gaussian(random) * radius * 0.06 * (1 - r / (radius * 0.22));
      color
        .copy(inner)
        .lerp(new Color('#ffffff'), random() * 0.3)
        .multiplyScalar(0.55);
      sizes[i] = 0.4 + random() * 1.1;
    } else {
      const r = radius * (0.12 + Math.pow(random(), 1.3) * 0.88);
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const angle = arm + Math.log(1 + r) * twist * 3;
      // Stars concentrate on the arm's spine; scatter grows outwards.
      const spread = (0.08 + (r / radius) * 0.35) * radius * Math.pow(random(), 2.2);
      const off = random() * Math.PI * 2;
      x = Math.cos(angle) * r + Math.cos(off) * spread;
      z = Math.sin(angle) * r + Math.sin(off) * spread;
      y = gaussian(random) * radius * 0.025;
      const isRegion = i < bulge + regions;
      if (isRegion) {
        color.copy(glow).multiplyScalar(0.22);
        sizes[i] = 2.5 + random() * 3;
      } else {
        color.copy(inner).lerp(outer, Math.min(1, r / radius + gaussian(random) * 0.15));
        sizes[i] = 0.2 + random() * random() * 1.2;
      }
    }
    positions.set([x, y, z], i * 3);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  return { positions, colors, sizes };
}

export interface NebulaOptions {
  clouds: number;
  stars: number;
  radius: number;
  palette: readonly Color[];
}

/**
 * Nebula: very soft, large gas sprites laid along a few noisy tendrils (filaments read as
 * structure, not as a blob), plus embedded young stars. Additive blending turns overlaps into volume.
 */
export function nebula({ clouds, stars, radius, palette }: NebulaOptions): ParticleData {
  const random = seeded(11);
  const count = clouds + stars;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const color = new Color();
  const tendrils = 6;
  const perTendril = Math.ceil(clouds / tendrils);
  for (let t = 0; t < tendrils; t++) {
    // A random walk from near the centre outwards.
    // Tendrils start apart, so their roots do not pile up into a white-hot core.
    let px = gaussian(random) * radius * 0.6;
    let py = gaussian(random) * radius * 0.45;
    let pz = gaussian(random) * radius * 0.4;
    let heading = random() * Math.PI * 2;
    let pitch = gaussian(random) * 0.6;
    const step = (radius * 1.6) / perTendril;
    for (let k = 0; k < perTendril; k++) {
      const i = t * perTendril + k;
      if (i >= clouds) break;
      heading += gaussian(random) * 0.35;
      pitch += gaussian(random) * 0.15;
      px += Math.cos(heading) * Math.cos(pitch) * step;
      py += Math.sin(pitch) * step;
      pz += Math.sin(heading) * Math.cos(pitch) * step * 0.6;
      const progress = k / perTendril;
      const jitter = radius * 0.12 * (0.5 + progress);
      positions.set(
        [
          px + gaussian(random) * jitter,
          py + gaussian(random) * jitter,
          pz + gaussian(random) * jitter,
        ],
        i * 3,
      );
      color
        .copy(palette[t % palette.length])
        .lerp(palette[(t + 1) % palette.length], progress * random())
        .multiplyScalar(0.14 + random() * 0.16);
      colors.set([color.r, color.g, color.b], i * 3);
      // ~40–120 px on screen at the viewing distance: overlaps build volume without blowing out.
      sizes[i] = (4 + random() * 7) * (1.15 - progress * 0.5);
    }
  }
  for (let i = clouds; i < count; i++) {
    positions.set(
      [gaussian(random) * radius, gaussian(random) * radius * 0.7, gaussian(random) * radius * 0.6],
      i * 3,
    );
    color.set('#ffffff').lerp(palette[1], random() * 0.4);
    colors.set([color.r, color.g, color.b], i * 3);
    sizes[i] = 0.3 + random() * random() * 1.6;
  }
  return { positions, colors, sizes };
}
