export const SITE = {
  name: 'Maxime Garcia',
  github: 'https://github.com/Maxime-Garcia',
  // TODO(maxime): LinkedIn URL, then add it to `sameAs` below and to the contact links.
  ogImage: '/og.png',
} as const;

/** schema.org Person, from facts stated in PROJECT.md only. */
export function personJsonLd(url: string, jobTitle: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    url,
    jobTitle,
    knowsAbout: ['MuleSoft', 'API integration', 'RabbitMQ', 'Azure DevOps', 'CI/CD', 'Game design'],
    sameAs: [SITE.github],
  };
}

/** Builds the document title: "Page · Maxime Garcia", or the site name alone. */
export function pageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} · ${SITE.name}` : SITE.name;
}
