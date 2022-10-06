import { assertInstanceOf, assertStrictEquals, assertThrows } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import Router from '../Router.ts';

const $globalThis = util.globalThis();

function scenario(mode: 'hash' | 'history'): void {
  Deno.test(`Router (${mode} mode)`, { sanitizeResources: false, sanitizeOps: false }, async (t) => {
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
    });

    await t.step('delete()', () => {
      router.delete(pattern1);
      router.delete(pattern2);
    });

    await t.step('navigate()', () => {
      //router.navigate('https://example.com/test/0/1');
      //router.navigate('https://example.com/test/2');
      console.log($globalThis.location.href);
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
