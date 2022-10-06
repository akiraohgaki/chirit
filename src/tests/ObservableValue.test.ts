import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import ObservableValue from '../ObservableValue.ts';

Deno.test('ObservableValue', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let observableValue: ObservableValue<number>;

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
    observableValue = new ObservableValue(0);

    assertInstanceOf(observableValue, ObservableValue);
  });

  await t.step('subscribe()', () => {
    observableValue.subscribe(observer1);
    observableValue.subscribe(observer2);

    observableValue.subscribe(observer3);
    observableValue.subscribe(observer3);
  });

  await t.step('unsubscribe()', () => {
    observableValue.unsubscribe(observer3);
  });

  await t.step('notify()', () => {
    observableValue.notify();

    assertStrictEquals(counter, 0);
  });

  await t.step('set()', () => {
    observableValue.set(1);

    assertStrictEquals(counter, 2);
  });

  await t.step('get()', () => {
    assertStrictEquals(observableValue.get(), 1);
  });
});
