import { assertStrictEquals } from '@std/assert';

import { dom } from '../../dom.ts';

Deno.test('dom', async (t) => {
  await t.step('globalThis', () => {
    assertStrictEquals('HTMLElement' in dom.globalThis, true);
    assertStrictEquals('structuredClone' in dom.globalThis, true);
    assertStrictEquals('localStorage' in dom.globalThis, true);
    assertStrictEquals('sessionStorage' in dom.globalThis, true);
  });
});
