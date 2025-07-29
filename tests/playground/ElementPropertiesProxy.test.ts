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
  await t.step('property manipulation', () => {
    const element = document.createElement('div');

    const elementPropertiesProxy = new ElementPropertiesProxy(element, {
      prop0: { value: 0 },
      prop1: { value: 1, reflect: true },
      prop2: { value: 2, converter: (value) => parseInt(value, 10) },
    });

    elementPropertiesProxy.prop0 = 0.5;
    elementPropertiesProxy['prop1'] = 1.5;
    element.setAttribute('prop2', '2.5');
    elementPropertiesProxy.__reflectFromAttribute('prop2');

    assertEquals(elementPropertiesProxy.prop0, 0.5);
    assert(!element.hasAttribute('prop0'));
    assertEquals(elementPropertiesProxy['prop1'], 1.5);
    assertEquals(element.getAttribute('prop1'), '1.5');
    assertEquals(elementPropertiesProxy.prop2, 2);
    assertEquals(element.getAttribute('prop2'), '2.5');
    assertEquals(Object.keys(elementPropertiesProxy).toSorted(), ['prop0', 'prop1', 'prop2']);
    assert(Object.getOwnPropertyDescriptor(elementPropertiesProxy, 'prop1') !== undefined);
    assert('prop1' in elementPropertiesProxy);
    assertThrows(() => delete elementPropertiesProxy.prop0, Error);
    assertEquals(element.outerHTML, '<div prop1="1.5" prop2="2.5"></div>');
  });

  await t.step('reflect from attributes to properties', () => {
    const element = document.createElement('div');

    element.setAttribute('undefined', 'text');
    element.setAttribute('null', 'text');
    element.setAttribute('symbol', 'text');
    element.setAttribute('function', 'text');

    element.setAttribute('boolean', '');
    element.setAttribute('string', 'text');
    element.setAttribute('number', '1');
    element.setAttribute('bigint', '1');
    element.setAttribute('object', '{"key":"value"}');
    element.setAttribute('array', '[1]');
    element.setAttribute('set', '[1]');
    element.setAttribute('date', '"1970-01-01T00:00:00.000Z"');

    const elementPropertiesProxy = new ElementPropertiesProxy(element, {
      undefined: {
        value: undefined,
      },
      null: {
        value: null,
      },
      symbol: {
        value: Symbol(),
      },
      function: {
        value: () => {},
      },
      boolean: {
        value: false,
      },
      string: {
        value: '',
      },
      number: {
        value: 0,
      },
      bigint: {
        value: 0n,
      },
      object: {
        value: {},
      },
      array: {
        value: [],
      },
      set: {
        value: new Set([0]),
      },
      date: {
        value: new Date(),
        converter: (value) => new Date(JSON.parse(value)),
      },
    });

    assertEquals(elementPropertiesProxy.undefined, 'text');
    assertEquals(elementPropertiesProxy.null, 'text');
    assertEquals(elementPropertiesProxy.symbol, 'text');
    assertEquals(elementPropertiesProxy.function, 'text');

    assert(elementPropertiesProxy.boolean);
    assertEquals(elementPropertiesProxy.string, 'text');
    assertEquals(elementPropertiesProxy.number, 1);
    assertEquals(elementPropertiesProxy.bigint, 1n);
    assertEquals(elementPropertiesProxy.object, { key: 'value' });
    assertEquals(elementPropertiesProxy.array, [1]);
    assertEquals(elementPropertiesProxy.set, [1]);
    assertEquals(elementPropertiesProxy.date, new Date('1970-01-01T00:00:00.000Z'));

    element.removeAttribute('boolean');
    elementPropertiesProxy.__reflectFromAttribute('boolean');

    assert(!elementPropertiesProxy.boolean);
  });

  await t.step('reflect from properties to attributes', () => {
    const element = document.createElement('div');

    const elementPropertiesProxy = new ElementPropertiesProxy(element, {
      undefined: {
        value: undefined,
        reflect: true,
      },
      null: {
        value: null,
        reflect: true,
      },
      symbol: {
        value: Symbol(),
        reflect: true,
      },
      function: {
        value: () => {},
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
      bigint: {
        value: 1n,
        reflect: true,
      },
      object: {
        value: { key: 'value' },
        reflect: true,
      },
      array: {
        value: [1],
        reflect: true,
      },
      set: {
        value: new Set([0]),
        reflect: true,
      },
      date: {
        value: new Date('1970-01-01T00:00:00.000Z'),
        reflect: true,
        converter: (value) => new Date(JSON.parse(value)),
      },
    });

    assert(!element.hasAttribute('undefined'));
    assert(!element.hasAttribute('null'));
    assert(element.hasAttribute('symbol')); // 'Symbol()'
    assert(element.hasAttribute('function')); // '() => {}'

    assert(!element.hasAttribute('boolean'));
    assertEquals(element.getAttribute('string'), 'text');
    assertEquals(element.getAttribute('number'), '1');
    assertEquals(element.getAttribute('bigint'), '1');
    assertEquals(element.getAttribute('object'), '{"key":"value"}');
    assertEquals(element.getAttribute('array'), '[1]');
    assertEquals(element.getAttribute('set'), '{}');
    assertEquals(element.getAttribute('date'), '"1970-01-01T00:00:00.000Z"');

    element.setAttribute('undefined', 'text');
    element.setAttribute('null', 'text');
    elementPropertiesProxy.__reflectToAttribute('undefined');
    elementPropertiesProxy.__reflectToAttribute('null');

    assert(!element.hasAttribute('undefined'));
    assert(!element.hasAttribute('null'));

    elementPropertiesProxy.boolean = true;

    assertEquals(element.getAttribute('boolean'), '');
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
