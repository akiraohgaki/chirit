import { expect, test } from '@playwright/test';

const notifyValue = 'text';

test.describe('/observable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observable');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init',
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-subscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-unsubscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-notify',

      'action: method-subscribe',

      'action: method-notify',
      `observer1: ${notifyValue}`,
      `observer2: ${notifyValue}`,
      `observer3: ${notifyValue}`,

      'action: method-unsubscribe',

      'action: method-notify',
    ]);
  });
});
