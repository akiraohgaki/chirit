import { expect, test } from '@playwright/test';

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

test.describe('/customelement (by constructor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');

    await page.locator('[data-action="method-define"]').click();
    await page.locator('[data-action="init-constructor"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'method-define',
      'observedAttributes',
      'defined: true',
      'init-constructor',
      'constructor',
      '<test-element></test-element>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-updatecounter',
      '0',
      '<test-element></test-element>',
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
      'method-update',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element></test-element>',
      'prop-updatecounter',
      '1',
      '<test-element></test-element>',
      'method-updatesync',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element></test-element>',
      'prop-updatecounter',
      '2',
      '<test-element></test-element>',
      'method-render',
      'render',
      '<test-element></test-element>',
      'prop-updatecounter',
      '2',
      '<test-element></test-element>',
    ]);
  });
});

test.describe('/customelement (by createElement)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');

    await page.locator('[data-action="method-define"]').click();
    await page.locator('[data-action="init-createelement"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'method-define',
      'observedAttributes',
      'defined: true',
      'init-createelement',
      'constructor',
      '<test-element></test-element>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-updatecounter',
      '0',
      '<test-element></test-element>',
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
      'method-update',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element></test-element>',
      'prop-updatecounter',
      '1',
      '<test-element></test-element>',
      'method-updatesync',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element></test-element>',
      'prop-updatecounter',
      '2',
      '<test-element></test-element>',
      'method-render',
      'render',
      '<test-element></test-element>',
      'prop-updatecounter',
      '2',
      '<test-element></test-element>',
    ]);
  });
});

test.describe('/customelement (by HTML)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');

    await page.locator('[data-action="method-define"]').click();
    await page.locator('[data-action="init-html"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'method-define',
      'observedAttributes',
      'defined: true',
      'init-html',
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
      'prop-updatecounter',
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
      'method-update',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',
      'prop-updatecounter',
      '2',
      '<test-element attr1="attr1">test-element</test-element>',
      'method-updatesync',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',
      'prop-updatecounter',
      '3',
      '<test-element attr1="attr1">test-element</test-element>',
      'method-render',
      'render',
      '<test-element attr1="attr1">test-element</test-element>',
      'prop-updatecounter',
      '3',
      '<test-element attr1="attr1">test-element</test-element>',
    ]);
  });

  test('Callbacks', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="callback-attributechangedcallback"]').click();
    await sleep(200);
    await page.locator('[data-action="callback-connectedcallback"]').click();
    await sleep(200);
    await page.locator('[data-action="callback-disconnectedcallback"]').click();
    await sleep(200);
    await page.locator('[data-action="callback-adoptedcallback"]').click();
    await sleep(200);
    await page.locator('[data-action="callback-updatedcallback"]').click();
    await page.locator('[data-action="callback-errorcallback"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'callback-attributechangedcallback',
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
      'callback-connectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',
      'callback-disconnectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-element attr1="attr1">test-element</test-element>',
      'updateSync',
      'render',
      'updatedCallback',
      'callback-adoptedcallback',
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
      'callback-updatedcallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr1="attr1">test-element</test-element>',
      'callback-errorcallback',
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
