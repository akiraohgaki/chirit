import { expect, test } from "@playwright/test";

test.describe("State", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/state");
  });

  test("state management", async ({ page }) => {
    const code = `
      const { State } = this.chirit;

      const state = new State(0);

      this.addLog(state.get());

      state.set(1);
      this.addLog(state.get());

      state.reset();
      this.addLog(state.get());
    `;

    const logs = [
      "0",
      "1",
      "0",
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("state change notification", async ({ page }) => {
    const code = `
      const { State } = this.chirit;

      const observer = (state) => {
        this.addLog(state);
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
      "0",
      "1",
      "0",
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
