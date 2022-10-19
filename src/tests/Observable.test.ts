import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import Observable from '../Observable.ts';

Deno.test('Observable', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let observable: Observable<string>;

  let counter = 0;

  const observer1 = (value: string) => {
    counter++;
    console.log(counter, value);
  };

  const observer2 = (value: string) => {
    counter++;
    console.log(counter, value);
  };

  const observer3 = (value: string) => {
    counter++;
    console.log(counter, value);
  };

  await t.step('constructor()', () => {
    observable = new Observable();

    assertInstanceOf(observable, Observable);
  });

  await t.step('subscribe()', () => {
    // Observer should not be double
    observable.subscribe(observer1);
    observable.subscribe(observer2);
    observable.subscribe(observer3);

    observable.subscribe(observer1);
    observable.subscribe(observer2);
    observable.subscribe(observer3);
  });

  await t.step('unsubscribe()', () => {
    observable.unsubscribe(observer3);
  });

  await t.step('notify()', () => {
    counter = 0;
    observable.notify('test');

    assertStrictEquals(counter, 2);
  });
});
