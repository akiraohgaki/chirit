import { assertEquals } from '@std/assert';

import { sleep, Task } from '../../../util.ts';

Deno.test('Task', async (t) => {
  await t.step('task execution', async () => {
    const logs: Array<unknown> = [];

    const task1 = () => {
      logs.push('task1');
    };
    const task2 = () => {
      logs.push('task2');
    };
    const task3 = () => {
      logs.push('task3');
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

    await sleep(100);

    task.add(task1);
    task.add(task2);
    task.add(task3);

    await sleep(200);

    task.pause();

    task.add(task1);
    task.add(task2);
    task.add(task3);

    task.clear();

    task.start();

    await sleep(100);

    task.pause();

    assertEquals(logs, [
      'task1',
      'task1',
      'task2',
      'task3',
    ]);
  });

  await t.step('looping task execution', async () => {
    const logs: Array<unknown> = [];

    const task1 = async () => {
      await sleep(100);
      logs.push('task1');
    };
    const task2 = async () => {
      await sleep(100);
      logs.push('task2');
    };
    const task3 = async () => {
      await sleep(100);
      logs.push('task3');
    };

    const task = new Task({
      maxParallelism: 3,
      tickDelay: 0,
    });

    task.addLoop(task1, 50);
    task.addLoop(task2, 50);
    task.addLoop(task3, 50);

    task.start();

    logs.push(task.isRunning());

    await sleep(50);

    logs.push(task.isRunning());

    await sleep(150);

    task.pause();

    await sleep(200); // wait for timer stopped

    assertEquals(logs, [
      false,
      true,
      'task1',
      'task2',
      'task3',
      'task1',
      'task2',
      'task3',
    ]);
  });

  await t.step('error handling (see error log in test output)', async () => {
    const logs: Array<unknown> = [];

    const task1 = () => {
      logs.push('task1');
      throw new Error('task1');
    };

    const task = new Task({
      maxParallelism: 1,
      tickDelay: 50,
    });

    task.add(task1);

    task.start();

    await sleep(100);

    task.pause();

    assertEquals(logs, [
      'task1',
    ]);
  });
});
