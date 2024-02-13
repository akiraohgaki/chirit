import { expect, test } from '@playwright/test';

const methodLogs = [
  'prop-size',
  '0',
  'method-set',
  'prop-size',
  '9',
  'method-keys',
  JSON.stringify([
    'test_array',
    'test_boolean',
    'test_invalidjson',
    'test_invalidobject',
    'test_null',
    'test_number',
    'test_object',
    'test_string',
    'test_undefined',
  ]),
  'method-get',
  JSON.stringify([
    true,
    1,
    'text',
    [0, 1, 2],
    { 'key0': 0, 'key1': 1, 'key2': 2 },
    null,
    null,
    'invalid',
    '{}',
    null,
  ]),
  JSON.stringify([
    '{"_k":"boolean","_v":true}',
    '{"_k":"number","_v":1}',
    '{"_k":"string","_v":"text"}',
    '{"_k":"array","_v":[0,1,2]}',
    '{"_k":"object","_v":{"key0":0,"key1":1,"key2":2}}',
    '{"_k":"null","_v":null}',
    '{"_k":"undefined"}',
    'invalid',
    '{}',
    null,
  ]),
  'method-delete',
  'prop-size',
  '0',
  'method-set',
  'prop-size',
  '9',
  'method-clear',
  'prop-size',
  '0',
];

test.describe('/webstorage (local mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');

    await page.locator('[data-action="init-local"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init-local');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-prefix"]').click();
    await page.locator('[data-action="prop-size"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-mode',
      'local',
      'prop-prefix',
      'test_',
      'prop-size',
      '0',
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-keys"]').click();
    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-delete"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-clear"]').click();
    await page.locator('[data-action="prop-size"]').click();

    await expect(page.locator('[data-log]')).toHaveText(methodLogs);
  });
});

test.describe('/webstorage (session mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');

    await page.locator('[data-action="init-session"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText('init-session');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-prefix"]').click();
    await page.locator('[data-action="prop-size"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-mode',
      'session',
      'prop-prefix',
      'test_',
      'prop-size',
      '0',
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-keys"]').click();
    await page.locator('[data-action="method-get"]').click();
    await page.locator('[data-action="method-delete"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-set"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await page.locator('[data-action="method-clear"]').click();
    await page.locator('[data-action="prop-size"]').click();

    await expect(page.locator('[data-log]')).toHaveText(methodLogs);
  });
});

test.describe('/webstorage (invalid mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');

    await page.locator('[data-action="init-invalid"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'init-invalid',
      /exception: .+/,
    ]);
  });
});
