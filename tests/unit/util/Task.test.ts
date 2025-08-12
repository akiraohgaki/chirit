import { assert, assertEquals } from '@std/assert';

import { sleep, Task } from '../../../util.ts';

async function sleepTask1(): Promise<void> {
  await sleep(100);
}

async function sleepTask2(): Promise<void> {
  await sleep(100);
}

async function sleepTask3(): Promise<void> {
  await sleep(100);
}

async function waitForTaskFinished(task: Task): Promise<number> {
  return await new Promise((resolve) => {
    const timeA = Date.now();
    const intervalId = setInterval(() => {
      if (task.queueSize === 0 && !task.isRunning) {
        clearInterval(intervalId);
        const timeB = Date.now();
        resolve(timeB - timeA);
      }
    }, 0);
  });
}

Deno.test('Task', async (t) => {
  let task: Task;

  await t.step('constructor()', () => {
    task = new Task({
      maxParallelism: 1,
      tickDelay: 0,
    });

    assert(task);
  });

  await t.step('queueSize', () => {
    assertEquals(task.queueSize, 0);
  });

  await t.step('loopSize', () => {
    assertEquals(task.loopSize, 0);
  });

  await t.step('isRunning', () => {
    assert(!task.isRunning);
  });

  await t.step('add()', () => {
    task.add(sleepTask1);
    task.add(sleepTask2);

    assertEquals(task.queueSize, 2);
  });

  await t.step('addLoop()', () => {
    task.addLoop(sleepTask3, 0);

    assertEquals(task.queueSize, 3);
    assertEquals(task.loopSize, 1);
  });

  await t.step('delete()', () => {
    task.delete(sleepTask3);

    assertEquals(task.queueSize, 2);
    assertEquals(task.loopSize, 0);
  });

  await t.step('start()', async () => {
    task.start();

    await sleep(50);

    assertEquals(task.queueSize, 1);
    assert(task.isRunning);
  });

  await t.step('pause()', async () => {
    task.pause();

    await sleep(100);

    assertEquals(task.queueSize, 1);
    assert(!task.isRunning);
  });

  await t.step('clear()', () => {
    task.add(sleepTask1);
    task.addLoop(sleepTask2, 0);

    task.clear();

    assertEquals(task.queueSize, 0);
    assertEquals(task.loopSize, 0);
  });
});

Deno.test('Task features', async (t) => {
  await t.step('parallel execution', async () => {
    const task = new Task({
      maxParallelism: 3,
      tickDelay: 0,
    });

    task.add(sleepTask1);
    task.add(sleepTask2);
    task.add(sleepTask3);

    task.start();

    const time = await waitForTaskFinished(task);

    task.pause();

    assert(time < 150);
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

    const time = await waitForTaskFinished(task);

    task.pause();

    assert(time >= 150);
  });

  await t.step('looping task', async () => {
    const task = new Task({
      maxParallelism: 1,
      tickDelay: 0,
    });

    let counter = 0;

    task.addLoop(() => counter++, 50);

    task.start();

    await sleep(150);

    task.pause();

    assert(counter > 2);
  });

  await t.step('error handling (see error log in test output)', async () => {
    const task = new Task({
      maxParallelism: 1,
      tickDelay: 0,
    });

    let isExecuted = false;

    task.add(() => {
      isExecuted = true;
      throw new Error('error');
    });

    task.start();

    await sleep(50);

    task.pause();

    assert(isExecuted);
  });
});
