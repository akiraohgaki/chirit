import { expect, test } from '@playwright/test';

test.describe('/version', () => {
  test('Semantic versioning', async ({ page }) => {
    await page.goto('/version');
    await expect(page.locator('[data-log]')).toHaveText(/version: \d+\.\d+\.\d+(-.+)?/);
  });
});
