// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { samePageHash } from '../../src/scripts/anchors';

const loc = (href: string) => new URL(href) as unknown as Location;
const link = (href: string) => {
  const a = document.createElement('a');
  a.href = href;
  return a;
};

describe('samePageHash', () => {
  it('returns the id for links to the current page', () => {
    expect(samePageHash(link('https://x.dev/#about'), loc('https://x.dev/'))).toBe('about');
    expect(samePageHash(link('https://x.dev/en/#skills'), loc('https://x.dev/en'))).toBe('skills');
    expect(samePageHash(link('https://x.dev/index.html#a'), loc('https://x.dev/'))).toBe('a');
  });

  it('ignores other pages, other origins and hashless links', () => {
    expect(samePageHash(link('https://x.dev/#about'), loc('https://x.dev/projects/a/'))).toBeNull();
    expect(samePageHash(link('https://y.dev/#about'), loc('https://x.dev/'))).toBeNull();
    expect(samePageHash(link('https://x.dev/'), loc('https://x.dev/'))).toBeNull();
  });
});
