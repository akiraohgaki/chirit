import { expect, test } from "@playwright/test";

test.describe("Observable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/observable.playground");
  });

  test("notification", async ({ page, baseURL }) => {
    const code = `
      import { Observable } from '${baseURL}/mod.bundle.js';

      const observer1 = (state) => {
        playground.logs.add(state);
      };
      const observer2 = (state) => {
        playground.logs.add(state);
      };

      const observable = new Observable();

      observable.notify(0);

      observable.subscribe(observer1);
      observable.subscribe(observer2);

      observable.notify(1);

      observable.unsubscribe(observer1);
      observable.unsubscribe(observer2);

      observable.notify(2);
    `;

    const logs = [
      "1",
      "1",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
