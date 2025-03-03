import { assert, assertEquals } from '@std/assert';

import { sleep, throttle } from '../../../util.ts';

const values: Array<number> = [];

async function func(value: number, delay?: number): Promise<void> {
  if (delay) {
    await sleep(delay);
  }
  values.push(value);
}

Deno.test('throttle()', async (t) => {
  await t.step('throttled function', async () => {
    const throttledFunc = throttle(func, 50);

    throttledFunc(1);
    throttledFunc(2);
    await sleep(100);
    throttledFunc(3);
    throttledFunc(4);
    await sleep(100);

    assertEquals(values.splice(0), [1, 3]);
  });

  await t.step('time-consuming processing', async () => {
    const throttledFunc = throttle(func, 50);

    throttledFunc(1, 150);
    throttledFunc(2, 150);
    await sleep(100);
    throttledFunc(3, 150);
    throttledFunc(4, 150);
    await sleep(200);

    assertEquals(values.splice(0), [1]);
  });

  await t.step('error handling (see error log in test output)', async () => {
    let isExecuted = false;

    const throttledFunc = throttle(() => {
      isExecuted = true;
      throw new Error('error');
    }, 0);

    throttledFunc();

    await sleep(50);

    assert(isExecuted);
  });
});
