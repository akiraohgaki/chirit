import { expect, test } from '@playwright/test';

test.describe('/router (hash)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');

    await page.locator('[data-action="init-hash"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init-hash',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-base"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-mode',
      'hash',

      'action: prop-base',
      '/router/',

      'action: prop-onchange',

      'action: prop-onerror',
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
      'action: method-set',

      'action: method-navigate-root',
      `${baseURL}/router#/`,
      'onchange: hashchange',

      'action: method-navigate-parent',
      `${baseURL}/router#/`,

      'action: method-navigate-current',
      `${baseURL}/router#/router/`,
      'onchange: hashchange',

      'action: method-navigate-pathto1',
      `${baseURL}/router#/router/path/to/1`,
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',

      'action: method-navigate-pathto',
      `${baseURL}/router#/router/path/to`,
      'onchange: hashchange',
      'params: {"name1":"to"}',

      // goBack
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',

      // goForward
      'onchange: hashchange',
      'params: {"name1":"to"}',

      'action: method-navigate-error',
      `${baseURL}/router#/router/error`,
      'onchange: hashchange',
      'params: {}',
      'onerror: error',

      'action: method-navigate-noroute',
      `${baseURL}/router#/router/noroute`,
      'onchange: hashchange',

      'action: method-delete',

      'action: method-navigate-root',
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
      'action: method-navigate-hashpathto1',
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

test.describe('/router (history)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');

    await page.locator('[data-action="init-history"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init-history',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-base"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-mode',
      'history',

      'action: prop-base',
      '/router/',

      'action: prop-onchange',

      'action: prop-onerror',
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
      'action: method-set',

      'action: method-navigate-root',
      'onchange: pushstate',
      `${baseURL}/`,

      'action: method-navigate-parent',
      `${baseURL}/`,

      'action: method-navigate-current',
      'onchange: pushstate',
      `${baseURL}/router/`,

      'action: method-navigate-pathto1',
      'onchange: pushstate',
      'params: {"name1":"to","name2":"1"}',
      `${baseURL}/router/path/to/1`,

      'action: method-navigate-pathto',
      'onchange: pushstate',
      'params: {"name1":"to"}',
      `${baseURL}/router/path/to`,

      // goBack
      'onchange: popstate',
      'params: {"name1":"to","name2":"1"}',

      // goForward
      'onchange: popstate',
      'params: {"name1":"to"}',

      'action: method-navigate-error',
      'onchange: pushstate',
      'params: {}',
      'onerror: error',
      `${baseURL}/router/error`,

      'action: method-navigate-noroute',
      'onchange: pushstate',
      `${baseURL}/router/noroute`,

      'action: method-delete',

      'action: method-navigate-root',
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
      'action: method-navigate-hashpathto1',
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
      'action: method-navigate-querykv',
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
      'action: method-navigate-locationorigin',
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

test.describe('/router (invalid)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');

    await page.locator('[data-action="init-invalid"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init-invalid',
      /exception: .+/,
    ]);
  });
});
