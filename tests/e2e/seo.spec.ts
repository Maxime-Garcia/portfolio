import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settle } from './helpers';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('seo', () => {
  test('home declares Open Graph, Twitter and a Person JSON-LD', async ({ page }) => {
    await page.goto('/en/');
    const meta = (selector: string) => page.locator(selector).first().getAttribute('content');
    expect(await meta('meta[property="og:type"]')).toBe('profile');
    expect(await meta('meta[property="og:locale"]')).toBe('en_US');
    expect(await meta('meta[property="og:image"]')).toMatch(/^https:\/\/.+\/og\.png$/);
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const person = JSON.parse(json ?? '{}');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Maxime Garcia');
    // The employer is deliberately not published.
    expect(person.worksFor).toBeUndefined();
  });

  test('project pages are articles without a Person block', async ({ page }) => {
    await page.goto('/projects/gravite/');
    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article');
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      /\/en\/projects\/gravite\/$/,
    );
  });

  test('robots.txt points to the sitemap, which lists hreflang alternates', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Sitemap: https:\/\/.+\/sitemap-index\.xml/);
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('hreflang="en"');
    expect(sitemap).toContain('/en/projects/gravite/');
    expect(sitemap).not.toContain('404');
  });
});

test.describe('404', () => {
  test('is themed, bilingual, not indexable and accessible', async ({ page }) => {
    const response = await page.goto('/nowhere-in-the-galaxy/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Signal perdu');
    await expect(page.getByRole('heading', { level: 2, name: 'Signal lost' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.getByRole('link', { name: 'Retour à la base' })).toHaveAttribute('href', '/');
    await settle(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
  });
});
