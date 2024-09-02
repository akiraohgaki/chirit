import Observable from './Observable.ts';

import dom from './dom.ts';

/**
 * State management store.
 *
 * This class provides a way to manages the state and notifies observers when the state is updated.
 *
 * This is ideal for complex state management.
 * If you need atomic state management, consider using the `ObservableValue` class.
 *
 * ----
 *
 * ### Basic usage
 *
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
 * ### Recommended usage of the Store class
 *
 * Create a custom class that extends the Store class to model the state.
 *
 * ```ts
 * const initialState = { count: 0 };
 *
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
   * @param state - The initial state of the store.
   */
  constructor(state: T) {
    super();

    this.#initialState = dom.globalThis.structuredClone(state);
    this.#state = dom.globalThis.structuredClone(state);
  }

  /**
   * Returns the current state of the store.
   */
  get state(): T {
    return this.#state;
  }

  /**
   * Resets the state of the store to the initial state.
   */
  reset(): void {
    this.#state = dom.globalThis.structuredClone(this.#initialState);
    this.notify();
  }

  /**
   * Updates the state of the store with a partial object.
   *
   * @param state - The partial state object to merge into the current state.
   */
  update(state: Partial<T>): void {
    this.#state = dom.globalThis.structuredClone({ ...this.#state, ...state });
    this.notify();
  }

  /**
   * Notifies all subscribed observers of the state of the store.
   */
  override notify(): void {
    super.notify(this.#state);
  }
}
