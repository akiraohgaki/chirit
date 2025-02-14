import { assert } from '@std/assert';

import { dom } from '../../mod.ts';

Deno.test('dom', async (t) => {
  await t.step('globalThis.HTMLElement', () => {
    assert(!('HTMLElement' in globalThis));
    assert('HTMLElement' in dom.globalThis);
  });
});
