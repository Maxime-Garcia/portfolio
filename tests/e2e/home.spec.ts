import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settle } from './helpers';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoAxeViolations(page: Page) {
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(results.violations).toEqual([]);
}

test.describe('home, French (root)', () => {
  test('has the French document and the six planets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page).toHaveTitle(/Maxime Garcia/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maxime Garcia');
    const map = page.getByRole('navigation', { name: 'Carte stellaire' });
    await expect(map.getByRole('link')).toHaveCount(6);
    for (const name of ['À propos', 'Compétences', 'Projets', 'Passions', 'Contact']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeAttached();
    }
  });

  test('declares hreflang alternates', async ({ page }) => {
    await page.goto('/');
    for (const lang of ['fr', 'en', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }
  });

  test('skip link moves focus to the content', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('switches to English', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Read this page in English' }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('home, English (/en/)', () => {
  test('has the English document', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('navigation', { name: 'Star map' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Skills' })).toBeAttached();
  });

  test('switches back to French', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'Lire cette page en français' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});

test.describe('themes', () => {
  test('toggle persists the light theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    const toggle = page.getByRole('button', { name: 'Thème clair' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('follows the system preference by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  for (const theme of ['dark', 'light'] as const) {
    for (const path of ['/', '/en/']) {
      test(`${path} has no WCAG A/AA violations in ${theme} theme`, async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoAxeViolations(page);
      });
    }
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('disables smooth scrolling', async ({ page }) => {
    await page.goto('/');
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe('auto');
  });
});
