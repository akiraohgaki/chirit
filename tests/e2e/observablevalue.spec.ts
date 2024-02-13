import { expect, test } from '@playwright/test';

const value0 = '';
const value1 = 'text';

test.describe('/observablevalue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observablevalue');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init');
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-subscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-unsubscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-set"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-get',
      value0,
      'method-notify',
      'method-subscribe',
      'method-notify',
      `observer1: ${value0}`,
      `observer2: ${value0}`,
      `observer3: ${value0}`,
      'method-set',
      `observer1: ${value1}`,
      `observer2: ${value1}`,
      `observer3: ${value1}`,
      'method-get',
      value1,
      'method-unsubscribe',
      'method-notify',
      'method-set',
    ]);
  });
});
