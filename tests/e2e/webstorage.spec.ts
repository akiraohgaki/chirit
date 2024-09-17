import { expect, test } from '@playwright/test';

test.describe('WebStorage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webstorage');
  });

  test('invalid storage mode', async ({ page }) => {
    const code = `
      const { WebStorage } = this.chirit;

      try {
        const webStorage = new WebStorage();
      } catch (exception) {
        if (exception instanceof Error) {
          this.addLog('Error: ' + exception.message);
        }
      }

      try {
        const webStorage = new WebStorage('invalid');
      } catch (exception) {
        if (exception instanceof Error) {
          this.addLog('Error: ' + exception.message);
        }
      }
    `;

    const logs = [
      /Error: .+/,
      /Error: .+/,
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('local storage mode', async ({ page }) => {
    const code = `
      const { WebStorage } = this.chirit;

      const webStorage = new WebStorage('local', 'test_');

      this.addLog(webStorage.mode);
      this.addLog(webStorage.prefix);
      this.addLog(webStorage.size);
      this.addLog(webStorage.keys());

      this.addLog(webStorage.get('item0'));

      localStorage.setItem('test_item1', 'test1');
      this.addLog(localStorage.getItem('test_item1'));
      this.addLog(webStorage.get('item1'));

      webStorage.set('item2', 'test2');
      this.addLog(localStorage.getItem('test_item2'));
      this.addLog(webStorage.get('item2'));

      this.addLog(webStorage.size);
      this.addLog(webStorage.keys().sort());

      webStorage.delete('item1');
      this.addLog(webStorage.size);
      this.addLog(webStorage.keys());

      webStorage.clear();
      this.addLog(webStorage.size);
      this.addLog(webStorage.keys());
    `;

    const logs = [
      'local',
      'test_',
      '0',
      '[]',
      'undefined',
      'test1',
      'test1',
      '{"_v":"test2"}',
      'test2',
      '2',
      '["test_item1","test_item2"]',
      '1',
      '["test_item2"]',
      '0',
      '[]',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('session storage mode', async ({ page }) => {
    const code = `
      const { WebStorage } = this.chirit;

      const webStorage = new WebStorage('session', 'test_');

      this.addLog(webStorage.mode);
      this.addLog(webStorage.prefix);
      this.addLog(webStorage.size);
      this.addLog(webStorage.keys());

      this.addLog(webStorage.get('item0'));

      sessionStorage.setItem('test_item1', 'test1');
      this.addLog(sessionStorage.getItem('test_item1'));
      this.addLog(webStorage.get('item1'));

      webStorage.set('item2', 'test2');
      this.addLog(sessionStorage.getItem('test_item2'));
      this.addLog(webStorage.get('item2'));

      this.addLog(webStorage.size);
      this.addLog(webStorage.keys().sort());

      webStorage.delete('item1');
      this.addLog(webStorage.size);
      this.addLog(webStorage.keys());

      webStorage.clear();
      this.addLog(webStorage.size);
      this.addLog(webStorage.keys());
    `;

    const logs = [
      'session',
      'test_',
      '0',
      '[]',
      'undefined',
      'test1',
      'test1',
      '{"_v":"test2"}',
      'test2',
      '2',
      '["test_item1","test_item2"]',
      '1',
      '["test_item2"]',
      '0',
      '[]',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('data in the storage', async ({ page }) => {
    const code = `
      const { WebStorage } = this.chirit;

      const webStorage = new WebStorage('local');

      webStorage.set('boolean', true);
      webStorage.set('number', 1);
      webStorage.set('string', 'text');
      webStorage.set('array', [0]);
      webStorage.set('object', { key: 'value' });
      webStorage.set('null', null);
      webStorage.set('undefined', undefined);

      this.addLog(webStorage.get('boolean'));
      this.addLog(webStorage.get('number'));
      this.addLog(webStorage.get('string'));
      this.addLog(webStorage.get('array'));
      this.addLog(webStorage.get('object'));
      this.addLog(webStorage.get('null'));
      this.addLog(webStorage.get('undefined'));

      this.addLog(localStorage.getItem('boolean'));
      this.addLog(localStorage.getItem('number'));
      this.addLog(localStorage.getItem('string'));
      this.addLog(localStorage.getItem('array'));
      this.addLog(localStorage.getItem('object'));
      this.addLog(localStorage.getItem('null'));
      this.addLog(localStorage.getItem('undefined'));

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
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
