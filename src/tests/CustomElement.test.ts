import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import CustomElement from '../CustomElement.ts';

let counter = 0;

const wait = () => {
  return new Promise((resolve) => {
    util.globalThis.setTimeout(resolve, 200);
  });
};

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
    if (this.getAttribute('test') === 'error'){
      throw new Error('error');
    }
  }
  protected override errorCallback(exception: unknown): void {
    counter++;
    console.log(counter, 'errorCallback()', (exception as Error).message);
  }
}

Deno.test('CustomElement', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let customElement: CustomElement;

  await t.step('define()', () => {
    TestElement.define('custom-element');
    // observedAttributes will fire

    assertStrictEquals(util.globalThis.customElements.get('custom-element') !== undefined, true);
    assertStrictEquals(counter, 1);
  });

  await t.step('constructor()', () => {
    customElement = new TestElement();

    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(customElement.getAttribute('test'), null);

    customElement = util.globalThis.document.createElement('custom-element') as CustomElement;

    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 0);
    assertStrictEquals(counter, 1);
    assertStrictEquals(customElement.getAttribute('test'), null);

    util.globalThis.document.body.innerHTML = '<custom-element test="0"></custom-element>';
    // attributeChangedCallback() and connectedCallback() will fire
    customElement = util.globalThis.document.querySelector('custom-element') as CustomElement;

    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 1);
    assertStrictEquals(counter, 5);
    assertStrictEquals(customElement.getAttribute('test'), '0');
  });

  await t.step('attributeChangedCallback()', async () => {
    customElement.setAttribute('test', '1');
    await wait();

    assertStrictEquals(customElement.getAttribute('test'), '1');
    assertStrictEquals(customElement.updateCounter, 2);
    assertStrictEquals(counter, 8);

    customElement.setAttribute('test', '2');
    customElement.setAttribute('test', '3');
    customElement.setAttribute('test', '4');
    await wait();

    assertStrictEquals(customElement.getAttribute('test'), '4');
    assertStrictEquals(customElement.updateCounter, 3);
    assertStrictEquals(counter, 13);

    customElement.setAttribute('test', '4');
    await wait();

    assertStrictEquals(customElement.getAttribute('test'), '4');
    assertStrictEquals(customElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    customElement.setAttribute('unobserved', '0');
    await wait();

    assertStrictEquals(customElement.getAttribute('unobserved'), '0');
    assertStrictEquals(customElement.updateCounter, 3);
    assertStrictEquals(counter, 14);

    customElement.setAttribute('test', 'error');
    await wait();

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
    const iframeElement = util.globalThis.document.createElement('iframe');
    iframeElement.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
    util.globalThis.document.body.appendChild(iframeElement);
    iframeElement.contentWindow?.document.body.appendChild(customElement);
    // adoptedCallback() and connectedCallback() will fire
    await wait();

    assertStrictEquals(customElement.updateCounter, 5);
    assertStrictEquals(counter, 24);
  });
});

util.globalThis.document.body.innerHTML = '';
