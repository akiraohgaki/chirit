import Observable from './Observable.ts';

export default class ObservableValue<T> extends Observable<T> {
  #value: T;

  constructor(value: T) {
    super();

    this.#value = value;
  }

  set(value: T): void {
    this.#value = value;
    this.notify();
  }

  get(): T {
    return this.#value;
  }

  override notify(): void {
    super.notify(this.#value);
  }
}
