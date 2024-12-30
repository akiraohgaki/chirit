import { expect, test } from '@playwright/test';

test.describe('dom', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dom.playground');
  });

  test('globalThis.HTMLElement', async ({ page, baseURL }) => {
    const code = `
      import { dom } from '${baseURL}/mod.bundle.js';

      playground.logs.add('HTMLElement' in globalThis);
      playground.logs.add('HTMLElement' in dom.globalThis);
      playground.logs.add(dom.globalThis.HTMLElement instanceof globalThis.HTMLElement);
    `;

    const logs = [
      'true',
      'true',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
