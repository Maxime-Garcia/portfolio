import { describe, expect, it, vi } from 'vitest';
import { intensityFor, smoothTowards } from '../../src/stores/velocity';
import { windFor } from '../../src/audio/wind';
import { drawSpeedLines } from '../../src/animations/speedlines';

describe('scroll intensity', () => {
  it('ignores reading-speed scrolls and saturates on a fling', () => {
    expect(intensityFor(0)).toBe(0);
    expect(intensityFor(5)).toBe(0);
    expect(intensityFor(-200)).toBe(1);
    expect(intensityFor(33.5)).toBeCloseTo(0.5);
  });

  it('attacks fast and releases slowly', () => {
    const up = smoothTowards(0, 1);
    const down = smoothTowards(1, 0);
    expect(up).toBeGreaterThan(1 - down);
  });
});

describe('wind', () => {
  it('is silent at rest and brighter when fast', () => {
    expect(windFor(0).gain).toBe(0);
    expect(windFor(1).frequency).toBeGreaterThan(windFor(0.2).frequency);
    expect(windFor(5)).toEqual(windFor(1));
  });
});

describe('speed lines', () => {
  const context = () =>
    ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
      globalAlpha: 1,
    }) as unknown as CanvasRenderingContext2D & { fill: ReturnType<typeof vi.fn> };

  it('draws nothing at rest and many wedges when fast', () => {
    const idle = context();
    drawSpeedLines(idle, 100, 100, 0, '#fff', () => 0.5);
    expect(idle.fill).not.toHaveBeenCalled();
    const fast = context();
    drawSpeedLines(fast, 100, 100, 1, '#fff', () => 0.5);
    expect(fast.fill.mock.calls.length).toBeGreaterThan(50);
  });
});
