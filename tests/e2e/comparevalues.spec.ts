import { expect, test } from '@playwright/test';

test.describe('compareValues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comparevalues.playground');
  });

  test('compare two values', async ({ page, baseURL }) => {
    const code = `
      import { compareValues } from '${baseURL}/mod.bundle.js';

      playground.logs.add(compareValues(0, 0));

      playground.logs.add(compareValues(0, 1));

      playground.logs.add(compareValues(0, ''));

      playground.logs.add(compareValues([], []));

      playground.logs.add(compareValues([], null));

      playground.logs.add(compareValues([], undefined));

      playground.logs.add(compareValues([0], [0]));

      playground.logs.add(compareValues([0], [1]));

      playground.logs.add(compareValues([0], [0, 1]));

      playground.logs.add(compareValues({}, {}));

      playground.logs.add(compareValues({}, null));

      playground.logs.add(compareValues({}, undefined));

      playground.logs.add(compareValues({ a: 0 }, { a: 0 }));

      playground.logs.add(compareValues({ a: 0 }, { a: 1 }));

      playground.logs.add(compareValues({ a: 0 }, { a: 0, b: 1 }));

      const array = [0];

      playground.logs.add(compareValues([array, array], [array, array]));

      playground.logs.add(compareValues([array, array], [[0], [0]]));

      const collection = new Set([0]);

      playground.logs.add(compareValues([collection], [collection]));

      playground.logs.add(compareValues([collection], [new Set([0])]));
    `;

    const logs = [
      'true',
      'false',
      'false',
      'true',
      'false',
      'false',
      'true',
      'false',
      'false',
      'true',
      'false',
      'false',
      'true',
      'false',
      'false',
      'true',
      'false',
      'true',
      'false',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
