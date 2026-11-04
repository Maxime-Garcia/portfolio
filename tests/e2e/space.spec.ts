import { test, expect, type Page } from '@playwright/test';

const isSceneChunk = (url: string) => /SpaceScene|three|react-three/i.test(url);

/** Simulates a capable device; CI runners have 4 cores, which counts as a weak phone. */
async function strongDevice(page: Page, cores = 8) {
  await page.addInitScript((value) => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => value });
  }, cores);
}

test.describe('3D scene', () => {
  test.beforeEach(async ({ page }) => strongDevice(page));

  test('loads nothing 3D before the first intent', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (request) => {
      if (isSceneChunk(request.url())) requested.push(request.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(requested).toEqual([]);
    await expect(page.locator('#space canvas')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-space', 'ready');
  });

  test('ignites on the HUD button and stays decorative', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    // dispatchEvent: a real pointer move is itself an intent and would load the scene first.
    await page.getByRole('button', { name: 'Allumer les moteurs' }).dispatchEvent('click');
    await expect(page.locator('html')).toHaveAttribute('data-space', 'on', { timeout: 15_000 });
    await expect(page.locator('#space canvas')).toHaveCount(1);
    await expect(page.locator('#space')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByRole('button', { name: 'Allumer les moteurs' })).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('keeps the canvas across page swaps', async ({ page }) => {
    await page.goto('/');
    // dispatchEvent: a real pointer move is itself an intent and would load the scene first.
    await page.getByRole('button', { name: 'Allumer les moteurs' }).dispatchEvent('click');
    await expect(page.locator('#space canvas')).toHaveCount(1, { timeout: 15_000 });
    await page
      .locator('#space canvas')
      .evaluate((canvas) => canvas.setAttribute('data-marker', 'kept'));
    await page.getByRole('link', { name: 'Pipeline de livraison avec contrôle qualité' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Pipeline de livraison avec contrôle qualité',
    );
    await expect(page.locator('#space canvas')).toHaveAttribute('data-marker', 'kept');
  });

  test('stays off on a weak touch device', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 400, height: 800 },
    });
    const page = await context.newPage();
    await strongDevice(page, 4);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-space', 'off');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maxime Garcia');
    await context.close();
  });

  test.describe('without WebGL', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) {
          if (type.startsWith('webgl')) return null;
          return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
        } as typeof original;
      });
    });

    test('shows the complete page and no ignite button', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-space', 'off');
      await expect(page.getByRole('button', { name: 'Allumer les moteurs' })).toBeHidden();
      await page.mouse.move(10, 10);
      await page.mouse.wheel(0, 400);
      await expect(page.locator('#space canvas')).toHaveCount(0);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maxime Garcia');
      await expect(page.locator('main h2')).toHaveCount(5);
    });
  });
});
