import { assert, assertEquals } from '@std/assert';

import { Observable } from '../../mod.ts';

Deno.test('Observable', async (t) => {
  let observable: Observable<number>;

  const values: Array<number> = [];

  const observer1 = (value: number) => {
    values.push(value);
  };

  const observer2 = (value: number) => {
    values.push(value);
  };

  const observer3 = (value: number) => {
    values.push(value);
  };

  await t.step('constructor()', () => {
    observable = new Observable();

    assert(observable);
  });

  await t.step('notify()', () => {
    observable.notify(0);

    assertEquals(values, []);
  });

  await t.step('subscribe()', () => {
    observable.subscribe(observer1);
    observable.subscribe(observer2);
    observable.subscribe(observer3);

    observable.notify(1);

    assertEquals(values, [1, 1, 1]);
  });

  await t.step('unsubscribe()', () => {
    observable.unsubscribe(observer1);

    observable.notify(2);

    observable.unsubscribe(observer2);
    observable.unsubscribe(observer3);

    observable.notify(3);

    assertEquals(values, [1, 1, 1, 2, 2]);
  });
});
