import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertInstanceOf, assertStrictEquals } from '@std/assert';

import { Component, CustomElement, NodeStructure, Observable, State, Store } from '../../../mod.ts';

const observable = new Observable();
const state = new State(0);
const store = new Store({ a: 0 });

class TestComponent1 extends Component {
  override styles() {
    return 'span { color: red; }';
  }
  override template() {
    return '<span>TestComponent</span>';
  }
}

class TestComponent2 extends Component {
  override createContentContainer(): Element | DocumentFragment {
    return document.createElement('div');
  }
}

class TestComponent3 extends Component {
  override updatedCallback(): void {
    this.dispatch('custom-event', { isCustomEvent: true });
  }
}

class TestComponent4 extends Component {
  override template() {
    return `<span>state:${state.get()}</span><span>store.state:${store.state.a}</span>`;
  }
}

TestComponent1.define('test-component-1');
TestComponent2.define('test-component-2');
TestComponent3.define('test-component-3');
TestComponent4.define('test-component-4');

await Playground.test('Component', async (t) => {
  let testComponent1: TestComponent1;

  await t.step('constructor()', () => {
    testComponent1 = new TestComponent1();

    assert(testComponent1);
    assertInstanceOf(testComponent1, CustomElement);
  });

  await t.step('attr', () => {
    testComponent1.attr.attr1 = '1';

    assertEquals(testComponent1.attr.attr1, '1');
  });

  await t.step('structure', () => {
    assertInstanceOf(testComponent1.structure, NodeStructure);
  });

  await t.step('content', () => {
    assertStrictEquals(testComponent1.content, testComponent1.structure.host);
  });

  await t.step('observe()', async () => {
    testComponent1.observe(observable);

    observable.notify(1);

    await Playground.sleep(100);

    assertEquals(testComponent1.updateCounter, 1);
  });

  await t.step('unobserve()', async () => {
    testComponent1.unobserve(observable);

    observable.notify(1);

    await Playground.sleep(100);

    assertEquals(testComponent1.updateCounter, 1);
  });

  await t.step('dispatch()', () => {
    let isCustomEvent = false;
    testComponent1.addEventListener('custom-event', (event) => {
      isCustomEvent = (event as CustomEvent).detail.isCustomEvent;
    });

    assert(testComponent1.dispatch('custom-event', { isCustomEvent: true }));
    assert(isCustomEvent);
  });
});

await Playground.test('Content container', async (t) => {
  const testComponent1 = new TestComponent1();
  const testComponent2 = new TestComponent2();

  await t.step('default content container should be ShadowRoot', () => {
    assertInstanceOf(testComponent1.content, ShadowRoot);
  });

  await t.step('custom content container', () => {
    assertInstanceOf(testComponent2.content, HTMLDivElement);
  });
});

await Playground.test('Rendering', async (t) => {
  const testComponent1 = new TestComponent1();

  testComponent1.render();

  await t.step('styles() should be called and style sheets adopted', () => {
    assertEquals((testComponent1.content as ShadowRoot).adoptedStyleSheets.length, 1);
  });

  await t.step('template() should be called and content updated', () => {
    assertEquals((testComponent1.content as ShadowRoot).innerHTML, '<span>TestComponent</span>');
  });
});

await Playground.test('Event handling', async (t) => {
  const testComponent3 = new TestComponent3();

  const parentElement = document.createElement('div');
  parentElement.appendChild(testComponent3);

  await t.step(
    'custom event from dispatch() should propagate across the shadow DOM boundary into the standard DOM',
    async () => {
      let isCustomEvent = false;
      parentElement.addEventListener('custom-event', (event) => {
        isCustomEvent = (event as CustomEvent).detail.isCustomEvent;
      });

      testComponent3.update();

      await Playground.sleep(100);

      assert(isCustomEvent);
    },
  );
});

await Playground.test('State management', async (t) => {
  const testComponent4 = new TestComponent4();

  testComponent4.observe(state, store);

  await t.step('should rendered with initial state', () => {
    testComponent4.updateSync();

    assertEquals((testComponent4.content as ShadowRoot).innerHTML, '<span>state:0</span><span>store.state:0</span>');
  });

  await t.step('should re-rendered with updated state', async () => {
    state.set(1);

    await Playground.sleep(100);

    assertEquals((testComponent4.content as ShadowRoot).innerHTML, '<span>state:1</span><span>store.state:0</span>');
  });

  await t.step('should re-rendered with updated state of store', async () => {
    store.update({ a: 1 });

    await Playground.sleep(100);

    assertEquals((testComponent4.content as ShadowRoot).innerHTML, '<span>state:1</span><span>store.state:1</span>');
  });
});
