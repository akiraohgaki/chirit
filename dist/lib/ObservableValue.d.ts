import Observable from './Observable.js';
export default class ObservableValue<T> extends Observable<T> {
    private _value;
    constructor(value: T);
    set(value: T): void;
    get(): T;
    notify(): void;
}
