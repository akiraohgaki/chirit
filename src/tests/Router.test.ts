import { assertInstanceOf, assertStrictEquals, assertThrows } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import Router from '../Router.ts';

function scenario(mode: 'hash' | 'history'): void {
  Deno.test(`Router (mode=${mode})`, { sanitizeResources: false, sanitizeOps: false }, async (t) => {
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

    const pattern1 = '/base/test/:name1/:name2';
    const handler1 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
    };

    const pattern2 = '/base/test/(?<name3>[^/?#]+)';
    const handler2 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
    };

    const pattern3 = '/base/error';
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

      // Route to handler1
      router.navigate(mode === 'hash' ? '#test/1/2' : 'test/1/2');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/base/test/1/2' : 'https://example.com/base/test/1/2',
      );
      assertStrictEquals(counter, mode === 'hash' ? 0 : 2);

      // Route to handler2
      router.navigate(mode === 'hash' ? '#test/3' : 'test/3');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/base/test/3' : 'https://example.com/base/test/3',
      );
      assertStrictEquals(counter, mode === 'hash' ? 0 : 4);

      // Route to handler3
      router.navigate(mode === 'hash' ? '#error' : 'error');
      // onerror() should fire

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/base/error' : 'https://example.com/base/error',
      );
      assertStrictEquals(counter, mode === 'hash' ? 0 : 7);

      // The path does not match with any patterns
      router.navigate(mode === 'hash' ? '#patternnotmatch' : 'patternnotmatch');

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

Deno.test(`Router (mode=invalid)`, { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  await t.step('constructor()', () => {
    assertThrows(() => {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      new Router('invalid');
    }, Error);
  });
});
