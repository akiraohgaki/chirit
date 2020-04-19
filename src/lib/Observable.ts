import {Observer} from './types.js';

export default class Observable {

    private _value: any;
    private _observerCollection: Set<Observer>;

    constructor(value: any = null, observers: Iterable<Observer> = []) {
        this._value = value;
        this._observerCollection = new Set(observers);
    }

    set(value: any): void {
        this._value = value;
        this._notify();
    }

    get(): any {
        return this._value;
    }

    subscribe(observer: Observer): void {
        this._observerCollection.add(observer);
    }

    unsubscribe(observer: Observer): void {
        this._observerCollection.delete(observer);
    }

    private _notify(): void {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(this._value);
            }
        }
    }

}
