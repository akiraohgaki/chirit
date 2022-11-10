import type { ComponentContentContainer, NodeContentData } from '../src/types.ts';

import { assertInstanceOf, assertStrictEquals } from 'std/testing/asserts.ts';
import dom from './dom.ts';
import Component from '../src/Component.ts';
import Observable from '../src/Observable.ts';
import ObservableValue from '../src/ObservableValue.ts';

Deno.test('Component', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let testComponent: Component;
  let container: ShadowRoot;

  let counter = 0;
  let useRenderError = false;
  let useTemplateError = false;
  let useUpdatedCallbackError = false;

  class TestComponent extends Component {
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
    override createContentContainer(): ComponentContentContainer {
      counter++;
      console.log(counter, 'createContentContainer()');
      return super.createContentContainer();
    }
    override render(): void {
      counter++;
      console.log(counter, 'render()');

      if (useRenderError) {
        throw new Error('error in render()');
      }

      super.render();
    }
    override template(): NodeContentData {
      counter++;
      console.log(counter, 'template()');

      if (useTemplateError) {
        throw new Error('error in template()');
      }

      return `<span>${this.attrs.test}</span>` + super.template();
    }
    override updatedCallback(): void {
      counter++;
      console.log(counter, 'updatedCallback()');

      if (useUpdatedCallbackError) {
        throw new Error('error in updatedCallback()');
      }

      super.updatedCallback();
    }
    override errorCallback(exception: unknown): void {
      counter++;
      console.log(counter, 'errorCallback()', (exception as Error).message);
      super.errorCallback(exception);
    }
  }

  let update: { (): void } | null = null;
  const observable1 = {
    subscribe: (observer: { (): void }) => {
      update = observer;
    },
    unsubscribe: (_observer: { (): void }) => {
      update = null;
    },
  };
  const observable2 = new Observable();
  const observable3 = new ObservableValue(0);

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      dom.globalThis.setTimeout(resolve, time);
    });
  };

  await t.step('define()', () => {
    // observedAttributes will fire
    counter = 0;
    TestComponent.define('test-component');

    assertStrictEquals(dom.globalThis.customElements.get('test-component') !== undefined, true);
    assertStrictEquals(counter, 1);
  });

  await t.step('constructor()', () => {
    // By constructor()
    // createContentContainer() will run
    counter = 0;
    testComponent = new TestComponent();
    container = testComponent.content.container as ShadowRoot;

    assertInstanceOf(testComponent, TestComponent);
    assertInstanceOf(testComponent, Component);
    assertInstanceOf(testComponent.attrs, Object);
    assertInstanceOf(container, dom.globalThis.ShadowRoot);
    assertStrictEquals(testComponent.attrs.test, undefined);
    assertStrictEquals(container.innerHTML, '');
    assertStrictEquals(testComponent.updateCounter, 0);
    assertStrictEquals(counter, 1);

    // By document.createElement()
    // createContentContainer() will run
    counter = 0;
    testComponent = dom.globalThis.document.createElement('test-component') as Component;
    container = testComponent.content.container as ShadowRoot;

    assertInstanceOf(testComponent, TestComponent);
    assertInstanceOf(testComponent, Component);
    assertInstanceOf(testComponent.attrs, Object);
    assertInstanceOf(container, dom.globalThis.ShadowRoot);
    assertStrictEquals(testComponent.attrs.test, undefined);
    assertStrictEquals(container.innerHTML, '');
    assertStrictEquals(testComponent.updateCounter, 0);
    assertStrictEquals(counter, 1);

    // By HTML
    // createContentContainer() will run
    // and attributeChangedCallback() and connectedCallback() will fire
    // and Synchronous updating method will run
    counter = 0;
    dom.globalThis.document.body.innerHTML = '<test-component test="0"></test-component>';
    testComponent = dom.globalThis.document.querySelector('test-component') as Component;
    container = testComponent.content.container as ShadowRoot;

    assertInstanceOf(testComponent, TestComponent);
    assertInstanceOf(testComponent, Component);
    assertInstanceOf(testComponent.attrs, Object);
    assertInstanceOf(container, dom.globalThis.ShadowRoot);
    assertStrictEquals(testComponent.attrs.test, '0');
    assertStrictEquals(container.innerHTML, '<span>0</span>');
    assertStrictEquals(testComponent.updateCounter, 1);
    assertStrictEquals(counter, 6);
  });

  await t.step('attributeChangedCallback()', async () => {
    // Asynchronous updating method will run
    counter = 0;
    testComponent.attrs.test = '1';
    await sleep(200);

    assertStrictEquals(testComponent.attrs.test, '1');
    assertStrictEquals(container.innerHTML, '<span>1</span>');
    assertStrictEquals(testComponent.updateCounter, 2);
    assertStrictEquals(counter, 4);

    // Asynchronous updating method should run with debounce way
    counter = 0;
    testComponent.attrs.test = '2';
    testComponent.attrs.test = '3';
    testComponent.attrs.test = '4';
    await sleep(200);

    assertStrictEquals(testComponent.attrs.test, '4');
    assertStrictEquals(container.innerHTML, '<span>4</span>');
    assertStrictEquals(testComponent.updateCounter, 3);
    assertStrictEquals(counter, 6);

    // If new value is the same of old value updating method should not run
    counter = 0;
    testComponent.attrs.test = '4';
    await sleep(200);

    assertStrictEquals(testComponent.attrs.test, '4');
    assertStrictEquals(container.innerHTML, '<span>4</span>');
    assertStrictEquals(testComponent.updateCounter, 3);
    assertStrictEquals(counter, 1);

    // If unobserved attribute has changed updating method should not run
    counter = 0;
    testComponent.attrs.unobserved = '0';
    await sleep(200);

    assertStrictEquals(testComponent.attrs.unobserved, '0');
    assertStrictEquals(container.innerHTML, '<span>4</span>');
    assertStrictEquals(testComponent.updateCounter, 3);
    assertStrictEquals(counter, 0);

    // Check if errorCallback() fire when error occurred in render()
    counter = 0;
    useRenderError = true;
    testComponent.attrs.test = '5';
    await sleep(200);
    useRenderError = false;

    assertStrictEquals(testComponent.attrs.test, '5');
    assertStrictEquals(container.innerHTML, '<span>4</span>');
    assertStrictEquals(testComponent.updateCounter, 3);
    assertStrictEquals(counter, 3);

    // Check if errorCallback() fire when error occurred in template()
    counter = 0;
    useTemplateError = true;
    testComponent.attrs.test = '6';
    await sleep(200);
    useTemplateError = false;

    assertStrictEquals(testComponent.attrs.test, '6');
    assertStrictEquals(container.innerHTML, '<span>4</span>');
    assertStrictEquals(testComponent.updateCounter, 3);
    assertStrictEquals(counter, 4);

    // Check if errorCallback() fire when error occurred in updatedCallback()
    counter = 0;
    useUpdatedCallbackError = true;
    testComponent.attrs.test = '7';
    await sleep(200);
    useUpdatedCallbackError = false;

    assertStrictEquals(testComponent.attrs.test, '7');
    assertStrictEquals(container.innerHTML, '<span>7</span>');
    assertStrictEquals(testComponent.updateCounter, 4);
    assertStrictEquals(counter, 5);
  });

  await t.step('disconnectedCallback()', () => {
    counter = 0;
    dom.globalThis.document.body.removeChild(testComponent);

    assertStrictEquals(testComponent.updateCounter, 4);
    assertStrictEquals(counter, 1);
  });

  await t.step('adoptedCallback()', async () => {
    // connectedCallback() will fire again when the element has adopted in another document
    counter = 0;
    const iframe = dom.globalThis.document.createElement('iframe');
    iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
    dom.globalThis.document.body.appendChild(iframe);
    iframe.contentWindow?.document.body.appendChild(testComponent);
    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 5);
    assertStrictEquals(counter, 5);
  });

  await t.step('observe()', async () => {
    testComponent.observe(observable1);
    testComponent.observe(observable2, observable3);

    // Check if updating method as observer has been subscribed
    counter = 0;
    if (update) update();

    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 6);
    assertStrictEquals(counter, 3);

    // This mechanism should compatible with Observable
    counter = 0;
    observable2.notify(1);
    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 7);
    assertStrictEquals(counter, 3);

    // This mechanism should compatible with ObservableValue
    counter = 0;
    observable3.set(1);
    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 8);
    assertStrictEquals(counter, 3);
  });

  await t.step('unobserve()', async () => {
    testComponent.unobserve(observable1);
    testComponent.unobserve(observable2, observable3);

    // Check if updating method as observer has been unsubscribed
    counter = 0;
    if (update) update();
    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 8);
    assertStrictEquals(counter, 0);

    // This mechanism should compatible with Observable
    counter = 0;
    observable2.notify(1);
    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 8);
    assertStrictEquals(counter, 0);

    // This mechanism should compatible with ObservableValue
    counter = 0;
    observable3.set(1);
    await sleep(200);

    assertStrictEquals(testComponent.updateCounter, 8);
    assertStrictEquals(counter, 0);
  });

  await t.step('dispatch()', () => {
    // Event not fired on test environment

    testComponent.dispatch('test', {});
  });

  dom.globalThis.document.body.innerHTML = ''; // disconnectedCallback() will fire
});
