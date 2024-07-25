import { expect, test } from '@playwright/test';

const initialState = JSON.stringify({ key0: 0, key1: 1, key2: { key0: 0 } });
const updatedState = JSON.stringify({ key0: 10, key1: 1, key2: { key0: 0 } });

test.describe('/store', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-state"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-state',
      initialState,
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-subscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-update"]').click();
    await page.locator('[data-action="prop-state"]').click();
    await page.locator('[data-action="method-reset"]').click();
    await page.locator('[data-action="prop-state"]').click();
    await page.locator('[data-action="method-unsubscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-update"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-notify',

      'action: method-subscribe',

      'action: method-notify',
      `observer1: ${initialState}`,
      `observer2: ${initialState}`,
      `observer3: ${initialState}`,

      'action: method-update',
      `observer1: ${updatedState}`,
      `observer2: ${updatedState}`,
      `observer3: ${updatedState}`,

      'action: prop-state',
      updatedState,

      'action: method-reset',
      `observer1: ${initialState}`,
      `observer2: ${initialState}`,
      `observer3: ${initialState}`,

      'action: prop-state',
      initialState,

      'action: method-unsubscribe',

      'action: method-notify',

      'action: method-update',
    ]);
  });

  test('Object state', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="object-state"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: object-state',
      'initial state object is same reference: false',
      'initial state.key2 object is same reference: false',
      'updated state object is same reference: false',
      'updated state.key2 object is same reference: false',
    ]);
  });
});
