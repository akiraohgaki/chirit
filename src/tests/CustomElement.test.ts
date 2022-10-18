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
      super.render();
    }
    protected override updatedCallback(): void {
      counter++;
      console.log(counter, 'updatedCallback()');
      super.updatedCallback();

      if (this.getAttribute('test') === 'error') {
        throw new Error('error');
      }
    }
    protected override errorCallback(exception: unknown): void {
      counter++;
      console.log(counter, 'errorCallback()', (exception as Error).message);
      super.errorCallback(exception);
    }
  }

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      util.globalThis.setTimeout(resolve, time);
    });
  };

  await t.step('define()', () => {
    TestElement.define('test-element');
    // observedAttributes will fire

    assertStrictEquals(util.globalThis.customElements.get('test-element') !== undefined, true);
    assertStrictEquals(counter, 1);
  });

  await t.step('constructor()', () => {
    // By constructor()
    testElement = new TestElement();

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(testElement.getAttribute('test'), null);

    // By document.createElement()
    testElement = util.globalThis.document.createElement('test-element') as CustomElement;

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(testElement.getAttribute('test'), null);

    // By HTML
    util.globalThis.document.body.innerHTML = '<test-element test="0"></test-element>';
    // attributeChangedCallback() and connectedCallback() will fire
    // also render() and updatedCallback() should fire
    testElement = util.globalThis.document.querySelector('test-element') as CustomElement;

    assertInstanceOf(testElement, TestElement);
    assertInstanceOf(testElement, CustomElement);
    assertStrictEquals(testElement.updateCounter, 1);
    assertStrictEquals(counter, 5);
    assertStrictEquals(testElement.getAttribute('test'), '0');
  });

  await t.step('attributeChangedCallback()', async () => {
    // Update method should run with debounce way
    testElement.setAttribute('test', '1');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('test'), '1');
    assertStrictEquals(testElement.updateCounter, 2);
    assertStrictEquals(counter, 8);

    testElement.setAttribute('test', '2');
    testElement.setAttribute('test', '3');
    testElement.setAttribute('test', '4');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('test'), '4');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 13);

    // If new value is the same of old value update method should not run
    testElement.setAttribute('test', '4');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('test'), '4');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    // If unobserved attribute has changed attributeChangedCallback() should not fire
    testElement.setAttribute('unobserved', '0');
    await sleep(200);

    assertStrictEquals(testElement.getAttribute('unobserved'), '0');
    assertStrictEquals(testElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    // Check if errorCallback() fire when throw error
    testElement.setAttribute('test', 'error');
    await sleep(200);

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
    await sleep(200);

    assertStrictEquals(testElement.updateCounter, 5);
    assertStrictEquals(counter, 24);
  });

  util.globalThis.document.body.innerHTML = '';
});
