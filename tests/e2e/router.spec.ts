import { expect, test } from '@playwright/test';

test.describe('/router (hash mode)', () => {
  test('Initialization', async ({ page }) => {
    await page.goto('/router');
    await page.locator('[data-action="init-hash"]').click();
    await expect(page.locator('[data-log]')).toHaveText('init (hash mode)');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-base"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await expect(page.locator('[data-log]')).toHaveText([
      'mode: hash',
      'base: /router/',
      'onchange',
      'onerror',
    ]);
  });

  test('Methods', async ({ page, baseURL }) => {
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();
    await page.locator('[data-action="method-navigate-parent"]').click();
    await page.locator('[data-action="method-navigate-current"]').click();
    await page.locator('[data-action="method-navigate-pathto1"]').click();
    await page.locator('[data-action="method-navigate-pathto"]').click();
    await page.locator('[data-action="method-navigate-error"]').click();
    await page.locator('[data-action="method-navigate-noroute"]').click();
    await page.locator('[data-action="method-delete"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();
    await expect(page.locator('[data-log]')).toHaveText([
      'set',
      `${baseURL}/router#/`,
      'onchange: hashchange',
      `${baseURL}/router#/`,
      `${baseURL}/router#/router/`,
      'onchange: hashchange',
      `${baseURL}/router#/router/path/to/1`,
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',
      `${baseURL}/router#/router/path/to`,
      'onchange: hashchange',
      'params: {"name1":"to"}',
      `${baseURL}/router#/router/error`,
      'onchange: hashchange',
      'params: {}',
      'onerror: error',
      `${baseURL}/router#/router/noroute`,
      'onchange: hashchange',
      'delete',
      `${baseURL}/router#/`,
    ]);

    await page.goto('/router');
    await page.locator('[data-action="init-hash"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-hashpathto1"]').click();
    await expect(page).toHaveURL(`${baseURL}/router#/router/path/to/1`);
    await expect(page.locator('[data-log]')).toHaveText([
      `${baseURL}/router#/router/path/to/1`,
      'onchange: hashchange',
      'params: {"name1":"to","name2":"1"}',
    ]);

    await page.goto('/router');
    await page.locator('[data-action="init-hash"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-querykv"]').click();
    await expect(page).toHaveURL(`${baseURL}/router?k=v`);
    await expect(page.locator('[data-log]')).toHaveCount(0);

    await page.goto('/router');
    await page.locator('[data-action="init-hash"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-locationorigin"]').click();
    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.locator('[data-log]')).toHaveCount(0);

    await page.goto('/router');
    await page.locator('[data-action="init-hash"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-examplecom"]').click();
    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('/router (history mode)', () => {
  test('Initialization', async ({ page }) => {
    await page.goto('/router');
    await page.locator('[data-action="init-history"]').click();
    await expect(page.locator('[data-log]')).toHaveText('init (history mode)');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-base"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="prop-onerror"]').click();
    await expect(page.locator('[data-log]')).toHaveText([
      'mode: history',
      'base: /router/',
      'onchange',
      'onerror',
    ]);
  });

  test('Methods', async ({ page, baseURL }) => {
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();
    await page.locator('[data-action="method-navigate-parent"]').click();
    await page.locator('[data-action="method-navigate-current"]').click();
    await page.locator('[data-action="method-navigate-pathto1"]').click();
    await page.locator('[data-action="method-navigate-pathto"]').click();
    await page.locator('[data-action="method-navigate-error"]').click();
    await page.locator('[data-action="method-navigate-noroute"]').click();
    await page.locator('[data-action="method-delete"]').click();
    await page.locator('[data-action="method-navigate-root"]').click();
    await expect(page.locator('[data-log]')).toHaveText([
      'set',
      'onchange: pushstate',
      `${baseURL}/`,
      `${baseURL}/`,
      'onchange: pushstate',
      `${baseURL}/router/`,
      'params: {"name1":"to","name2":"1"}',
      `${baseURL}/router/path/to/1`,
      'onchange: pushstate',
      'params: {"name1":"to"}',
      `${baseURL}/router/path/to`,
      'onchange: pushstate',
      'params: {}',
      'onerror: error',
      `${baseURL}/router/error`,
      'onchange: pushstate',
      `${baseURL}/router/noroute`,
      'delete',
      'onchange: pushstate',
      `${baseURL}/`,
    ]);

    await page.goto('/router');
    await page.locator('[data-action="init-history"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-hashpathto1"]').click();
    await expect(page).toHaveURL(`${baseURL}/router#/path/to/1`);
    await expect(page.locator('[data-log]')).toHaveText([
      'onchange: pushstate',
      `${baseURL}/router#/path/to/1`,
    ]);

    await page.goto('/router');
    await page.locator('[data-action="init-history"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-querykv"]').click();
    await expect(page).toHaveURL(`${baseURL}/router/?k=v`);
    await expect(page.locator('[data-log]')).toHaveText([
      'onchange: pushstate',
      `${baseURL}/router/?k=v`,
    ]);

    await page.goto('/router');
    await page.locator('[data-action="init-history"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-locationorigin"]').click();
    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.locator('[data-log]')).toHaveText([
      'onchange: pushstate',
      `${baseURL}/`,
    ]);

    await page.goto('/router');
    await page.locator('[data-action="init-history"]').click();
    await page.locator('[data-action="prop-onchange"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="method-navigate-examplecom"]').click();
    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('/router (invalid mode)', () => {
  test('Initialization', async ({ page }) => {
    await page.goto('/router');
    await page.locator('[data-action="init-invalid"]').click();
    await expect(page.locator('[data-log]')).toHaveText(/exception: .+/);
  });
});
