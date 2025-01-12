import { expect, test } from '@playwright/test';

test.describe('sleep', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utils/sleep.playground');
  });

  test('pauses the execution', async ({ page, baseURL }) => {
    const code = `
      import { sleep } from '${baseURL}/utils.bundle.js';

      const timeA = Date.now();
      await sleep(100);
      const timeB = Date.now();

      playground.logs.add(timeB - timeA >= 100);
    `;

    const logs = [
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
