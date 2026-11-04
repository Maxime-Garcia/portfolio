import { describe, expect, it } from 'vitest';
import { envelope, palette } from '../../src/audio/blips';
import { levelOf } from '../../src/audio/analyser';

describe('synth palette', () => {
  it('keeps every sound short and quiet', () => {
    for (const notes of Object.values(palette)) {
      for (const note of notes) {
        expect(note.at + note.duration).toBeLessThan(1);
        expect(note.gain).toBeLessThanOrEqual(0.25);
      }
    }
  });

  it('builds a fast-attack, decaying envelope', () => {
    const [start, peak, end] = envelope({ frequency: 440, at: 0.1, duration: 0.2, gain: 0.2 }, 1);
    expect(start).toEqual({ time: 1.1, value: 0.0001 });
    expect(peak.value).toBe(0.2);
    expect(peak.time).toBeCloseTo(1.108);
    expect(end).toEqual({ time: 1.3, value: 0.0001 });
    expect(envelope({ frequency: 440, at: 0, duration: 0.1 }, 0)[1].value).toBe(0.2);
  });
});

describe('levelOf', () => {
  it('normalises the average to 0..1', () => {
    expect(levelOf(new Uint8Array([]))).toBe(0);
    expect(levelOf(new Uint8Array([0, 0]))).toBe(0);
    expect(levelOf(new Uint8Array([255, 255]))).toBe(1);
    expect(levelOf(new Uint8Array([255, 0]))).toBeCloseTo(0.5);
  });
});
