import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertInstanceOf, assertNotInstanceOf, assertThrows } from '@std/assert';

import { ElementPropertiesProxy } from '../../mod.ts';

// Makes Element object in a separate scope,
// to ensure that object are cleared by garbage collection.
function createElementPropertiesProxyForGC(): ElementPropertiesProxy {
  const element = document.createElement('div');
  element.id = 'gc';

  const elementPropertiesProxy = new ElementPropertiesProxy(element, {
    id: { value: 'gc' },
  });

  element.remove();

  return elementPropertiesProxy;
}

await Playground.test('ElementPropertiesProxy', async (t) => {
  await t.step('constructor()', () => {
    const element = document.createElement('div');

    const elementPropertiesProxy = new ElementPropertiesProxy(element, {});

    assert(elementPropertiesProxy);
    assertNotInstanceOf(elementPropertiesProxy, ElementPropertiesProxy);
    assertInstanceOf(elementPropertiesProxy, Object);
  });
});

await Playground.test('Proxy object', async (t) => {
  await t.step('reflect from attributes to properties', () => {
    const element = document.createElement('div');
    element.setAttribute('no-reflect', '1');
    element.setAttribute('undefined', '[]');
    element.setAttribute('boolean', '');
    element.setAttribute('string', 'text');
    element.setAttribute('number', '1');
    element.setAttribute('array', '[1]');
    element.setAttribute('object', '{"key":"value"}');
    element.setAttribute('null', '[]');
    element.setAttribute('date', '1970-01-01T00:00:00.000Z');
    element.setAttribute('set', '[1]');
    element.setAttribute('map', '[["a",1]]');

    const elementPropertiesProxy = new ElementPropertiesProxy(element, {
      'no-reflect': {
        value: 0,
      },
      undefined: {
        value: undefined,
        reflect: true,
      },
      boolean: {
        value: false,
        reflect: true,
      },
      string: {
        value: '',
        reflect: true,
      },
      number: {
        value: 0,
        reflect: true,
      },
      array: {
        value: [],
        reflect: true,
      },
      object: {
        value: {},
        reflect: true,
      },
      null: {
        value: null,
        reflect: true,
      },
      date: {
        value: new Date(),
        reflect: true,
        converter: (value) => new Date(value),
      },
      set: {
        value: new Set([0]),
        reflect: true,
      },
      map: {
        value: new Map([['a', 0]]),
        reflect: true,
      },
    });

    assertEquals(elementPropertiesProxy['no-reflect'], 1);
    assertEquals(elementPropertiesProxy.undefined, undefined);
    assertEquals(elementPropertiesProxy.boolean, true);
    assertEquals(elementPropertiesProxy.string, 'text');
    assertEquals(elementPropertiesProxy.number, 1);
    assertEquals(elementPropertiesProxy.array, [1]);
    assertEquals(elementPropertiesProxy.object, { key: 'value' });
    assertEquals(elementPropertiesProxy.null, []);
    assertEquals(elementPropertiesProxy.date, new Date('1970-01-01T00:00:00.000Z'));
    assertEquals(elementPropertiesProxy.set, [1]);
    assertEquals(elementPropertiesProxy.map, [['a', 1]]);

    element.setAttribute('no-reflect', '2');
    element.removeAttribute('boolean');
    elementPropertiesProxy.__reflectFromAttribute('no-reflect');
    elementPropertiesProxy.__reflectFromAttribute('boolean');

    assertEquals(elementPropertiesProxy['no-reflect'], 2);
    assertEquals(elementPropertiesProxy.boolean, false);
  });

  await t.step('reflect from properties to attributes', () => {
    const element = document.createElement('div');

    const elementPropertiesProxy = new ElementPropertiesProxy(element, {
      'no-reflect': {
        value: 1,
      },
      undefined: {
        value: undefined,
        reflect: true,
      },
      boolean: {
        value: true,
        reflect: true,
      },
      string: {
        value: 'text',
        reflect: true,
      },
      number: {
        value: 1,
        reflect: true,
      },
      array: {
        value: [1],
        reflect: true,
      },
      object: {
        value: { key: 'value' },
        reflect: true,
      },
      null: {
        value: null,
        reflect: true,
      },
      date: {
        value: new Date('1970-01-01T00:00:00.000Z'),
        reflect: true,
        converter: (value) => new Date(value),
      },
      set: {
        value: new Set([0]),
        reflect: true,
      },
      map: {
        value: new Map([['a', 0]]),
        reflect: true,
      },
    });

    assertEquals(element.hasAttribute('no-reflect'), false);
    assertEquals(element.hasAttribute('undefined'), false);
    assertEquals(element.getAttribute('boolean'), '');
    assertEquals(element.getAttribute('string'), 'text');
    assertEquals(element.getAttribute('number'), '1');
    assertEquals(element.getAttribute('array'), '[1]');
    assertEquals(element.getAttribute('object'), '{"key":"value"}');
    assertEquals(element.getAttribute('null'), 'null');
    assertEquals(element.getAttribute('date'), '"1970-01-01T00:00:00.000Z"');
    assertEquals(element.getAttribute('set'), '{}');
    assertEquals(element.getAttribute('map'), '{}');

    elementPropertiesProxy['no-reflect'] = 2;
    elementPropertiesProxy.boolean = false;
    elementPropertiesProxy.__reflectToAttribute('no-reflect');
    elementPropertiesProxy.__reflectToAttribute('boolean');

    assertEquals(element.getAttribute('no-reflect'), '2');
    assertEquals(element.hasAttribute('boolean'), false);
  });

  await t.step('garbage collection', async () => {
    if (navigator.userAgent.search('Firefox') !== -1) {
      // GC is slow in Firefox, so skip the check.
      return;
    }

    const elementPropertiesProxy = createElementPropertiesProxyForGC();

    // Wait for the element has gone.
    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        try {
          elementPropertiesProxy.__reflectFromAttribute('id');
        } catch (exception) {
          clearInterval(intervalId);
          resolve(exception);
        }
      }, 0);
    });

    assertThrows(() => elementPropertiesProxy.__reflectFromAttribute('id'), Error);
  });
});
