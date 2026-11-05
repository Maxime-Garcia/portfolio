import { test, expect, type Page } from '@playwright/test';

/** Counts AudioContext constructions, to prove nothing starts without a user action. */
async function trackAudioContexts(page: Page) {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    (window as unknown as { __audioContexts: number }).__audioContexts = 0;
    window.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        (window as unknown as { __audioContexts: number }).__audioContexts += 1;
      }
    };
  });
}

const contexts = (page: Page) =>
  page.evaluate(() => (window as unknown as { __audioContexts: number }).__audioContexts);

test.describe('sound', () => {
  test('is off by default and creates no AudioContext on its own', async ({ page }) => {
    await trackAudioContexts(page);
    await page.goto('/');
    await page.mouse.wheel(0, 1500);
    await page.locator('#passions').scrollIntoViewIfNeeded();
    const toggle = page.getByRole('button', { name: 'Son' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await contexts(page)).toBe(0);
  });

  test('starts only on the toggle, remembers the choice and unlocks an achievement', async ({
    page,
  }) => {
    await trackAudioContexts(page);
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Son' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => contexts(page)).toBe(1);
    await expect(page.locator('#toasts').getByText(/Ampli allumé/)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('orbite:sound'))).toBe('on');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Son' })).toHaveAttribute('aria-pressed', 'true');
    expect(await contexts(page)).toBe(0);
  });
});
