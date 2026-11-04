import { test, expect } from '@playwright/test';

test.describe('content sections', () => {
  test('hero calls to action reach projects and contact', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Voir mes projets' })).toHaveAttribute(
      'href',
      '#projects',
    );
    await expect(page.getByRole('link', { name: 'Me contacter' })).toHaveAttribute(
      'href',
      '#contact',
    );
  });

  test('about shows the journey with a placeholder flag', async ({ page }) => {
    await page.goto('/');
    const about = page.locator('#about');
    await expect(
      about.getByText('Développeur intégration chez CGI', { exact: true }),
    ).toBeVisible();
    await expect(about.getByRole('listitem').filter({ hasText: 'À compléter' })).toHaveCount(1);
  });

  test('skills list the spec stack', async ({ page }) => {
    await page.goto('/en/');
    const skills = page.locator('#skills');
    for (const skill of ['MuleSoft', 'RabbitMQ', 'GoAnywhere', 'Azure DevOps', 'SonarQube']) {
      await expect(skills.getByText(skill, { exact: true })).toBeVisible();
    }
  });

  test('audio is not requested before playback', async ({ page }) => {
    const audioRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/audio/')) audioRequests.push(r.url());
    });
    await page.goto('/');
    await page.locator('#passions').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-passions-audio]')).toHaveAttribute('preload', 'none');
    expect(audioRequests).toEqual([]);
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

  test('home ships no JavaScript beyond theme, filters and contact', async ({ page }) => {
    await page.goto('/');
    const scripts = await page.locator('script[src], script[type="module"]').count();
    expect(scripts).toBeLessThanOrEqual(3);
  });
});
