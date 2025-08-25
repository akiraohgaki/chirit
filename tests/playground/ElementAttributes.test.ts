import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertThrows } from '@std/assert';

import { ElementAttributes } from '../../mod.ts';

// Makes Element object in a separate scope,
// to ensure that object are cleared by garbage collection.
function createElementAttributesForGC(): ElementAttributes<{ id: string }> {
  const element = document.createElement('div');
  element.id = 'gc';

  const elementAttributes = new ElementAttributes<{ id: string }>(element);

  element.remove();

  return elementAttributes;
}

await Playground.test('ElementAttributes', async (t) => {
  const element = document.createElement('div');
  element.setAttribute('attr1', '1');

  let elementAttributes: ElementAttributes<{ attr1: string }>;

  await t.step('constructor()', () => {
    elementAttributes = new ElementAttributes(element);

    assert(elementAttributes);
  });

  await t.step('proxy', () => {
    assertEquals(elementAttributes.proxy.attr1, '1');
  });
});

await Playground.test('Attributes management features', async (t) => {
  await t.step('attribute manipulation', () => {
    const element = document.createElement('div');

    const elementAttributes = new ElementAttributes<{
      attr0: string;
      attr1: string;
      attr2: string;
    }>(element);

    elementAttributes.proxy.attr0 = '0';
    elementAttributes.proxy.attr1 = '1';
    elementAttributes.proxy.attr2 = '2';
    delete elementAttributes.proxy.attr0;

    assertEquals(elementAttributes.proxy.attr0, undefined);
    assertEquals(elementAttributes.proxy.attr1, '1');
    assertEquals(elementAttributes.proxy.attr2, '2');
    assertEquals(Object.keys(elementAttributes.proxy).toSorted(), ['attr1', 'attr2']);
    assert(Object.getOwnPropertyDescriptor(elementAttributes.proxy, 'attr1') !== undefined);
    assert(!('attr0' in elementAttributes.proxy));
    assert('attr1' in elementAttributes.proxy);
    assertEquals(element.outerHTML, '<div attr1="1" attr2="2"></div>');
  });

  await t.step('garbage collection', async () => {
    if (navigator.userAgent.search('Firefox') !== -1) {
      // GC is slow in Firefox, so skip the check.
      return;
    }

    const elementAttributes = createElementAttributesForGC();

    // Wait for the element has gone.
    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        try {
          if (elementAttributes.proxy.id) {
            void 0;
          }
        } catch (exception) {
          clearInterval(intervalId);
          resolve(exception);
        }
      }, 0);
    });

    assertThrows(() => elementAttributes.proxy.id, Error);
  });
});
