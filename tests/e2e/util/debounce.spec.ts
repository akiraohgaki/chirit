import { expect, test } from '@playwright/test';

test.describe('debounce', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/util/debounce.playground');
  });

  test('debounced function', async ({ page, baseURL }) => {
    const code = `
      import { debounce } from '${baseURL}/util.bundle.js';

      const debouncedFunc = debounce((value) => {
        playground.logs.add(value);
      }, 50);

      debouncedFunc(1);
      debouncedFunc(2);
      await playground.sleep(100);
      debouncedFunc(3);
      debouncedFunc(4);
      await playground.sleep(100);
    `;

    const logs = [
      '2',
      '4',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('time-consuming processing', async ({ page, baseURL }) => {
    const code = `
      import { debounce } from '${baseURL}/util.bundle.js';

      const debouncedFunc = debounce(async (value) => {
        await playground.sleep(150);
        playground.logs.add(value);
      }, 50);

      debouncedFunc(1);
      debouncedFunc(2);
      await playground.sleep(100);
      debouncedFunc(3);
      debouncedFunc(4);
      await playground.sleep(200);
    `;

    const logs = [
      '2',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('error handling (see error log in test output)', async ({ page, baseURL }) => {
    const code = `
      import { debounce } from '${baseURL}/util.bundle.js';

      const debouncedFunc = debounce((value) => {
        playground.logs.add(value);
        throw new Error('' + value);
      }, 50);

      debouncedFunc(1);
      debouncedFunc(2);
      await playground.sleep(100);
      debouncedFunc(3);
      debouncedFunc(4);
      await playground.sleep(100);
    `;

    const logs = [
      '2',
      '4',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
