import { expect, test } from '@playwright/test';

test.describe('WebStorage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/WebStorage.playground');
  });

  test('invalid storage mode', async ({ page, baseURL }) => {
    const code = `
      import { WebStorage } from '${baseURL}/mod.bundle.js';

      try {
        const webStorage = new WebStorage();
      } catch (exception) {
        if (exception instanceof Error) {
          playground.logs.add('Error: ' + exception.message);
        }
      }

      try {
        const webStorage = new WebStorage('invalid');
      } catch (exception) {
        if (exception instanceof Error) {
          playground.logs.add('Error: ' + exception.message);
        }
      }
    `;

    const logs = [
      /Error: .+/,
      /Error: .+/,
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('local storage mode', async ({ page, baseURL }) => {
    const code = `
      import { WebStorage } from '${baseURL}/mod.bundle.js';

      const webStorage = new WebStorage('local', 'test_');

      playground.logs.add(webStorage.mode);
      playground.logs.add(webStorage.prefix);
      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys());

      playground.logs.add(webStorage.get('item0'));

      localStorage.setItem('test_item1', 'a');

      playground.logs.add(localStorage.getItem('test_item1'));
      playground.logs.add(webStorage.get('item1'));

      webStorage.set('item2', 'b');

      playground.logs.add(localStorage.getItem('test_item2'));
      playground.logs.add(webStorage.get('item2'));

      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys().sort());

      webStorage.delete('item1');

      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys());

      webStorage.clear();

      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys());
    `;

    const logs = [
      'local',
      'test_',
      '0',
      '[]',
      'undefined',
      'a',
      'a',
      '{"_v":"b"}',
      'b',
      '2',
      '["test_item1","test_item2"]',
      '1',
      '["test_item2"]',
      '0',
      '[]',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('session storage mode', async ({ page, baseURL }) => {
    const code = `
      import { WebStorage } from '${baseURL}/mod.bundle.js';

      const webStorage = new WebStorage('session', 'test_');

      playground.logs.add(webStorage.mode);
      playground.logs.add(webStorage.prefix);
      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys());

      playground.logs.add(webStorage.get('item0'));

      sessionStorage.setItem('test_item1', 'a');

      playground.logs.add(sessionStorage.getItem('test_item1'));
      playground.logs.add(webStorage.get('item1'));

      webStorage.set('item2', 'b');

      playground.logs.add(sessionStorage.getItem('test_item2'));
      playground.logs.add(webStorage.get('item2'));

      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys().sort());

      webStorage.delete('item1');

      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys());

      webStorage.clear();

      playground.logs.add(webStorage.size);
      playground.logs.add(webStorage.keys());
    `;

    const logs = [
      'session',
      'test_',
      '0',
      '[]',
      'undefined',
      'a',
      'a',
      '{"_v":"b"}',
      'b',
      '2',
      '["test_item1","test_item2"]',
      '1',
      '["test_item2"]',
      '0',
      '[]',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('data in the storage', async ({ page, baseURL }) => {
    const code = `
      import { WebStorage } from '${baseURL}/mod.bundle.js';

      const webStorage = new WebStorage('local');

      webStorage.set('boolean', true);
      webStorage.set('number', 1);
      webStorage.set('string', 'text');
      webStorage.set('array', [0]);
      webStorage.set('object', { key: 'value' });
      webStorage.set('null', null);
      webStorage.set('undefined', undefined);

      playground.logs.add(webStorage.get('boolean'));
      playground.logs.add(webStorage.get('number'));
      playground.logs.add(webStorage.get('string'));
      playground.logs.add(webStorage.get('array'));
      playground.logs.add(webStorage.get('object'));
      playground.logs.add(webStorage.get('null'));
      playground.logs.add(webStorage.get('undefined'));

      playground.logs.add(localStorage.getItem('boolean'));
      playground.logs.add(localStorage.getItem('number'));
      playground.logs.add(localStorage.getItem('string'));
      playground.logs.add(localStorage.getItem('array'));
      playground.logs.add(localStorage.getItem('object'));
      playground.logs.add(localStorage.getItem('null'));
      playground.logs.add(localStorage.getItem('undefined'));

      webStorage.clear();
    `;

    const logs = [
      'true',
      '1',
      'text',
      '[0]',
      '{"key":"value"}',
      'null',
      'undefined',
      '{"_v":true}',
      '{"_v":1}',
      '{"_v":"text"}',
      '{"_v":[0]}',
      '{"_v":{"key":"value"}}',
      '{"_v":null}',
      '{}',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
