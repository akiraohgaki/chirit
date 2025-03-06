import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertStrictEquals } from '@std/assert';

import { dom } from '../../mod.ts';

await Playground.test('dom', async (t) => {
  await t.step('globalThis', () => {
    // Because the test running with browser.
    assertStrictEquals(dom.globalThis, globalThis);
  });

  await t.step('globalThis.HTMLElement', () => {
    assert('HTMLElement' in dom.globalThis);
    // Because the test running with browser.
    assert('HTMLElement' in globalThis);
  });
});
