import { test, expect, type Page } from '@playwright/test';

/** Distance between the section top and the bottom of the HUD, once scrolling settles. */
async function settledTop(page: Page, id: string) {
  let previous = Number.NaN;
  for (let i = 0; i < 40; i++) {
    const top = await page
      .locator(`#${id}`)
      .evaluate((el) => Math.round(el.getBoundingClientRect().top));
    if (top === previous) return top;
    previous = top;
    await page.waitForTimeout(100);
  }
  return previous;
}

test.describe('star map anchors', () => {
  test('every HUD link lands on its section, click after click', async ({ page }) => {
    await page.goto('/');
    for (const id of ['skills', 'projects', 'about', 'contact', 'passions']) {
      await page.locator(`[data-hud-section="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const top = await settledTop(page, id);
      expect(Math.abs(top - 96), `${id} top=${top}`).toBeLessThanOrEqual(4);
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
    await page.locator('[data-hud-section="hero"]').click();
    expect(Math.abs(await settledTop(page, 'hero'))).toBeLessThanOrEqual(2);
  });

  test('hero calls to action reach their sections', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'Open a frequency' }).click();
    expect(Math.abs((await settledTop(page, 'contact')) - 96)).toBeLessThanOrEqual(4);
  });

  test('from a project page, the map goes back to the right section', async ({ page }) => {
    await page.goto('/projects/gravite/');
    await page.locator('[data-hud-section="skills"]').click();
    await expect(page).toHaveURL(/\/#skills$/);
    await expect(page.locator('#skills h2')).toBeInViewport();
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('jumps straight to the section', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-hud-section="passions"]').click();
      expect(Math.abs((await settledTop(page, 'passions')) - 96)).toBeLessThanOrEqual(4);
    });
  });
});
