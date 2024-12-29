import { expect, test } from '@playwright/test';

test.describe('Store', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store.playground');
  });

  test('state management with object', async ({ page, baseURL }) => {
    const code = `
      import { Store } from '${baseURL}/mod.bundle.js';

      const initialState = { updated: false, key: null };

      const store = new Store(initialState);

      playground.logs.add(store.state);
      playground.logs.add(store.state === initialState);

      const previousState = store.state;

      store.update({ updated: true });

      playground.logs.add(store.state);
      playground.logs.add(store.state === previousState);

      store.reset();

      playground.logs.add(store.state);
      playground.logs.add(store.state === initialState);
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
      import { Store } from '${baseURL}/mod.bundle.js';

      const initialState = { updated: false, key: null };

      const observer = (state) => {
        playground.logs.add(state);
      };

      const store = new Store(initialState);

      store.subscribe(observer);

      store.notify();

      store.update({ updated: false });

      store.update({ updated: true });

      store.reset();

      store.unsubscribe(observer);

      store.notify();
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
