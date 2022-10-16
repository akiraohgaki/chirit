import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import CustomElement from '../CustomElement.ts';

Deno.test('CustomElement', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let testElement: CustomElement;

  let counter = 0;

  class TestElement extends CustomElement {
    static override get observedAttributes(): Array<string> {
      counter++;
      console.log(counter, 'observedAttributes');
      return ['test'];
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
    }
    override adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
      counter++;
      console.log(counter, 'adoptedCallback()');
    }
    protected override render(): void {
      counter++;
      console.log(counter, 'render()');
    }
    protected override updatedCallback(): void {
      counter++;
      console.log(counter, 'updatedCallback()');
      if (this.getAttribute('test') === 'error') {
        throw new Error('error');
      }
    }
    protected override errorCallback(exception: unknown): void {
      counter++;
      console.log(counter, 'errorCallback()', (exception as Error).message);
    }
  }

  const sleep = () => {
    return new Promise((resolve) => {
      util.globalThis.setTimeout(resolve, 200);
    });
  };

  await t.step('define()', () => {
    TestElement.define('test-element');
    // observedAttributes will fire

    assertStrictEquals(util.globalThis.customElements.get('test-element') !== undefined, true);
    assertStrictEquals(counter, 1);
  });

  await t.step('constructor()', () => {
    // From constructor()
    testElement = new TestElement();

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(testElement.getAttribute('test'), null);

    // From document.createElement()
    testElement = util.globalThis.document.createElement('test-element') as CustomElement;

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(testElement.getAttribute('test'), null);

    // From HTML tag
    util.globalThis.document.body.innerHTML = '<test-element test="0"></test-element>';
    // attributeChangedCallback() and connectedCallback() will fire
    testElement = util.globalThis.document.querySelector('test-element') as CustomElement;

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.updateCounter, 1);
    assertStrictEquals(counter, 5);
    assertStrictEquals(testElement.getAttribute('test'), '0');
  });

  await t.step('attributeChangedCallback()', async () => {
    // Should work with debounce way
    testElement.setAttribute('test', '1');
    await sleep();

    assertStrictEquals(testElement.getAttribute('test'), '1');
    assertStrictEquals(testElement.updateCounter, 2);
    assertStrictEquals(counter, 8);

    testElement.setAttribute('test', '2');
    testElement.setAttribute('test', '3');
    testElement.setAttribute('test', '4');
    await sleep();

    assertStrictEquals(testElement.getAttribute('test'), '4');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 13);

    // If the value is the same it will not update
    testElement.setAttribute('test', '4');
    await sleep();

    assertStrictEquals(testElement.getAttribute('test'), '4');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    // update() should not fire for unobserved attribute
    testElement.setAttribute('unobserved', '0');
    await sleep();

    assertStrictEquals(testElement.getAttribute('unobserved'), '0');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    // Check if errorCallback() is fire
    testElement.setAttribute('test', 'error');
    await sleep();

    assertStrictEquals(testElement.getAttribute('test'), 'error');
    assertStrictEquals(testElement.updateCounter, 4);
    assertStrictEquals(counter, 18);
  });

  await t.step('disconnectedCallback()', () => {
    util.globalThis.document.body.removeChild(testElement);

    assertStrictEquals(testElement.updateCounter, 4);
    assertStrictEquals(counter, 19);
  });

  await t.step('adoptedCallback()', async () => {
    const iframe = util.globalThis.document.createElement('iframe');
    iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
    util.globalThis.document.body.appendChild(iframe);
    iframe.contentWindow?.document.body.appendChild(testElement);
    // adoptedCallback() and connectedCallback() will fire
    await sleep();

    assertStrictEquals(testElement.updateCounter, 5);
    assertStrictEquals(counter, 24);
  });

  util.globalThis.document.body.innerHTML = '';
});
