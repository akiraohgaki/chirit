import { expect, test } from '@playwright/test';

const testElementDefinitionCode = `
  const { CustomElement } = this.chirit;
  const addLog = this.addLog;

  let isRenderError = false;
  let isUpdatedCallbackError = false;

  class TestElement extends CustomElement {
    static get observedAttributes() {
      addLog('observedAttributes');
      return ['attr1', ...super.observedAttributes];
    }
    constructor() {
      addLog('constructor');
      super();
    }
    attributeChangedCallback(name, oldValue, newValue, namespace) {
      addLog('attributeChangedCallback');
      super.attributeChangedCallback(name, oldValue, newValue, namespace);
    }
    connectedCallback() {
      addLog('connectedCallback');
      super.connectedCallback();
    }
    disconnectedCallback() {
      addLog('disconnectedCallback');
      super.disconnectedCallback();
    }
    adoptedCallback(oldDocument, newDocument) {
      addLog('adoptedCallback');
      super.adoptedCallback(oldDocument, newDocument);
    }
    update() {
      addLog('update');
      return super.update();
    }
    updateSync() {
      addLog('updateSync');
      super.updateSync();
    }
    render() {
      addLog('render');
      if (isRenderError) {
        throw new Error('error');
      }
      super.render();
      if (this.getAttribute('attr0') || this.getAttribute('attr1')) {
        this.textContent = 'attr0:' + this.getAttribute('attr0') + ';'
          + 'attr1:' + this.getAttribute('attr1') + ';';
      }
    }
    updatedCallback() {
      addLog('updatedCallback');
      if (isUpdatedCallbackError) {
        throw new Error('error');
      }
      super.updatedCallback();
    }
    errorCallback(exception) {
      addLog('errorCallback');
      if (exception instanceof Error) {
        addLog(exception.message);
      }
      super.errorCallback(exception);
    }
  }

  TestElement.define('test-element');
`;

test.describe('CustomElement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customelement');
  });

  test('custom element definition', async ({ page }) => {
    const code = `
      ${testElementDefinitionCode}

      this.addLog(customElements.get('test-element') !== undefined);
    `;

    const logs = [
      'observedAttributes',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('connected or disconnected', async ({ page }) => {
    const code = `
      ${testElementDefinitionCode}

      this.addResult('<test-element></test-element>');

      const testElement = document.querySelector('test-element');
      this.addLog(testElement.outerHTML);

      testElement.remove();
    `;

    const logs = [
      'observedAttributes',
      'constructor',
      'connectedCallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element></test-element>',
      'disconnectedCallback',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('moved to a different page', async ({ page }) => {
    const code = `
      ${testElementDefinitionCode}

      this.addResult('<test-element></test-element>');

      const testElement = document.querySelector('test-element');
      this.addLog(testElement.outerHTML);

      const iframe = document.createElement('iframe');
      iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
      this.addResult(iframe);

      document.querySelector('iframe').contentWindow.document.body.appendChild(testElement);
    `;

    const logs = [
      'observedAttributes',
      'constructor',
      'connectedCallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element></test-element>',
      'disconnectedCallback',
      'adoptedCallback',
      'connectedCallback',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('attribute changed', async ({ page }) => {
    const code = `
      ${testElementDefinitionCode}

      this.addResult('<test-element attr0="0" attr1="1"></test-element>');

      const testElement = document.querySelector('test-element');
      this.addLog(testElement.outerHTML);

      testElement.setAttribute('attr0', 'a');
      await this.wait(100);
      this.addLog(testElement.outerHTML);

      testElement.setAttribute('attr1', 'b');
      await this.wait(100);
      this.addLog(testElement.outerHTML);

      testElement.setAttribute('attr1', 'c');
      testElement.setAttribute('attr1', 'd');
      testElement.setAttribute('attr1', 'e');
      testElement.setAttribute('attr1', 'f');
      await this.wait(100);
      this.addLog(testElement.outerHTML);
    `;

    const logs = [
      'observedAttributes',
      'constructor',
      'attributeChangedCallback',
      'connectedCallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr0="0" attr1="1">attr0:0;attr1:1;</test-element>',
      '<test-element attr0="a" attr1="1">attr0:0;attr1:1;</test-element>',
      'attributeChangedCallback',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr0="a" attr1="b">attr0:a;attr1:b;</test-element>',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr0="a" attr1="f">attr0:a;attr1:f;</test-element>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('asynchronous update', async ({ page }) => {
    const code = `
      ${testElementDefinitionCode}

      this.addResult('<test-element attr0="0" attr1="1"></test-element>');

      const testElement = document.querySelector('test-element');
      this.addLog(testElement.updateCounter);

      testElement.setAttribute('attr1', 'a');
      await this.wait(100);
      this.addLog(testElement.updateCounter);

      testElement.setAttribute('attr1', 'b');
      testElement.setAttribute('attr1', 'c');
      testElement.setAttribute('attr1', 'd');
      testElement.setAttribute('attr1', 'e');
      testElement.setAttribute('attr1', 'f');
      await this.wait(100);
      this.addLog(testElement.updateCounter);
    `;

    const logs = [
      'observedAttributes',
      'constructor',
      'attributeChangedCallback',
      'connectedCallback',
      'updateSync',
      'render',
      'updatedCallback',
      '1',
      'attributeChangedCallback',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '2',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'attributeChangedCallback',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      '3',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('error handling', async ({ page }) => {
    const code = `
      ${testElementDefinitionCode}

      this.addResult('<test-element attr0="0" attr1="1"></test-element>');

      const testElement = document.querySelector('test-element');
      this.addLog(testElement.outerHTML);

      isRenderError = true;
      isUpdatedCallbackError = false;

      testElement.setAttribute('attr1', 'a');
      await this.wait(100);
      this.addLog(testElement.outerHTML);

      isRenderError = false;
      isUpdatedCallbackError = true;

      testElement.setAttribute('attr1', 'b');
      await this.wait(100);
      this.addLog(testElement.outerHTML);
    `;

    const logs = [
      'observedAttributes',
      'constructor',
      'attributeChangedCallback',
      'connectedCallback',
      'updateSync',
      'render',
      'updatedCallback',
      '<test-element attr0="0" attr1="1">attr0:0;attr1:1;</test-element>',
      'attributeChangedCallback',
      'update',
      'updateSync',
      'render',
      'errorCallback',
      'error',
      '<test-element attr0="0" attr1="a">attr0:0;attr1:1;</test-element>',
      'attributeChangedCallback',
      'update',
      'updateSync',
      'render',
      'updatedCallback',
      'errorCallback',
      'error',
      '<test-element attr0="0" attr1="b">attr0:0;attr1:b;</test-element>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
