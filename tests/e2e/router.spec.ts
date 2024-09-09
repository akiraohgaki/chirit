import { expect, test } from '@playwright/test';

test.describe('Router', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/router');
  });

  test('invalid routing mode', async ({ page }) => {
    const code = `
      const { Router } = this.chirit;

      try {
        const router = new Router();
      } catch (exception) {
        if (exception instanceof Error) {
          this.addLog('Error: ' + exception.message);
        }
      }

      try {
        const router = new Router('invalid');
      } catch (exception) {
        if (exception instanceof Error) {
          this.addLog('Error: ' + exception.message);
        }
      }
    `;

    const logs = [
      /Error: .+/,
      /Error: .+/,
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('history-based routing mode: routing', async ({ page, baseURL }) => {
    const code = `
      const { Router } = this.chirit;

      const router = new Router('history', '/router/history');

      this.addLog(router.mode);
      this.addLog(router.base);

      router.set('/router/history/a/:name1/:name2', (params) => {
        this.addLog(location.href);
        this.addLog(params);
      });
      router.set('/router/history/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)', (params) => {
        this.addLog(location.href);
        this.addLog(params);
      });
      router.set('.*', () => {
        this.addLog(location.href);
      });

      router.navigate('a/1/2');
      router.navigate('b/1/2');
      router.navigate('./');
      router.navigate('../');
      router.navigate('/');
      router.navigate('#hash');
      router.navigate('?query=true');
      router.navigate(location.origin);

      router.delete('/router/history/a/:name1/:name2');
      router.delete('/router/history/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)');
      router.delete('.*');

      router.navigate('noroute');
      this.addLog(location.href);
    `;

    const logs = [
      'history',
      '/router/history/',
      baseURL + '/router/history/a/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router/history/b/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router/history/',
      baseURL + '/router/',
      baseURL + '/',
      baseURL + '/router/history/#hash',
      baseURL + '/router/history/?query=true',
      baseURL + '/',
      baseURL + '/router/history/noroute',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('history-based routing mode: reload to different origin', async ({ page }) => {
    const url = 'https://example.com/';

    const code = `
      const { Router } = this.chirit;

      const router = new Router('history');

      router.navigate('${url}');
    `;

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page).toHaveURL(url);
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
  });

  test('history-based routing mode: events', async ({ page, baseURL }) => {
    const code = `
      const { Router } = this.chirit;

      const router = new Router('history');

      router.onchange = (event) => {
        this.addLog(event.type);
      };
      router.onerror = (error) => {
        this.addLog(error.message);
      };

      router.set('/error', () => {
        this.addLog(location.href);
        throw new Error('error');
      });
      router.set('.*', () => {
        this.addLog(location.href);
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

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.goBack();
    await page.goForward();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      'popstate',
      baseURL + '/change',
      'popstate',
      baseURL + '/error',
      'error',
    ]);
  });

  test('hash-based routing mode: routing', async ({ page, baseURL }) => {
    const code = `
      const { Router } = this.chirit;

      const router = new Router('hash', '/router/hash');

      this.addLog(router.mode);
      this.addLog(router.base);

      router.set('/router/hash/a/:name1/:name2', (params) => {
        this.addLog(location.href);
        this.addLog(params);
      });
      router.set('/router/hash/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)', (params) => {
        this.addLog(location.href);
        this.addLog(params);
      });
      router.set('.*', () => {
        this.addLog(location.href);
      });

      router.navigate('a/1/2');
      await this.wait(40);
      router.navigate('b/1/2');
      await this.wait(40);
      router.navigate('./');
      await this.wait(40);
      router.navigate('../');
      await this.wait(40);
      router.navigate('/');
      await this.wait(40);
      router.navigate('#hash');
      await this.wait(40);

      router.delete('/router/hash/a/:name1/:name2');
      router.delete('/router/hash/b/(?<name1>[^/?#]+)/(?<name2>[^/?#]+)');
      router.delete('.*');

      router.navigate('noroute');
      await this.wait(40);
      this.addLog(location.href);
    `;

    const logs = [
      'hash',
      '/router/hash/',
      baseURL + '/router#/router/hash/a/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router#/router/hash/b/1/2',
      '{"name1":"1","name2":"2"}',
      baseURL + '/router#/router/hash/',
      baseURL + '/router#/router/',
      baseURL + '/router#/',
      baseURL + '/router#/router/hash/hash',
      baseURL + '/router#/router/hash/noroute',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('hash-based routing mode: reload to query string', async ({ page, baseURL }) => {
    const code = `
      const { Router } = this.chirit;

      const router = new Router('hash');

      this.addLog(location.href);

      router.navigate('?query=true');
    `;

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page).toHaveURL(baseURL + '/router?query=true');
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
  });

  test('hash-based routing mode: reload to same origin', async ({ page, baseURL }) => {
    const code = `
      const { Router } = this.chirit;

      const router = new Router('hash');

      this.addLog(location.href);

      router.navigate(location.origin);
    `;

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page).toHaveURL(baseURL + '/');
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
  });

  test('hash-based routing mode: reload to different origin', async ({ page }) => {
    const url = 'https://example.com/';

    const code = `
      const { Router } = this.chirit;

      const router = new Router('hash');

      router.navigate('${url}');
    `;

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page).toHaveURL(url);
    await expect(page.locator('[data-content="log"]')).toHaveText([]);
  });

  test('hash-based routing mode: events', async ({ page, baseURL }) => {
    const code = `
      const { Router } = this.chirit;

      const router = new Router('hash');

      router.onchange = (event) => {
        this.addLog(event.type);
      };
      router.onerror = (error) => {
        this.addLog(error.message);
      };

      router.set('/error', () => {
        this.addLog(location.href);
        throw new Error('error');
      });
      router.set('.*', () => {
        this.addLog(location.href);
      });

      router.navigate('/change');
      await this.wait(40);
      router.navigate('/error');
      await this.wait(40);
    `;

    const logs = [
      'hashchange',
      baseURL + '/router#/change',
      'hashchange',
      baseURL + '/router#/error',
      'error',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.goBack();
    await page.goForward();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      'hashchange',
      baseURL + '/router#/change',
      'hashchange',
      baseURL + '/router#/error',
      'error',
    ]);
  });
});
