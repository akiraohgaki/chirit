import { expect, test } from '@playwright/test';

test.describe('/version', () => {
  test('Should use semantic versioning', async ({ page }) => {
    await page.goto('/version');
    await expect(page.locator('#log > p')).toHaveText(/version: \d+\.\d+\.\d+(-.+)?/);
  });
});
