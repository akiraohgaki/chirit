import { assert, assertEquals, assertInstanceOf, assertNotInstanceOf, assertThrows } from '@std/assert';

import { ElementAttributesProxy } from '../../../mod.ts';

import { Playground } from './Playground.ts';

await Playground.test('ElementAttributesProxy', async (t) => {
  await t.step('constructor()', () => {
    const element = document.createElement('div');
    const elementAttributesProxy = new ElementAttributesProxy(element);

    assertNotInstanceOf(elementAttributesProxy, ElementAttributesProxy);
    assertInstanceOf(elementAttributesProxy, Object);
  });
});

await Playground.test('Proxy object', async (t) => {
  await t.step('attribute manipulation', () => {
    const element = document.createElement('div');
    const elementAttributesProxy = new ElementAttributesProxy(element);

    elementAttributesProxy.attr0 = '0';
    elementAttributesProxy.attr1 = '1';
    elementAttributesProxy['attr2'] = '2';
    delete elementAttributesProxy.attr0;

    assertEquals(elementAttributesProxy.attr0, undefined);
    assertEquals(elementAttributesProxy.attr1, '1');
    assertEquals(elementAttributesProxy['attr2'], '2');
    assertEquals(Object.keys(elementAttributesProxy).toSorted(), ['attr1', 'attr2']);
    assert(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'attr1') !== undefined);
    assert(!('attr0' in elementAttributesProxy));
    assert('attr1' in elementAttributesProxy);
    assertEquals(element.outerHTML, '<div attr1="1" attr2="2"></div>');
  });

  // Makes Element object in a separate scope,
  // to ensure that object are cleared by garbage collection.
  function createElementAttributesProxyForGC(): ElementAttributesProxy {
    const element = document.createElement('div');
    element.id = 'gc';

    const elementAttributesProxy = new ElementAttributesProxy(element);

    element.remove();

    return elementAttributesProxy;
  }

  await t.step('garbage collection', async () => {
    if (navigator.userAgent.search('Firefox') !== -1) {
      // GC is slow in Firefox, so skip the check.
      return;
    }

    const elementAttributesProxy = createElementAttributesProxyForGC();

    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        try {
          if (elementAttributesProxy.id) {
            void 0;
          }
        } catch (exception) {
          clearInterval(intervalId);
          resolve(exception);
        }
      }, 1000);
    });

    assertThrows(() => elementAttributesProxy.id, Error);
  });
});
