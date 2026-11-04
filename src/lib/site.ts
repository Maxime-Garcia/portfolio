export const SITE = {
  name: 'Maxime Garcia',
  role: 'Integration developer · MuleSoft',
  description:
    'Portfolio of Maxime Garcia — integration developer at CGI, MuleSoft expert, game designer and guitarist.',
  locale: 'en',
} as const;

/** Builds the document title: "Page · Maxime Garcia", or the site name alone. */
export function pageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} · ${SITE.name}` : SITE.name;
}
