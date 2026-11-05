import { test, expect } from '@playwright/test';

test.describe('warp scroll', () => {
  test('adds a decorative speed-lines layer', async ({ page }) => {
    await page.goto('/');
    const lines = page.locator('canvas.speed-lines');
    await expect(lines).toHaveCount(1);
    await expect(lines).toHaveAttribute('aria-hidden', 'true');
    await expect(lines).toHaveCSS('pointer-events', 'none');
  });

  test('no wind or audio context without a user action, even scrolling', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('orbite:sound', 'on');
      const Original = window.AudioContext;
      (window as unknown as { __n: number }).__n = 0;
      window.AudioContext = class extends Original {
        constructor(...args: ConstructorParameters<typeof AudioContext>) {
          super(...args);
          (window as unknown as { __n: number }).__n += 1;
        }
      };
    });
    await page.goto('/');
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __n: number }).__n)).toBe(0);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('has no speed lines', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);
      await expect(page.locator('canvas.speed-lines')).toHaveCount(0);
    });
  });
});
