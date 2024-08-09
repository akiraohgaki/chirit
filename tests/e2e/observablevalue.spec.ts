import { expect, test } from '@playwright/test';

const initialValue = '';
const updatedValue = 'text';

test.describe('/observablevalue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observablevalue');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init',
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-subscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-reset"]').click();
    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-unsubscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-set"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-get',
      initialValue,

      'action: method-notify',

      'action: method-subscribe',

      'action: method-notify',
      `observer1: ${initialValue}`,
      `observer2: ${initialValue}`,
      `observer3: ${initialValue}`,

      'action: method-set',
      `observer1: ${updatedValue}`,
      `observer2: ${updatedValue}`,
      `observer3: ${updatedValue}`,

      'action: method-get',
      updatedValue,

      'action: method-reset',
      `observer1: ${initialValue}`,
      `observer2: ${initialValue}`,
      `observer3: ${initialValue}`,

      'action: method-get',
      initialValue,

      'action: method-unsubscribe',

      'action: method-notify',

      'action: method-set',
    ]);
  });
});
