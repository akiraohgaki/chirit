import { Playground } from '@akiraohgaki/devsrv/playground';
import { assertEquals, assertInstanceOf } from '@std/assert';

import { css } from '../../mod.ts';

await Playground.test('css()', async (t) => {
  await t.step('tagged template literal', () => {
    const sheet = css`span { color: ${'red'}; }`;

    assertInstanceOf(sheet, CSSStyleSheet);
    assertEquals(sheet.cssRules[0].cssText, 'span { color: red; }');
  });
});
