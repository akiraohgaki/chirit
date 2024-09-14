import { expect, test } from '@playwright/test';

test.describe('ElementAttributesProxy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/elementattributesproxy');
  });

  test('class instance', async ({ page }) => {
    const code = `
      const { ElementAttributesProxy } = this.chirit;

      const target = document.createElement('div');

      const elementAttributesProxy = new ElementAttributesProxy(target);

      this.addLog(elementAttributesProxy instanceof ElementAttributesProxy);
      this.addLog(elementAttributesProxy instanceof Object);
    `;

    const logs = [
      'false',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('attribute manipulation', async ({ page }) => {
    const code = `
      const { ElementAttributesProxy } = this.chirit;

      const target = document.createElement('div');
      this.addResult(target);
      this.addLog(target.outerHTML);

      const elementAttributesProxy = new ElementAttributesProxy(target);

      this.addLog(elementAttributesProxy.attr0);

      elementAttributesProxy.attr1 = '1';
      this.addLog(elementAttributesProxy.attr1);
      this.addResult(target);
      this.addLog(target.outerHTML);

      elementAttributesProxy['attr2'] = '2';
      this.addLog(elementAttributesProxy['attr2']);
      this.addResult(target);
      this.addLog(target.outerHTML);

      this.addLog(Object.keys(elementAttributesProxy).toSorted());
      this.addLog(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'attr1') !== undefined);

      delete elementAttributesProxy.attr2;
      this.addResult(target);
      this.addLog(target.outerHTML);

      this.addLog('attr1' in elementAttributesProxy);
      this.addLog('attr2' in elementAttributesProxy);
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
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('reference to target element', async ({ page }, testInfo) => {
    const code = `
      const { ElementAttributesProxy } = this.chirit;

      const target = document.createElement('div');
      target.id = 'element-attributes-proxy-target';

      const elementAttributesProxy = new ElementAttributesProxy(target);

      target.remove();

      const timerId = setInterval(() => {
        try {
          if (elementAttributesProxy.id) {
            void 0;
          }
        } catch (exception) {
          if (exception instanceof Error) {
            this.addLog('Error: ' + exception.message);
          }
          clearInterval(timerId);
        }
      }, 1000);
    `;

    const logs = [
      /Error: .+/,
    ];

    const logsFirefox = [];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(
      testInfo.project.name === 'firefox' ? logsFirefox : logs,
      { timeout: 1000 * 60 },
    );
  });
});
