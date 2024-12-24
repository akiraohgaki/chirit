import { assertEquals, assertInstanceOf } from '@std/assert';

import { WebStorage } from '../../mod.ts';

Deno.test('WebStorage', async (t) => {
  await t.step('invalid storage mode', () => {
    try {
      // @ts-ignore: for testing
      new WebStorage();
    } catch (exception) {
      assertInstanceOf(exception, Error);
    }

    try {
      // @ts-ignore: for testing
      new WebStorage('invalid');
    } catch (exception) {
      assertInstanceOf(exception, Error);
    }
  });

  await t.step('local storage mode', () => {
    const webStorage = new WebStorage('local', 'test_');

    assertEquals(webStorage.mode, 'local');
    assertEquals(webStorage.prefix, 'test_');
    assertEquals(webStorage.size, 0);
    assertEquals(webStorage.keys(), []);

    assertEquals(webStorage.get('item0'), undefined);

    localStorage.setItem('test_item1', 'a');

    assertEquals(localStorage.getItem('test_item1'), 'a');
    assertEquals(webStorage.get('item1'), 'a');

    webStorage.set('item2', 'b');

    assertEquals(localStorage.getItem('test_item2'), '{"_v":"b"}');
    assertEquals(webStorage.get('item2'), 'b');

    assertEquals(webStorage.size, 2);
    assertEquals(webStorage.keys().sort(), ['test_item1', 'test_item2']);

    webStorage.delete('item1');

    assertEquals(webStorage.size, 1);
    assertEquals(webStorage.keys(), ['test_item2']);

    webStorage.clear();

    assertEquals(webStorage.size, 0);
    assertEquals(webStorage.keys(), []);
  });

  await t.step('session storage mode', () => {
    const webStorage = new WebStorage('session', 'test_');

    assertEquals(webStorage.mode, 'session');
    assertEquals(webStorage.prefix, 'test_');
    assertEquals(webStorage.size, 0);
    assertEquals(webStorage.keys(), []);

    assertEquals(webStorage.get('item0'), undefined);

    sessionStorage.setItem('test_item1', 'a');

    assertEquals(sessionStorage.getItem('test_item1'), 'a');
    assertEquals(webStorage.get('item1'), 'a');

    webStorage.set('item2', 'b');

    assertEquals(sessionStorage.getItem('test_item2'), '{"_v":"b"}');
    assertEquals(webStorage.get('item2'), 'b');

    assertEquals(webStorage.size, 2);
    assertEquals(webStorage.keys().sort(), ['test_item1', 'test_item2']);

    webStorage.delete('item1');

    assertEquals(webStorage.size, 1);
    assertEquals(webStorage.keys(), ['test_item2']);

    webStorage.clear();

    assertEquals(webStorage.size, 0);
    assertEquals(webStorage.keys(), []);
  });

  await t.step('data in the storage', () => {
    const webStorage = new WebStorage('local');

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
});
