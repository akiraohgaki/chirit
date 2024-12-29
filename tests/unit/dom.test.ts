import { assertEquals } from '@std/assert';

import { dom } from '../../dom.ts';

Deno.test('dom', async (t) => {
  await t.step('globalThis.HTMLElement', () => {
    assertEquals('HTMLElement' in dom.globalThis, true);
  });
});
