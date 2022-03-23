import type { Observer } from './types.ts';

export default class Observable<T = any> {
  private _observerCollection: Set<Observer<T>>;

  constructor() {
    this._observerCollection = new Set();
  }

  subscribe(observer: Observer<T>): void {
    this._observerCollection.add(observer);
  }

  unsubscribe(observer: Observer<T>): void {
    this._observerCollection.delete(observer);
  }

  notify(value: T): void {
    if (this._observerCollection.size) {
      for (const observer of this._observerCollection) {
        observer(value);
      }
    }
  }
}
