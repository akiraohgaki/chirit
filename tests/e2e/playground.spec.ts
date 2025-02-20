import type { Page } from '@playwright/test';

import { expect, test } from '@playwright/test';

async function runCode(page: Page, code: string): Promise<void> {
  await page.locator('[data-content="code"] code').fill(code);
  await page.locator('[data-action="code.run"]').click();
}

async function expectLogs(
  page: Page,
  logs: Array<string | RegExp>,
  timeout?: number,
): Promise<void> {
  await expect(page.locator('[data-content="log"]')).toHaveText(logs, { timeout });
}

test.describe('Testing on playground page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.playground');
  });

  test('dom', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/dom.test.bundle.js';`);

    await expectLogs(page, [
      'dom',
      'globalThis ... Passed',
      'globalThis.HTMLElement ... Passed',
    ]);
  });

  test('html()', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/html.test.bundle.js';`);

    await expectLogs(page, [
      'html()',
      'tagged template literal ... Passed',
    ]);
  });

  test('css()', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/css.test.bundle.js';`);

    await expectLogs(page, [
      'css()',
      'tagged template literal ... Passed',
    ]);
  });

  test('ElementAttributesProxy', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/ElementAttributesProxy.test.bundle.js';`);

    await expectLogs(page, [
      'ElementAttributesProxy',
      'constructor() ... Passed',
      'Proxy object',
      'attribute manipulation ... Passed',
      'garbage collection ... Passed',
    ], 60000);
  });

  test('Router - hash mode', async ({ page, baseURL }) => {
    await page.goto('/router-hash.playground');

    await runCode(page, `import '${baseURL}/playground/Router.test.bundle.js';`);

    await expectLogs(page, [
      'Router',
      'invalid routing mode ... Passed',
      'hash-based routing mode and base path ... Passed',
      'history-based routing mode and base path ... Passed',
      'constructor() ... Passed',
      'mode ... Passed',
      'base ... Passed',
      'size ... Passed',
      'set() ... Passed',
      'delete() ... Passed',
      'onchange() ... Passed',
      'onerror() ... Passed',
      'navigate() ... Passed',
      'Client-side routing',
      'navigation events ... Passed',
      'error handling ... Passed',
      'URL navigation ... Passed',
    ]);
  });

  test('Router - history mode', async ({ page, baseURL }) => {
    await page.goto('/router-history.playground');

    await runCode(page, `import '${baseURL}/playground/Router.test.bundle.js';`);

    await expectLogs(page, [
      'Router',
      'invalid routing mode ... Passed',
      'hash-based routing mode and base path ... Passed',
      'history-based routing mode and base path ... Passed',
      'constructor() ... Passed',
      'mode ... Passed',
      'base ... Passed',
      'size ... Passed',
      'set() ... Passed',
      'delete() ... Passed',
      'onchange() ... Passed',
      'onerror() ... Passed',
      'navigate() ... Passed',
      'Client-side routing',
      'navigation events ... Passed',
      'error handling ... Passed',
      'URL navigation ... Passed',
    ]);
  });

  test('NodeStructure', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/NodeStructure.test.bundle.js';`);

    await expectLogs(page, [
      'NodeStructure',
      'constructor() ... Passed',
      'host ... Passed',
      'adoptStyles() ... Passed',
      'update() ... Passed',
      'clone() ... Passed',
      'DOM management',
      'DOM manipulation ... Passed',
      'event binding ... Passed',
      'garbage collection ... Passed',
    ], 60000);
  });

  test('CustomElement', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/CustomElement.test.bundle.js';`);

    await expectLogs(page, [
      'CustomElement',
      'observedAttributes() ... Passed',
      'define() ... Passed',
      'constructor() ... Passed',
      'updateCounter() ... Passed',
      'Custom element lifecycle callbacks',
      'created an instance of the element ... Passed',
      'connected to parent element ... Passed',
      'disconnected from parent element ... Passed',
      'to current document ... Passed',
      'to iframe document ... Passed',
      'transferred element to another document ... Passed',
      'initial changed ... Passed',
      'changed to another value ... Passed',
      'changed but same value ... Passed',
      'not an observed attribute ... Passed',
      'attribute changed ... Passed',
      'first time synchronous update ... Passed',
      'asynchronous updates after the first time ... Passed',
      'debounced updates ... Passed',
      'update ... Passed',
      'error in render() ... Passed',
      'error in updatedCallback() ... Passed',
      'error handling ... Passed',
    ]);
  });

  test('Component', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/Component.test.bundle.js';`);

    await expectLogs(page, [
      'Component',
      'constructor() ... Passed',
      'attr ... Passed',
      'structure ... Passed',
      'content ... Passed',
      'observe() ... Passed',
      'unobserve() ... Passed',
      'dispatch() ... Passed',
      'Content container',
      'default content container is ShadowRoot ... Passed',
      'custom content container ... Passed',
      'Rendering',
      'style ... Passed',
      'template ... Passed',
      'Event handling',
      'custom event bubbles ... Passed',
      'State management',
      'use State ... Passed',
      'use Store ... Passed',
    ]);
  });

  test('createComponent()', async ({ page, baseURL }) => {
    await runCode(page, `import '${baseURL}/playground/createComponent.test.bundle.js';`);

    await expectLogs(page, [
      'createComponent()',
      'custom element definition ... Passed',
      'specific base component ... Passed',
      'component lifecycle callbacks ... Passed',
    ]);
  });
});
