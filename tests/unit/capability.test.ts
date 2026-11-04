import { describe, expect, it } from 'vitest';
import { canRender3D, dprRange } from '../../src/lib/capability';
import { cameraFor, planets } from '../../src/components/space/layout';
import { sections } from '../../src/i18n/ui';

const desktop = { webgl: true, saveData: false, cores: 8, memory: 8, coarsePointer: false };

describe('canRender3D', () => {
  it('renders on a capable desktop', () => {
    expect(canRender3D(desktop)).toBe(true);
  });

  it('skips without WebGL or with Save-Data', () => {
    expect(canRender3D({ ...desktop, webgl: false })).toBe(false);
    expect(canRender3D({ ...desktop, saveData: true })).toBe(false);
  });

  it('skips weak touch devices but keeps strong ones', () => {
    expect(canRender3D({ ...desktop, coarsePointer: true, cores: 4 })).toBe(false);
    expect(canRender3D({ ...desktop, coarsePointer: true, memory: 2 })).toBe(false);
    expect(canRender3D({ ...desktop, coarsePointer: true, cores: 8, memory: 6 })).toBe(true);
    expect(
      canRender3D({ ...desktop, coarsePointer: true, cores: undefined, memory: undefined }),
    ).toBe(true);
  });
});

describe('dprRange', () => {
  it('caps the pixel ratio lower on touch devices', () => {
    expect(dprRange(true)).toEqual([1, 1.5]);
    expect(dprRange(false)).toEqual([1, 2]);
  });
});

describe('planet layout', () => {
  it('has one planet per section, in order', () => {
    expect(planets.map((p) => p.id)).toEqual([...sections]);
  });

  it('keeps the draw-call budget small (planets + rings + stars + nebula < 100)', () => {
    const rings = planets.filter((p) => p.ring).length;
    expect(planets.length + rings + 2).toBeLessThan(100);
  });

  it('places the camera in front of each planet, shifted on wide screens', () => {
    for (const spec of planets) {
      const wide = cameraFor(spec, true);
      const narrow = cameraFor(spec, false);
      expect(wide.position[2]).toBeGreaterThan(spec.position[2]);
      expect(wide.target[0]).toBeLessThan(narrow.target[0]);
    }
  });
});
