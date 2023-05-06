import Observable from './Observable.ts';

export default class Store<T extends Record<string, unknown>> extends Observable<T> {
  #state: T;

  constructor(state: T) {
    super();

    this.#state = state;
  }

  get state(): T {
    return this.#state;
  }

  update(state: Partial<T>): void {
    this.#state = { ...this.#state, ...state };
    this.notify();
  }

  override notify(): void {
    super.notify(this.#state);
  }
}
