import Observable from './Observable.js';
export default class ObservableValue extends Observable {
    constructor(value = null, observers = []) {
        super(observers);
        this._value = value;
    }
    set(value) {
        this._value = value;
        this.notify();
    }
    get() {
        return this._value;
    }
    notify() {
        super.notify(this._value);
    }
}
//# sourceMappingURL=ObservableValue.js.map