import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';

import WebStorage from '../WebStorage.ts';

Deno.test('WebStorage', async (t) => {
  let webStorage: WebStorage;

  await t.step('constructor()', async (t) => {
    await t.step('Initialization for localStorage', () => {
      webStorage = new WebStorage('local', 'test_');

      assertInstanceOf(webStorage, WebStorage);
      assertStrictEquals(webStorage.mode, 'local');
      assertStrictEquals(webStorage.prefix, 'test_');
      assertStrictEquals(webStorage.size, 0);
    });

    await t.step('Initialization for sessioStorage', () => {
      webStorage = new WebStorage('session', 'test_');

      assertInstanceOf(webStorage, WebStorage);
      assertStrictEquals(webStorage.mode, 'session');
      assertStrictEquals(webStorage.prefix, 'test_');
      assertStrictEquals(webStorage.size, 0);
    });

    await t.step('Initialization error', () => {
      assertThrows(() => {
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        new WebStorage('test');
      }, Error);
    });
  });

  await t.step('set()', () => {
    webStorage.set('boolean', true);
    webStorage.set('number', 0);
    webStorage.set('string', 'test');
    webStorage.set('array', [0, 1, 2]);
    webStorage.set('object', { key0: 0, key1: 1, key2: 2 });
    webStorage.set('null', null);
    webStorage.set('undefined', undefined);

    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_boolean'),
      '{"_k":"boolean","_v":true}',
    );
    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_number'),
      '{"_k":"number","_v":0}',
    );
    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_string'),
      '{"_k":"string","_v":"test"}',
    );
    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_array'),
      '{"_k":"array","_v":[0,1,2]}',
    );
    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_object'),
      '{"_k":"object","_v":{"key0":0,"key1":1,"key2":2}}',
    );
    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_null'),
      '{"_k":"null","_v":null}',
    );
    assertStrictEquals(
      globalThis.sessionStorage.getItem('test_undefined'),
      '{"_k":"undefined"}',
    );
  });

  await t.step('get()', () => {
    assertStrictEquals(webStorage.get('boolean'), true);
    assertStrictEquals(webStorage.get('number'), 0);
    assertStrictEquals(webStorage.get('string'), 'test');
    assertEquals(webStorage.get('array'), [0, 1, 2]);
    assertEquals(webStorage.get('object'), { key0: 0, key1: 1, key2: 2 });
    assertStrictEquals(webStorage.get('null'), null);
    assertStrictEquals(webStorage.get('undefined'), undefined);

    assertStrictEquals(webStorage.get('keynotexist'), null);

    globalThis.sessionStorage.setItem('test_invalidjson', 'dummy');
    assertStrictEquals(webStorage.get('invalidjson'), 'dummy');
    globalThis.sessionStorage.removeItem('test_invalidjson');

    globalThis.sessionStorage.setItem('test_invalidobject', '{}');
    assertStrictEquals(webStorage.get('invalidobject'), '{}');
    globalThis.sessionStorage.removeItem('test_invalidobject');
  });

  await t.step('keys()', () => {
    assertArrayIncludes(webStorage.keys(), [
      'test_boolean',
      'test_number',
      'test_string',
      'test_array',
      'test_object',
      'test_null',
      'test_undefined',
    ]);
  });

  await t.step('delete()', () => {
    webStorage.delete('boolean');
    webStorage.delete('number');
    webStorage.delete('string');

    assertStrictEquals(webStorage.size, 4);
  });

  await t.step('clear()', () => {
    webStorage.clear();

    assertStrictEquals(webStorage.size, 0);
  });
});
