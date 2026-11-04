import { describe, expect, it } from 'vitest';
import { SITE, pageTitle } from '../../src/lib/site';

describe('pageTitle', () => {
  it('returns the site name when no page is given', () => {
    expect(pageTitle()).toBe(SITE.name);
  });

  it('returns the site name for a blank page title', () => {
    expect(pageTitle('   ')).toBe(SITE.name);
  });

  it('prefixes the page title', () => {
    expect(pageTitle('Projects')).toBe(`Projects · ${SITE.name}`);
  });
});
