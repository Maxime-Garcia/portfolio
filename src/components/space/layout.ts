import type { SectionId } from '../../i18n/ui';

export type BodyKind = 'earth' | 'planet' | 'nebula' | 'galaxy';

export interface BodySpec {
  id: SectionId;
  kind: BodyKind;
  position: [number, number, number];
  /** Visual radius: drives the camera distance and the distance fade. */
  radius: number;
  /** Texture name in public/textures/{hd,sd}/ (planets only). */
  texture?: 'mars' | 'jupiter' | 'saturn';
  ring?: boolean;
  /** Axial tilt in radians. */
  tilt?: number;
  /** Extra screen framing [x, y] in world units: positive y shows the body higher. */
  frame?: [number, number];
}

/**
 * One celestial body per section, a voyage outwards:
 * home planet → Mars → Jupiter → Saturn → a nebula → a whole galaxy.
 */
export const bodies: readonly BodySpec[] = [
  { id: 'hero', kind: 'earth', position: [4, 0.4, 0], radius: 2.4, tilt: 0.41 },
  {
    id: 'about',
    kind: 'planet',
    texture: 'mars',
    position: [-3, -2, -45],
    radius: 1.6,
    tilt: 0.44,
  },
  {
    id: 'skills',
    kind: 'planet',
    texture: 'jupiter',
    position: [5, 1.5, -90],
    radius: 3.2,
    tilt: 0.05,
  },
  {
    id: 'projects',
    kind: 'planet',
    texture: 'saturn',
    ring: true,
    position: [-4, 2.5, -135],
    radius: 2.6,
    tilt: 0.47,
  },
  { id: 'passions', kind: 'nebula', position: [3, 0.5, -185], radius: 6, frame: [0, 3.5] },
  { id: 'contact', kind: 'galaxy', position: [-2, 0, -240], radius: 7 },
];

/** Kept for callers that only need positions (tests, camera). */
export const planets = bodies;

/** Direction the sunlight comes from (world space): from the right, so night sides face the text. */
export const SUN_DIRECTION: [number, number, number] = [1, 0.3, 0.2];

/** Distance fade (distance to the body's surface): the active body is < 26 away, the next one ≥ 30. */
export const FADE_NEAR = 26;
export const FADE_FAR = 44;

/** 1 when close, 0 when far: bodies dissolve with distance so they never clutter the text. */
export function fadeFor(distanceToSurface: number): number {
  const t = Math.min(1, Math.max(0, (distanceToSurface - FADE_NEAR) / (FADE_FAR - FADE_NEAR)));
  return 1 - t * t * (3 - 2 * t);
}

/** Where the camera sits for a body: in front of it and shifted left, so it sits right of the text. */
export function cameraFor(
  spec: BodySpec,
  wide: boolean,
): { position: [number, number, number]; target: [number, number, number] } {
  const [x, y, z] = spec.position;
  const [frameX, frameY] = spec.frame ?? [0, 0];
  // Bigger bodies sit further right so they never cover the headline.
  const side = (wide ? -(3 + spec.radius * 1.4) : 0) - frameX;
  const lift = -frameY;
  return {
    position: [x + side, y + lift + 0.6, z + spec.radius * 3.6 + 4],
    target: [x + side, y + lift, z],
  };
}
