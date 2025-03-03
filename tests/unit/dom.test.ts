import { assert, assertNotStrictEquals } from '@std/assert';

import { dom } from '../../mod.ts';

Deno.test('dom', async (t) => {
  await t.step('globalThis', () => {
    // Because the test running with Deno.
    assertNotStrictEquals(dom.globalThis, globalThis);
  });

  await t.step('globalThis.HTMLElement', () => {
    assert('HTMLElement' in dom.globalThis);
    // Because the test running with Deno.
    assert(!('HTMLElement' in globalThis));
  });
});
