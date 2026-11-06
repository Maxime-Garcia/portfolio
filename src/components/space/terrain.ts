import { BufferAttribute, Color, IcosahedronGeometry, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Deterministic 3D value noise + fbm (no dependency), for the campfire world's relief. */
function hash(x: number, y: number, z: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}

function noise(x: number, y: number, z: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const s = (t: number) => t * t * (3 - 2 * t);
  const [u, v, w] = [s(fx), s(fy), s(fz)];
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const corner = (dx: number, dy: number, dz: number) => hash(ix + dx, iy + dy, iz + dz);
  return lerp(
    lerp(lerp(corner(0, 0, 0), corner(1, 0, 0), u), lerp(corner(0, 1, 0), corner(1, 1, 0), u), v),
    lerp(lerp(corner(0, 0, 1), corner(1, 0, 1), u), lerp(corner(0, 1, 1), corner(1, 1, 1), u), v),
    w,
  );
}

export function fbm(p: Vector3, octaves = 5) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(p.x * frequency, p.y * frequency, p.z * frequency);
    frequency *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

/** Surface direction for a latitude/longitude (radians). */
export function direction(lat: number, lon: number) {
  return new Vector3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
}

export interface Clearing {
  dir: Vector3;
  /** Angular radius (radians) kept flat. */
  size: number;
}

export const WATER_LEVEL = -0.02;

/** Height (fraction of the radius) of the terrain at a unit direction; clearings are flattened. */
export function heightAt(dir: Vector3, clearings: readonly Clearing[]) {
  let h =
    (fbm(dir.clone().multiplyScalar(2.4)) - 0.5) * 0.16 +
    (fbm(dir.clone().multiplyScalar(7)) - 0.5) * 0.03;
  for (const clearing of clearings) {
    const angle = dir.angleTo(clearing.dir);
    if (angle < clearing.size * 1.6) {
      const t = Math.min(1, Math.max(0, (angle - clearing.size) / (clearing.size * 0.6)));
      h = h * t + 0.012 * (1 - t);
    }
  }
  return Math.max(h, WATER_LEVEL);
}

const palette = {
  water: new Color('#2f6f8f'),
  shore: new Color('#b89e6a'),
  grass: new Color('#3f7a3a'),
  meadow: new Color('#6a9a45'),
  rock: new Color('#7a6f66'),
  peak: new Color('#d8d2c4'),
  path: new Color('#8a6440'),
};

/**
 * The campfire world's ground: a subdivided icosphere displaced by fbm relief, coloured by altitude
 * (lake, shore, grass, meadows, cliffs, pale summits), with flat clearings for the camp and the rocket.
 */
export function terrain(radius: number, clearings: readonly Clearing[], detail = 26) {
  // Indexed, finely subdivided sphere: smooth normals instead of big facets.
  const base = new IcosahedronGeometry(radius, detail);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geometry = mergeVertices(base);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const v = new Vector3();
  const c = new Color();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i).normalize();
    const h = heightAt(v, clearings);
    const near = Math.min(...clearings.map((clearing) => v.angleTo(clearing.dir) / clearing.size));
    if (h <= WATER_LEVEL + 0.0005) c.copy(palette.water);
    else if (h < WATER_LEVEL + 0.012) c.copy(palette.shore);
    else if (near < 1.1) c.copy(palette.path).lerp(palette.meadow, Math.max(0, near - 0.6) * 2);
    else if (h < 0.03) c.copy(palette.grass).lerp(palette.meadow, fbm(v.clone().multiplyScalar(9)));
    else if (h < 0.055) c.copy(palette.meadow).lerp(palette.rock, (h - 0.03) / 0.025);
    else c.copy(palette.rock).lerp(palette.peak, Math.min(1, (h - 0.055) / 0.02));
    colors.set([c.r, c.g, c.b], i * 3);
    v.multiplyScalar(radius * (1 + h));
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
