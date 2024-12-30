import { assertEquals } from '@std/assert';

import { compareValues } from '../../mod.ts';

Deno.test('compareValues', async (t) => {
  await t.step('compare two values', () => {
    assertEquals(compareValues(0, 0), true);
    assertEquals(compareValues(0, 1), false);
    assertEquals(compareValues(0, ''), false);
    assertEquals(compareValues(0, null), false);
    assertEquals(compareValues(0, undefined), false);

    assertEquals(compareValues([], []), true);
    assertEquals(compareValues([], null), false);

    assertEquals(compareValues([0], [0]), true);
    assertEquals(compareValues([0], [1]), false);
    assertEquals(compareValues([0], [0, 1]), false);

    assertEquals(compareValues({}, {}), true);
    assertEquals(compareValues({}, null), false);

    assertEquals(compareValues({ a: 0 }, { a: 0 }), true);
    assertEquals(compareValues({ a: 0 }, { a: 1 }), false);
    assertEquals(compareValues({ a: 0 }, { b: 1 }), false);
    assertEquals(compareValues({ a: 0 }, { a: 0, b: 1 }), false);

    const set = new Set([0]);
    assertEquals(compareValues(set, set), true);
    assertEquals(compareValues(set, new Set([0])), false);

    const arr = [0];
    assertEquals(compareValues([arr, arr], [arr, arr]), true);
    assertEquals(compareValues([arr, arr], [[0], arr]), true);
    assertEquals(compareValues([arr, arr], [[0], [0]]), false);

    const obj = { a: 0 };
    assertEquals(compareValues({ a: obj, b: obj }, { a: obj, b: obj }), true);
    assertEquals(compareValues({ a: obj, b: obj }, { a: { a: 0 }, b: obj }), true);
    assertEquals(compareValues({ a: obj, b: obj }, { a: { a: 0 }, b: { a: 0 } }), false);
  });
});
