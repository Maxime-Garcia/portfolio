import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page greets the universe', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Maxime Garcia/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello, universe');
});

test('home page has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
