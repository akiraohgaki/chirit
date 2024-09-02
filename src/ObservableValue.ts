import Observable from './Observable.ts';

/**
 * Represents an observable value.
 *
 * This class provides a way to manages the state and notifies observers when the state is updated.
 *
 * This is ideal for atomic state management.
 * If you need complex state management, consider using the `Store` class.
 *
 * ----
 *
 * ### Basic usage
 *
 * ```ts
 * const count = new ObservableValue(0);
 *
 * count.subscribe((value) => {
 *   console.log(`value: ${value}`);
 * });
 *
 * console.log(count.get());
 * // 0
 *
 * count.set(count.get() + 1);
 * // value: 1
 * count.reset();
 * // value: 0
 * ```
 *
 * @template T - The type of the value.
 */
export default class ObservableValue<T> extends Observable<T> {
  #initialValue: T;
  #value: T;

  /**
   * Creates a new instance of the ObservableValue class.
   *
   * @param value - The initial value.
   */
  constructor(value: T) {
    super();

    this.#initialValue = value;
    this.#value = value;
  }

  /**
   * Resets the value to the initial value.
   */
  reset(): void {
    this.#value = this.#initialValue;
    this.notify();
  }

  /**
   * Sets a new value.
   *
   * @param value - The new value.
   */
  set(value: T): void {
    this.#value = value;
    this.notify();
  }

  /**
   * Gets the current value.
   */
  get(): T {
    return this.#value;
  }

  /**
   * Notifies all subscribed observers of the value.
   */
  override notify(): void {
    super.notify(this.#value);
  }
}
