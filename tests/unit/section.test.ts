import { describe, expect, it } from 'vitest';
import { activeSection, pickActive } from '../../src/stores/section';

describe('pickActive', () => {
  const tops = (values: number[]) => values.map((top, i) => ({ id: `s${i}`, top }));

  it('picks the last section whose top crossed the reading line', () => {
    expect(pickActive(tops([-900, -100, 200, 900]), 900)).toBe('s2');
  });

  it('falls back to the first section at the very top', () => {
    expect(pickActive(tops([400, 1200]), 900)).toBe('s0');
  });

  it('returns undefined without sections', () => {
    expect(pickActive([], 900)).toBeUndefined();
  });
});

describe('activeSection', () => {
  it('starts on the hero planet', () => {
    expect(activeSection.get()).toBe('hero');
  });
});

describe('visitedSections', () => {
  it('remembers every section that became active', async () => {
    const { activeSection, visitedSections } = await import('../../src/stores/section');
    activeSection.set('skills');
    activeSection.set('contact');
    expect([...visitedSections]).toEqual(expect.arrayContaining(['hero', 'skills', 'contact']));
  });
});
