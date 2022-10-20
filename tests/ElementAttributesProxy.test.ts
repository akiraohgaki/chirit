import {
  assertArrayIncludes,
  assertInstanceOf,
  assertNotInstanceOf,
  assertStrictEquals,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';
import dom from './dom.ts';
import ElementAttributesProxy from '../src/ElementAttributesProxy.ts';

Deno.test('ElementAttributesProxy', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let elementAttributesProxy: ElementAttributesProxy;

  const element = dom.globalThis.document.createElement('div');

  await t.step('constructor()', () => {
    elementAttributesProxy = new ElementAttributesProxy(element);

    // This class creates Object instance instead of self instance
    assertInstanceOf(elementAttributesProxy, Object);
    assertNotInstanceOf(elementAttributesProxy, ElementAttributesProxy);
  });

  await t.step('set()', () => {
    elementAttributesProxy.test = 'test';
    elementAttributesProxy['data-test'] = 'data-test';

    assertStrictEquals(element.getAttribute('test'), 'test');
    assertStrictEquals(element.getAttribute('data-test'), 'data-test');

    assertThrows(() => {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      elementAttributesProxy.invalidvalue = 0;
    }, TypeError);
  });

  await t.step('get()', () => {
    assertStrictEquals(elementAttributesProxy.test, 'test');
    assertStrictEquals(elementAttributesProxy['data-test'], 'data-test');

    assertStrictEquals(elementAttributesProxy.undefinedname, undefined);
  });

  await t.step('has()', () => {
    assertStrictEquals('test' in elementAttributesProxy, true);
    assertStrictEquals('data-test' in elementAttributesProxy, true);

    assertStrictEquals('undefinedname' in elementAttributesProxy, false);
  });

  await t.step('ownKeys()', () => {
    assertArrayIncludes(Object.keys(elementAttributesProxy), ['test', 'data-test']);
  });

  await t.step('getOwnPropertyDescriptor()', () => {
    assertStrictEquals(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'test')?.value, 'test');
    assertStrictEquals(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'data-test')?.value, 'data-test');

    assertStrictEquals(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'undefinedname'), undefined);
  });

  await t.step('deleteProperty()', () => {
    delete elementAttributesProxy.test;
    delete elementAttributesProxy['data-test'];

    assertStrictEquals(element.hasAttribute('test'), false);
    assertStrictEquals(element.hasAttribute('data-test'), false);

    assertThrows(() => {
      delete elementAttributesProxy.undefinedname;
    }, TypeError);
  });
});
