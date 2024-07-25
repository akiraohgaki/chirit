import Observable from './Observable.ts';

export default class ObservableValue<T> extends Observable<T> {
  #initialValue: T;
  #value: T;

  constructor(value: T) {
    super();

    this.#initialValue = value;
    this.#value = value;
  }

  reset(): void {
    this.#value = this.#initialValue;
    this.notify();
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
