import { test, expect } from '@playwright/test';

test.describe('regressions', () => {
  test('HUD controls survive a language switch', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Son' })).toBeVisible();
    await page.locator('[data-lang-switch]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: 'Sound' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Terminal', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/(^|\s)js(\s|$)/);
  });

  test('the 3D layer stays visible across page swaps', async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }),
    );
    await page.goto('/');
    await page.getByRole('button', { name: 'Allumer les moteurs' }).dispatchEvent('click');
    await expect(page.locator('html')).toHaveAttribute('data-space', 'on', { timeout: 15_000 });
    await page.locator('[data-lang-switch]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('data-space', 'on');
  });

  test('the wheel scrolls the terminal log, not the page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: 'Commande' });
    await expect(input).toBeVisible({ timeout: 15_000 });
    for (let i = 0; i < 4; i++) {
      await input.fill('help');
      await input.press('Enter');
    }
    const log = page.getByRole('log');
    await log.evaluate((el) => (el.scrollTop = 0));
    const pageY = await page.evaluate(() => window.scrollY);
    await log.hover();
    await page.mouse.wheel(0, 400);
    await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageY);
  });
});
