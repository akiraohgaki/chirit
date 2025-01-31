import { expect, test } from '@playwright/test';

test.describe('css', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/css.playground');
  });

  test('tagged template literal', async ({ page, baseURL }) => {
    const code = `
      import { css } from '${baseURL}/mod.bundle.js';

      const sheet = css\`span { color: ${'red'}; }\`;

      playground.logs.add(sheet instanceof CSSStyleSheet);
      playground.logs.add(sheet.cssRules[0].cssText);
    `;

    const logs = [
      'true',
      'span { color: red; }',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
