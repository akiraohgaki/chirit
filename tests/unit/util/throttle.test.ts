import { assertEquals } from '@std/assert';

import { sleep, throttle } from '../../../util.ts';

Deno.test('throttle()', async (t) => {
  await t.step('throttled function', async () => {
    const values: Array<number> = [];

    const throttledFunc = throttle((value: number) => {
      values.push(value);
    }, 50);

    throttledFunc(1);
    throttledFunc(2);
    await sleep(100);
    throttledFunc(3);
    throttledFunc(4);
    await sleep(100);

    assertEquals(values, [1, 3]);
  });

  await t.step('time-consuming processing', async () => {
    const values: Array<number> = [];

    const throttledFunc = throttle(async (value: number) => {
      await sleep(150);
      values.push(value);
    }, 50);

    throttledFunc(1);
    throttledFunc(2);
    await sleep(100);
    throttledFunc(3);
    throttledFunc(4);
    await sleep(200);

    assertEquals(values, [1]);
  });

  await t.step('error handling (see error log in test output)', async () => {
    const values: Array<number> = [];

    const throttledFunc = throttle((value: number) => {
      values.push(value);
      throw new Error('' + value);
    }, 50);

    throttledFunc(1);
    await sleep(100);

    assertEquals(values, [1]);
  });
});
