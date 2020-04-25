import { Observer } from './types.js';
import Observable from './Observable.js';
export default class ObservableValue extends Observable {
    private _value;
    constructor(value?: any, observers?: Iterable<Observer>);
    set(value: any): void;
    get(): any;
    notify(): void;
}
