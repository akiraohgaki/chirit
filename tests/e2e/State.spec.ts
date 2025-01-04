import { expect, test } from '@playwright/test';

test.describe('State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/State.playground');
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

  test('state management with object', async ({ page, baseURL }) => {
    const code = `
      import { State } from '${baseURL}/mod.bundle.js';

      const initialState = { updated: false, key: null };

      const state = new State(initialState);

      playground.logs.add(state.get());
      playground.logs.add(state.get() === initialState);

      const previousState = state.get();

      state.set({ updated: true, key: null });

      playground.logs.add(state.get());
      playground.logs.add(state.get() === previousState);

      state.reset();

      playground.logs.add(state.get());
      playground.logs.add(state.get() === initialState);
    `;

    const logs = [
      '{"updated":false,"key":null}',
      'false',
      '{"updated":true,"key":null}',
      'false',
      '{"updated":false,"key":null}',
      'false',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('state change notification', async ({ page, baseURL }) => {
    const code = `
      import { State } from '${baseURL}/mod.bundle.js';

      const initialState = { updated: false, key: null };

      const observer = (state) => {
        playground.logs.add(state);
      };

      const state = new State(initialState);

      state.subscribe(observer);

      state.notify();

      state.set({ updated: false, key: null });

      state.set({ updated: true, key: null });

      state.reset();

      state.unsubscribe(observer);

      state.notify();
    `;

    const logs = [
      '{"updated":false,"key":null}',
      '{"updated":true,"key":null}',
      '{"updated":false,"key":null}',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
