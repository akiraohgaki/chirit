import { assert } from '@std/assert';

import { dom } from '../../mod.ts';

Deno.test('dom', async (t) => {
  await t.step('has globalThis', () => {
    assert('globalThis' in dom);
  });

  await t.step('has globalThis.HTMLElement', () => {
    assert('HTMLElement' in dom.globalThis);
    assert(!('HTMLElement' in globalThis));
  });
});
