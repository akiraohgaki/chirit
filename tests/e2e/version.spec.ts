import { expect, test } from '@playwright/test';

test.describe('/version', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/version');
  });

  test('Semantic versioning', async ({ page }) => {
    await page.locator('[data-action="var-version"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'var-version',
      /\d+\.\d+\.\d+(-.+)?/,
    ]);
  });
});
