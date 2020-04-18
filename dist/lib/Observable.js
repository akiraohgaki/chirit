export default class Observable {
    constructor(value = null, observers = []) {
        this._value = value;
        this._observerCollection = new Set(observers);
    }
    set(value) {
        this._value = value;
        this._notify();
    }
    get() {
        return this._value;
    }
    subscribe(observer) {
        this._observerCollection.add(observer);
    }
    unsubscribe(observer) {
        this._observerCollection.delete(observer);
    }
    _notify() {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(this._value);
            }
        }
    }
}
//# sourceMappingURL=Observable.js.map