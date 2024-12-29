import { assertEquals } from '@std/assert';

import { compareValues } from '../../mod.ts';

Deno.test('compareValues', async (t) => {
  await t.step('compare two values', () => {
    assertEquals(compareValues(0, 0), true);

    assertEquals(compareValues(0, 1), false);

    assertEquals(compareValues(0, ''), false);

    assertEquals(compareValues([], []), true);

    assertEquals(compareValues([], null), false);

    assertEquals(compareValues([], undefined), false);

    assertEquals(compareValues([0], [0]), true);

    assertEquals(compareValues([0], [1]), false);

    assertEquals(compareValues([0], [0, 1]), false);

    assertEquals(compareValues({}, {}), true);

    assertEquals(compareValues({}, null), false);

    assertEquals(compareValues({}, undefined), false);

    assertEquals(compareValues({ a: 0 }, { a: 0 }), true);

    assertEquals(compareValues({ a: 0 }, { a: 1 }), false);

    assertEquals(compareValues({ a: 0 }, { b: 1 }), false);

    assertEquals(compareValues({ a: 0 }, { a: 0, b: 1 }), false);

    const array = [0];

    assertEquals(compareValues([array, array], [array, array]), true);

    assertEquals(compareValues([array, array], [[0], array]), true);

    assertEquals(compareValues([array, array], [[0], [0]]), false);

    const collection = new Set([0]);

    assertEquals(compareValues([collection], [collection]), true);

    assertEquals(compareValues([collection], [new Set([0])]), false);
  });
});
