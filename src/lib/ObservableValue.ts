import {Observer} from './types.js';
import Observable from './Observable.js';

export default class ObservableValue<T> extends Observable<T> {

    private _value: T;

    constructor(value: T, observers?: Iterable<Observer<any>>) {
        super(observers);

        this._value = value;
    }

    set(value: T): void {
        this._value = value;
        this.notify();
    }

    get(): T {
        return this._value;
    }

    notify(): void {
        super.notify(this._value);
    }

}
