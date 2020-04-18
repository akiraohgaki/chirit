import { Observer } from './common.js';
export default class Observable {
    private _value;
    private _observerCollection;
    constructor(value?: any, observers?: Iterable<Observer>);
    set(value: any): void;
    get(): any;
    subscribe(observer: Observer): void;
    unsubscribe(observer: Observer): void;
    private _notify;
}
