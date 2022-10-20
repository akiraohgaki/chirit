import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import ObservableValue from '../src/ObservableValue.ts';

Deno.test('ObservableValue', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let observableValue: ObservableValue<string>;

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
    observableValue = new ObservableValue('initial value');

    assertInstanceOf(observableValue, ObservableValue);
  });

  await t.step('subscribe()', () => {
    observableValue.subscribe(observer1);
    observableValue.subscribe(observer2);
    observableValue.subscribe(observer3);
  });

  await t.step('unsubscribe()', () => {
    observableValue.unsubscribe(observer3);
  });

  await t.step('notify()', () => {
    counter = 0;
    observableValue.notify();

    assertStrictEquals(counter, 2);
  });

  await t.step('get()', () => {
    assertStrictEquals(observableValue.get(), 'initial value');
  });

  await t.step('set()', () => {
    counter = 0;
    observableValue.set('new value');

    assertStrictEquals(counter, 2);
    assertStrictEquals(observableValue.get(), 'new value');
  });
});
