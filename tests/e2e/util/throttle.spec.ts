import { expect, test } from '@playwright/test';

test.describe('throttle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/util/throttle.playground');
  });

  test('throttled function', async ({ page, baseURL }) => {
    const code = `
      import { throttle } from '${baseURL}/util.bundle.js';

      const throttledFunc = throttle((value) => {
        playground.logs.add(value);
      }, 50);

      throttledFunc(1);
      throttledFunc(2);
      await playground.sleep(100);
      throttledFunc(3);
      throttledFunc(4);
      await playground.sleep(100);
    `;

    const logs = [
      '1',
      '3',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('time-consuming processing', async ({ page, baseURL }) => {
    const code = `
      import { throttle } from '${baseURL}/util.bundle.js';

      const throttledFunc = throttle(async (value) => {
        await playground.sleep(150);
        playground.logs.add(value);
      }, 50);

      throttledFunc(1);
      throttledFunc(2);
      await playground.sleep(100);
      throttledFunc(3);
      throttledFunc(4);
      await playground.sleep(100);
    `;

    const logs = [
      '1',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('error handling (see error log in test output)', async ({ page, baseURL }) => {
    const code = `
      import { throttle } from '${baseURL}/util.bundle.js';

      const throttledFunc = throttle((value) => {
        playground.logs.add(value);
        throw new Error('' + value);
      }, 50);

      throttledFunc(1);
      throttledFunc(2);
      await playground.sleep(100);
      throttledFunc(3);
      throttledFunc(4);
      await playground.sleep(100);
    `;

    const logs = [
      '1',
      '3',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
