import { expect, test } from '@playwright/test';

test.describe('css', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/css.playground');
  });

  test('Tagged template literal', async ({ page, baseURL }) => {
    const code = `
      import { html } from '${baseURL}/mod.bundle.js';

      const sheet = css\`span { diaplay: ${'inline-block'}; }\`;

      playground.logs.add(sheet instanceof CSSStyleSheet);
      playground.logs.add(sheet.cssRules[0].cssText);
    `;

    const logs = [
      'true',
      'span { diaplay: inline-block; }',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
