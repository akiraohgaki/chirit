import { assert, assertEquals, assertThrows } from '@std/assert';

import { WebStorage } from '../../mod.ts';

localStorage.clear();
sessionStorage.clear();

Deno.test('WebStorage', async (t) => {
  let webStorage: WebStorage;

  await t.step('constructor()', async (t) => {
    await t.step('invalid storage mode', () => {
      // @ts-ignore because invalid parameter.
      assertThrows(() => new WebStorage(), Error);
      // @ts-ignore because invalid parameter.
      assertThrows(() => new WebStorage('invalid'), Error);
    });

    await t.step('local storage mode and prefix to keys', () => {
      webStorage = new WebStorage('local', 'test_');

      assert(webStorage);
    });

    await t.step('session storage mode and prefix to keys', () => {
      // Initialization only.
      new WebStorage('session', 'test_');

      assert(webStorage);
    });
  });

  await t.step('mode', () => {
    assertEquals(webStorage.mode, 'local');
  });

  await t.step('prefix', () => {
    assertEquals(webStorage.prefix, 'test_');
  });

  await t.step('size', () => {
    assertEquals(webStorage.size, 0);
  });

  await t.step('keys()', () => {
    assertEquals(webStorage.keys(), []);
  });

  await t.step('get()', () => {
    assertEquals(webStorage.get('a'), undefined);
    assertEquals(webStorage.get('b'), undefined);
  });

  await t.step('set()', () => {
    webStorage.set('a', 1);
    webStorage.set('b', 1);

    assertEquals(webStorage.get('a'), 1);
    assertEquals(webStorage.get('b'), 1);

    assertEquals(webStorage.size, 2);
    assertEquals(webStorage.keys().sort(), ['test_a', 'test_b']);
  });

  await t.step('delete()', () => {
    webStorage.delete('b');

    assertEquals(webStorage.get('b'), undefined);

    assertEquals(webStorage.size, 1);
    assertEquals(webStorage.keys(), ['test_a']);
  });

  await t.step('clear()', () => {
    webStorage.clear();

    assertEquals(webStorage.size, 0);
    assertEquals(webStorage.keys(), []);
  });
});

Deno.test('Storage mode', async (t) => {
  await t.step('local storage', () => {
    const webStorage = new WebStorage('local', 'test_');

    webStorage.set('a', 1);
    localStorage.setItem('test_b', '{"_v":1}');

    assertEquals(localStorage.getItem('test_a'), '{"_v":1}');
    assertEquals(webStorage.get('b'), 1);

    webStorage.clear();
  });

  await t.step('session storage', () => {
    const webStorage = new WebStorage('session', 'test_');

    webStorage.set('a', 1);
    sessionStorage.setItem('test_b', '{"_v":1}');

    assertEquals(sessionStorage.getItem('test_a'), '{"_v":1}');
    assertEquals(webStorage.get('b'), 1);

    webStorage.clear();
  });
});

Deno.test('Stored data', async (t) => {
  const webStorage = new WebStorage('local');

  await t.step('compatibility', () => {
    localStorage.setItem('keyA', 'value');
    webStorage.set('keyB', 'value');

    assertEquals(
      JSON.parse(localStorage.getItem('keyB') as string)._v,
      webStorage.get('keyA'),
    );

    webStorage.clear();
  });

  await t.step('JSON serializable data', () => {
    webStorage.set('boolean', true);
    webStorage.set('number', 1);
    webStorage.set('string', 'text');
    webStorage.set('array', [0]);
    webStorage.set('object', { key: 'value' });
    webStorage.set('null', null);
    webStorage.set('undefined', undefined);

    assertEquals(webStorage.get('boolean'), true);
    assertEquals(webStorage.get('number'), 1);
    assertEquals(webStorage.get('string'), 'text');
    assertEquals(webStorage.get('array'), [0]);
    assertEquals(webStorage.get('object'), { key: 'value' });
    assertEquals(webStorage.get('null'), null);
    assertEquals(webStorage.get('undefined'), undefined);

    assertEquals(localStorage.getItem('boolean'), '{"_v":true}');
    assertEquals(localStorage.getItem('number'), '{"_v":1}');
    assertEquals(localStorage.getItem('string'), '{"_v":"text"}');
    assertEquals(localStorage.getItem('array'), '{"_v":[0]}');
    assertEquals(localStorage.getItem('object'), '{"_v":{"key":"value"}}');
    assertEquals(localStorage.getItem('null'), '{"_v":null}');
    assertEquals(localStorage.getItem('undefined'), '{}');

    webStorage.clear();
  });

  await t.step('data that cannot be JSON serialized', () => {
    webStorage.set('Set', new Set([0]));
    webStorage.set('Map', new Map([['a', 0]]));

    assertEquals(webStorage.get('Set'), {});
    assertEquals(webStorage.get('Map'), {});

    assertEquals(localStorage.getItem('Set'), '{"_v":{}}');
    assertEquals(localStorage.getItem('Map'), '{"_v":{}}');

    webStorage.clear();
  });
});
