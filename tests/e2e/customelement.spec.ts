import { expect, test } from "@playwright/test";

const testElementDefinitionCode = `
  let isRenderError = false;
  let isUpdatedCallbackError = false;

  class TestElement extends CustomElement {
    static get observedAttributes() {
      playground.logs.add('observedAttributes');
      return ['attr1', ...super.observedAttributes];
    }
    constructor() {
      playground.logs.add('constructor');
      super();
    }
    attributeChangedCallback(name, oldValue, newValue, namespace) {
      playground.logs.add('attributeChangedCallback');
      super.attributeChangedCallback(name, oldValue, newValue, namespace);
    }
    connectedCallback() {
      playground.logs.add('connectedCallback');
      super.connectedCallback();
    }
    disconnectedCallback() {
      playground.logs.add('disconnectedCallback');
      super.disconnectedCallback();
    }
    adoptedCallback(oldDocument, newDocument) {
      playground.logs.add('adoptedCallback');
      super.adoptedCallback(oldDocument, newDocument);
    }
    update() {
      playground.logs.add('update');
      return super.update();
    }
    updateSync() {
      playground.logs.add('updateSync');
      super.updateSync();
    }
    render() {
      playground.logs.add('render');
      if (isRenderError) {
        throw new Error('error');
      }
      super.render();
      this.innerHTML = '<span>attr1:' + (this.getAttribute('attr1') ?? '') + '</span>'
        + '<span>attr2:' + (this.getAttribute('attr2') ?? '') + '</span>';
    }
    updatedCallback() {
      playground.logs.add('updatedCallback');
      if (isUpdatedCallbackError) {
        throw new Error('error');
      }
      super.updatedCallback();
    }
    errorCallback(exception) {
      playground.logs.add('errorCallback');
      if (exception instanceof Error) {
        playground.logs.add(exception.message);
      }
      super.errorCallback(exception);
    }
  }

  TestElement.define('test-element');
`;

