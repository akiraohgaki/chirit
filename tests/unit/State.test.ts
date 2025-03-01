import { assert, assertEquals, assertNotStrictEquals } from '@std/assert';

import { State } from '../../mod.ts';

const initialState = { a: 0, b: 0 };
const updatedState = { a: 1, b: 1 };

const values: Array<typeof initialState> = [];

function observer(value: typeof initialState): void {
  values.push(value);
}

Deno.test('State', async (t) => {
  let state: State<number>;

  await t.step('constructor()', () => {
    state = new State(0);

    assert(state);
  });

  await t.step('get()', () => {
    assertEquals(state.get(), 0);
  });

  await t.step('set()', () => {
    state.set(1);

    assertEquals(state.get(), 1);
  });

  await t.step('reset()', () => {
    state.reset();

    assertEquals(state.get(), 0);
  });
});

Deno.test('State management', async (t) => {
  const state = new State(initialState);

  const previousState = state.get();

  await t.step('immutable state', async (t) => {
    await t.step('initial state should be immutable', () => {
      assertEquals(state.get(), initialState);
      assertNotStrictEquals(state.get(), initialState);
    });

    await t.step('updated state should be immutable', () => {
      state.set(updatedState);

      assertEquals(state.get(), updatedState);
      assertNotStrictEquals(state.get(), updatedState);
    });

    await t.step('reset state should be immutable', () => {
      state.reset();

      assertEquals(state.get(), initialState);
      assertEquals(state.get(), previousState);
      assertNotStrictEquals(state.get(), initialState);
      assertNotStrictEquals(state.get(), previousState);
    });
  });

  await t.step('state change notification', async (t) => {
    await t.step('subscribe and notify manually', () => {
      state.subscribe(observer);

      state.notify();

      assertEquals(values.splice(0), [initialState]);
    });

    await t.step('when state changed', () => {
      state.set(updatedState); // changed
      state.set(updatedState); // no changed

      assertEquals(values.splice(0), [updatedState]);
    });

    await t.step('when state reset', () => {
      state.reset(); // changed
      state.reset(); // no changed

      assertEquals(values.splice(0), [initialState]);
    });
  });
});
