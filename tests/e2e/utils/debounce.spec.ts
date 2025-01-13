import { expect, test } from '@playwright/test';

test.describe('debounce', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utils/debounce.playground');
  });

  test('debounced function', async ({ page, baseURL }) => {
    const code = `
      import { debounce } from '${baseURL}/utils.bundle.js';

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

  test('time-consuming debounced function', async ({ page, baseURL }) => {
    const code = `
      import { debounce } from '${baseURL}/utils.bundle.js';

      const debouncedFunc = debounce(async (value) => {
        await playground.sleep(150);
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
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
