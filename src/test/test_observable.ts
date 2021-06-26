import { Observable } from '../chirit.js';

function observerA(value: number): void {
  console.log('observerA');
  console.log(value);
}

function observerB(value: number): void {
  console.log('observerB');
  console.log(value);
}

export default function (): void {
  const observable = new Observable<number>();

  observable.subscribe(observerA);
  observable.subscribe(observerB);
  observable.unsubscribe(observerB);

  observable.notify(1);
}
