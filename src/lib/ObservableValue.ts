import {Observer} from './types.js';
import Observable from './Observable.js';

export default class ObservableValue extends Observable {

    private _value: any;

    constructor(value: any = null, observers: Iterable<Observer> = []) {
        super(observers);

        this._value = value;
    }

    set(value: any): void {
        this._value = value;
        this.notify();
    }

    get(): any {
        return this._value;
    }

    notify(): void {
        super.notify(this._value);
    }

}
