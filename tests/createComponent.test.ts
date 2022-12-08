import { assertStrictEquals } from 'std/testing/asserts.ts';
import dom from './dom.ts';
import createComponent from '../src/createComponent.ts';

Deno.test('createComponent', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  await t.step('createComponent()', () =>{
    const CustomComponent = createComponent('custom-component', {});

    assertStrictEquals(dom.globalThis.customElements.get('custom-component') !== undefined, true);
  });
});
