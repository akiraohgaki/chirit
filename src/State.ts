import Observable from './Observable.ts';

/**
 * An observable state for atomic state management.
 *
 * This class provides a way to manages the state and notifies observers when the state is updated.
 *
 * If you need complex state management, consider using the `Store` class.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const count = new State(0);
 *
 * count.subscribe((state) => {
 *   console.log(`state: ${state}`);
 * });
 *
 * console.log(count.get());
 * // 0
 *
 * count.set(count.get() + 1);
 * // state: 1
 * count.reset();
 * // state: 0
 * ```
 *
 * @template T - The type of the state.
 */
export default class State<T> extends Observable<T> {
  #initialState: T;
  #state: T;

  /**
   * Creates a new instance of the State class.
   *
   * @param state - The initial state.
   */
  constructor(state: T) {
    super();

    this.#initialState = state;
    this.#state = state;
  }

  /**
   * Resets the state to the initial state.
   */
  reset(): void {
    this.#state = this.#initialState;
    this.notify();
  }

  /**
   * Sets a new state.
   *
   * @param state - The new state.
   */
  set(state: T): void {
    this.#state = state;
    this.notify();
  }

  /**
   * Gets the current state.
   */
  get(): T {
    return this.#state;
  }

  /**
   * Notifies all subscribed observers of the current state.
   */
  override notify(): void {
    super.notify(this.#state);
  }
}
