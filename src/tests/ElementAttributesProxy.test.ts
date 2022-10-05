import {
  assertArrayIncludes,
  assertInstanceOf,
  assertNotInstanceOf,
  assertStrictEquals,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';
import { jsdom } from './util.ts';

import ElementAttributesProxy from '../ElementAttributesProxy.ts';

Deno.test('ElementAttributesProxy', async (t) => {
  let elementAttributesProxy: ElementAttributesProxy;

  let element: Element;

  await t.step('constructor()', () => {
    element = jsdom().window.document.createElement('div');
    elementAttributesProxy = new ElementAttributesProxy(element);

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
      elementAttributesProxy.invalid = 0;
    }, TypeError);
  });

  await t.step('get()', () => {
    assertStrictEquals(elementAttributesProxy.test, 'test');
    assertStrictEquals(elementAttributesProxy['data-test'], 'data-test');

    assertStrictEquals(elementAttributesProxy.invalid, undefined);
  });

  await t.step('has()', () => {
    assertStrictEquals('test' in elementAttributesProxy, true);
    assertStrictEquals('data-test' in elementAttributesProxy, true);

    assertStrictEquals('invalid' in elementAttributesProxy, false);
  });

  await t.step('ownKeys()', () => {
    assertArrayIncludes(Object.keys(elementAttributesProxy), ['test', 'data-test']);
  });

  await t.step('getOwnPropertyDescriptor()', () => {
    assertStrictEquals(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'test')?.value, 'test');
    assertStrictEquals(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'data-test')?.value, 'data-test');

    assertStrictEquals(Object.getOwnPropertyDescriptor(elementAttributesProxy, 'invalid'), undefined);
  });

  await t.step('deleteProperty()', () => {
    delete elementAttributesProxy.test;
    delete elementAttributesProxy['data-test'];

    assertStrictEquals(element.hasAttribute('test'), false);
    assertStrictEquals(element.hasAttribute('data-test'), false);

    assertThrows(() => {
      delete elementAttributesProxy.invalid;
    }, TypeError);
  });
});
