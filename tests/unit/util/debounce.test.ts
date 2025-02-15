import { assert, assertEquals } from '@std/assert';

import { debounce, sleep } from '../../../util.ts';

const values: Array<number> = [];

async function func(value: number, delay?: number): Promise<void> {
  if (delay) {
    await sleep(delay);
  }
  values.push(value);
}

Deno.test('debounce()', async (t) => {
  await t.step('debounced function', async () => {
    const debouncedFunc = debounce(func, 50);

    debouncedFunc(1);
    debouncedFunc(2);
    await sleep(100);
    debouncedFunc(3);
    debouncedFunc(4);
    await sleep(100);

    assertEquals(values.splice(0), [2, 4]);
  });

  await t.step('time-consuming processing', async () => {
    const debouncedFunc = debounce(func, 50);

    debouncedFunc(1, 150);
    debouncedFunc(2, 150);
    await sleep(100);
    debouncedFunc(3, 150);
    debouncedFunc(4, 150);
    await sleep(200);

    assertEquals(values.splice(0), [2]);
  });

  await t.step('error handling (see error log in test output)', async () => {
    let isExecuted = false;

    const debouncedFunc = debounce(() => {
      isExecuted = true;
      throw new Error('error');
    }, 0);

    debouncedFunc();

    await sleep(50);

    assert(isExecuted);
  });
});
