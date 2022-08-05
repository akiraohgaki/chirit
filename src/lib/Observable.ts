import type { Observer } from './types.ts';

export default class Observable<T = unknown> {
  #observerCollection: Set<Observer<T>>;

  constructor() {
    this.#observerCollection = new Set();
  }

  subscribe(observer: Observer<T>): void {
    this.#observerCollection.add(observer);
  }

  unsubscribe(observer: Observer<T>): void {
    this.#observerCollection.delete(observer);
  }

  notify(value: T): void {
    if (this.#observerCollection.size) {
      for (const observer of this.#observerCollection) {
        observer(value);
      }
    }
  }
}
