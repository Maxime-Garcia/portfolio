import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settle } from './helpers';
import { launch, step } from '../../src/game/gravity/engine';
import { levels } from '../../src/game/gravity/levels';

test.describe('Gravité mini-game', () => {
  test('loads nothing until played', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => {
      if (/gravity|ui\.[\w-]+\.js/.test(r.url())) requested.push(r.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(requested.filter((u) => u.includes('gravity'))).toEqual([]);
  });

  test('opens from Passions and is fully keyboard playable', async ({ page }) => {
    await page.goto('/');
    await page.locator('#passions').getByRole('button', { name: 'Jouer à Gravité' }).click();
    const dialog = page.getByRole('dialog', { name: 'Gravité' });
    await expect(dialog).toBeVisible();
    const field = dialog.getByRole('img', { name: /Terrain de jeu/ });
    await expect(field).toBeFocused();
    await expect(dialog.getByText(/Niveau 1\/5/)).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await expect(dialog.getByText(/puissance 58 %/)).toBeVisible();
    await page.keyboard.press('Space');
    await expect(dialog.getByRole('status')).not.toBeEmpty({ timeout: 20_000 });
    await expect(dialog.getByText(/Essais : 1/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('can be won, records the best score and announces it', async ({ page }) => {
    // Find, with the real engine, a winning shot reachable from the keyboard
    // (start: angle 0°, power 55 %; arrows: ±2°, ±3 %).
    const level = levels[0];
    let presses: string[] | undefined;
    search: for (let k = 0; k <= 15; k++) {
      for (let n = -45; n <= 45; n++) {
        const aim = { angle: (n * 2 * Math.PI) / 180, power: 0.55 + k * 0.03 };
        let probe = launch(level, aim);
        let status = 'flying';
        for (let i = 0; i < 60 * 15 * 4 && status === 'flying'; i++) {
          const result = step(level, probe, 1 / 240);
          probe = result.probe;
          status = result.status;
        }
        if (status === 'won') {
          presses = [
            ...Array<string>(Math.abs(n)).fill(n < 0 ? 'ArrowLeft' : 'ArrowRight'),
            ...Array<string>(k).fill('ArrowUp'),
          ];
          break search;
        }
      }
    }
    expect(presses, 'a keyboard-reachable winning shot exists').toBeDefined();

    await page.goto('/projects/gravite/');
    await page.getByRole('button', { name: 'Jouer à Gravité' }).click();
    const dialog = page.getByRole('dialog', { name: 'Gravité' });
    await expect(dialog).toBeVisible();
    for (const key of presses ?? []) await page.keyboard.press(key);
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('status')).toContainText('Cible atteinte en 1 essai(s)', {
      timeout: 20_000,
    });
    await expect(dialog.getByRole('button', { name: 'Niveau suivant' })).toBeVisible();
    const best = await page.evaluate(() => localStorage.getItem('orbite:gravity'));
    expect(JSON.parse(best ?? '{}')).toEqual({ 1: 1 });
  });

  test('has no WCAG A/AA violations when open', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#passions').getByRole('button', { name: 'Play Gravity' }).click();
    await expect(page.getByRole('dialog', { name: 'Gravity' })).toBeVisible();
    await settle(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('the terminal play command starts it', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: 'Commande' });
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.fill('play');
    await input.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Gravité' })).toBeVisible();
  });
});
