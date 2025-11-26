import { assert } from '@std/assert';

import { isEqual } from '../../../util.ts';

Deno.test('isEqual()', async (t) => {
  await t.step('compare two values', () => {
    assert(isEqual(0, 0));
    assert(!isEqual(0, 1));
    assert(!isEqual(0, ''));
    assert(!isEqual(0, null));
    assert(!isEqual(0, undefined));

    assert(isEqual({}, {}));
    assert(isEqual(null, null));
    assert(!isEqual({}, null));
    assert(!isEqual(null, {}));

    assert(isEqual(new Date(0), new Date(0)));
    assert(!isEqual(new Date(0), new Date(1)));

    assert(isEqual(/a/, /a/));
    assert(!isEqual(/a/, /b/));
    assert(!isEqual(/a/, /a/i));

    assert(isEqual([0], [0]));
    assert(!isEqual([0], [1]));
    assert(!isEqual([0], [0, 1]));

    assert(isEqual({ a: 0 }, { a: 0 }));
    assert(!isEqual({ a: 0 }, { a: 1 }));
    assert(!isEqual({ a: 0 }, { b: 1 }));
    assert(!isEqual({ a: 0 }, { a: 0, b: 1 }));

    const set = new Set([0]);
    assert(isEqual(set, set));
    assert(!isEqual(set, new Set([0])));

    const arr = [0];
    assert(isEqual([arr, arr], [arr, arr]));
    assert(isEqual([arr, arr], [[0], arr]));
    assert(isEqual([[0], arr], [arr, arr]));
    assert(!isEqual([arr, arr], [[0], [0]]));
    assert(!isEqual([[0], [0]], [arr, arr]));

    const obj = { a: 0 };
    assert(isEqual({ a: obj, b: obj }, { a: obj, b: obj }));
    assert(isEqual({ a: obj, b: obj }, { a: { a: 0 }, b: obj }));
    assert(isEqual({ a: { a: 0 }, b: obj }, { a: obj, b: obj }));
    assert(!isEqual({ a: obj, b: obj }, { a: { a: 0 }, b: { a: 0 } }));
    assert(!isEqual({ a: { a: 0 }, b: { a: 0 } }, { a: obj, b: obj }));
  });
});
