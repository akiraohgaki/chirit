import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertStrictEquals, assertThrows } from '@std/assert';

import { ElementProperties } from '../../mod.ts';

// Makes Element object in a separate scope,
// to ensure that object are cleared by garbage collection.
function createElementPropertiesForGC(): ElementProperties {
  const element = document.createElement('div');
  element.id = 'gc';

  const elementProperties = new ElementProperties(element, {
    id: { value: 'gc' },
  });

  element.remove();

  return elementProperties;
}

await Playground.test('ElementProperties', async (t) => {
  const element = document.createElement('div');
  element.setAttribute('prop1', '1');

  let elementProperties: ElementProperties;

  await t.step('constructor()', () => {
    elementProperties = new ElementProperties(element, {
      prop1: { value: 0 },
      prop2: { value: 0, reflect: true },
    });

    assert(elementProperties);
  });

  await t.step('properties', () => {
    assertEquals(elementProperties.properties.prop1, 0);
    assertEquals(elementProperties.properties.prop2, 0);
  });

  await t.step('sync()', () => {
    elementProperties.sync();

    assertEquals(elementProperties.properties.prop1, 1);
    assertEquals(element.getAttribute('prop2'), '0');
  });

  await t.step('reflectFromAttribute()', () => {
    elementProperties.properties.prop1 = 2;
    elementProperties.reflectFromAttribute('prop1');

    assertEquals(elementProperties.properties.prop1, 1);
  });

  await t.step('reflectToAttribute()', () => {
    elementProperties.properties.prop1 = 2;
    elementProperties.reflectToAttribute('prop1');

    assertEquals(element.getAttribute('prop1'), '2');
  });

  await t.step('onchange()', () => {
    const func = () => {};

    elementProperties.onchange = func;

    assertStrictEquals(elementProperties.onchange, func);
  });
});

await Playground.test('Properties management', async (t) => {
  await t.step('property manipulation', () => {
    const element = document.createElement('div');

    const elementProperties = new ElementProperties(element, {
      prop0: { value: 0 },
      prop1: { value: 1, reflect: true },
      prop2: { value: 2, converter: (value) => parseInt(value, 10) },
    });

    elementProperties.sync();
    elementProperties.properties.prop0 = 0.5;
    elementProperties.properties.prop1 = 1.5;
    element.setAttribute('prop2', '2.5');
    elementProperties.reflectFromAttribute('prop2');

    assertEquals(elementProperties.properties.prop0, 0.5);
    assert(!element.hasAttribute('prop0'));
    assertEquals(elementProperties.properties.prop1, 1.5);
    assertEquals(element.getAttribute('prop1'), '1.5');
    assertEquals(elementProperties.properties.prop2, 2);
    assertEquals(element.getAttribute('prop2'), '2.5');
    assertEquals(Object.keys(elementProperties.properties).toSorted(), ['prop0', 'prop1', 'prop2']);
    assert(Object.getOwnPropertyDescriptor(elementProperties.properties, 'prop1') !== undefined);
    assert('prop1' in elementProperties.properties);
    assertThrows(() => delete elementProperties.properties.prop0, Error);
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

    const elementProperties = new ElementProperties(element, {
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

    elementProperties.sync();

    assertEquals(elementProperties.properties.undefined, 'text');
    assertEquals(elementProperties.properties.null, 'text');
    assertEquals(elementProperties.properties.symbol, 'text');
    assertEquals(elementProperties.properties.function, 'text');

    assert(elementProperties.properties.boolean);
    assertEquals(elementProperties.properties.string, 'text');
    assertEquals(elementProperties.properties.number, 1);
    assertEquals(elementProperties.properties.bigint, 1n);
    assertEquals(elementProperties.properties.object, { key: 'value' });
    assertEquals(elementProperties.properties.array, [1]);
    assertEquals(elementProperties.properties.set, [1]);
    assertEquals(elementProperties.properties.date, new Date('1970-01-01T00:00:00.000Z'));

    element.removeAttribute('boolean');
    elementProperties.reflectFromAttribute('boolean');

    assert(!elementProperties.properties.boolean);
  });

  await t.step('reflect from properties to attributes', () => {
    const element = document.createElement('div');

    const elementProperties = new ElementProperties(element, {
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

    elementProperties.sync();

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
    elementProperties.reflectToAttribute('undefined');
    elementProperties.reflectToAttribute('null');

    assert(!element.hasAttribute('undefined'));
    assert(!element.hasAttribute('null'));

    elementProperties.properties.boolean = true;

    assertEquals(element.getAttribute('boolean'), '');
  });

  await t.step('garbage collection', async () => {
    if (navigator.userAgent.search('Firefox') !== -1) {
      // GC is slow in Firefox, so skip the check.
      return;
    }

    const elementProperties = createElementPropertiesForGC();

    // Wait for the element has gone.
    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        try {
          elementProperties.reflectFromAttribute('id');
        } catch (exception) {
          clearInterval(intervalId);
          resolve(exception);
        }
      }, 0);
    });

    assertThrows(() => elementProperties.reflectFromAttribute('id'), Error);
  });
});
