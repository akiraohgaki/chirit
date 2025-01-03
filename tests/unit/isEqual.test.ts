import { assertEquals } from '@std/assert';

import { isEqual } from '../../mod.ts';

Deno.test('isEqual', async (t) => {
  await t.step('compare two values', () => {
    assertEquals(isEqual(0, 0), true);
    assertEquals(isEqual(0, 1), false);
    assertEquals(isEqual(0, ''), false);
    assertEquals(isEqual(0, null), false);
    assertEquals(isEqual(0, undefined), false);

    assertEquals(isEqual([], []), true);
    assertEquals(isEqual([], null), false);

    assertEquals(isEqual([0], [0]), true);
    assertEquals(isEqual([0], [1]), false);
    assertEquals(isEqual([0], [0, 1]), false);

    assertEquals(isEqual({}, {}), true);
    assertEquals(isEqual({}, null), false);

    assertEquals(isEqual({ a: 0 }, { a: 0 }), true);
    assertEquals(isEqual({ a: 0 }, { a: 1 }), false);
    assertEquals(isEqual({ a: 0 }, { b: 1 }), false);
    assertEquals(isEqual({ a: 0 }, { a: 0, b: 1 }), false);

    const set = new Set([0]);
    assertEquals(isEqual(set, set), true);
    assertEquals(isEqual(set, new Set([0])), false);

    const arr = [0];
    assertEquals(isEqual([arr, arr], [arr, arr]), true);
    assertEquals(isEqual([arr, arr], [[0], arr]), true);
    assertEquals(isEqual([[0], arr], [arr, arr]), true);
    assertEquals(isEqual([arr, arr], [[0], [0]]), false);
    assertEquals(isEqual([[0], [0]], [arr, arr]), false);

    const obj = { a: 0 };
    assertEquals(isEqual({ a: obj, b: obj }, { a: obj, b: obj }), true);
    assertEquals(isEqual({ a: obj, b: obj }, { a: { a: 0 }, b: obj }), true);
    assertEquals(isEqual({ a: { a: 0 }, b: obj }, { a: obj, b: obj }), true);
    assertEquals(isEqual({ a: obj, b: obj }, { a: { a: 0 }, b: { a: 0 } }), false);
    assertEquals(isEqual({ a: { a: 0 }, b: { a: 0 } }, { a: obj, b: obj }), false);
  });
});
