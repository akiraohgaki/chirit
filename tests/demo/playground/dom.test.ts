import { assert, assertStrictEquals } from '@std/assert';

import { dom } from '../../../mod.ts';

import { Playground } from './Playground.ts';

await Playground.test('dom', async (t) => {
  await t.step('globalThis', () => {
    assertStrictEquals(dom.globalThis, globalThis);
  });

  await t.step('globalThis.HTMLElement', () => {
    assert('HTMLElement' in dom.globalThis);
    assert('HTMLElement' in globalThis);
  });
});
