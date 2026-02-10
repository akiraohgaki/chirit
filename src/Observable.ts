/**
 * Notify observers.
 *
 * This also works in non-browser environments.
 *
 * @example Basic usage
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
export class Observable<T = unknown> {
  #observerSet: Set<(value: T) => unknown>;

  /**
   * Creates a new instance of the Observable class.
   */
  constructor() {
    this.#observerSet = new Set();
  }

  /**
   * Subscribes an observer.
   *
   * @param observer - An observer function.
   */
  subscribe(observer: (value: T) => unknown): void {
    this.#observerSet.add(observer);
  }

  /**
   * Unsubscribes an observer.
   *
   * @param observer - An observer function.
   */
  unsubscribe(observer: (value: T) => unknown): void {
    this.#observerSet.delete(observer);
  }

  /**
   * Notifies all subscribed observers.
   *
   * @param value - The value to notify.
   */
  notify(value: T): void {
    for (const observer of this.#observerSet) {
      observer(value);
    }
  }
}
