import { describe, expect, it } from 'vitest';
import { languages, sections, ui } from '../../src/i18n/ui';
import {
  alternates,
  getLangFromUrl,
  localizePath,
  otherLang,
  stripLocale,
  useTranslations,
} from '../../src/i18n/utils';

const site = new URL('https://example.com');

describe('ui strings', () => {
  it('has the same keys in every language, none empty', () => {
    const frKeys = Object.keys(ui.fr).sort();
    for (const lang of Object.keys(languages) as (keyof typeof languages)[]) {
      expect(Object.keys(ui[lang]).sort()).toEqual(frKeys);
      for (const value of Object.values(ui[lang])) expect(value.trim()).not.toBe('');
    }
  });

  it('names every section in both languages', () => {
    const t = useTranslations('en');
    expect(sections).toHaveLength(6);
    for (const id of sections) expect(t(`section.${id}`)).toBeTruthy();
  });
});

describe('getLangFromUrl', () => {
  it('defaults to French at the root', () => {
    expect(getLangFromUrl(new URL('/', site))).toBe('fr');
    expect(getLangFromUrl(new URL('/projects/a/', site))).toBe('fr');
  });

  it('reads the /en/ prefix', () => {
    expect(getLangFromUrl(new URL('/en/', site))).toBe('en');
    expect(getLangFromUrl(new URL('/en/projects/a/', site))).toBe('en');
  });

  it('ignores unknown prefixes', () => {
    expect(getLangFromUrl(new URL('/de/', site))).toBe('fr');
  });
});

describe('localizePath', () => {
  it('keeps French unprefixed', () => {
    expect(localizePath('fr', '/')).toBe('/');
    expect(localizePath('fr', '/en/')).toBe('/');
    expect(localizePath('fr', '/en/projects/a/')).toBe('/projects/a/');
  });

  it('prefixes English', () => {
    expect(localizePath('en', '/')).toBe('/en/');
    expect(localizePath('en', '/projects/a/')).toBe('/en/projects/a/');
    expect(localizePath('en', '/en/')).toBe('/en/');
  });

  it('strips only known non-default locales', () => {
    expect(stripLocale('/en/x/')).toBe('/x/');
    expect(stripLocale('/fr-page/')).toBe('/fr-page/');
  });
});

describe('alternates', () => {
  it('lists fr, en and x-default', () => {
    expect(alternates('/en/', site)).toEqual([
      { hreflang: 'fr', href: 'https://example.com/' },
      { hreflang: 'en', href: 'https://example.com/en/' },
      { hreflang: 'x-default', href: 'https://example.com/' },
    ]);
  });
});

describe('otherLang', () => {
  it('swaps the two languages', () => {
    expect(otherLang('fr')).toBe('en');
    expect(otherLang('en')).toBe('fr');
  });
});
