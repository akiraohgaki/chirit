import { assert, assertEquals, assertInstanceOf, assertStrictEquals } from '@std/assert';

import { Component, CustomElement, NodeStructure, Observable, State, Store } from '../../../mod.ts';

import { Playground } from './Playground.ts';

class TestComponent extends Component {
  override styles() {
    return 'span { color: red; }';
  }
  override template() {
    return '<span>TestComponent</span>';
  }
}

TestComponent.define('test-component');

const observable = new Observable();

await Playground.test('Component', async (t) => {
  let testComponent: TestComponent;

  await t.step('constructor()', () => {
    testComponent = new TestComponent();

    assertInstanceOf(testComponent, CustomElement);
  });

  await t.step('attr', () => {
    testComponent.attr.attr1 = '1';

    assertEquals(testComponent.attr.attr1, '1');
  });

  await t.step('structure', () => {
    assertInstanceOf(testComponent.structure, NodeStructure);
  });

  await t.step('content', () => {
    assertStrictEquals(testComponent.content, testComponent.structure.host);
  });

  await t.step('observe()', async () => {
    testComponent.observe(observable);

    observable.notify(1);

    await Playground.sleep(100);

    assertEquals(testComponent.updateCounter, 1);
  });

  await t.step('unobserve()', async () => {
    testComponent.unobserve(observable);

    observable.notify(1);

    await Playground.sleep(100);

    assertEquals(testComponent.updateCounter, 1);
  });

  await t.step('dispatch()', () => {
    let isCustomEvent = false;
    testComponent.addEventListener('custom-event', (event) => {
      isCustomEvent = (event as CustomEvent).detail.isCustomEvent;
    });

    assert(testComponent.dispatch('custom-event', { isCustomEvent: true }));
    assert(isCustomEvent);
  });
});

await Playground.test('Content container', async (t) => {
  await t.step('default content container is ShadowRoot', () => {
    const testComponent = new TestComponent();

    assertInstanceOf(testComponent.content, ShadowRoot);
  });

  await t.step('custom content container', () => {
    class TestComponent2 extends Component {
      override createContentContainer(): Element | DocumentFragment {
        return document.createElement('div');
      }
    }

    TestComponent2.define('test-component-2');

    const testComponent2 = new TestComponent2();

    assertInstanceOf(testComponent2.content, HTMLDivElement);
  });
});

await Playground.test('Rendering', async (t) => {
  const testComponent = new TestComponent();

  testComponent.render();

  await t.step('style', () => {
    assertEquals((testComponent.content as ShadowRoot).adoptedStyleSheets.length, 1);
  });

  await t.step('template', () => {
    assertEquals((testComponent.content as ShadowRoot).innerHTML, '<span>TestComponent</span>');
  });
});

await Playground.test('Event handling', async (t) => {
  class TestComponent3 extends Component {
    override updatedCallback(): void {
      this.dispatch('custom-event', { isCustomEvent: true });
    }
  }

  TestComponent3.define('test-component-3');

  const testComponent3 = new TestComponent3();

  const parentElement = document.createElement('div');
  parentElement.appendChild(testComponent3);

  await t.step('custom event bubbles', async () => {
    let isCustomEvent = false;
    parentElement.addEventListener('custom-event', (event) => {
      isCustomEvent = (event as CustomEvent).detail.isCustomEvent;
    });

    testComponent3.update();

    await Playground.sleep(100);

    assert(isCustomEvent);
  });
});

await Playground.test('State management', async (t) => {
  const state = new State(0);
  const store = new Store({ a: 0 });

  class TestComponent4 extends Component {
    override template() {
      return `<span>${state.get()}</span><span>${store.state.a}</span>`;
    }
  }

  TestComponent4.define('test-component-4');

  const testComponent4 = new TestComponent4();

  testComponent4.observe(state, store);

  testComponent4.updateSync();

  await t.step('use State', async () => {
    assertEquals(
      (testComponent4.content as ShadowRoot).innerHTML,
      '<span>0</span><span>0</span>',
    );

    state.set(1);

    await Playground.sleep(100);

    assertEquals(
      (testComponent4.content as ShadowRoot).innerHTML,
      '<span>1</span><span>0</span>',
    );
  });

  await t.step('use Store', async () => {
    assertEquals(
      (testComponent4.content as ShadowRoot).innerHTML,
      '<span>1</span><span>0</span>',
    );

    store.update({ a: 1 });

    await Playground.sleep(100);

    assertEquals(
      (testComponent4.content as ShadowRoot).innerHTML,
      '<span>1</span><span>1</span>',
    );
  });
});
