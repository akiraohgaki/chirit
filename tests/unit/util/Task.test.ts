import { assert, assertEquals } from '@std/assert';

import { sleep, Task } from '../../../util.ts';

Deno.test('Task', async (t) => {
  let task: Task;

  const sleepTask1 = () => sleep(100);
  const sleepTask2 = () => sleep(100);
  const sleepTask3 = () => sleep(100);

  await t.step('constructor()', () => {
    task = new Task({
      maxParallelism: 1,
      tickDelay: 0,
    });

    assert(task);
  });

  await t.step('size', () => {
    assertEquals(task.size, 0);
  });

  await t.step('isRunning()', () => {
    assert(!task.isRunning());
  });

  await t.step('add()', () => {
    task.add(sleepTask1);
    task.add(sleepTask2);

    assertEquals(task.size, 2);
  });

  await t.step('addLoop()', () => {
    task.addLoop(sleepTask3, 0);

    assertEquals(task.size, 3);
  });

  await t.step('delete()', () => {
    task.delete(sleepTask3);

    assertEquals(task.size, 2);
  });

  await t.step('start()', async () => {
    task.start();

    await sleep(50);

    assertEquals(task.size, 1);
    assert(task.isRunning());
  });

  await t.step('pause()', async () => {
    task.pause();

    await sleep(100);

    assertEquals(task.size, 1);
    assert(!task.isRunning());
  });

  await t.step('clear()', () => {
    task.clear();

    assertEquals(task.size, 0);
  });
});

Deno.test('Task execution', async (t) => {
  const sleepTask1 = () => sleep(100);
  const sleepTask2 = () => sleep(100);
  const sleepTask3 = () => sleep(100);

  await t.step('parallel execution', async () => {
    const task = new Task({
      maxParallelism: 3,
      tickDelay: 0,
    });

    task.add(sleepTask1);
    task.add(sleepTask2);
    task.add(sleepTask3);

    task.start();

    const timeA = Date.now();

    await sleep(50);

    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (task.size === 0 && !task.isRunning()) {
          clearInterval(intervalId);
          resolve(true);
        }
      }, 0);
    });

    const timeB = Date.now();

    task.pause();

    assert(timeB - timeA < 150);
  });

  await t.step('delayed execution', async () => {
    const task = new Task({
      maxParallelism: 1,
      tickDelay: 50,
    });

    task.add(() => void 0);
    task.add(() => void 0);
    task.add(() => void 0);

    task.start();

    const timeA = Date.now();

    await sleep(100);

    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (task.size === 0 && !task.isRunning()) {
          clearInterval(intervalId);
          resolve(true);
        }
      }, 0);
    });

    const timeB = Date.now();

    task.pause();

    assert(timeB - timeA >= 150);
  });

  await t.step('looping task', async () => {
    let counter = 0;

    const task = new Task({
      maxParallelism: 1,
      tickDelay: 0,
    });

    task.addLoop(() => counter++, 50);

    task.start();

    await sleep(150);

    task.pause();

    assert(counter > 2);
  });

  await t.step('error handling (see error log in test output)', async () => {
    const values: Array<number> = [];

    const task = new Task({
      maxParallelism: 1,
      tickDelay: 0,
    });

    task.add(() => {
      values.push(1);
      throw new Error('1');
    });

    task.start();

    await sleep(50);

    task.pause();

    assertEquals(values, [1]);
  });
});
