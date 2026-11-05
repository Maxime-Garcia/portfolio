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

test.describe('hyperspace spread', () => {
  test('a fast fling lifts the HUD and spreads the content, then everything returns', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    await page.mouse.move(600, 400);
    const states: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 600);
      states.push(
        await page.evaluate(() => document.documentElement.style.getPropertyValue('--warp')),
      );
    }
    expect(states.some((v) => Number(v) > 0.2)).toBe(true);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('warping')), {
        timeout: 5000,
      })
      .toBe(false);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('never spreads', async ({ page }) => {
      await page.goto('/');
      await page.mouse.move(600, 400);
      for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 600);
      expect(await page.evaluate(() => document.querySelectorAll('.warp-block').length)).toBe(0);
    });
  });
});
