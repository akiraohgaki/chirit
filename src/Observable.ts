import type { Observer } from './types.ts';

/**
 * Represents an observable.
 *
 * This class provides a way to notifies observers when a new value is available.
 *
 * ----
 *
 * ### Basic usage
 *
 * ```ts
 * const updateEvent = new Observable<string>();
 *
 * updateEvent.subscribe((value) => {
 *   console.log(`value: ${value}`);
 * });
 *
 * updateEvent.notify('preparing');
 * // value: preparing
 * updateEvent.notify('updating');
 * // value: updating
 * updateEvent.notify('updated');
 * // value: updated
 * ```
 *
 * @template T - The type of the value.
 */
export default class Observable<T = unknown> {
  #observerCollection: Set<Observer<T>>;

  /**
   * Creates a new instance of the Observable class.
   */
  constructor() {
    this.#observerCollection = new Set();
  }

  /**
   * Subscribes an observer.
   *
   * @param observer - An observer function.
   */
  subscribe(observer: Observer<T>): void {
    this.#observerCollection.add(observer);
  }

  /**
   * Unsubscribes an observer.
   *
   * @param observer - An observer function.
   */
  unsubscribe(observer: Observer<T>): void {
    this.#observerCollection.delete(observer);
  }

  /**
   * Notifies all subscribed observers of the value.
   *
   * @param value - The value to notify.
   */
  notify(value: T): void {
    if (this.#observerCollection.size) {
      for (const observer of this.#observerCollection) {
        observer(value);
      }
    }
  }
}
