import {Observer} from './types.js';

export default class Observable {

    private _observerCollection: Set<Observer>;

    constructor(observers: Iterable<Observer> = []) {
        this._observerCollection = new Set(observers);
    }

    subscribe(observer: Observer): void {
        this._observerCollection.add(observer);
    }

    unsubscribe(observer: Observer): void {
        this._observerCollection.delete(observer);
    }

    notify(value: any): void {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(value);
            }
        }
    }

}
