import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settle } from './helpers';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

async function openTerminal(page: Page) {
  await page.getByRole('button', { name: 'Terminal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Terminal de bord' });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  return dialog;
}

test.describe('terminal', () => {
  test('opens from the HUD, runs commands and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const dialog = await openTerminal(page);
    const input = dialog.getByRole('textbox', { name: 'Commande' });
    await expect(input).toBeFocused();
    await input.fill('help');
    await input.press('Enter');
    await expect(dialog.getByText('Commandes disponibles :')).toBeVisible();
    await input.fill('nope');
    await input.press('Enter');
    await expect(dialog.getByText(/Commande inconnue : nope/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Terminal', exact: true })).toBeFocused();
  });

  test('opens with Ctrl+K and drives the site', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Terminal de bord' });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    const input = dialog.getByRole('textbox', { name: 'Commande' });
    await input.fill('theme');
    await input.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await input.fill('projects 1');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/projects\/gravite\/$/);
    await expect(dialog).toBeHidden();
  });

  test('has no WCAG A/AA violations when open', async ({ page }) => {
    await page.goto('/');
    await openTerminal(page);
    await settle(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('achievements', () => {
  test('Konami code unlocks a toast, but not while typing', async ({ page }) => {
    await page.goto('/');
    const toasts = page.locator('#toasts');
    await expect(toasts).toHaveAttribute('aria-live', 'polite');

    const dialog = await openTerminal(page);
    const input = dialog.getByRole('textbox', { name: 'Commande' });
    for (const key of KONAMI) await input.press(key);
    await expect(toasts.getByText(/Code secret/)).toHaveCount(0);
    await page.keyboard.press('Escape');

    await page.locator('h1').click();
    for (const key of KONAMI) await page.keyboard.press(key);
    await expect(toasts.getByText(/Code secret/)).toBeVisible();
  });

  test('progress persists across pages and counts terminal, project and language', async ({
    page,
  }) => {
    await page.goto('/');
    const progress = page.locator('header [data-achievements-progress]');
    await expect(progress).toHaveText(/^\d\/6$/);
    const dialog = await openTerminal(page);
    await expect(page.locator('#toasts').getByText(/Pilote/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('link', { name: 'Gravité, un mini-jeu de navigation spatiale' }).click();
    await expect(page.locator('#toasts').getByText(/Archiviste/)).toBeVisible();
    await page.getByRole('link', { name: 'Read this page in English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('orbite:achievements') ?? '{}'),
    );
    expect(stored.unlocked).toEqual(expect.arrayContaining(['terminal', 'project', 'lang']));
  });

  test('visiting all six planets unlocks the grand tour', async ({ page }) => {
    await page.goto('/');
    for (const id of ['about', 'skills', 'projects', 'passions', 'contact']) {
      await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await expect(page.locator(`[data-hud-section="${id}"][aria-current]`)).toHaveCount(1);
    }
    await expect(page.locator('#toasts').getByText(/Grand tour/)).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('hides controls that need it', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Terminal', exact: true })).toBeHidden();
    await expect(page.locator('header [data-achievements-progress]')).toBeHidden();
  });
});
