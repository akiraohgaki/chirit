import { expect, test } from '@playwright/test';

test.describe('State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/state.playground');
  });

  test('state management', async ({ page, baseURL }) => {
    const code = `
      import { State } from '${baseURL}/mod.bundle.js';

      const state = new State(0);

      playground.logs.add(state.get());

      state.set(1);

      playground.logs.add(state.get());

      state.reset();

      playground.logs.add(state.get());
    `;

    const logs = [
      '0',
      '1',
      '0',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('state change notification', async ({ page, baseURL }) => {
    const code = `
      import { State } from '${baseURL}/mod.bundle.js';

      const observer = (state) => {
        playground.logs.add(state);
      };

      const state = new State(0);

      state.subscribe(observer);

      state.notify();

      state.set(1);

      state.reset();

      state.unsubscribe(observer);

      state.notify();
    `;

    const logs = [
      '0',
      '1',
      '0',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
