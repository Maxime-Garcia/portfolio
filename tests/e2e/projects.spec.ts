import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('projects', () => {
  test('lists the three examples with a badge', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('[data-project]');
    await expect(cards).toHaveCount(3);
    await expect(cards.filter({ hasText: 'Exemple' })).toHaveCount(3);
  });

  test('filters with aria-pressed and a live count', async ({ page }) => {
    await page.goto('/');
    const group = page.getByRole('group', { name: 'Filtrer les projets' });
    const count = page.locator('[data-filter-count]');
    await expect(count).toHaveText('3 projet(s) affiché(s)');
    const game = group.getByRole('button', { name: 'Jeu' });
    await game.click();
    await expect(game).toHaveAttribute('aria-pressed', 'true');
    await expect(group.getByRole('button', { name: 'Tous' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(page.locator('[data-project]:visible')).toHaveCount(1);
    await expect(count).toHaveText('1 projet(s) affiché(s)');
    await group.getByRole('button', { name: 'Tous' }).click();
    await expect(page.locator('[data-project]:visible')).toHaveCount(3);
  });

  test('filters are keyboard operable', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.goto('/en/');
    const devops = page.getByRole('button', { name: 'DevOps' });
    await devops.focus();
    await page.keyboard.press('Enter');
    await expect(devops).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-project]:visible')).toHaveCount(1);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('shows every project and no filter', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-project]:visible')).toHaveCount(3);
      await expect(page.locator('[data-filters]')).toBeHidden();
    });
  });

  test('opens a detail page and comes back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Pipeline de livraison avec contrôle qualité' }).click();
    await expect(page).toHaveURL(/\/projects\/exemple-pipeline-qualite\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Pipeline de livraison avec contrôle qualité',
    );
    await expect(page.getByText('Projet d’exemple')).toBeVisible();
    await page.getByRole('link', { name: /Retour aux projets/ }).click();
    await expect(page).toHaveURL(/\/#projects$/);
  });

  test('detail page switches language on the same project', async ({ page }) => {
    await page.goto('/projects/exemple-jeu-orbite/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await page.getByRole('link', { name: 'Read this page in English' }).click();
    await expect(page).toHaveURL(/\/en\/projects\/exemple-jeu-orbite\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Space exploration game prototype',
    );
  });

  for (const path of [
    '/projects/exemple-passerelle-api/',
    '/en/projects/exemple-passerelle-api/',
  ]) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
