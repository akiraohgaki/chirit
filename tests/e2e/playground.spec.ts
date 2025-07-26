import type { Page } from '@playwright/test';

import { expect, test } from '@playwright/test';

const additionalCode = `
let testsPassed = true;
for (const log of Playground.logs.get()) {
  if (log.endsWith('... Failed')) {
    testsPassed = false;
    break;
  }
}
Playground.log(testsPassed ? '[Passed]' : '[Failed]');
`;

async function runCode(page: Page, code: string): Promise<void> {
  await page.locator('[data-content="code"] code').fill(code + additionalCode);
  await page.locator('[data-action="code.run"]').click();
}

async function expectStatus(page: Page, timeout?: number): Promise<void> {
  await expect(page.locator('[data-content="log"]').last()).toHaveText('[Passed]', { timeout });
}

test.describe('Testing on playground page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.playground');
  });

  test('Component', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/Component.test.bundle.js';`);

    await expectStatus(page);
  });

  test('CustomElement', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/CustomElement.test.bundle.js';`);

    await expectStatus(page);
  });

  test('ElementAttributesProxy', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/ElementAttributesProxy.test.bundle.js';`);

    await expectStatus(page, 60000);
  });

  test('ElementPropertiesProxy', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/ElementPropertiesProxy.test.bundle.js';`);

    await expectStatus(page, 60000);
  });

  test('NodeStructure', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/NodeStructure.test.bundle.js';`);

    await expectStatus(page, 60000);
  });

  test('Router - hash mode', async ({ page, baseURL }) => {
    await page.goto('/router-hash.playground');

    await runCode(page, `import '${baseURL}/Router.test.bundle.js';`);

    await expectStatus(page);
  });

  test('Router - history mode', async ({ page, baseURL }) => {
    await page.goto('/router-history.playground');

    await runCode(page, `import '${baseURL}/Router.test.bundle.js';`);

    await expectStatus(page);
  });

  test('createComponent()', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/createComponent.test.bundle.js';`);

    await expectStatus(page);
  });

  test('css()', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/css.test.bundle.js';`);

    await expectStatus(page);
  });

  test('html()', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/html.test.bundle.js';`);

    await expectStatus(page);
  });

  test('dom', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/dom.test.bundle.js';`);

    await expectStatus(page);
  });
});
