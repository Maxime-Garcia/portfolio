import { test, expect } from '@playwright/test';

test.describe('motion', () => {
  test('reveals sections when scrolled into view', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/motion-ready/);
    const reveal = page.locator('#contact [data-reveal]').first();
    await reveal.scrollIntoViewIfNeeded();
    await expect.poll(() => reveal.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  });

  test('marks the visible planet in the star map', async ({ page }) => {
    await page.goto('/');
    const map = page.getByRole('navigation', { name: 'Carte stellaire' });
    await expect(map.locator('[aria-current="location"]')).toHaveAttribute(
      'data-hud-section',
      'hero',
    );
    await page.locator('#skills').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect(map.locator('[aria-current="location"]')).toHaveAttribute(
      'data-hud-section',
      'skills',
    );
  });

  test('client router keeps working across pages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.getByRole('link', { name: 'Pipeline de livraison avec contrôle qualité' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Pipeline de livraison avec contrôle qualité',
    );
    await page.getByRole('link', { name: /Retour aux projets/ }).click();
    await expect(page.locator('html')).toHaveClass(/motion-ready/);
    await page.getByRole('button', { name: 'Thème clair' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('reduced motion variant', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows everything at once, without hidden states', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/(^|\s)motion(\s|$)/);
    const opacities = await page
      .locator('[data-intro], [data-reveal]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities.every((value) => value === '1')).toBe(true);
    const animations = await page.evaluate(() => document.getAnimations().length);
    expect(animations).toBe(0);
  });

  test('anchor links jump instead of gliding', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-hud-section="contact"]').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  });
});
