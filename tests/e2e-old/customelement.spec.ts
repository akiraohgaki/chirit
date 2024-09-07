import { expect, test } from '@playwright/test';
import { sleep } from './util.ts';

const propLogs = [
  'action: prop-updatecounter',
  '0',
  '<test-element></test-element>',
];

const methodLogs = [
  'action: method-update',
  'update',
  'updateSync',
  'render',
  'updatedCallback',
  '<test-element></test-element>',

  'action: prop-updatecounter',
  '1',
  '<test-element></test-element>',

  'action: method-updatesync',
  'updateSync',
  'render',
  'updatedCallback',
  '<test-element></test-element>',

  'action: prop-updatecounter',
  '2',
  '<test-element></test-element>',

  'action: method-render',
  'render',
  '<test-element></test-element>',

  'action: prop-updatecounter',
  '2',
  '<test-element></test-element>',
];

test.describe('/customelement (constructor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');

    await page.locator('[data-action="method-define"]').click();
    await page.locator('[data-action="init-constructor"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-define',
      'observedAttributes',
      'defined: true',

      'action: init-constructor',
      'constructor',
      '<test-element></test-element>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText(propLogs);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-update"]').click();
    await sleep(200);
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-updatesync"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-render"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText(methodLogs);
  });
});

test.describe('/customelement (createElement)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');

    await page.locator('[data-action="method-define"]').click();
    await page.locator('[data-action="init-createelement"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-define',
      'observedAttributes',
      'defined: true',

      'action: init-createelement',
      'constructor',
      '<test-element></test-element>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText(propLogs);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-update"]').click();
    await sleep(200);
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-updatesync"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-render"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText(methodLogs);
  });
});

test.describe('/customelement (HTML)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');

    await page.locator('[data-action="method-define"]').click();
    await page.locator('[data-action="init-html"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-define',
      'observedAttributes',
      'defined: true',

      'action: init-html',
      'constructor',
      'attributeChangedCallback',
      'connectedCallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-updatecounter',
      '1',
      '<test-element attr1="attr1">test-element</test-element>',
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-update"]').click();
    await sleep(200);
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-updatesync"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-render"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-update',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',

      'action: prop-updatecounter',
      '2',
      '<test-element attr1="attr1">test-element</test-element>',

      'action: method-updatesync',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',

      'action: prop-updatecounter',
      '3',
      '<test-element attr1="attr1">test-element</test-element>',

      'action: method-render',
      'render',
      '<test-element attr1="attr1">test-element</test-element>',

      'action: prop-updatecounter',
      '3',
      '<test-element attr1="attr1">test-element</test-element>',
    ]);
  });

  test('Callbacks', async ({ page }, testInfo) => {
    const isFirefox = testInfo.project.name === 'firefox';

    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="callback-attributechangedcallback"]').click();
    await sleep(200);
    await page.locator('[data-action="callback-connectedcallback"]').click();
    await sleep(200);
    await page.locator('[data-action="callback-disconnectedcallback"]').click();
    await sleep(200);
    if (!isFirefox) {
      // Skip with Firefox,
      // because when move a custom element to another document,
      // Firefox resets the element as an unknown tag
      await page.locator('[data-action="callback-adoptedcallback"]').click();
      await sleep(200);
    }
    await page.locator('[data-action="callback-updatedcallback"]').click();
    await page.locator('[data-action="callback-errorcallback"]').click();

    const callbackAdoptedcallbackLogs = isFirefox ? [] : [
      'action: callback-adoptedcallback',
      'disconnectedCallback',
      'adoptedCallback',
      'connectedCallback',
      'update',
      'disconnectedCallback',
      'adoptedCallback',
      'connectedCallback',
      'update',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',
    ];

    await expect(page.locator('[data-log]')).toHaveText([
      'action: callback-attributechangedcallback',
      'attributeChangedCallback',
      '<test-element attr1="attr1">test-element</test-element>',
      'attributeChangedCallback',
      'update',
      '<test-element attr1="text">test-element</test-element>',
      'attributeChangedCallback',
      'update',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',

      'action: callback-connectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',

      'action: callback-disconnectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',

      ...callbackAdoptedcallbackLogs,

      'action: callback-updatedcallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',

      'action: callback-errorcallback',
      'updateSync',
      'render',
      'errorCallback',
      'exception: error',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',
      'errorCallback',
      'exception: error',
      '<test-element attr1="attr1">test-element</test-element>',
    ]);
  });
});
