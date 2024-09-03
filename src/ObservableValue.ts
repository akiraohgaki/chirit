import Observable from './Observable.ts';

/**
 * An observable value for atomic state management.
 *
 * This class provides a way to manages the state and notifies observers when the state is updated.
 *
 * If you need complex state management, consider using the `Store` class.
 *
 * ----
 *
 * @example Basic usage
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
   * Notifies all subscribed observers of the current value.
   */
  override notify(): void {
    super.notify(this.#value);
  }
}
