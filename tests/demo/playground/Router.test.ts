import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertStrictEquals, assertThrows } from '@std/assert';

import { Router } from '../../../mod.ts';

const initialUrl = location.href;
const mode = location.href.search('router-hash.playground') !== -1 ? 'hash' : 'history';

await Playground.test('Router', async (t) => {
  let router: Router;

  await t.step('constructor()', async (t) => {
    await t.step('invalid routing mode', () => {
      // @ts-ignore invalid parameter
      assertThrows(() => new Router(), Error);
      // @ts-ignore invalid parameter
      assertThrows(() => new Router('invalid'), Error);
    });

    await t.step('hash-based routing mode and base path', () => {
      const hashRouter = new Router('hash', '/base');

      if (mode === 'hash') {
        router = hashRouter;
      }

      assert(router ?? mode === 'history');
    });

    await t.step('history-based routing mode and base path', () => {
      const historyRouter = new Router('history', '/base');

      if (mode === 'history') {
        router = historyRouter;
      }

      assert(router ?? mode === 'hash');
    });
  });

  await t.step('mode', () => {
    assertEquals(router.mode, mode);
  });

  await t.step('base', () => {
    assertEquals(router.base, '/base/');
  });

  await t.step('size', () => {
    assertEquals(router.size, 0);
  });

  await t.step('set()', () => {
    router.set(router.base + 'route1', () => {});
    router.set(router.base + 'route2', () => {});
    router.set(router.base + 'route3', () => {});

    assertEquals(router.size, 3);
  });

  await t.step('delete()', () => {
    router.delete(router.base + 'route3');

    assertEquals(router.size, 2);
  });

  await t.step('onchange()', () => {
    const func = () => {};

    router.onchange = func;

    assertStrictEquals(router.onchange, func);
  });

  await t.step('onerror()', () => {
    const func = () => {};

    router.onerror = func;

    assertStrictEquals(router.onerror, func);
  });

  await t.step('navigate()', async (t) => {
    const baseUrl = (router.mode === 'hash' ? `${initialUrl}#` : location.origin) + router.base;

    await t.step('navigate but URL is blank', async () => {
      router.navigate('');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl);
    });

    await t.step('to existing route', async () => {
      router.navigate('route1');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + 'route1');
    });

    await t.step('to another route', async () => {
      router.navigate('route2');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + 'route2');
    });
  });
});

await Playground.test('Client-side routing', async (t) => {
  const router = new Router(mode, '/parent/sub');

  const rootUrl = (router.mode === 'hash' ? `${initialUrl}#` : location.origin) + '/';
  const parentUrl = rootUrl + 'parent/';
  const baseUrl = parentUrl + 'sub/';

  let handlerParams: Record<string, string> = {};
  let eventType = '';
  let errorMessage = '';

  router.set(router.base + 'a/:name1/:name2', (params) => {
    handlerParams = params;
  });

  router.set(router.base + 'b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)', (params) => {
    handlerParams = params;
  });

  router.set(router.base + 'error', () => {
    throw new Error('error');
  });

  router.set('.*', (params) => {
    handlerParams = params;
  });

  router.onchange = (event) => {
    // hash: hashchange
    // history: pushstate | popstate
    eventType = event.type;
  };

  router.onerror = (exception) => {
    errorMessage = (exception as Error).message;
  };

  await t.step('parameters and events', async (t) => {
    await t.step('match route pattern', async () => {
      router.navigate('a/1/2');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + 'a/1/2');
      assertEquals(handlerParams, { name1: '1', name2: '2' });
      assertEquals(eventType, router.mode === 'hash' ? 'hashchange' : 'pushstate');
    });

    await t.step('match another route pattern', async () => {
      router.navigate('b/1/2');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + 'b/1/2');
      assertEquals(handlerParams, { name1: '1', name2: '2' });
      assertEquals(eventType, router.mode === 'hash' ? 'hashchange' : 'pushstate');
    });

    await t.step('match any route pattern', async () => {
      router.navigate('a');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + 'a');
      assertEquals(handlerParams, {});
      assertEquals(eventType, router.mode === 'hash' ? 'hashchange' : 'pushstate');
    });
  });

  await t.step('error handling', async () => {
    router.navigate('error');

    await Playground.sleep(50);

    assertEquals(location.href, baseUrl + 'error');
    assertEquals(handlerParams, {});
    assertEquals(eventType, router.mode === 'hash' ? 'hashchange' : 'pushstate');
    assertEquals(errorMessage, 'error');
  });

  await t.step('URL navigation', async (t) => {
    await t.step('to base', async () => {
      router.navigate('');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl);
    });

    await t.step('to current', async () => {
      router.navigate('./');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl);
    });

    await t.step('to parent', async () => {
      router.navigate('../');

      await Playground.sleep(50);

      assertEquals(location.href, parentUrl);
    });

    await t.step('to root', async () => {
      router.navigate('/');

      await Playground.sleep(50);

      assertEquals(location.href, rootUrl);
    });

    await t.step('hash', async () => {
      // hash: #/base/hash
      // history: /base/#hash
      router.navigate('#hash');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + (router.mode === 'hash' ? 'hash' : '#hash'));
    });

    await t.step('query', async () => {
      if (router.mode === 'hash') {
        // Because hash mode refreshes page.
        return;
      }

      // hash: ?query with refreshing page
      // history: /base/?query without refreshing page
      router.navigate('?query=true');

      await Playground.sleep(50);

      assertEquals(location.href, baseUrl + '?query=true');
    });

    await t.step('to origin', async () => {
      if (router.mode === 'hash') {
        // Because hash mode refreshes page.
        return;
      }

      // hash: location.origin with refreshing page
      // history: location.origin without refreshing page
      router.navigate(location.origin);

      await Playground.sleep(50);

      assertEquals(location.href, rootUrl);
    });

    /*
    await t.step('to external', () => {
      // Always refreshing page.
      router.navigate('https://example.com/');
    });
    */
  });
});
