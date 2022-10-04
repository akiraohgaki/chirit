import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';

import Observable from '../Observable.ts';

Deno.test('Observable', async (t) => {
  let observable: Observable<number>;

  let counter = 0;

  const observer1 = (value: number) => {
    counter += value;
  };
  const observer2 = (value: number) => {
    counter += value;
  };
  const observer3 = (value: number) => {
    counter += value;
  };

  await t.step('constructor()', () => {
    observable = new Observable();

    assertInstanceOf(observable, Observable);
  });

  await t.step('subscribe()', () => {
    observable.subscribe(observer1);
    observable.subscribe(observer2);

    observable.subscribe(observer3);
    observable.subscribe(observer3);
  });

  await t.step('unsubscribe()', () => {
    observable.unsubscribe(observer3);
  });

  await t.step('notify()', () => {
    observable.notify(1);

    assertStrictEquals(counter, 2);
  });
});
