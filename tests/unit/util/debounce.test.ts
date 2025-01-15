import { assertEquals } from '@std/assert';

import { debounce, sleep } from '../../../util.ts';

Deno.test('debounce', async (t) => {
  await t.step('debounced function', async () => {
    const logs: Array<number> = [];

    const debouncedFunc = debounce((value: number) => {
      logs.push(value);
    }, 50);

    debouncedFunc(1);
    debouncedFunc(2);
    await sleep(100);
    debouncedFunc(3);
    debouncedFunc(4);
    await sleep(100);

    assertEquals(logs, [2, 4]);
  });

  await t.step('time-consuming debounced function', async () => {
    const logs: Array<number> = [];

    const debouncedFunc = debounce(async (value: number) => {
      await sleep(150);
      logs.push(value);
    }, 50);

    debouncedFunc(1);
    debouncedFunc(2);
    await sleep(100);
    debouncedFunc(3);
    debouncedFunc(4);
    await sleep(100);

    assertEquals(logs, [2]);
  });
});
