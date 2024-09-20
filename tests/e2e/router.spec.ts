import { expect, test } from '@playwright/test';

test.describe('Router', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router.playground');
  });

  test('invalid routing mode', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      try {
        const router = new Router();
      } catch (exception) {
        if (exception instanceof Error) {
          playground.logs.add('Error: ' + exception.message);
        }
      }

      try {
        const router = new Router('invalid');
      } catch (exception) {
        if (exception instanceof Error) {
          playground.logs.add('Error: ' + exception.message);
        }
      }
    `;

    const logs = [
      /Error: .+/,
      /Error: .+/,
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('history-based routing mode: routing', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('history', '/router.playground/history');

      playground.logs.add(router.mode);
      playground.logs.add(router.base);

      router.set('/router.playground/history/a/:name1/:name2', (params) => {
        playground.logs.add(location.href);
        playground.logs.add(params);
      });
      router.set('/router.playground/history/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)', (params) => {
        playground.logs.add(location.href);
        playground.logs.add(params);
      });
      router.set('.*', () => {
        playground.logs.add(location.href);
      });

      router.navigate('a/1/2');
      router.navigate('b/1/2');
      router.navigate('./');
      router.navigate('../');
      router.navigate('/');
      router.navigate('#hash');
      router.navigate('?query=true');
      router.navigate(location.origin);

      router.delete('/router.playground/history/a/:name1/:name2');
      router.delete('/router.playground/history/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)');
      router.delete('.*');

      router.navigate('noroute');

      playground.logs.add(location.href);
    `;

    const logs = [
      'history',
      '/router.playground/history/',
      baseURL + '/router.playground/history/a/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router.playground/history/b/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router.playground/history/',
      baseURL + '/router.playground/',
      baseURL + '/',
      baseURL + '/router.playground/history/#hash',
      baseURL + '/router.playground/history/?query=true',
      baseURL + '/',
      baseURL + '/router.playground/history/noroute',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('history-based routing mode: reload to different origin', async ({ page, baseURL }) => {
    const url = 'https://example.com/';

    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('history');

      router.navigate('${url}');
    `;

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
    await expect(page).toHaveURL(url);
  });

  test('history-based routing mode: events', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('history');

      router.onchange = (event) => {
        playground.logs.add(event.type);
      };
      router.onerror = (error) => {
        playground.logs.add(error.message);
      };

      router.set('/error', () => {
        playground.logs.add(location.href);
        throw new Error('error');
      });
      router.set('.*', () => {
        playground.logs.add(location.href);
      });

      router.navigate('/change');
      router.navigate('/error');
    `;

    const logs = [
      'pushstate',
      baseURL + '/change',
      'pushstate',
      baseURL + '/error',
      'error',
    ];

    const logsAfterPopstate = [
      'popstate',
      baseURL + '/change',
      'popstate',
      baseURL + '/error',
      'error',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.goBack();
    await page.goForward();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      ...logsAfterPopstate,
    ]);
  });

  test('hash-based routing mode: routing', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('hash', '/router.playground/hash');

      playground.logs.add(router.mode);
      playground.logs.add(router.base);

      router.set('/router.playground/hash/a/:name1/:name2', (params) => {
        playground.logs.add(location.href);
        playground.logs.add(params);
      });
      router.set('/router.playground/hash/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)', (params) => {
        playground.logs.add(location.href);
        playground.logs.add(params);
      });
      router.set('.*', () => {
        playground.logs.add(location.href);
      });

      router.navigate('a/1/2');
      await playground.wait(40);
      router.navigate('b/1/2');
      await playground.wait(40);
      router.navigate('./');
      await playground.wait(40);
      router.navigate('../');
      await playground.wait(40);
      router.navigate('/');
      await playground.wait(40);
      router.navigate('#hash');
      await playground.wait(40);

      router.delete('/router.playground/hash/a/:name1/:name2');
      router.delete('/router.playground/hash/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)');
      router.delete('.*');

      router.navigate('noroute');
      await playground.wait(40);

      playground.logs.add(location.href);
    `;

    const logs = [
      'hash',
      '/router.playground/hash/',
      baseURL + '/router.playground#/router.playground/hash/a/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router.playground#/router.playground/hash/b/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router.playground#/router.playground/hash/',
      baseURL + '/router.playground#/router.playground/',
      baseURL + '/router.playground#/',
      baseURL + '/router.playground#/router.playground/hash/hash',
      baseURL + '/router.playground#/router.playground/hash/noroute',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('hash-based routing mode: reload to query string', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('hash');

      playground.logs.add(location.href);

      router.navigate('?query=true');
    `;

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
    await expect(page).toHaveURL(baseURL + '/router.playground?query=true');
  });

  test('hash-based routing mode: reload to same origin', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('hash');

      playground.logs.add(location.href);

      router.navigate(location.origin);
    `;

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
    await expect(page).toHaveURL(baseURL + '/');
  });

  test('hash-based routing mode: reload to different origin', async ({ page, baseURL }) => {
    const url = 'https://example.com/';

    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('hash');

      router.navigate('${url}');
    `;

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
    await expect(page).toHaveURL(url);
  });

  test('hash-based routing mode: events', async ({ page, baseURL }) => {
    const code = `
      import { Router } from '${baseURL}/mod.bundle.js';

      const router = new Router('hash');

      router.onchange = (event) => {
        playground.logs.add(event.type);
      };
      router.onerror = (error) => {
        playground.logs.add(error.message);
      };

      router.set('/error', () => {
        playground.logs.add(location.href);
        throw new Error('error');
      });
      router.set('.*', () => {
        playground.logs.add(location.href);
      });

      router.navigate('/change');
      await playground.wait(40);
      router.navigate('/error');
      await playground.wait(40);
    `;

    const logs = [
      'hashchange',
      baseURL + '/router.playground#/change',
      'hashchange',
      baseURL + '/router.playground#/error',
      'error',
    ];

    const logsAfterHashchange = [
      'hashchange',
      baseURL + '/router.playground#/change',
      'hashchange',
      baseURL + '/router.playground#/error',
      'error',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.goBack();
    await page.goForward();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      ...logsAfterHashchange,
    ]);
  });
});
