import Observable from './Observable.ts';

import dom from './dom.ts';

/**
 * An observable store for complex state management.
 *
 * This class provides a way to manages the state and notifies observers when the state is updated.
 *
 * If you need atomic state management, consider using the `State` class.
 *
 * This class also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const initialState = { count: 0 };
 *
 * const counter = new Store(initialState);
 *
 * counter.subscribe((state) => {
 *   console.log(`state.count: ${state.count}`);
 * });
 *
 * console.log(counter.state.count);
 * // 0
 *
 * counter.update({ count: counter.state.count + 1 });
 * // state.count: 1
 * counter.reset();
 * // state.count: 0
 * ```
 *
 * @example Cteate a custom store
 * ```ts
 * const initialState = { count: 0 };
 *
 * // Create a custom class that extends the Store class to model the state.
 * class Counter extends Store<typeof initialState> {
 *   increment() {
 *     this.update({ count: this.state.count + 1 });
 *   }
 *
 *   decrement() {
 *     this.update({ count: this.state.count - 1 });
 *   }
 * }
 *
 * const counter = new Counter(initialState);
 *
 * counter.subscribe((state) => {
 *   console.log(`state.count: ${state.count}`);
 * });
 *
 * counter.increment();
 * // state.count: 1
 * counter.decrement();
 * // state.count: 0
 * ```
 *
 * @template T - The type of the state.
 */
export default class Store<T extends Record<string, unknown>> extends Observable<T> {
  #initialState: T;
  #state: T;

  /**
   * Creates a new instance of the Store class.
   *
   * @param state - The initial state.
   */
  constructor(state: T) {
    super();

    this.#initialState = dom.globalThis.structuredClone(state);
    this.#state = dom.globalThis.structuredClone(state);
  }

  /**
   * Returns the current state.
   */
  get state(): T {
    return this.#state;
  }

  /**
   * Resets the state to the initial state.
   */
  reset(): void {
    this.#state = dom.globalThis.structuredClone(this.#initialState);
    this.notify();
  }

  /**
   * Updates the state with a partial object.
   *
   * @param state - The partial state object to merge into the current state.
   */
  update(state: Partial<T>): void {
    this.#state = dom.globalThis.structuredClone({ ...this.#state, ...state });
    this.notify();
  }

  /**
   * Notifies all subscribed observers of the current state.
   */
  override notify(): void {
    super.notify(this.#state);
  }
}
