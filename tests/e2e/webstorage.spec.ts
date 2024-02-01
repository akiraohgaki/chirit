import { expect, test } from '@playwright/test';

const methodLogs = [
  'size: 0',
  'set',
  'setItem',
  'size: 9',
  `keys: ${
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
    ])
  }`,
  `get: ${
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
    ])
  }`,
  `getItem: ${
    JSON.stringify([
      '{"_k":"boolean","_v":true}',
      '{"_k":"number","_v":0}',
      '{"_k":"string","_v":"text"}',
      '{"_k":"array","_v":[0,1,2]}',
      '{"_k":"object","_v":{"key0":0,"key1":1,"key2":2}}',
      '{"_k":"null","_v":null}',
      '{"_k":"undefined"}',
      'invalid',
      '{}',
      null,
    ])
  }`,
  'delete',
  'size: 0',
  'set',
  'setItem',
  'size: 9',
  'clear',
  'size: 0',
];

test.describe('/webstorage (local mode)', () => {
  test('Initialization', async ({ page }) => {
    await page.goto('/webstorage');
    await page.locator('[data-action="init-local"]').click();
    await expect(page.locator('[data-log]')).toHaveText('init (local mode)');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-prefix"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await expect(page.locator('[data-log]')).toHaveText([
      'mode: local',
      'prefix: test_',
      'size: 0',
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
  test('Initialization', async ({ page }) => {
    await page.goto('/webstorage');
    await page.locator('[data-action="init-session"]').click();
    await expect(page.locator('[data-log]')).toHaveText('init (session mode)');
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();
    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-prefix"]').click();
    await page.locator('[data-action="prop-size"]').click();
    await expect(page.locator('[data-log]')).toHaveText([
      'mode: session',
      'prefix: test_',
      'size: 0',
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
  test('Initialization', async ({ page }) => {
    await page.goto('/webstorage');
    await page.locator('[data-action="init-invalid"]').click();
    await expect(page.locator('[data-log]')).toHaveText(/exception: .+/);
  });
});
