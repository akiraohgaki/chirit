import { assertInstanceOf, assertStrictEquals, assertThrows } from 'https://deno.land/std/testing/asserts.ts';

import Router from '../Router.ts';

function scenario(mode: 'hash' | 'history'): void {
  Deno.test(`Router (${mode} mode)`, async (t) => {
    let router: Router;

    const onchange = () => {};

    const onerror = () => {};

    const pattern1 = '/test/:id0/:id1';
    const handler1 = () => {};

    const pattern2 = '/test/(?<id2>[^/?#]+)';
    const handler2 = () => {};

    await t.step('constructor()', () => {
      router = new Router(mode, '/test');

      assertInstanceOf(router, Router);
      assertStrictEquals(router.mode, mode);
      assertStrictEquals(router.base, '/test/');
    });

    await t.step('onchange', () => {
      router.onchange = onchange;

      assertStrictEquals(router.onchange, onchange);
    });

    await t.step('onerror', () => {
      router.onerror = onerror;

      assertStrictEquals(router.onerror, onerror);
    });

    await t.step('set()', () => {
      router.set(pattern1, handler1);
      router.set(pattern2, handler2);
    });

    await t.step('get()', () => {
      assertStrictEquals(router.get(pattern1), handler1);
      assertStrictEquals(router.get(pattern2), handler2);

      assertStrictEquals(router.get('/notset'), undefined);
    });

    await t.step('delete()', () => {
      router.delete(pattern1);
      router.delete(pattern2);
    });

    await t.step('navigate()', () => {
      //router.navigate('https://example.com/test/0/1');
      //router.navigate('https://example.com/test/2');
    });
  });
}

scenario('hash');

scenario('history');

Deno.test(`Router (invalid mode)`, async (t) => {
  await t.step('constructor()', () => {
    assertThrows(() => {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      new Router('test');
    }, Error);
  });
});
