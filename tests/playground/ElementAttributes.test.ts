import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertThrows } from '@std/assert';

import { ElementAttributes } from '../../mod.ts';

// Makes Element object in a separate scope,
// to ensure that object are cleared by garbage collection.
function createElementAttributesForGC(): ElementAttributes {
  const element = document.createElement('div');
  element.id = 'gc';

  const elementAttributes = new ElementAttributes(element);

  element.remove();

  return elementAttributes;
}

await Playground.test('ElementAttributes', async (t) => {
  const element = document.createElement('div');
  element.setAttribute('attr1', '1');

  let elementAttributes: ElementAttributes;

  await t.step('constructor()', () => {
    elementAttributes = new ElementAttributes(element);

    assert(elementAttributes);
  });

  await t.step('attributes', () => {
    assertEquals(elementAttributes.attributes.attr1, '1');
  });
});

await Playground.test('Attributes management', async (t) => {
  await t.step('attribute manipulation', () => {
    const element = document.createElement('div');

    const elementAttributes = new ElementAttributes(element);

    elementAttributes.attributes.attr0 = '0';
    elementAttributes.attributes.attr1 = '1';
    elementAttributes.attributes.attr2 = '2';
    delete elementAttributes.attributes.attr0;

    assertEquals(elementAttributes.attributes.attr0, undefined);
    assertEquals(elementAttributes.attributes.attr1, '1');
    assertEquals(elementAttributes.attributes.attr2, '2');
    assertEquals(Object.keys(elementAttributes.attributes).toSorted(), ['attr1', 'attr2']);
    assert(Object.getOwnPropertyDescriptor(elementAttributes.attributes, 'attr1') !== undefined);
    assert(!('attr0' in elementAttributes.attributes));
    assert('attr1' in elementAttributes.attributes);
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
          if (elementAttributes.attributes.id) {
            void 0;
          }
        } catch (exception) {
          clearInterval(intervalId);
          resolve(exception);
        }
      }, 0);
    });

    assertThrows(() => elementAttributes.attributes.id, Error);
  });
});
