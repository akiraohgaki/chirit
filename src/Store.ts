import { Observable } from './Observable.ts';
import { dom } from './dom.ts';
import { isEqual } from './util/isEqual.ts';

/**
 * An observable store for managing complex state.
 *
 * It inherited the Observable class.
 * And notifies observers when the state is changed.
 *
 * Consider using the State class to manage atomic state.
 *
 * This also works in non-browser environments.
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
export class Store<T extends Record<string, unknown>> extends Observable<T> {
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
   * The current state.
   */
  get state(): T {
    return this.#state;
  }

  /**
   * Resets the state to the initial state.
   */
  reset(): void {
    const isEquiv = isEqual(this.#state, this.#initialState);

    this.#state = dom.globalThis.structuredClone(this.#initialState);

    if (!isEquiv) {
      this.notify();
    }
  }

  /**
   * Updates the state with a partial object.
   *
   * @param state - The partial state object to merge into the current state.
   */
  update(state: Partial<T>): void {
    const newState = { ...this.#state, ...state };

    const isEquiv = isEqual(this.#state, newState);

    this.#state = dom.globalThis.structuredClone(newState);

    if (!isEquiv) {
      this.notify();
    }
  }

  /**
   * Notifies all subscribed observers.
   */
  override notify(): void {
    super.notify(this.#state);
  }
}
