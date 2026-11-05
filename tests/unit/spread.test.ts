import { describe, expect, it } from 'vitest';
import { sideFor, warpFor } from '../../src/animations/spread';

describe('hyperspace spread', () => {
  it('stays still while reading, spreads fully on a fling', () => {
    expect(warpFor(0)).toBe(0);
    expect(warpFor(0.35)).toBe(0);
    expect(warpFor(1)).toBe(1);
    expect(warpFor(0.7)).toBeGreaterThan(0.3);
  });

  it('sends blocks towards their side of the screen', () => {
    expect(sideFor(100, 1000)).toBeLessThan(-0.5);
    expect(sideFor(950, 1000)).toBeGreaterThan(0.5);
    expect(sideFor(490, 1000)).toBe(-0.6);
    expect(sideFor(510, 1000)).toBe(0.6);
  });
});
