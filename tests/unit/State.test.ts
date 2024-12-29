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
    const initialState = { updated: false };

    const state = new State(initialState);

    assertEquals(state.get(), { updated: false });
    assertNotStrictEquals(state.get(), initialState);

    const previousState = state.get();

    state.set({ updated: true });

    assertEquals(state.get(), { updated: true });
    assertNotStrictEquals(state.get(), previousState);

    state.reset();

    assertEquals(state.get(), { updated: false });
    assertNotStrictEquals(state.get(), initialState);
  });

  await t.step('state change notification', () => {
    const logs: Array<unknown> = [];

    const observer = (state: number) => {
      logs.push(state);
    };

    const state = new State(0);

    state.subscribe(observer);

    state.notify();

    state.set(0);

    state.set(1);

    state.reset();

    state.unsubscribe(observer);

    state.notify();

    assertEquals(logs, [
      0,
      1,
      0,
    ]);
  });
});
