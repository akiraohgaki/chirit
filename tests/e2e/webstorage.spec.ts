import { expect, test } from '@playwright/test';

const logs = [
  'clear by general method',
  'mode: ',
  'prefix: test_',
  'size: 0',
  'set: 7 items',
  'set by general method: 2 items',
  'size: 9',
  'get: 9+1undefined items ' + JSON.stringify([
    true,
    0,
    'text',
    [0, 1, 2],
    { key0: 0, key1: 1, key2: 2 },
    null,
    null,
    'invalidjson',
    '{}',
    null,
  ]),
  'get by general method: 9+1undefined items ' + JSON.stringify([
    '{"_k":"boolean","_v":true}',
    '{"_k":"number","_v":0}',
    '{"_k":"string","_v":"text"}',
    '{"_k":"array","_v":[0,1,2]}',
    '{"_k":"object","_v":{"key0":0,"key1":1,"key2":2}}',
    '{"_k":"null","_v":null}',
    '{"_k":"undefined"}',
    'invalidjson',
    '{}',
    null,
  ]),
  'delete: 2 items',
  'size: 7',
  'keys: ' + JSON.stringify([
    'test_boolean',
    'test_number',
    'test_string',
    'test_array',
    'test_object',
    'test_null',
    'test_undefined',
  ].toSorted()),
  'clear',
  'size: 0',
];

test.describe('/webstorage/local', () => {
  test('Local storage mode should work', async ({ page }) => {
    logs[1] = 'mode: local';

    await page.goto('/webstorage/local');
    await expect(page.locator('#log > p')).toHaveText(logs);
  });
});

test.describe('/webstorage/session', () => {
  test('Session storage mode should work', async ({ page }) => {
    logs[1] = 'mode: session';

    await page.goto('/webstorage/session');
    await expect(page.locator('#log > p')).toHaveText(logs);
  });
});

test.describe('/webstorage/invalidmode', () => {
  test('Should throw exception if invalid mode', async ({ page }) => {
    await page.goto('/webstorage/invalidmode');
    await expect(page.locator('#log > p')).toHaveText(/exception: .+/);
  });
});
