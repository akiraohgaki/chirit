import { assertInstanceOf, assertStrictEquals, assertThrows } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import Router from '../Router.ts';

function scenario(mode: 'hash' | 'history'): void {
  Deno.test(`Router (${mode} mode)`, { sanitizeResources: false, sanitizeOps: false }, async (t) => {
    let router: Router;

    let counter = 0;

    const onchange = (event: Event) => {
      counter++;
      console.log(counter, util.globalThis.location.href, event.type);
    };

    const onerror = (exception: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, (exception as Error).message);
    };

    const pattern1 = '/base/test/:id0/:id1';
    const handler1 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
    };

    const pattern2 = '/base/test/(?<id2>[^/?#]+)';
    const handler2 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
    };

    const pattern3 = '/base/test';
    const handler3 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
      throw new Error('error');
    };

    await t.step('constructor()', () => {
      router = new Router(mode, '/base');

      assertInstanceOf(router, Router);
      assertStrictEquals(router.mode, mode);
      assertStrictEquals(router.base, '/base/');
    });

    await t.step('onchange()', () => {
      router.onchange = onchange;

      assertStrictEquals(router.onchange, onchange);
    });

    await t.step('onerror()', () => {
      router.onerror = onerror;

      assertStrictEquals(router.onerror, onerror);
    });

    await t.step('set()', () => {
      router.set(pattern1, handler1);
      router.set(pattern2, handler2);
      router.set(pattern3, handler3);
    });

    await t.step('navigate()', () => {
      // hashchange event not fired on test environment

      router.navigate(mode === 'hash' ? '#test/0/1' : 'test/0/1');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/base/test/0/1' : 'https://example.com/base/test/0/1',
      );

      router.navigate(mode === 'hash' ? '#test/2' : 'test/2');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/base/test/2' : 'https://example.com/base/test/2',
      );

      router.navigate(mode === 'hash' ? '#test' : 'test');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/base/test' : 'https://example.com/base/test',
      );

      router.navigate(mode === 'hash' ? '#invalid' : 'invalid');

      assertStrictEquals(counter, mode === 'hash' ? 0 : 8);
    });

    await t.step('delete()', () => {
      router.delete(pattern1);
      router.delete(pattern2);
      router.delete(pattern3);
    });
  });
}

scenario('hash');

scenario('history');

Deno.test(`Router (invalid mode)`, { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  await t.step('constructor()', () => {
    assertThrows(() => {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      new Router('invalid');
    }, Error);
  });
});
