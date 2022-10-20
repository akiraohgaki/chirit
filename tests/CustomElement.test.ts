import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import dom from './dom.ts';
import CustomElement from '../src/CustomElement.ts';

Deno.test('CustomElement', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let testElement: CustomElement;

  let counter = 0;
  let useRenderError = false;
  let useUpdatedCallbackError = false;

  class TestElement extends CustomElement {
    static override get observedAttributes(): Array<string> {
      counter++;
      console.log(counter, 'observedAttributes');
      return ['test', ...super.observedAttributes];
    }
    override attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null,
      namespace?: string | null,
    ): void {
      counter++;
      console.log(counter, 'attributeChangedCallback()');
      super.attributeChangedCallback(name, oldValue, newValue, namespace);
    }
    override connectedCallback(): void {
      counter++;
      console.log(counter, 'connectedCallback()');
      super.connectedCallback();
    }
    override disconnectedCallback(): void {
      counter++;
      console.log(counter, 'disconnectedCallback()');
      super.disconnectedCallback();
    }
    override adoptedCallback(oldDocument: Document, newDocument: Document): void {
      counter++;
      console.log(counter, 'adoptedCallback()');
      super.adoptedCallback(oldDocument, newDocument);
    }
    protected override render(): void {
      counter++;
      console.log(counter, 'render()');

      if (useRenderError) {
        throw new Error('error in render()');
      }

      super.render();
    }
    protected override updatedCallback(): void {
      counter++;
      console.log(counter, 'updatedCallback()');

      if (useUpdatedCallbackError) {
        throw new Error('error in updatedCallback()');
      }

      super.updatedCallback();
    }
    protected override errorCallback(exception: unknown): void {
      counter++;
      console.log(counter, 'errorCallback()', (exception as Error).message);
      super.errorCallback(exception);
    }
  }

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      dom.globalThis.setTimeout(resolve, time);
    });
  };

  await t.step('define()', () => {
    // observedAttributes will fire
    counter = 0;
    TestElement.define('test-element');

    assertStrictEquals(dom.globalThis.customElements.get('test-element') !== undefined, true);
    assertStrictEquals(counter, 1);
  });

  await t.step('constructor()', () => {
    // By constructor()
    counter = 0;
    testElement = new TestElement();

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.getAttribute('test'), null);
    assertStrictEquals(testElement.updateCounter, 0);
    assertStrictEquals(counter, 0);

    // By document.createElement()
    counter = 0;
    testElement = dom.globalThis.document.createElement('test-element') as CustomElement;

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.getAttribute('test'), null);
    assertStrictEquals(testElement.updateCounter, 0);
    assertStrictEquals(counter, 0);

    // By HTML
    // attributeChangedCallback() and connectedCallback() will fire
    // and Synchronous updating method will run
    counter = 0;
    dom.globalThis.document.body.innerHTML = '<test-element test="0"></test-element>';
    testElement = dom.globalThis.document.querySelector('test-element') as CustomElement;

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.getAttribute('test'), '0');
    assertStrictEquals(testElement.updateCounter, 1);
    assertStrictEquals(counter, 4);
  });

  await t.step('attributeChangedCallback()', async () => {
    // Asynchronous updating method will run
    counter = 0;
    testElement.setAttribute('test', '1');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('test'), '1');
    assertStrictEquals(testElement.updateCounter, 2);
    assertStrictEquals(counter, 3);

    // Asynchronous updating method should run with debounce way
    counter = 0;
    testElement.setAttribute('test', '2');
    testElement.setAttribute('test', '3');
    testElement.setAttribute('test', '4');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('test'), '4');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 5);

    // If new value is the same of old value updating method should not run
    counter = 0;
    testElement.setAttribute('test', '4');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('test'), '4');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 1);

    // If unobserved attribute has changed updating method should not run
    counter = 0;
    testElement.setAttribute('unobserved', '0');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('unobserved'), '0');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 0);

    // Check if errorCallback() fire when error occurred in render()
    counter = 0;
    useRenderError = true;
    testElement.setAttribute('test', '5');
    await sleep(200);
    useRenderError = false;

    assertStrictEquals(testElement.getAttribute('test'), '5');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 3);

    // Check if errorCallback() fire when error occurred in updatedCallback()
    counter = 0;
    useUpdatedCallbackError = true;
    testElement.setAttribute('test', '6');
    await sleep(200);
    useUpdatedCallbackError = false;

    assertStrictEquals(testElement.getAttribute('test'), '6');
    assertStrictEquals(testElement.updateCounter, 4);
    assertStrictEquals(counter, 4);
  });

  await t.step('disconnectedCallback()', () => {
    counter = 0;
    dom.globalThis.document.body.removeChild(testElement);

    assertStrictEquals(testElement.updateCounter, 4);
    assertStrictEquals(counter, 1);
  });

  await t.step('adoptedCallback()', async () => {
    // connectedCallback() will fire again when the element has adopted in another document
    counter = 0;
    const iframe = dom.globalThis.document.createElement('iframe');
    iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
    dom.globalThis.document.body.appendChild(iframe);
    iframe.contentWindow?.document.body.appendChild(testElement);
    await sleep(200);

    assertStrictEquals(testElement.updateCounter, 5);
    assertStrictEquals(counter, 4);
  });

  dom.globalThis.document.body.innerHTML = ''; // disconnectedCallback() will fire
});
