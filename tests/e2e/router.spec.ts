import { expect, test } from '@playwright/test';

const origin = 'http://127.0.0.1:3000';

const hashModeLogs = [
  'mode: hash',
  'base: /router/hash/',
  'set onchange',
  'set onerror',
  'set: 3 routes',
  'navigate: test/a/0',
  `${origin}/router/hash#/router/hash/test/a/0`,
  'onchange: hashchange',
  'params: ' + JSON.stringify({ name1: 'a', name2: '0' }),
  'navigate: test/b',
  `${origin}/router/hash#/router/hash/test/b`,
  'onchange: hashchange',
  'params: ' + JSON.stringify({ name1: 'b' }),
  'navigate: error',
  `${origin}/router/hash#/router/hash/error`,
  'onchange: hashchange',
  'params: ' + JSON.stringify({}),
  'onerror: error',
  'navigate: patternnotmatch',
  `${origin}/router/hash#/router/hash/patternnotmatch`,
  'onchange: hashchange',
  'navigate: test/a/0',
  `${origin}/router/hash#/router/hash/test/a/0`,
  'onchange: hashchange',
  'params: ' + JSON.stringify({ name1: 'a', name2: '0' }),
  'navigate: ./',
  `${origin}/router/hash#/router/hash/`,
  'onchange: hashchange',
  'navigate: ../',
  `${origin}/router/hash#/router/`,
  'onchange: hashchange',
  'navigate: /',
  `${origin}/router/hash#/`,
  'onchange: hashchange',
  'navigate: #test/c/0',
  `${origin}/router/hash#/router/hash/test/c/0`,
  'onchange: hashchange',
  'params: ' + JSON.stringify({ name1: 'c', name2: '0' }),
  'onchange: hashchange',
  'delete: 3 routes',
  'navigate: test/a/0',
  `${origin}/router/hash#/router/hash/test/a/0`,
];

const historyModeLogs = [
  'mode: history',
  'base: /router/history/',
  'set onchange',
  'set onerror',
  'set: 3 routes',
  'navigate: test/a/0',
  'onchange: pushstate',
  'params: ' + JSON.stringify({ name1: 'a', name2: '0' }),
  `${origin}/router/history/test/a/0`,
  'navigate: test/b',
  'onchange: pushstate',
  'params: ' + JSON.stringify({ name1: 'b' }),
  `${origin}/router/history/test/b`,
  'navigate: error',
  'onchange: pushstate',
  'params: ' + JSON.stringify({}),
  'onerror: error',
  `${origin}/router/history/error`,
  'navigate: patternnotmatch',
  'onchange: pushstate',
  `${origin}/router/history/patternnotmatch`,
  'navigate: test/a/0',
  'onchange: pushstate',
  'params: ' + JSON.stringify({ name1: 'a', name2: '0' }),
  `${origin}/router/history/test/a/0`,
  'navigate: ./',
  'onchange: pushstate',
  `${origin}/router/history/`,
  'navigate: ../',
  'onchange: pushstate',
  `${origin}/router/`,
  'navigate: /',
  'onchange: pushstate',
  `${origin}/`,
  'navigate: #test/c/0',
  'onchange: pushstate',
  `${origin}/router/history/#test/c/0`,
  'onchange: popstate',
  'delete: 3 routes',
  'navigate: test/a/0',
  'onchange: pushstate',
  `${origin}/router/history/test/a/0`,
];

test.describe('/router/hash', () => {
  test('Hash mode should work', async ({ page }) => {
    await page.goto('/router/hash');
    await page.locator('#content > button').getByText('set: 3 routes').click();
    await page.locator('#content > button').getByText('navigate: test/a/0').click();
    await page.locator('#content > button').getByText('navigate: test/b').click();
    await page.locator('#content > button').getByText('navigate: error').click();
    await page.locator('#content > button').getByText('navigate: patternnotmatch').click();
    await page.locator('#content > button').getByText('navigate: test/a/0').click();
    await page.locator('#content > button').getByText('navigate: ./').click();
    await page.locator('#content > button').getByText('navigate: ../').click();
    await page.locator('#content > button').getByText('navigate: /').click();
    await page.locator('#content > button').getByText('navigate: #test/c/0').click();
    await page.goBack();
    await page.locator('#content > button').getByText('delete: 3 routes').click();
    await page.locator('#content > button').getByText('navigate: test/a/0').click();
    await expect(page.locator('#log > p')).toHaveText(hashModeLogs);

    await page.goto('/router/hash');
    await page.locator('#content > button').getByText('navigate: ?k=v').click();
    await expect(page).toHaveURL(`${origin}/router/hash?k=v`);
    await expect(page.locator('#log > p').last()).toHaveText('set onerror');

    await page.goto('/router/hash');
    await page.locator('#content > button').getByText('navigate: location.origin').click();
    await expect(page).toHaveURL(`${origin}/`);
    await expect(page.locator('#log > p')).toHaveCount(0);

    await page.goto('/router/hash');
    await page.locator('#content > button').getByText('navigate: https://example.com/').click();
    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('/router/history', () => {
  test('History mode should work', async ({ page }) => {
    await page.goto('/router/history');
    await page.locator('#content > button').getByText('set: 3 routes').click();
    await page.locator('#content > button').getByText('navigate: test/a/0').click();
    await page.locator('#content > button').getByText('navigate: test/b').click();
    await page.locator('#content > button').getByText('navigate: error').click();
    await page.locator('#content > button').getByText('navigate: patternnotmatch').click();
    await page.locator('#content > button').getByText('navigate: test/a/0').click();
    await page.locator('#content > button').getByText('navigate: ./').click();
    await page.locator('#content > button').getByText('navigate: ../').click();
    await page.locator('#content > button').getByText('navigate: /').click();
    await page.locator('#content > button').getByText('navigate: #test/c/0').click();
    await page.goBack();
    await page.locator('#content > button').getByText('delete: 3 routes').click();
    await page.locator('#content > button').getByText('navigate: test/a/0').click();
    await expect(page.locator('#log > p')).toHaveText(historyModeLogs);

    await page.goto('/router/history');
    await page.locator('#content > button').getByText('navigate: ?k=v').click();
    await expect(page).toHaveURL(`${origin}/router/history/?k=v`);
    await expect(page.locator('#log > p').last()).toHaveText(`${origin}/router/history/?k=v`);

    await page.goto('/router/history');
    await page.locator('#content > button').getByText('navigate: location.origin').click();
    await expect(page).toHaveURL(`${origin}/`);
    await expect(page.locator('#log > p').last()).toHaveText(`${origin}/`);

    await page.goto('/router/history');
    await page.locator('#content > button').getByText('navigate: https://example.com/').click();
    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('/router/invalidmode', () => {
  test('Should throw exception if invalid mode', async ({ page }) => {
    await page.goto('/router/invalidmode');
    await expect(page.locator('#log > p')).toHaveText(/exception: .+/);
  });
});
