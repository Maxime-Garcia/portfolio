import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
const stored = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('orbite:fragments') ?? '[]') as string[]);

async function terminal(page: Page, command: string) {
  await page.keyboard.press('Control+k');
  const input = page.getByRole('textbox', { name: 'Commande' });
  await expect(input).toBeVisible({ timeout: 15_000 });
  await input.fill(command);
  await input.press('Enter');
  return page.getByRole('dialog', { name: 'Terminal de bord' });
}

test.describe('star fragments', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');

  test('hidden buttons, the Jupiter scan and the Konami code collect fragments', async ({
    page,
  }) => {
    await page.goto('/');
    const progress = page.locator('[data-fragments-progress]');
    await expect(progress).toHaveText('0/6');

    await page.locator('#hero').getByRole('button', { name: 'Fragment d’étoile' }).click();
    await expect(page.locator('#toasts').getByText('Fragment de la Terre')).toBeVisible();
    await expect(page.locator('#hero [data-fragment]')).toBeHidden();

    await page.locator('#about').getByRole('button', { name: 'Fragment d’étoile' }).click();
    await page.locator('#passions').getByRole('button', { name: 'Fragment d’étoile' }).click();

    await page.locator('#skills').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect(page.locator('[data-hud-section="skills"][aria-current]')).toHaveCount(1);
    const dialog = await terminal(page, 'scan');
    await expect(dialog.getByText('Anomalie détectée')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.locator('h1').click();
    for (const key of KONAMI) await page.keyboard.press(key);
    await expect
      .poll(() => stored(page))
      .toEqual(['hero', 'about', 'skills', 'passions', 'contact']);
    await expect(progress).toHaveText('5/6');

    await terminal(page, 'hint');
    await expect(page.getByText(/gagne un niveau de Gravité/)).toBeVisible();
  });

  test('the logbook is locked, then opens with six fragments', async ({ page }) => {
    await page.goto('/journal/');
    await expect(page.getByText(/Ce journal ne s’ouvre qu’aux pilotes/)).toBeVisible();
    await expect(page.getByText('Tes records Gravité')).toBeHidden();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    await page.evaluate(() =>
      localStorage.setItem(
        'orbite:fragments',
        JSON.stringify(['hero', 'about', 'skills', 'projects', 'passions', 'contact']),
      ),
    );
    await page.goto('/');
    const dialog = await terminal(page, 'journal');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/journal\/$/);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Tes records Gravité' }),
    ).toBeVisible();
    await expect(page.getByText('Aucun niveau gagné pour l’instant.')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('go flies to a celestial body', async ({ page }) => {
    await page.goto('/');
    await terminal(page, 'go saturne');
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('#projects h2')).toBeInViewport();
  });
});
