import { assertInstanceOf, assertStrictEquals, assertThrows } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import Router from '../Router.ts';

function scenario(mode: 'hash' | 'history'): void {
  Deno.test(`Router (${mode} mode)`, { sanitizeResources: false, sanitizeOps: false }, async (t) => {
    let router: Router;

    let counter = 0;

    const onchange = (event: Event) => {
      counter++;
      console.log(counter, util.globalThis.location.href, event);
    };

    const onerror = (exception: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, exception);
    };

    const pattern1 = '/test/test/:id0/:id1';
    const handler1 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
    };

    const pattern2 = '/test/test/(?<id2>[^/?#]+)';
    const handler2 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
    };

    const pattern3 = '/test/test';
    const handler3 = (params: unknown) => {
      counter++;
      console.log(counter, util.globalThis.location.href, params);
      throw new Error('error');
    };

    await t.step('constructor()', () => {
      router = new Router(mode, '/test');

      assertInstanceOf(router, Router);
      assertStrictEquals(router.mode, mode);
      assertStrictEquals(router.base, '/test/');
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
      router.navigate('/test/test/0/1');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/test/test/0/1' : 'https://example.com/test/test/0/1',
      );

      router.navigate('/test/test/2');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/test/test/2' : 'https://example.com/test/test/2',
      );

      router.navigate('/test/test');

      assertStrictEquals(
        util.globalThis.location.href,
        mode === 'hash' ? 'https://example.com/#/test/test' : 'https://example.com/test/test',
      );

      router.navigate('/test/invalid');

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
