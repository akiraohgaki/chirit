import { assertEquals, assertNotStrictEquals } from '@std/assert';

import { State } from '../../mod.ts';

Deno.test('State', async (t) => {
  await t.step('state management', () => {
    const state = new State(0);

    assertEquals(state.get(), 0);

    state.set(1);

    assertEquals(state.get(), 1);

    state.reset();

    assertEquals(state.get(), 0);
  });

  await t.step('state management with object', () => {
    const initialState = { updated: false, key: null };

    const state = new State(initialState);

    assertEquals(state.get(), { updated: false, key: null });
    assertNotStrictEquals(state.get(), initialState);

    const previousState = state.get();

    state.set({ updated: true, key: null });

    assertEquals(state.get(), { updated: true, key: null });
    assertNotStrictEquals(state.get(), previousState);

    state.reset();

    assertEquals(state.get(), { updated: false, key: null });
    assertNotStrictEquals(state.get(), initialState);
  });

  await t.step('state change notification', () => {
    const logs: Array<unknown> = [];

    const initialState = { updated: false, key: null };

    const observer = (state: typeof initialState) => {
      logs.push(state);
    };

    const state = new State(initialState);

    state.subscribe(observer);

    state.notify();

    state.set({ updated: false, key: null });

    state.set({ updated: true, key: null });

    state.reset();

    state.unsubscribe(observer);

    state.notify();

    assertEquals(logs, [
      { updated: false, key: null },
      { updated: true, key: null },
      { updated: false, key: null },
    ]);
  });
});
