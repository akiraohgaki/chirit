import { expect, test } from '@playwright/test';

const methodLogs = [
  'action: prop-size',
  '0',

  'action: method-set',

  'action: prop-size',
  '9',

  'action: method-keys',
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

  'action: method-get',
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

  'action: method-delete',

  'action: prop-size',
  '0',

  'action: method-set',

  'action: prop-size',
  '9',

  'action: method-clear',

  'action: prop-size',
  '0',
];

test.describe('/webstorage (local)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');

    await page.locator('[data-action="init-local"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init-local',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-prefix"]').click();
    await page.locator('[data-action="prop-size"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-mode',
      'local',

      'action: prop-prefix',
      'test_',

      'action: prop-size',
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

test.describe('/webstorage (session)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');

    await page.locator('[data-action="init-session"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init-session',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-mode"]').click();
    await page.locator('[data-action="prop-prefix"]').click();
    await page.locator('[data-action="prop-size"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-mode',
      'session',

      'action: prop-prefix',
      'test_',

      'action: prop-size',
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

test.describe('/webstorage (invalid)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');

    await page.locator('[data-action="init-invalid"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init-invalid',
      /exception: .+/,
    ]);
  });
});
