import { assertEquals } from '@std/assert';

import { debounce, sleep } from '../../../util.ts';

Deno.test('debounce()', async (t) => {
  await t.step('debounced function', async () => {
    const values: Array<number> = [];

    const debouncedFunc = debounce((value: number) => {
      values.push(value);
    }, 50);

    debouncedFunc(1);
    debouncedFunc(2);
    await sleep(100);
    debouncedFunc(3);
    debouncedFunc(4);
    await sleep(100);

    assertEquals(values, [2, 4]);
  });

  await t.step('time-consuming processing', async () => {
    const values: Array<number> = [];

    const debouncedFunc = debounce(async (value: number) => {
      await sleep(150);
      values.push(value);
    }, 50);

    debouncedFunc(1);
    debouncedFunc(2);
    await sleep(100);
    debouncedFunc(3);
    debouncedFunc(4);
    await sleep(200);

    assertEquals(values, [2]);
  });

  await t.step('error handling (see error log in test output)', async () => {
    const values: Array<number> = [];

    const debouncedFunc = debounce((value: number) => {
      values.push(value);
      throw new Error('' + value);
    }, 50);

    debouncedFunc(1);
    await sleep(100);

    assertEquals(values, [1]);
  });
});
