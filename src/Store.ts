import Observable from './Observable.ts';

import dom from './dom.ts';

export default class Store<T extends Record<string, unknown>> extends Observable<T> {
  #initialState: T;
  #state: T;

  constructor(state: T) {
    super();

    this.#initialState = dom.globalThis.structuredClone(state);
    this.#state = dom.globalThis.structuredClone(state);
  }

  get state(): T {
    return this.#state;
  }

  reset(): void {
    this.#state = dom.globalThis.structuredClone(this.#initialState);
    this.notify();
  }

  update(state: Partial<T>): void {
    this.#state = dom.globalThis.structuredClone({ ...this.#state, ...state });
    this.notify();
  }

  override notify(): void {
    super.notify(this.#state);
  }
}
