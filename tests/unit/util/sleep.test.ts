import { assert } from '@std/assert';

import { sleep } from '../../../util.ts';

Deno.test('sleep()', async (t) => {
  await t.step('pauses the execution', async () => {
    const timeA = Date.now();
    await sleep(100);
    const timeB = Date.now();

    assert(timeB - timeA >= 100);
  });
});
