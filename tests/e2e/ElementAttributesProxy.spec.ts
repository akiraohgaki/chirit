import { expect, test } from '@playwright/test';

test.describe('ElementAttributesProxy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ElementAttributesProxy.playground');
  });

  test('class instance', async ({ page, baseURL }) => {
    const code = `
      import { ElementAttributesProxy } from '${baseURL}/mod.bundle.js';

      const target = document.createElement('div');

      const elementAttributesProxy = new ElementAttributesProxy(target);

      playground.logs.add(elementAttributesProxy instanceof ElementAttributesProxy);
      playground.logs.add(elementAttributesProxy instanceof Object);
    `;

    const logs = [
      'false',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('attribute manipulation', async ({ page, baseURL }) => {
    const code = `
      import { ElementAttributesProxy } from '${baseURL}/mod.bundle.js';

      const target = document.createElement('div');

      playground.preview.set(target);

      playground.logs.add(target.outerHTML);

      const elementAttributesProxy = new ElementAttributesProxy(target);

      playground.logs.add(elementAttributesProxy.attr0);

      elementAttributesProxy.attr1 = '1';

      playground.logs.add(elementAttributesProxy.attr1);

      playground.logs.add(target.outerHTML);

      elementAttributesProxy['attr2'] = '2';

      playground.logs.add(elementAttributesProxy['attr2']);

      playground.logs.add(target.outerHTML);

      playground.logs.add(Object.keys(elementAttributesProxy).toSorted());
      playground.logs.add(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'attr1') !== undefined);

      delete elementAttributesProxy.attr2;

      playground.logs.add(target.outerHTML);

      playground.logs.add('attr1' in elementAttributesProxy);
      playground.logs.add('attr2' in elementAttributesProxy);
    `;

    const logs = [
      '<div></div>',
      'undefined',
      '1',
      '<div attr1="1"></div>',
      '2',
      '<div attr1="1" attr2="2"></div>',
      '["attr1","attr2"]',
      'true',
      '<div attr1="1"></div>',
      'true',
      'false',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('reference to target element', async ({ page, baseURL }, testInfo) => {
    const code = `
      import { ElementAttributesProxy } from '${baseURL}/mod.bundle.js';

      const target = document.createElement('div');
      target.id = 'element-attributes-proxy-target';

      const elementAttributesProxy = new ElementAttributesProxy(target);

      target.remove();

      const intervalId = setInterval(() => {
        try {
          if (elementAttributesProxy.id) {
            void 0;
          }
        } catch (exception) {
          if (exception instanceof Error) {
            playground.logs.add('Error: ' + exception.message);
          }
          clearInterval(intervalId);
        }
      }, 1000);
    `;

    let logs = [
      /Error: .+/,
    ];

    let timeout = 60000;

    // GC is slow in Firefox, so skip the check.
    if (testInfo.project.name === 'firefox') {
      logs = [];
      timeout = 1000;
    }

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs, {
      timeout,
    });
  });
});
