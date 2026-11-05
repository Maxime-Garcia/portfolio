import type { Page } from '@playwright/test';

/** Waits for finite CSS/GSAP animations (infinite ones, like the fragment glint, are skipped). */
export async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
