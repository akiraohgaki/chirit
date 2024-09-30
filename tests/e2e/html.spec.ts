import { expect, test } from '@playwright/test';

test.describe('html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/html.playground');
  });

  test('Tagged template literal', async ({ page, baseURL }) => {
    const code = `
      import { html } from '${baseURL}/mod.bundle.js';

      const fragment = html\`<span>${'a'},${0},${null},${undefined}</span>\`;

      playground.logs.add(fragment instanceof DocumentFragment);
      playground.logs.add(fragment.querySelector('span').outerHTML);
    `;

    const logs = [
      'true',
      '<span>a,0,null,undefined</span>',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
