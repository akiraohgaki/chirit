import type { Observer } from './types.js';
export default class Observable<T = any> {
    private _observerCollection;
    constructor();
    subscribe(observer: Observer<T>): void;
    unsubscribe(observer: Observer<T>): void;
    notify(value: T): void;
}
