import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import CustomElement from '../CustomElement.ts';

Deno.test('CustomElement', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let customElement: CustomElement;

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
    TestElement.define('custom-element');
    // observedAttributes will fire

    assertStrictEquals(util.globalThis.customElements.get('custom-element') !== undefined, true);
    assertStrictEquals(counter, 1);
  });

  await t.step('constructor()', () => {
    // From constructor()
    customElement = new TestElement();

    assertInstanceOf(customElement, TestElement);
    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(customElement.getAttribute('test'), null);

    // From document.createElement()
    customElement = util.globalThis.document.createElement('custom-element') as CustomElement;

    assertInstanceOf(customElement, TestElement);
    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(customElement.getAttribute('test'), null);

    // From HTML tag
    util.globalThis.document.body.innerHTML = '<custom-element test="0"></custom-element>';
    // attributeChangedCallback() and connectedCallback() will fire
    customElement = util.globalThis.document.querySelector('custom-element') as CustomElement;

    assertInstanceOf(customElement, TestElement);
    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 1);
    assertStrictEquals(counter, 5);
    assertStrictEquals(customElement.getAttribute('test'), '0');
  });

  await t.step('attributeChangedCallback()', async () => {
    // Should work with debounce way
    customElement.setAttribute('test', '1');
    await sleep();

    assertStrictEquals(customElement.getAttribute('test'), '1');
    assertStrictEquals(customElement.updateCounter, 2);
    assertStrictEquals(counter, 8);

    customElement.setAttribute('test', '2');
    customElement.setAttribute('test', '3');
    customElement.setAttribute('test', '4');
    await sleep();

    assertStrictEquals(customElement.getAttribute('test'), '4');
    assertStrictEquals(customElement.updateCounter, 3);
    assertStrictEquals(counter, 13);

    // If the value is the same it will not update
    customElement.setAttribute('test', '4');
    await sleep();

    assertStrictEquals(customElement.getAttribute('test'), '4');
    assertStrictEquals(customElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    // update() should not fire for unobserved attribute
    customElement.setAttribute('unobserved', '0');
    await sleep();

    assertStrictEquals(customElement.getAttribute('unobserved'), '0');
    assertStrictEquals(customElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    // Check if errorCallback() is fire
    customElement.setAttribute('test', 'error');
    await sleep();

    assertStrictEquals(customElement.getAttribute('test'), 'error');
    assertStrictEquals(customElement.updateCounter, 4);
    assertStrictEquals(counter, 18);
  });

  await t.step('disconnectedCallback()', () => {
    util.globalThis.document.body.removeChild(customElement);

    assertStrictEquals(customElement.updateCounter, 4);
    assertStrictEquals(counter, 19);
  });

  await t.step('adoptedCallback()', async () => {
    const iframe = util.globalThis.document.createElement('iframe');
    iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
    util.globalThis.document.body.appendChild(iframe);
    iframe.contentWindow?.document.body.appendChild(customElement);
    // adoptedCallback() and connectedCallback() will fire
    await sleep();

    assertStrictEquals(customElement.updateCounter, 5);
    assertStrictEquals(counter, 24);
  });

  util.globalThis.document.body.innerHTML = '';
});
