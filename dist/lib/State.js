export default class State {
    constructor(state, handler, observers) {
        this._state = state || {};
        this._handler = handler || this._defaultHandler;
        this._observerCollection = new Set(observers);
    }
    get state() {
        return this._state;
    }
    setHandler(handler) {
        this._handler = handler;
    }
    addObserver(observer) {
        this._observerCollection.add(observer);
    }
    removeObserver(observer) {
        this._observerCollection.delete(observer);
    }
    async update(data) {
        this._state = await Promise.resolve(this._handler(data, this._state));
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(this._state);
            }
        }
    }
    _defaultHandler(data) {
        return data;
    }
}
//# sourceMappingURL=State.js.map