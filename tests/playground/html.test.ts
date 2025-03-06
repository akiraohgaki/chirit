import { Playground } from '@akiraohgaki/devsrv/playground';
import { assertEquals, assertInstanceOf } from '@std/assert';

import { html } from '../../mod.ts';

await Playground.test('html()', async (t) => {
  await t.step('tagged template literal', () => {
    const fragment = html`<span>${'a'},${0},${null},${undefined}</span>`;

    assertInstanceOf(fragment, DocumentFragment);
    assertEquals(fragment.querySelector('span')?.outerHTML, '<span>a,0,null,undefined</span>');
  });
});
