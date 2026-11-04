import type { SectionId } from '../../i18n/ui';

export interface PlanetSpec {
  id: SectionId;
  position: [number, number, number];
  radius: number;
  bands: number;
  ring: boolean;
  /** Theme palette keys: base surface and accent. */
  base: 'surface' | 'ink';
  accent: 'plasma' | 'signal' | 'amp';
}

/** One planet per section, laid out along a gentle descending spiral. */
export const planets: readonly PlanetSpec[] = [
  {
    id: 'hero',
    position: [4, 0.5, 0],
    radius: 2.4,
    bands: 9,
    ring: true,
    base: 'surface',
    accent: 'plasma',
  },
  {
    id: 'about',
    position: [-3, -2, -22],
    radius: 1.6,
    bands: 14,
    ring: false,
    base: 'surface',
    accent: 'signal',
  },
  {
    id: 'skills',
    position: [5, 1.5, -44],
    radius: 2,
    bands: 6,
    ring: false,
    base: 'surface',
    accent: 'amp',
  },
  {
    id: 'projects',
    position: [-4, 2.5, -66],
    radius: 2.8,
    bands: 11,
    ring: true,
    base: 'surface',
    accent: 'signal',
  },
  {
    id: 'passions',
    position: [3.5, -1.5, -88],
    radius: 1.8,
    bands: 18,
    ring: false,
    base: 'surface',
    accent: 'plasma',
  },
  {
    id: 'contact',
    position: [-2, 0, -110],
    radius: 2.2,
    bands: 8,
    ring: false,
    base: 'surface',
    accent: 'amp',
  },
];

/** Where the camera sits for a planet: in front of it and shifted left, so the planet sits right of the text. */
export function cameraFor(
  spec: PlanetSpec,
  wide: boolean,
): { position: [number, number, number]; target: [number, number, number] } {
  const [x, y, z] = spec.position;
  // Bigger planets sit further right so they never cover the headline.
  const side = wide ? -(3 + spec.radius * 1.4) : 0;
  return {
    position: [x + side, y + 0.6, z + spec.radius * 3.6 + 4],
    target: [x + side, y, z],
  };
}
