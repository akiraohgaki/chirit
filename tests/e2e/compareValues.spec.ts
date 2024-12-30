import { expect, test } from '@playwright/test';

test.describe('compareValues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compareValues.playground');
  });

  test('compare two values', async ({ page, baseURL }) => {
    const code = `
      import { compareValues } from '${baseURL}/mod.bundle.js';

      playground.logs.add(compareValues(0, 0));
      playground.logs.add(compareValues(0, 1));
      playground.logs.add(compareValues(0, ''));
      playground.logs.add(compareValues(0, null));
      playground.logs.add(compareValues(0, undefined));

      playground.logs.add(compareValues([], []));
      playground.logs.add(compareValues([], null));

      playground.logs.add(compareValues([0], [0]));
      playground.logs.add(compareValues([0], [1]));
      playground.logs.add(compareValues([0], [0, 1]));

      playground.logs.add(compareValues({}, {}));
      playground.logs.add(compareValues({}, null));

      playground.logs.add(compareValues({ a: 0 }, { a: 0 }));
      playground.logs.add(compareValues({ a: 0 }, { a: 1 }));
      playground.logs.add(compareValues({ a: 0 }, { b: 1 }));
      playground.logs.add(compareValues({ a: 0 }, { a: 0, b: 1 }));

      const set = new Set([0]);
      playground.logs.add(compareValues(set, set));
      playground.logs.add(compareValues(set, new Set([0])));

      const arr = [0];
      playground.logs.add(compareValues([arr, arr], [arr, arr]));
      playground.logs.add(compareValues([arr, arr], [[0], arr]));
      playground.logs.add(compareValues([arr, arr], [[0], [0]]));

      const obj = { a: 0 };
      playground.logs.add(compareValues({ a: obj, b: obj }, { a: obj, b: obj }));
      playground.logs.add(compareValues({ a: obj, b: obj }, { a: { a: 0 }, b: obj }));
      playground.logs.add(compareValues({ a: obj, b: obj }, { a: { a: 0 }, b: { a: 0 } }));
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
      'false',
      'true',
      'true',
      'false',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
