import { expect, test } from '@playwright/test';

test.describe('/router (hash mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');

    await page.locator('[data-action="init-hash"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init-hash');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-base"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-mode',
      'hash',
      'prop-base',
      '/router/',
      'prop-onchange',
      'prop-onerror',
    ]);
  });

  test('Methods', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();
    await page.locator('[data-action="method-navigate-parent"]').click();
    await page.locator('[data-action="method-navigate-current"]').click();
    await page.locator('[data-action="method-navigate-pathto1"]').click();
    await page.locator('[data-action="method-navigate-pathto"]').click();
    await page.goBack();
    await page.goForward();
    await page.locator('[data-action="method-navigate-error"]').click();
    await page.locator('[data-action="method-navigate-noroute"]').click();
    await page.locator('[data-action="method-delete"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-set',
      'method-navigate-root',
      `${baseURL}/router#/`,
      'onchange: hashchange',
      'method-navigate-parent',
      `${baseURL}/router#/`,
      'method-navigate-current',
      `${baseURL}/router#/router/`,
      'onchange: hashchange',
      'method-navigate-pathto1',
      `${baseURL}/router#/router/path/to/1`,
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',
      'method-navigate-pathto',
      `${baseURL}/router#/router/path/to`,
      'onchange: hashchange',
      'params: {"name1":"to"}',
      // goBack
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',
      // goForward
      'onchange: hashchange',
      'params: {"name1":"to"}',
      'method-navigate-error',
      `${baseURL}/router#/router/error`,
      'onchange: hashchange',
      'params: {}',
      'onerror: error',
      'method-navigate-noroute',
      `${baseURL}/router#/router/noroute`,
      'onchange: hashchange',
      'method-delete',
      'method-navigate-root',
      `${baseURL}/router#/`,
    ]);
  });

  test('URL is hash', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should not load page
    await page.locator('[data-action="method-navigate-hashpathto1"]').click();

    await expect(page).toHaveURL(`${baseURL}/router#/router/path/to/1`);
    await expect(page.locator('[data-log]')).toHaveText([
      'method-navigate-hashpathto1',
      `${baseURL}/router#/router/path/to/1`,
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',
    ]);
  });

  test('URL is query string', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should load page
    await page.locator('[data-action="method-navigate-querykv"]').click();

    await expect(page).toHaveURL(`${baseURL}/router?k=v`);
    await expect(page.locator('[data-log]')).toHaveCount(0);
  });

  test('URL is same origin', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should load page
    await page.locator('[data-action="method-navigate-locationorigin"]').click();

    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.locator('[data-log]')).toHaveCount(0);
  });

  test('URL is different origin', async ({ page }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should load page
    await page.locator('[data-action="method-navigate-examplecom"]').click();

    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('/router (history mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');

    await page.locator('[data-action="init-history"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init-history');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-base"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-mode',
      'history',
      'prop-base',
      '/router/',
      'prop-onchange',
      'prop-onerror',
    ]);
  });

  test('Methods', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();
    await page.locator('[data-action="method-navigate-parent"]').click();
    await page.locator('[data-action="method-navigate-current"]').click();
    await page.locator('[data-action="method-navigate-pathto1"]').click();
    await page.locator('[data-action="method-navigate-pathto"]').click();
    await page.goBack();
    await page.goForward();
    await page.locator('[data-action="method-navigate-error"]').click();
    await page.locator('[data-action="method-navigate-noroute"]').click();
    await page.locator('[data-action="method-delete"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-set',
      'method-navigate-root',
      'onchange: pushstate',
      `${baseURL}/`,
      'method-navigate-parent',
      `${baseURL}/`,
      'method-navigate-current',
      'onchange: pushstate',
      `${baseURL}/router/`,
      'method-navigate-pathto1',
      'onchange: pushstate',
      'params: {"name1":"to","name2":"1"}',
      `${baseURL}/router/path/to/1`,
      'method-navigate-pathto',
      'onchange: pushstate',
      'params: {"name1":"to"}',
      `${baseURL}/router/path/to`,
      // goBack
      'onchange: popstate',
      'params: {"name1":"to","name2":"1"}',
      // goForward
      'onchange: popstate',
      'params: {"name1":"to"}',
      'method-navigate-error',
      'onchange: pushstate',
      'params: {}',
      'onerror: error',
      `${baseURL}/router/error`,
      'method-navigate-noroute',
      'onchange: pushstate',
      `${baseURL}/router/noroute`,
      'method-delete',
      'method-navigate-root',
      'onchange: pushstate',
      `${baseURL}/`,
    ]);
  });

  test('URL is hash', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should not load page
    await page.locator('[data-action="method-navigate-hashpathto1"]').click();

    await expect(page).toHaveURL(`${baseURL}/router/#path/to/1`);
    await expect(page.locator('[data-log]')).toHaveText([
      'method-navigate-hashpathto1',
      'onchange: pushstate',
      `${baseURL}/router/#path/to/1`,
    ]);
  });

  test('URL is query string', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should not load page
    await page.locator('[data-action="method-navigate-querykv"]').click();

    await expect(page).toHaveURL(`${baseURL}/router/?k=v`);
    await expect(page.locator('[data-log]')).toHaveText([
      'method-navigate-querykv',
      'onchange: pushstate',
      `${baseURL}/router/?k=v`,
    ]);
  });

  test('URL is same origin', async ({ page, baseURL }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should not load page
    await page.locator('[data-action="method-navigate-locationorigin"]').click();

    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.locator('[data-log]')).toHaveText([
      'method-navigate-locationorigin',
      'onchange: pushstate',
      `${baseURL}/`,
    ]);
  });

  test('URL is different origin', async ({ page }) => {
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();

    // Should load page
    await page.locator('[data-action="method-navigate-examplecom"]').click();

    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('/router (invalid mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');

    await page.locator('[data-action="init-invalid"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'init-invalid',
      /exception: .+/,
    ]);
  });
});
