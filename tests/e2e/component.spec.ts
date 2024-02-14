import { expect, test } from '@playwright/test';

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

test.describe('/component (by constructor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');

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
      'createContentContainer',
      '<test-component></test-component>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="prop-attr"]').click();
    await page.locator('[data-action="prop-content"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-updatecounter',
      '0',
      '<test-component></test-component>',
      'prop-attr',
      'object instance of ElementAttributesProxy: false',
      'object instance of Object: true',
      'attr.attr1: undefined',
      '<test-component></test-component>',
      'prop-content',
      'object instance of NodeContent: true',
      '<test-component></test-component>',
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
    await page.locator('[data-action="method-template"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-observe"]').click();
    await page.locator('[data-action="observable-notify"]').click();
    await sleep(200);
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-unobserve"]').click();
    await page.locator('[data-action="observable-notify"]').click();
    await page.locator('[data-action="method-dispatch"]').click();
    await page.locator('[data-action="method-createcontentcontainer"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component></test-component>',
      'prop-updatecounter',
      '1',
      '<test-component></test-component>',
      'method-updatesync',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component></test-component>',
      'prop-updatecounter',
      '2',
      '<test-component></test-component>',
      'method-render',
      'render',
      'template',
      '<test-component></test-component>',
      'prop-updatecounter',
      '2',
      '<test-component></test-component>',
      'method-template',
      'template',
      'blank string: true',
      '<test-component></test-component>',
      'prop-updatecounter',
      '2',
      '<test-component></test-component>',
      'method-observe',
      'observable-notify',
      'update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      'prop-updatecounter',
      '3',
      '<test-component></test-component>',
      'method-unobserve',
      'observable-notify',
      'method-dispatch',
      `eventHandler: custom-event ${JSON.stringify({ prop: 0 })}`,
      'method-createcontentcontainer',
      'object instance of ShadowRoot: true',
      '<test-component></test-component>',
    ]);
  });
});

test.describe('/component (by createElement)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');

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
      'createContentContainer',
      '<test-component></test-component>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="prop-attr"]').click();
    await page.locator('[data-action="prop-content"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-updatecounter',
      '0',
      '<test-component></test-component>',
      'prop-attr',
      'object instance of ElementAttributesProxy: false',
      'object instance of Object: true',
      'attr.attr1: undefined',
      '<test-component></test-component>',
      'prop-content',
      'object instance of NodeContent: true',
      '<test-component></test-component>',
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
    await page.locator('[data-action="method-template"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-observe"]').click();
    await page.locator('[data-action="observable-notify"]').click();
    await sleep(200);
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-unobserve"]').click();
    await page.locator('[data-action="observable-notify"]').click();
    await page.locator('[data-action="method-dispatch"]').click();
    await page.locator('[data-action="method-createcontentcontainer"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component></test-component>',
      'prop-updatecounter',
      '1',
      '<test-component></test-component>',
      'method-updatesync',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component></test-component>',
      'prop-updatecounter',
      '2',
      '<test-component></test-component>',
      'method-render',
      'render',
      'template',
      '<test-component></test-component>',
      'prop-updatecounter',
      '2',
      '<test-component></test-component>',
      'method-template',
      'template',
      'blank string: true',
      '<test-component></test-component>',
      'prop-updatecounter',
      '2',
      '<test-component></test-component>',
      'method-observe',
      'observable-notify',
      'update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      'prop-updatecounter',
      '3',
      '<test-component></test-component>',
      'method-unobserve',
      'observable-notify',
      'method-dispatch',
      `eventHandler: custom-event ${JSON.stringify({ prop: 0 })}`,
      'method-createcontentcontainer',
      'object instance of ShadowRoot: true',
      '<test-component></test-component>',
    ]);
  });
});

test.describe('/component (by HTML)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');

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
      'createContentContainer',
      'attributeChangedCallback',
      'connectedCallback',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="prop-attr"]').click();
    await page.locator('[data-action="prop-content"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'prop-updatecounter',
      '1',
      '<test-component attr1="attr1">test-component</test-component>',
      'prop-attr',
      'object instance of ElementAttributesProxy: false',
      'object instance of Object: true',
      'attr.attr1: attr1',
      '<test-component attr1="attr1">test-component</test-component>',
      'prop-content',
      'object instance of NodeContent: true',
      '<test-component attr1="attr1">test-component</test-component>',
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
    await page.locator('[data-action="method-template"]').click();
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-observe"]').click();
    await page.locator('[data-action="observable-notify"]').click();
    await sleep(200);
    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="method-unobserve"]').click();
    await page.locator('[data-action="observable-notify"]').click();
    await page.locator('[data-action="method-dispatch"]').click();
    await page.locator('[data-action="method-createcontentcontainer"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'method-update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',
      'prop-updatecounter',
      '2',
      '<test-component attr1="attr1">test-component</test-component>',
      'method-updatesync',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',
      'prop-updatecounter',
      '3',
      '<test-component attr1="attr1">test-component</test-component>',
      'method-render',
      'render',
      'template',
      '<test-component attr1="attr1">test-component</test-component>',
      'prop-updatecounter',
      '3',
      '<test-component attr1="attr1">test-component</test-component>',
      'method-template',
      'template',
      'blank string: true',
      '<test-component attr1="attr1">test-component</test-component>',
      'prop-updatecounter',
      '3',
      '<test-component attr1="attr1">test-component</test-component>',
      'method-observe',
      'observable-notify',
      'update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      'prop-updatecounter',
      '4',
      '<test-component attr1="attr1">test-component</test-component>',
      'method-unobserve',
      'observable-notify',
      'method-dispatch',
      `eventHandler: custom-event ${JSON.stringify({ prop: 0 })}`,
      'method-createcontentcontainer',
      'object instance of ShadowRoot: true',
      '<test-component attr1="attr1">test-component</test-component>',
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
    //await page.locator('[data-action="callback-adoptedcallback"]').click();
    //await sleep(200);
    await page.locator('[data-action="callback-updatedcallback"]').click();
    await page.locator('[data-action="callback-errorcallback"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'callback-attributechangedcallback',
      'attributeChangedCallback',
      '<test-component attr1="attr1">test-component</test-component>',
      'attributeChangedCallback',
      'update',
      '<test-component attr1="text">test-component</test-component>',
      'attributeChangedCallback',
      'update',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      'callback-connectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      'callback-disconnectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      //'callback-adoptedcallback',
      //'disconnectedCallback',
      //'adoptedCallback',
      //'connectedCallback',
      //'update',
      //'disconnectedCallback',
      //'adoptedCallback',
      //'connectedCallback',
      //'update',
      //'<test-component attr1="attr1">test-component</test-component>',
      //'updateSync',
      //'render',
      //'template',
      //'updatedCallback',
      'callback-updatedcallback',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',
      'callback-errorcallback',
      'updateSync',
      'render',
      'template',
      'errorCallback',
      'exception: error',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'errorCallback',
      'exception: error',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      'errorCallback',
      'exception: error',
      '<test-component attr1="attr1">test-component</test-component>',
    ]);
  });
});