test.describe("CustomElement", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customelement.playground");
  });

  test("custom element definition", async ({ page, baseURL }) => {
    const code = `
      import { CustomElement } from '${baseURL}/mod.bundle.js';

      ${testElementDefinitionCode}

      playground.logs.add(customElements.get('test-element') !== undefined);
    `;

    const logs = [
      "observedAttributes",
      "true",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("connected or disconnected", async ({ page, baseURL }) => {
    const code = `
      import { CustomElement } from '${baseURL}/mod.bundle.js';

      ${testElementDefinitionCode}

      playground.content.set('<test-element></test-element>');

      const testElement = playground.content.get().querySelector('test-element');

      playground.logs.add(testElement.outerHTML);

      testElement.remove();
    `;

    const logs = [
      "observedAttributes",
      "constructor",
      "connectedCallback",
      "updateSync",
      "render",
      "updatedCallback",
      "<test-element><span>attr1:</span><span>attr2:</span></test-element>",
      "disconnectedCallback",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("moved to a different page", async ({ page, baseURL }, testInfo) => {
    const code = `
      import { CustomElement } from '${baseURL}/mod.bundle.js';

      ${testElementDefinitionCode}

      playground.content.set('<test-element></test-element>');

      const testElement = playground.content.get().querySelector('test-element');

      playground.logs.add(testElement.outerHTML);

      const iframe = document.createElement('iframe');
      iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';

      playground.content.set(iframe);

      playground.content.get().querySelector('iframe').contentWindow.document.body.appendChild(testElement);
    `;

    let logs = [
      "observedAttributes",
      "constructor",
      "connectedCallback",
      "updateSync",
      "render",
      "updatedCallback",
      "<test-element><span>attr1:</span><span>attr2:</span></test-element>",
      "disconnectedCallback",
      "adoptedCallback",
      "connectedCallback",
      "update",
      "updateSync",
      "render",
      "updatedCallback",
    ];

    // The behavior is different in Firefox.
    if (testInfo.project.name === "firefox") {
      logs = [
        "observedAttributes",
        "constructor",
        "connectedCallback",
        "updateSync",
        "render",
        "updatedCallback",
        "<test-element><span>attr1:</span><span>attr2:</span></test-element>",
        "disconnectedCallback",
        "adoptedCallback",
        "connectedCallback",
      ];
    }

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("attribute changed", async ({ page, baseURL }) => {
    const code = `
      import { CustomElement } from '${baseURL}/mod.bundle.js';

      ${testElementDefinitionCode}

      playground.content.set('<test-element attr1="1" attr2="2"></test-element>');

      const testElement = playground.content.get().querySelector('test-element');

      playground.logs.add(testElement.outerHTML);

      testElement.setAttribute('attr1', 'a');

      await playground.wait(100);

      playground.logs.add(testElement.outerHTML);

      testElement.setAttribute('attr1', 'b');
      testElement.setAttribute('attr1', 'c');

      await playground.wait(100);

      playground.logs.add(testElement.outerHTML);

      testElement.setAttribute('attr2', 'x');

      await playground.wait(100);

      playground.logs.add(testElement.outerHTML);
    `;

    const logs = [
      "observedAttributes",
      "constructor",
      "attributeChangedCallback",
      "connectedCallback",
      "updateSync",
      "render",
      "updatedCallback",
      '<test-element attr1="1" attr2="2"><span>attr1:1</span><span>attr2:2</span></test-element>',
      "attributeChangedCallback",
      "update",
      "updateSync",
      "render",
      "updatedCallback",
      '<test-element attr1="a" attr2="2"><span>attr1:a</span><span>attr2:2</span></test-element>',
      "attributeChangedCallback",
      "update",
      "attributeChangedCallback",
      "update",
      "updateSync",
      "render",
      "updatedCallback",
      '<test-element attr1="c" attr2="2"><span>attr1:c</span><span>attr2:2</span></test-element>',
      '<test-element attr1="c" attr2="x"><span>attr1:c</span><span>attr2:2</span></test-element>',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("asynchronous update", async ({ page, baseURL }) => {
    const code = `
      import { CustomElement } from '${baseURL}/mod.bundle.js';

      ${testElementDefinitionCode}

      playground.content.set('<test-element attr1="1" attr2="2"></test-element>');

      const testElement = playground.content.get().querySelector('test-element');

      playground.logs.add(testElement.updateCounter);

      testElement.setAttribute('attr1', 'a');

      await playground.wait(100);

      playground.logs.add(testElement.updateCounter);

      testElement.setAttribute('attr1', 'b');
      testElement.setAttribute('attr1', 'c');

      await playground.wait(100);

      playground.logs.add(testElement.updateCounter);
    `;

    const logs = [
      "observedAttributes",
      "constructor",
      "attributeChangedCallback",
      "connectedCallback",
      "updateSync",
      "render",
      "updatedCallback",
      "1",
      "attributeChangedCallback",
      "update",
      "updateSync",
      "render",
      "updatedCallback",
      "2",
      "attributeChangedCallback",
      "update",
      "attributeChangedCallback",
      "update",
      "updateSync",
      "render",
      "updatedCallback",
      "3",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("error handling", async ({ page, baseURL }) => {
    const code = `
      import { CustomElement } from '${baseURL}/mod.bundle.js';

      ${testElementDefinitionCode}

      playground.content.set('<test-element attr1="1" attr2="2"></test-element>');

      const testElement = playground.content.get().querySelector('test-element');

      playground.logs.add(testElement.outerHTML);

      isRenderError = true;
      isUpdatedCallbackError = false;

      testElement.setAttribute('attr1', 'a');

      await playground.wait(100);

      playground.logs.add(testElement.outerHTML);

      isRenderError = false;
      isUpdatedCallbackError = true;

      testElement.setAttribute('attr1', 'b');

      await playground.wait(100);

      playground.logs.add(testElement.outerHTML);
    `;

    const logs = [
      "observedAttributes",
      "constructor",
      "attributeChangedCallback",
      "connectedCallback",
      "updateSync",
      "render",
      "updatedCallback",
      '<test-element attr1="1" attr2="2"><span>attr1:1</span><span>attr2:2</span></test-element>',
      "attributeChangedCallback",
      "update",
      "updateSync",
      "render",
      "errorCallback",
      "error",
      '<test-element attr1="a" attr2="2"><span>attr1:1</span><span>attr2:2</span></test-element>',
      "attributeChangedCallback",
      "update",
      "updateSync",
      "render",
      "updatedCallback",
      "errorCallback",
      "error",
      '<test-element attr1="b" attr2="2"><span>attr1:b</span><span>attr2:2</span></test-element>',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
