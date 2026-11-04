export const SITE = {
  name: 'Maxime Garcia',
  github: 'https://github.com/Maxime-Garcia',
} as const;

/** Builds the document title: "Page · Maxime Garcia", or the site name alone. */
export function pageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} · ${SITE.name}` : SITE.name;
}
