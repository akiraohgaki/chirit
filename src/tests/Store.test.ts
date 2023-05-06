import { assertEquals, assertInstanceOf, assertStrictEquals } from 'std/testing/asserts.ts';
import Store from '../Store.ts';

Deno.test('Store', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  const testState = { prop1: 1, prop2: 2, prop3: 3 };
  let testStore: Store<typeof testState>;

  let counter = 0;

  class TestStore extends Store<typeof testState> {
    constructor() {
      super(testState);
    }
  }

  const observer1 = (state: typeof testState) => {
    counter++;
    console.log(counter, state);
  };

  const observer2 = (state: typeof testState) => {
    counter++;
    console.log(counter, state);
  };

  const observer3 = (state: typeof testState) => {
    counter++;
    console.log(counter, state);
  };

  await t.step('constructor()', () => {
    testStore = new TestStore();

    assertInstanceOf(testStore, TestStore);
    assertInstanceOf(testStore, Store);
    assertStrictEquals(testStore.state, testState);
  });

  await t.step('subscribe()', () => {
    testStore.subscribe(observer1);
    testStore.subscribe(observer2);
    testStore.subscribe(observer3);
  });

  await t.step('unsubscribe()', () => {
    testStore.unsubscribe(observer3);
  });

  await t.step('notify()', () => {
    counter = 0;
    testStore.notify();

    assertStrictEquals(counter, 2);
  });

  await t.step('update()', () => {
    counter = 0;
    testStore.update({ prop1: 0, prop3: 0 });

    assertStrictEquals(counter, 2);
    assertEquals(testStore.state, { prop1: 0, prop2: 2, prop3: 0 });
  });
});
