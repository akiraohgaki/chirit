import { expect, test } from '@playwright/test';

test.describe('/nodecontent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nodecontent');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'action: init',
      '<div></div>',
    ]);
  });

  test('Properties', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="prop-container"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: prop-container',
      '<div></div>',
      '<div></div>',
    ]);
  });

  test('Methods', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="method-update-string"]').click();
    await page.locator('[data-action="method-update-documentfragment"]').click();
    await page.locator('[data-action="method-update-node"]').click();
    await page.locator('[data-action="method-update-nodelist"]').click();
    await page.locator('[data-action="method-clone"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: method-update-string',
      '<div><p>string</p></div>',

      'action: method-update-documentfragment',
      '<div><p>DocumentFragment</p></div>',

      'action: method-update-node',
      '<div><p>Node</p></div>',

      'action: method-update-nodelist',
      '<div><p>NodeList</p><p>NodeList</p></div>',

      'action: method-clone',
      '<p>NodeList</p><p>NodeList</p>',
      '<div><p>NodeList</p><p>NodeList</p></div>',
    ]);
  });

  test('DOM element', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="dom-element"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: dom-element',
      '<div><ul><li title="1">1</li></ul></div>',
      '<div><ul><li title="1">1</li><li title="2">2</li></ul></div>',
      'li[title="1"] is same object reference: true',
      '<div><ul><li title="0">0</li><li title="1">1</li><li title="2">2</li></ul></div>',
      'li[title="1"] is same object reference: false',
      'li[title="2"] is same object reference: false',
      '<div><ol><li title="0">0</li><li title="1">1</li><li title="2">2</li></ol></div>',
      'li[title="0"] is same object reference: false',
      'li[title="1"] is same object reference: false',
      'li[title="2"] is same object reference: false',
    ]);
  });

  test('DOM element attributes', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="dom-elementattribute"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: dom-elementattribute',
      '<div><p>has no attributes</p></div>',
      '<div><p attr1="attr1" data-attr2="attr2">has attributes</p></div>',
      'p is same object reference: true',
      '<div><p>has no attributes</p></div>',
      'p is same object reference: true',
    ]);
  });

  test('DOM element events', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="dom-elementevent"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'action: dom-elementevent',
      'eventHandler: click',
      '<div><p>has click event</p></div>',
    ]);
  });
});
