import { expect, test } from '@playwright/test';

test.describe('createComponent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/createcomponent.playground');
  });

  test('custom element definition', async ({ page, baseURL }) => {
    const code = `
      import { createComponent, Component } from '${baseURL}/mod.bundle.js';

      const TestComponent = createComponent('test-component');

      playground.logs.add(customElements.get('test-component') !== undefined);
      playground.logs.add(TestComponent instanceof Component);
      playground.logs.add(TestComponent instanceof Function);
    `;

    const logs = [
      'true',
      'false',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('connected or disconnected', async ({ page, baseURL }) => {
    const code = `
      import { createComponent } from '${baseURL}/mod.bundle.js';

      createComponent('test-component', {
        observedAttributes: ['attr1'],
        init: (_context) => {
          playground.logs.add('init');
        },
        connected: (_context) => {
          playground.logs.add('connected');
        },
        disconnected: (_context) => {
          playground.logs.add('disconnected');
        },
        styles: () => {
          playground.logs.add('styles');
          return ':host { color: red; }';
        },
        template: (context) => {
          playground.logs.add('template');
          return '<span>attr1:' + context.attr.attr1 + '</span>';
        }
      });

      playground.content.set('<test-component attr1="1"></test-component>');

      const testComponent = playground.content.get().querySelector('test-component');

      playground.logs.add(testComponent.outerHTML);
      playground.logs.add(testComponent.content.innerHTML);

      testComponent.remove();
    `;

    const logs = [
      'init',
      'styles',
      'template',
      'connected',
      '<test-component attr1="1"></test-component>',
      '<span>attr1:1</span>',
      'disconnected',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
