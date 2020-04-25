import { Observer } from './types.js';
export default class Observable {
    private _observerCollection;
    constructor(observers?: Iterable<Observer>);
    subscribe(observer: Observer): void;
    unsubscribe(observer: Observer): void;
    notify(value: any): void;
}
