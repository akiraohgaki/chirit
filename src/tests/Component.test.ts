import type { NodeContentData } from '../types.ts';

import { assertInstanceOf, assertStrictEquals } from 'std/testing/asserts.ts';
import dom from './dom.ts';
import Component from '../Component.ts';
import ObservableValue from '../ObservableValue.ts';
import Store from '../Store.ts';

Deno.test('Component', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let testComponent: Component;
  const observableValue = new ObservableValue(0);
  const store = new Store({ prop: 0 });

  let counter = 0;

  class TestComponent extends Component {
    static override get observedAttributes(): Array<string> {
      return ['test'];
    }
    constructor() {
      super();
      this.addEventListener('test-event', (event: Event) => {
        counter++;
        console.log((event as CustomEvent).detail);
      });
    }
    override connectedCallback(): void {
      super.connectedCallback();
      this.observe(observableValue, store);
    }
    override disconnectedCallback(): void {
      this.unobserve(observableValue, store);
      super.disconnectedCallback();
    }
    override updatedCallback(): void {
      counter++;
    }
    override template(): NodeContentData {
      return `<span>${this.attr.test}</span><span>${observableValue.get()}</span><span>${store.state.prop}</span>`;
    }
  }

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      dom.globalThis.setTimeout(resolve, time);
    });
  };

  await t.step('define()', () => {
    counter = 0;
    TestComponent.define('test-component');

    assertStrictEquals(dom.globalThis.customElements.get('test-component') !== undefined, true);
    assertStrictEquals(counter, 0);
  });

  await t.step('constructor()', async () => {
    // Should be rendered correctly
    counter = 0;
    dom.globalThis.document.body.innerHTML = '<test-component test="0"></test-component>';
    testComponent = dom.globalThis.document.querySelector('test-component') as Component;
    const container = testComponent.content.container as ShadowRoot;

    assertInstanceOf(testComponent, TestComponent);
    assertInstanceOf(testComponent, Component);
    assertStrictEquals(testComponent.attr.test, '0');
    assertStrictEquals(container.innerHTML, '<span>0</span><span>0</span><span>0</span>');
    assertStrictEquals(counter, 1);

    // Should be update correctly
    counter = 0;
    testComponent.attr.test = '1';
    observableValue.set(2);
    store.update({ prop: 3 });
    await sleep(200);

    assertStrictEquals(container.innerHTML, '<span>1</span><span>2</span><span>3</span>');
    assertStrictEquals(counter, 1);
  });

  await t.step('dispatch()', () => {
    counter = 0;
    testComponent = dom.globalThis.document.querySelector('test-component') as Component;
    testComponent.dispatch('test-event', { test: 0 });

    assertStrictEquals(counter, 1);
  });

  dom.globalThis.document.body.innerHTML = ''; // disconnectedCallback() will fire
});
