export default class Observable {
    constructor() {
        this._observerCollection = new Set();
    }
    subscribe(observer) {
        this._observerCollection.add(observer);
    }
    unsubscribe(observer) {
        this._observerCollection.delete(observer);
    }
    notify(value) {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(value);
            }
        }
    }
}
//# sourceMappingURL=Observable.js.map