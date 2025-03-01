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

  const previousState = store.state;

  await t.step('immutable state', async (t) => {
    await t.step('initial state should be immutable', () => {
      assertEquals(store.state, initialState);
      assertNotStrictEquals(store.state, initialState);
    });

    await t.step('updated state should be immutable', () => {
      store.update(updatedState);

      assertEquals(store.state, updatedState);
      assertNotStrictEquals(store.state, updatedState);
    });

    await t.step('reset state should be immutable', () => {
      store.reset();

      assertEquals(store.state, initialState);
      assertEquals(store.state, previousState);
      assertNotStrictEquals(store.state, initialState);
      assertNotStrictEquals(store.state, previousState);
    });
  });

  await t.step('state merging', () => {
    const { a } = updatedState;

    store.update({ a });

    assertEquals(store.state, { ...initialState, a });

    store.reset();
  });

  await t.step('state change notification', async (t) => {
    await t.step('subscribe and notify manually', () => {
      store.subscribe(observer);

      store.notify();

      assertEquals(values.splice(0), [initialState]);
    });

    await t.step('when state changed', () => {
      store.update(updatedState); // changed
      store.update(updatedState); // no changed

      assertEquals(values.splice(0), [updatedState]);
    });

    await t.step('when state reset', () => {
      store.reset(); // changed
      store.reset(); // no changed

      assertEquals(values.splice(0), [initialState]);
    });
  });
});
