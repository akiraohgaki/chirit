import { assert, assertEquals } from '@std/assert';

import { Observable } from '../../mod.ts';

const values: Array<number> = [];

function observer1(value: number): void {
  values.push(value);
}

function observer2(value: number): void {
  values.push(value);
}

function observer3(value: number): void {
  values.push(value);
}

Deno.test('Observable', async (t) => {
  let observable: Observable<number>;

  await t.step('constructor()', () => {
    observable = new Observable();

    assert(observable);
  });

  await t.step('notify()', () => {
    observable.notify(1);

    assertEquals(values.splice(0), []);
  });

  await t.step('subscribe()', () => {
    observable.subscribe(observer1);
    observable.subscribe(observer2);
    observable.subscribe(observer3);

    observable.notify(1);

    assertEquals(values.splice(0), [1, 1, 1]);
  });

  await t.step('unsubscribe()', () => {
    observable.unsubscribe(observer1);

    observable.notify(1);

    observable.unsubscribe(observer2);
    observable.unsubscribe(observer3);

    observable.notify(1);

    assertEquals(values.splice(0), [1, 1]);
  });
});
