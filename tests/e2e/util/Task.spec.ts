import { expect, test } from '@playwright/test';

test.describe('Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/util/Task.playground');
  });

  test('task execution', async ({ page, baseURL }) => {
    const code = `
      import { Task } from '${baseURL}/util.bundle.js';

      const task1 = () => {
        playground.logs.add('task1');
      };
      const task2 = () => {
        playground.logs.add('task2');
      };
      const task3 = () => {
        playground.logs.add('task3');
      };

      const task = new Task({
        maxParallelism: 1,
        tickDelay: 50,
      });

      task.add(task1);
      task.add(task1);
      task.add(task2);
      task.add(task3);

      task.delete(task2);
      task.delete(task3);

      task.start();

      await playground.sleep(100);

      task.add(task1);
      task.add(task2);
      task.add(task3);

      await playground.sleep(200);

      task.pause();

      task.add(task1);
      task.add(task2);
      task.add(task3);

      task.clear();

      task.start();

      await playground.sleep(100);

      task.pause();
    `;

    const logs = [
      'task1',
      'task1',
      'task2',
      'task3',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('looping task execution', async ({ page, baseURL }) => {
    const code = `
      import { Task } from '${baseURL}/util.bundle.js';

      const task1 = async () => {
        await playground.sleep(100);
        playground.logs.add('task1');
      };
      const task2 = async () => {
        await playground.sleep(100);
        playground.logs.add('task2');
      };
      const task3 = async () => {
        await playground.sleep(100);
        playground.logs.add('task3');
      };

      const task = new Task({
        maxParallelism: 3,
        tickDelay: 0,
      });

      task.addLoop(task1, 50);
      task.addLoop(task2, 50);
      task.addLoop(task3, 50);

      task.start();

      playground.logs.add(task.isRunning());

      await playground.sleep(50);

      playground.logs.add(task.isRunning());

      await playground.sleep(150);

      task.pause();

      await playground.sleep(200); // wait for timer stopped
    `;

    const logs = [
      'task1',
      'task1',
      'task2',
      'task3',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('error handling (see error log in test output)', async ({ page, baseURL }) => {
    const code = `
      import { Task } from '${baseURL}/util.bundle.js';

      const task1 = () => {
        playground.logs.add('task1');
        throw new Error('task1');
      };

      const task = new Task({
        maxParallelism: 1,
        tickDelay: 50,
      });

      task.add(task1);

      task.start();

      await playground.sleep(100);

      task.pause();
    `;

    const logs = [
      'task1',
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
