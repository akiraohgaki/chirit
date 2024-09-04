import { expect, test } from '@playwright/test';

const initialState = '';
const updatedState = 'text';

test.describe('/state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/state');

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
      initialState,

      'action: method-notify',

      'action: method-subscribe',

      'action: method-notify',
      `observer1: ${initialState}`,
      `observer2: ${initialState}`,
      `observer3: ${initialState}`,

      'action: method-set',
      `observer1: ${updatedState}`,
      `observer2: ${updatedState}`,
      `observer3: ${updatedState}`,

      'action: method-get',
      updatedState,

      'action: method-reset',
      `observer1: ${initialState}`,
      `observer2: ${initialState}`,
      `observer3: ${initialState}`,

      'action: method-get',
      initialState,

      'action: method-unsubscribe',

      'action: method-notify',

      'action: method-set',
    ]);
  });
});
