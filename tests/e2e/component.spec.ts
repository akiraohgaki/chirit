import { expect, test } from '@playwright/test';
import { sleep } from './util.ts';

const propLogs = [
  'action: prop-updatecounter',
  '0',
  '<test-component></test-component>',

  'action: prop-attr',
  'object instance of ElementAttributesProxy: false',
  'object instance of Object: true',
  'attr.attr1: undefined',
  '<test-component></test-component>',

  'action: prop-structure',
  'object instance of NodeStructure: true',
  '<test-component></test-component>',

  'action: prop-content',
  'object instance of ShadowRoot: true',
  '<test-component></test-component>',
];

const methodLogs = [
  'action: method-update',
  'update',
  'updateSync',
  'render',
  'template',
  'updatedCallback',
  '<test-component></test-component>',

  'action: prop-updatecounter',
  '1',
  '<test-component></test-component>',

  'action: method-updatesync',
  'updateSync',
  'render',
  'template',
  'updatedCallback',
  '<test-component></test-component>',

  'action: prop-updatecounter',
  '2',
  '<test-component></test-component>',

  'action: method-render',
  'render',
  'template',
  '<test-component></test-component>',

  'action: prop-updatecounter',
  '2',
  '<test-component></test-component>',

  'action: method-template',
  'template',
  'blank string: true',
  '<test-component></test-component>',

  'action: prop-updatecounter',
  '2',
  '<test-component></test-component>',

  'action: method-observe',

  'action: observable-notify',
  'update',
  'update',
  'updateSync',
  'render',
  'template',
  'updatedCallback',

  'action: prop-updatecounter',
  '3',
  '<test-component></test-component>',

  'action: method-unobserve',

  'action: observable-notify',

  'action: method-dispatch',
  `eventHandler: custom-event ${JSON.stringify({ prop: 0 })}`,

  'action: method-createcontentcontainer',
  'object instance of ShadowRoot: true',
  '<test-component></test-component>',
];

test.describe('/component (constructor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');

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
      'createContentContainer',
      '<test-component></test-component>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="prop-attr"]').click();
    await page.locator('[data-action="prop-structure"]').click();
    await page.locator('[data-action="prop-content"]').click();

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

    await expect(page.locator('[data-log]')).toHaveText(methodLogs);
  });
});

test.describe('/component (createElement)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');

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
      'createContentContainer',
      '<test-component></test-component>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-updatecounter"]').click();
    await page.locator('[data-action="prop-attr"]').click();
    await page.locator('[data-action="prop-structure"]').click();
    await page.locator('[data-action="prop-content"]').click();

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

    await expect(page.locator('[data-log]')).toHaveText(methodLogs);
  });
});

test.describe('/component (HTML)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');

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
    await page.locator('[data-action="prop-structure"]').click();
    await page.locator('[data-action="prop-content"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-updatecounter',
      '1',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-attr',
      'object instance of ElementAttributesProxy: false',
      'object instance of Object: true',
      'attr.attr1: attr1',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-structure',
      'object instance of NodeStructure: true',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-content',
      'object instance of ShadowRoot: true',
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
      'action: method-update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-updatecounter',
      '2',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: method-updatesync',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-updatecounter',
      '3',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: method-render',
      'render',
      'template',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-updatecounter',
      '3',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: method-template',
      'template',
      'blank string: true',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: prop-updatecounter',
      '3',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: method-observe',

      'action: observable-notify',
      'update',
      'update',
      'updateSync',
      'render',
      'template',
      'updatedCallback',

      'action: prop-updatecounter',
      '4',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: method-unobserve',

      'action: observable-notify',

      'action: method-dispatch',
      `eventHandler: custom-event ${JSON.stringify({ prop: 0 })}`,

      'action: method-createcontentcontainer',
      'object instance of ShadowRoot: true',
      '<test-component attr1="attr1">test-component</test-component>',
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
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
    ];

    await expect(page.locator('[data-log]')).toHaveText([
      'action: callback-attributechangedcallback',
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

      'action: callback-connectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',

      'action: callback-disconnectedcallback',
      'disconnectedCallback',
      'connectedCallback',
      'update',
      '<test-component attr1="attr1">test-component</test-component>',
      'updateSync',
      'render',
      'template',
      'updatedCallback',

      ...callbackAdoptedcallbackLogs,

      'action: callback-updatedcallback',
      'updateSync',
      'render',
      'template',
      'updatedCallback',
      '<test-component attr1="attr1">test-component</test-component>',

      'action: callback-errorcallback',
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
