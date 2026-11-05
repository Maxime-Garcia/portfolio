import { test, expect } from '@playwright/test';

test.describe('content sections', () => {
  test('hero calls to action reach projects and contact', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Visiter le hangar' })).toHaveAttribute(
      'href',
      '#projects',
    );
    await expect(page.getByRole('link', { name: 'Ouvrir une fréquence' })).toHaveAttribute(
      'href',
      '#contact',
    );
  });

  test('about shows the journey with a placeholder flag', async ({ page }) => {
    await page.goto('/');
    const about = page.locator('#about');
    await expect(about.getByText('MuleSoft Tech Lead chez CGI', { exact: true })).toBeVisible();
    await expect(about.getByRole('listitem').filter({ hasText: 'À compléter' })).toHaveCount(1);
  });

  test('skills list the spec stack', async ({ page }) => {
    await page.goto('/en/');
    const skills = page.locator('#skills');
    for (const skill of ['MuleSoft', 'RabbitMQ', 'GoAnywhere', 'Azure DevOps', 'SonarQube']) {
      await expect(skills.getByText(skill, { exact: true })).toBeVisible();
    }
  });

  test('music shows listening styles and artists linking to YouTube Music', async ({ page }) => {
    await page.goto('/');
    const music = page.locator('#passions article').first();
    await expect(music.getByRole('heading', { name: 'Ce que j’écoute' })).toBeVisible();
    const artists = music.getByRole('link', { name: /YouTube Music, nouvel onglet/ });
    expect(await artists.count()).toBeGreaterThan(3);
    await expect(artists.first()).toHaveAttribute('href', /^https:\/\/music\.youtube\.com\//);
    await expect(page.locator('audio')).toHaveCount(0);
  });

  test('contact form is disabled with a notice when Formspree is not configured', async ({
    page,
  }) => {
    test.skip(!!process.env.PUBLIC_FORMSPREE_ID, 'Formspree configured');
    await page.goto('/');
    const form = page.locator('[data-contact-form]');
    await expect(form.getByText('Le formulaire sera activé très bientôt')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
    await expect(form.locator('input[name="_gotcha"]')).toBeAttached();
    await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/Maxime-Garcia',
    );
  });
});

test.describe('campfire', () => {
  test('lists the worlds that left a mark', async ({ page }) => {
    await page.goto('/');
    const passions = page.locator('#passions');
    for (const name of ['Outer Wilds', 'Dofus', 'Tunic'])
      await expect(passions.getByText(name, { exact: true })).toBeVisible();
  });

  test('the HUD games link leads to the games room, which launches every game', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Jeux' }).click();
    await expect(page).toHaveURL(/#arcade$/);
    const arcade = page.getByRole('article', { name: 'Salle de jeux' });
    await expect(arcade).toBeInViewport();
    await arcade.getByRole('button', { name: /Jouer à Gravité/ }).click();
    await expect(page.getByRole('dialog', { name: 'Gravité' })).toBeVisible();
    await page.keyboard.press('Escape');
    await arcade.getByRole('button', { name: /Ouvrir le terminal/ }).click();
    await expect(page.getByRole('dialog', { name: 'Terminal de bord' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
