import { defaultLang, languages, ui, type Lang, type UiKey } from './ui';

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/** Reads the language from the first path segment; FR (unprefixed) otherwise. */
export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  return isLang(segment) ? segment : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key];
  };
}

/** Removes the locale prefix: "/en/projects/" → "/projects/". */
export function stripLocale(pathname: string): string {
  const [, segment, ...rest] = pathname.split('/');
  if (isLang(segment) && segment !== defaultLang) return `/${rest.join('/')}`;
  return pathname;
}

/** Builds the path of `pathname` in `lang`: FR at the root, others under "/<lang>". */
export function localizePath(lang: Lang, pathname: string): string {
  const bare = stripLocale(pathname);
  return lang === defaultLang ? bare : `/${lang}${bare === '/' ? '/' : bare}`;
}

/** Other language than `lang` (the site has exactly two). */
export function otherLang(lang: Lang): Lang {
  return lang === 'fr' ? 'en' : 'fr';
}

export interface Alternate {
  hreflang: Lang | 'x-default';
  href: string;
}

/** hreflang alternates for a page, including x-default (FR). */
export function alternates(pathname: string, site: URL): Alternate[] {
  const langs = Object.keys(languages) as Lang[];
  const links: Alternate[] = langs.map((lang) => ({
    hreflang: lang,
    href: new URL(localizePath(lang, pathname), site).href,
  }));
  links.push({
    hreflang: 'x-default',
    href: new URL(localizePath(defaultLang, pathname), site).href,
  });
  return links;
}
