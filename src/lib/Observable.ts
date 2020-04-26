import {Observer} from './types.js';

export default class Observable<T = any> {

    private _observerCollection: Set<Observer<T>>;

    constructor(observers?: Iterable<Observer<T>>) {
        this._observerCollection = new Set(observers);
    }

    subscribe(observer: Observer<T>): void {
        this._observerCollection.add(observer);
    }

    unsubscribe(observer: Observer<T>): void {
        this._observerCollection.delete(observer);
    }

    notify(value: T): void {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(value);
            }
        }
    }

}
