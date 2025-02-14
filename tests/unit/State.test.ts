import { assert, assertEquals, assertNotStrictEquals } from '@std/assert';

import { State } from '../../mod.ts';

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
  const initialState = { a: 0, b: 0 };
  const updatedState = { a: 1, b: 1 };

  const states: Array<typeof initialState> = [];

  const observer = (state: typeof initialState) => {
    states.push(state);
  };

  const state = new State(initialState);

  await t.step('immutable state', () => {
    assertEquals(state.get(), initialState);
    assertNotStrictEquals(state.get(), initialState);

    const previousState = state.get();

    state.set(updatedState);

    assertEquals(state.get(), updatedState);
    assertNotStrictEquals(state.get(), updatedState);

    state.reset();

    assertEquals(state.get(), initialState);
    assertEquals(state.get(), previousState);
    assertNotStrictEquals(state.get(), initialState);
    assertNotStrictEquals(state.get(), previousState);
  });

  await t.step('state change notification', () => {
    state.subscribe(observer);

    state.notify();

    state.set(updatedState); // changed
    state.set(updatedState); // no changed

    state.reset(); // changed
    state.reset(); // no changed

    assertEquals(states, [
      initialState,
      updatedState,
      initialState,
    ]);
  });
});
