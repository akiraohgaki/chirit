import { expect, test } from '@playwright/test';

test.describe('isEqual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/util/isEqual.playground');
  });

  test('compare two values', async ({ page, baseURL }) => {
    const code = `
      import { isEqual } from '${baseURL}/util.bundle.js';

      playground.logs.add(isEqual(0, 0));
      playground.logs.add(isEqual(0, 1));
      playground.logs.add(isEqual(0, ''));
      playground.logs.add(isEqual(0, null));
      playground.logs.add(isEqual(0, undefined));

      playground.logs.add(isEqual([], []));
      playground.logs.add(isEqual([], null));

      playground.logs.add(isEqual([0], [0]));
      playground.logs.add(isEqual([0], [1]));
      playground.logs.add(isEqual([0], [0, 1]));

      playground.logs.add(isEqual({}, {}));
      playground.logs.add(isEqual({}, null));

      playground.logs.add(isEqual({ a: 0 }, { a: 0 }));
      playground.logs.add(isEqual({ a: 0 }, { a: 1 }));
      playground.logs.add(isEqual({ a: 0 }, { b: 1 }));
      playground.logs.add(isEqual({ a: 0 }, { a: 0, b: 1 }));

      const set = new Set([0]);
      playground.logs.add(isEqual(set, set));
      playground.logs.add(isEqual(set, new Set([0])));

      const arr = [0];
      playground.logs.add(isEqual([arr, arr], [arr, arr]));
      playground.logs.add(isEqual([arr, arr], [[0], arr]));
      playground.logs.add(isEqual([[0], arr], [arr, arr]));
      playground.logs.add(isEqual([arr, arr], [[0], [0]]));
      playground.logs.add(isEqual([[0], [0]], [arr, arr]));

      const obj = { a: 0 };
      playground.logs.add(isEqual({ a: obj, b: obj }, { a: obj, b: obj }));
      playground.logs.add(isEqual({ a: obj, b: obj }, { a: { a: 0 }, b: obj }));
      playground.logs.add(isEqual({ a: { a: 0 }, b: obj }, { a: obj, b: obj }));
      playground.logs.add(isEqual({ a: obj, b: obj }, { a: { a: 0 }, b: { a: 0 } }));
      playground.logs.add(isEqual({ a: { a: 0 }, b: { a: 0 } }, { a: obj, b: obj }));
    `;

    const logs = [
      'true',
      'false',
      'false',
      'false',
      'false',
      'true',
      'false',
      'true',
      'false',
      'false',
      'true',
      'false',
      'true',
      'false',
      'false',
      'false',
      'true',
      'false',
      'true',
      'true',
      'true',
      'false',
      'false',
      'true',
      'true',
      'true',
      'false',
      'false',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
