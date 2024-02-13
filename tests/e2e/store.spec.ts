import { expect, test } from '@playwright/test';

const state0 = JSON.stringify({ key0: 0, key1: 1, key2: { key0: 0 } });
const state1 = JSON.stringify({ key0: 10, key1: 1, key2: { key0: 0 } });

test.describe('/store', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-state"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-state',
      state0,
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-subscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-update"]').click();
    await page.locator('[data-action="prop-state"]').click();
    await page.locator('[data-action="method-unsubscribe"]').click();
    await page.locator('[data-action="method-notify"]').click();
    await page.locator('[data-action="method-update"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-notify',
      'method-subscribe',
      'method-notify',
      `observer1: ${state0}`,
      `observer2: ${state0}`,
      `observer3: ${state0}`,
      'method-update',
      `observer1: ${state1}`,
      `observer2: ${state1}`,
      `observer3: ${state1}`,
      'prop-state',
      state1,
      'method-unsubscribe',
      'method-notify',
      'method-update',
    ]);
  });

  test('Object state', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="object-state"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'object-state',
      'initial state object is same reference: false',
      'initial state.key2 object is same reference: false',
      'updated state object is same reference: false',
      'updated state.key2 object is same reference: false',
    ]);
  });
});
