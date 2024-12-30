import { assertEquals } from '@std/assert';

import { dom } from '../../mod.ts';

Deno.test('dom', async (t) => {
  await t.step('globalThis.HTMLElement', () => {
    assertEquals('HTMLElement' in globalThis, false);
    assertEquals('HTMLElement' in dom.globalThis, true);
  });
});
