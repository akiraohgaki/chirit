import { expect, test } from '@playwright/test';

test.describe('NodeStructure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nodestructure.playground');
  });

  test('style sheets', async ({ page, baseURL }) => {
    const code = `
      import { NodeStructure } from '${baseURL}/mod.bundle.js';

      class TestElement extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
          this.shadowRoot.innerHTML = '<span>NodeStructure</span>';
        }
      }

      customElements.define('test-element', TestElement);

      playground.preview.set('<test-element></test-element>');

      const testElement = playground.preview.get().querySelector('test-element');

      const nodeStructure = new NodeStructure(testElement.shadowRoot);

      playground.logs.add(Array.from(nodeStructure.host.adoptedStyleSheets).length);

      const style = ':host { font-size: 140%; }';
      nodeStructure.adoptStyles(style);

      playground.logs.add(Array.from(nodeStructure.host.adoptedStyleSheets).length);

      const sheet = new CSSStyleSheet();
      sheet.replaceSync(':host { color: red; }');
      nodeStructure.adoptStyles(sheet);

      playground.logs.add(Array.from(nodeStructure.host.adoptedStyleSheets).length);

      nodeStructure.adoptStyles([style, sheet]);

      playground.logs.add(Array.from(nodeStructure.host.adoptedStyleSheets).length);

      nodeStructure.adoptStyles([...nodeStructure.host.adoptedStyleSheets, style, sheet]);

      playground.logs.add(Array.from(nodeStructure.host.adoptedStyleSheets).length);
    `;

    const logs = [
      '0',
      '1',
      '1',
      '2',
      '4',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('content', async ({ page, baseURL }) => {
    const code = `
      import { NodeStructure } from '${baseURL}/mod.bundle.js';

      const host = document.createElement('div');

      playground.preview.set(host);

      const nodeStructure = new NodeStructure(host);

      playground.logs.add(nodeStructure.host.outerHTML);

      const html = '<span>1</span>';
      nodeStructure.update(html);

      playground.logs.add(nodeStructure.host.outerHTML);

      const node = document.createElement('span');
      node.textContent = '2';
      nodeStructure.update(node);

      playground.logs.add(nodeStructure.host.outerHTML);

      const templateForNodeList = document.createElement('template');
      templateForNodeList.innerHTML = '<span>3</span><span>4</span>';
      nodeStructure.update(templateForNodeList.content.childNodes);

      playground.logs.add(nodeStructure.host.outerHTML);

      const templateForDocumentFragment = document.createElement('template');
      templateForDocumentFragment.innerHTML = '<span>5</span><span>6</span>';
      nodeStructure.update(templateForDocumentFragment.content);

      playground.logs.add(nodeStructure.host.outerHTML);
    `;

    const logs = [
      '<div></div>',
      '<div><span>1</span></div>',
      '<div><span>2</span></div>',
      '<div><span>3</span><span>4</span></div>',
      '<div><span>5</span><span>6</span></div>',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('diff and patch', async ({ page, baseURL }) => {
    const code = `
      import { NodeStructure } from '${baseURL}/mod.bundle.js';

      const host = document.createElement('div');

      playground.preview.set(host);

      const nodeStructure = new NodeStructure(host);

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<span>1</span>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<span>1</span><span>2</span>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p>a</p><span>1</span><span>2</span>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p>a</p>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p title="a">a</p>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p title="a" class="a">a</p>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="a">a</p>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="b">a</p>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="b">b</p>');

      playground.logs.add(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="b"><span>c</span></p>');

      playground.logs.add(nodeStructure.host.outerHTML);
    `;

    const logs = [
      '<div></div>',
      '<div><span>1</span></div>',
      '<div><span>1</span><span>2</span></div>',
      '<div><p>a</p><span>1</span><span>2</span></div>',
      '<div><p>a</p></div>',
      '<div><p title="a">a</p></div>',
      '<div><p title="a" class="a">a</p></div>',
      '<div><p class="a">a</p></div>',
      '<div><p class="b">a</p></div>',
      '<div><p class="b">b</p></div>',
      '<div><p class="b"><span>c</span></p></div>',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('event binding', async ({ page, baseURL }) => {
    const code = `
      import { NodeStructure } from '${baseURL}/mod.bundle.js';

      const host = document.createElement('div');

      playground.preview.set(host);

      const context = {
        eventHandler: (event) => {
          playground.logs.add(event.type);
        }
      };

      const nodeStructure = new NodeStructure(host, context);

      const button1 = '<button data-onevent="true" onclick="this.eventHandler(event)">click me</button>';
      const button2 = '<button data-onevent="false">click me</button>';

      nodeStructure.update(button1);
      nodeStructure.update(button2 + button1);

      playground.logs.add(nodeStructure.host.outerHTML);
    `;

    const logs = [
      '<div><button data-onevent="false">click me</button><button data-onevent="true">click me</button></div>',
    ];

    const logsAfterButtonClick = [
      'click',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.locator('[data-content="preview"] button[data-onevent="false"]').click();
    await page.locator('[data-content="preview"] button[data-onevent="true"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      ...logsAfterButtonClick,
    ]);
  });

  test('clone', async ({ page, baseURL }) => {
    const code = `
      import { NodeStructure } from '${baseURL}/mod.bundle.js';

      const host = document.createElement('div');

      const nodeStructure = new NodeStructure(host);

      nodeStructure.update('<span>1</span>');

      playground.logs.add(nodeStructure.host.outerHTML);

      const clone = nodeStructure.clone();

      playground.logs.add(clone instanceof DocumentFragment);
      playground.logs.add(clone.querySelector('span').outerHTML);
    `;

    const logs = [
      '<div><span>1</span></div>',
      'true',
      '<span>1</span>',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('reference to host element', async ({ page, baseURL }, testInfo) => {
    const code = `
      import { NodeStructure } from '${baseURL}/mod.bundle.js';

      const host = document.createElement('div');
      host.id = 'nodestructure-host';

      const nodeStructure = new NodeStructure(host);

      host.remove();

      const timerId = setInterval(() => {
        try {
          if (nodeStructure.host.id) {
            void 0;
          }
        } catch (exception) {
          if (exception instanceof Error) {
            playground.logs.add('Error: ' + exception.message);
          }
          clearInterval(timerId);
        }
      }, 1000);
    `;

    let logs = [
      /Error: .+/,
    ];

    let timeout = 60000;

    // GC is slow in Firefox, so skip the check.
    if (testInfo.project.name === 'firefox') {
      logs = [];
      timeout = 1000;
    }

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs, {
      timeout,
    });
  });
});
