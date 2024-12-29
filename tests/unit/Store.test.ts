import { assertEquals, assertNotStrictEquals } from '@std/assert';

import { Store } from '../../mod.ts';

Deno.test('Store', async (t) => {
  await t.step('state management with object', () => {
    const initialState = { updated: false, key: null };

    const store = new Store(initialState);

    assertEquals(store.state, { updated: false, key: null });
    assertNotStrictEquals(store.state, initialState);

    const previousState = store.state;

    store.update({ updated: true });

    assertEquals(store.state, { updated: true, key: null });
    assertNotStrictEquals(store.state, previousState);

    store.reset();

    assertEquals(store.state, { updated: false, key: null });
    assertNotStrictEquals(store.state, initialState);
  });

  await t.step('state change notification', () => {
    const logs: Array<unknown> = [];

    const initialState = { updated: false, key: null };

    const observer = (state: typeof initialState) => {
      logs.push(state);
    };

    const store = new Store(initialState);

    store.subscribe(observer);

    store.notify();

    store.update({ updated: false });

    store.update({ updated: true });

    store.reset();

    store.unsubscribe(observer);

    store.notify();

    assertEquals(logs, [
      { updated: false, key: null },
      { updated: true, key: null },
      { updated: false, key: null },
    ]);
  });
});
