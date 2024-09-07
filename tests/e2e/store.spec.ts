import { expect, test } from "@playwright/test";

test.describe("Store", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/store");
  });

  test("state management", async ({ page }) => {
    const code = `
      const { Store } = this.chirit;

      const initialState = { updated: false, key: null };

      const store = new Store(initialState);

      this.addLog(store.state);
      this.addLog(store.state === initialState);

      const previousState = store.state;

      store.update({ updated: true });
      this.addLog(store.state);
      this.addLog(store.state === previousState);

      store.reset();
      this.addLog(store.state);
      this.addLog(store.state === initialState);
    `;

    const logs = [
      '{"updated":false,"key":null}',
      "false",
      '{"updated":true,"key":null}',
      "false",
      '{"updated":false,"key":null}',
      "false",
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("state change notification", async ({ page }) => {
    const code = `
      const { Store } = this.chirit;

      const initialState = { updated: false };
      const observer = (state) => {
        this.addLog(state);
      };

      const store = new Store(initialState);

      store.subscribe(observer);
      store.notify();

      store.update({ updated: true });

      store.reset();

      store.unsubscribe(observer);
      store.notify();
    `;

    const logs = [
      '{"updated":false}',
      '{"updated":true}',
      '{"updated":false}',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
