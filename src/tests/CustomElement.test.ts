import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import CustomElement from '../CustomElement.ts';

class TestElement extends CustomElement {
  static override get observedAttributes(): Array<string> {
    return ['test'];
  }
  protected override render(): void {
    console.log('render()');
  }
  protected override updatedCallback(): void {
    console.log('updatedCallback()');
  }
  protected override errorCallback(exception: unknown): void {
    console.log('errorCallback()');
    console.log(exception);
  }
  override disconnectedCallback(): void {
    console.log('disconnectedCallback()');
  }
  override adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
    console.log('adoptedCallback()');
  }
}

Deno.test('CustomElement', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let customElement: CustomElement;

  await t.step('define()', () => {
    TestElement.define('custom-element');
  });

  await t.step('constructor()', () => {
    customElement = util.globalThis.document.createElement('custom-element') as CustomElement;

    assertInstanceOf(customElement, CustomElement);
    assertStrictEquals(customElement.updateCounter, 0);
  });

  await t.step('connectedCallback()', () => {
    util.globalThis.document.body.appendChild(customElement);

    assertStrictEquals(customElement.updateCounter, 1);
  });

  await t.step('attributeChangedCallback()', () => {
    // May not work on test environment
    customElement.setAttribute('test', '0');
    customElement.setAttribute('test', '1');

    customElement.setAttribute('test', '1');
  });

  await t.step('disconnectedCallback()', () => {
    util.globalThis.document.body.removeChild(customElement);
  });
});
