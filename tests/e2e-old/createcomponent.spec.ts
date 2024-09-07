import { expect, test } from '@playwright/test';
import { sleep } from './util.ts';

test.describe('/createcomponent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/createcomponent');

    await page.locator('[data-action="function-createcomponent"]').click();
    await page.locator('[data-action="init-html"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: function-createcomponent',
      'defined: true',

      'action: init-html',
      'init',
      'template',
      'connected',
      '<test-component attr1="attr1">test-component</test-component>',
      '<p>attr1=attr1</p>',
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

    await expect(page.locator('[data-log]')).toHaveText([
      'action: callback-attributechangedcallback',
      '<test-component attr1="attr1">test-component</test-component>',
      '<p>attr1=attr1</p>',
      '<test-component attr1="text">test-component</test-component>',
      '<p>attr1=attr1</p>',
      'template',

      'action: callback-connectedcallback',
      'disconnected',
      'connected',
      '<test-component attr1="text">test-component</test-component>',
      '<p>attr1=text</p>',
      'template',

      'action: callback-disconnectedcallback',
      'disconnected',
      'connected',
      '<test-component attr1="text">test-component</test-component>',
      '<p>attr1=text</p>',
      'template',
    ]);
  });

  test('DOM element events', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="dom-elementevent"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: dom-elementevent',
      'eventHandler: custom-event {"prop":0}',
      '<test-component attr1="attr1">test-component</test-component>',
      '<p>attr1=attr1</p>',
    ]);
  });

  test('Object instance', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="object-instance"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: object-instance',
      'class instance of Component: false',
      'class instance of Function: true',
      'object instance of Component: true',
      'object instance of Function: false',
    ]);
  });
});
