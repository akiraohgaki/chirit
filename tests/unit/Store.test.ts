import { assert, assertEquals, assertNotStrictEquals } from '@std/assert';

import { Store } from '../../mod.ts';

const initialState = { a: 0, b: 0 };
const updatedState = { a: 1, b: 1 };

const values: Array<typeof initialState> = [];

function observer(value: typeof initialState): void {
  values.push(value);
}

Deno.test('Store', async (t) => {
  let store: Store<typeof initialState>;

  await t.step('constructor()', () => {
    store = new Store(initialState);

    assert(store);
  });

  await t.step('state', () => {
    assertEquals(store.state, initialState);
  });

  await t.step('update()', () => {
    store.update(updatedState);

    assertEquals(store.state, updatedState);
  });

  await t.step('reset()', () => {
    store.reset();

    assertEquals(store.state, initialState);
  });
});

Deno.test('State management', async (t) => {
  const store = new Store(initialState);

  await t.step('state merging', () => {
    const { a } = updatedState;

    store.update({ a });

    assertEquals(store.state, { ...initialState, a });

    store.reset();
  });

  await t.step('immutable state', () => {
    assertEquals(store.state, initialState);
    assertNotStrictEquals(store.state, initialState);

    const previousState = store.state;

    store.update(updatedState);

    assertEquals(store.state, updatedState);
    assertNotStrictEquals(store.state, updatedState);

    store.reset();

    assertEquals(store.state, initialState);
    assertEquals(store.state, previousState);
    assertNotStrictEquals(store.state, initialState);
    assertNotStrictEquals(store.state, previousState);
  });

  await t.step('state change notification', () => {
    store.subscribe(observer);

    store.notify();

    store.update(updatedState); // changed
    store.update(updatedState); // no changed

    store.reset(); // changed
    store.reset(); // no changed

    assertEquals(values, [
      initialState,
      updatedState,
      initialState,
    ]);
  });
});
