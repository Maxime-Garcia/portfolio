import { describe, expect, it } from 'vitest';
import {
  collect,
  fragmentIds,
  fragmentMechanics,
  nextMissing,
  parseFragments,
  resolveBody,
} from '../../src/lib/fragments';

describe('fragments', () => {
  it('collects once, in voyage order, and reports completion', () => {
    const first = collect([], 'skills');
    expect(first).toEqual({ found: ['skills'], gained: true, complete: false });
    expect(collect(first.found, 'skills').gained).toBe(false);
    const all = fragmentIds.reduce<readonly (typeof fragmentIds)[number][]>(
      (found, id) => collect(found, id).found,
      [],
    );
    expect(collect(all.slice(0, -1), 'contact')).toMatchObject({ gained: true, complete: true });
    expect(collect(all, 'hero')).toMatchObject({ gained: false, complete: true });
  });

  it('points to the next missing fragment', () => {
    expect(nextMissing([])).toBe('hero');
    expect(nextMissing(['hero', 'about'])).toBe('skills');
    expect(nextMissing(fragmentIds)).toBeUndefined();
  });

  it('parses persisted fragments defensively', () => {
    expect(parseFragments('["about","nope","hero"]')).toEqual(['hero', 'about']);
    expect(parseFragments('{}')).toEqual([]);
    expect(parseFragments('oops')).toEqual([]);
    expect(parseFragments(null)).toEqual([]);
  });

  it('resolves body names in both languages', () => {
    expect(resolveBody('Saturne')).toBe('projects');
    expect(resolveBody('nebula')).toBe('passions');
    expect(resolveBody('contact')).toBe('contact');
    expect(resolveBody('pluto')).toBeUndefined();
  });

  it('has a mechanic for every fragment', () => {
    expect(Object.keys(fragmentMechanics).sort()).toEqual([...fragmentIds].sort());
  });
});
