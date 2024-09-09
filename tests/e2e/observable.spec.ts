import { expect, test } from '@playwright/test';

test.describe('Observable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observable');
  });

  test('notification', async ({ page }) => {
    const code = `
      const { Observable } = this.chirit;

      const observer1 = (state) => {
        this.addLog(state);
      };
      const observer2 = (state) => {
        this.addLog(state);
      };

      const observable = new Observable();

      observable.subscribe(observer1);
      observable.subscribe(observer2);
      observable.notify(true);

      observable.unsubscribe(observer1);
      observable.unsubscribe(observer2);
      observable.notify(true);
    `;

    const logs = [
      'true',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
