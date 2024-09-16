import { expect, test } from '@playwright/test';

test.describe('createComponent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/createcomponent');
  });

  test('custom element definition', async ({ page }) => {
    const code = `
      const { createComponent, Component } = this.chirit;

      const TestComponent = createComponent('test-component');

      this.addLog(customElements.get('test-component') !== undefined);

      this.addLog(TestComponent instanceof Component);
      this.addLog(TestComponent instanceof Function);
    `;

    const logs = [
      'true',
      'false',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('connected or disconnected', async ({ page }) => {
    const code = `
      const { createComponent } = this.chirit;
      const addLog = this.addLog;

      createComponent('test-component', {
        observedAttributes: ['attr1'],
        init: (_context) => {
          addLog('init');
        },
        connected: (_context) => {
          addLog('connected');
        },
        disconnected: (_context) => {
          addLog('disconnected');
        },
        styles: () => {
          addLog('styles');
          return ':host { color: red; }';
        },
        template: (context) => {
          addLog('template');
          return '<span>' + context.attr.attr1 + '</span>';
        }
      });

      this.addResult('<test-component attr1="1"></test-component>');

      const testComponent = document.querySelector('test-component');
      this.addLog(testComponent.outerHTML);
      this.addLog(testComponent.content.innerHTML);

      testComponent.remove();
    `;

    const logs = [
      'init',
      'styles',
      'template',
      'connected',
      '<test-component attr1="1"></test-component>',
      '<span>1</span>',
      'disconnected',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
