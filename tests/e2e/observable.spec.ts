import { expect, test } from '@playwright/test';

const value = 'text';

test.describe('/observable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observable');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init');
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-subscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-unsubscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-notify',
      'method-subscribe',
      'method-notify',
      `observer1: ${value}`,
      `observer2: ${value}`,
      `observer3: ${value}`,
      'method-unsubscribe',
      'method-notify',
    ]);
  });
});
