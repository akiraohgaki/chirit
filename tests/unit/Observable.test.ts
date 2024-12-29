import { assertEquals } from '@std/assert';

import { Observable } from '../../mod.ts';

Deno.test('Observable', async (t) => {
  await t.step('notification', () => {
    const logs: Array<unknown> = [];

    const observer1 = (state: number) => {
      logs.push(state);
    };
    const observer2 = (state: number) => {
      logs.push(state);
    };

    const observable = new Observable<number>();

    observable.notify(0);

    observable.subscribe(observer1);
    observable.subscribe(observer2);

    observable.notify(1);

    observable.unsubscribe(observer1);
    observable.unsubscribe(observer2);

    observable.notify(2);

    assertEquals(logs, [
      1,
      1,
    ]);
  });
});
