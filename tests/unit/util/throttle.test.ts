import { assertEquals } from '@std/assert';

import { sleep, throttle } from '../../../util.ts';

Deno.test('throttle', async (t) => {
  await t.step('throttled function', async () => {
    const logs: Array<number> = [];

    const throttledFunc = throttle((value: number) => {
      logs.push(value);
    }, 50);

    throttledFunc(1);
    throttledFunc(2);
    await sleep(100);
    throttledFunc(3);
    throttledFunc(4);
    await sleep(100);

    assertEquals(logs, [1, 3]);
  });

  await t.step('time-consuming processing', async () => {
    const logs: Array<number> = [];

    const throttledFunc = throttle(async (value: number) => {
      await sleep(150);
      logs.push(value);
    }, 50);

    throttledFunc(1);
    throttledFunc(2);
    await sleep(100);
    throttledFunc(3);
    throttledFunc(4);
    await sleep(200);

    assertEquals(logs, [1]);
  });

  await t.step('error handling (see error log in test output)', async () => {
    const logs: Array<number> = [];

    const throttledFunc = throttle((value: number) => {
      logs.push(value);
      throw new Error('' + value);
    }, 50);

    throttledFunc(1);
    throttledFunc(2);
    await sleep(100);
    throttledFunc(3);
    throttledFunc(4);
    await sleep(100);

    assertEquals(logs, [1, 3]);
  });
});
