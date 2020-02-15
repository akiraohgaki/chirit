import State from './State.js';
export default class StateManager {
    constructor(target) {
        this._target = target;
        this._stateCollection = new Map();
        this._eventListener = this._eventListener.bind(this);
    }
    get target() {
        return this._target;
    }
    hasState(name) {
        return this._stateCollection.has(name);
    }
    createState(name, state, handler, observers) {
        if (this._stateCollection.has(name)) {
            this.removeState(name);
        }
        this._stateCollection.set(name, new State(state, handler, observers));
        this._target.addEventListener(name, this._eventListener, false);
    }
    removeState(name) {
        this._target.removeEventListener(name, this._eventListener, false);
        this._stateCollection.delete(name);
    }
    getState(name) {
        var _a;
        return ((_a = this._stateCollection.get(name)) === null || _a === void 0 ? void 0 : _a.state) || null;
    }
    async updateState(name, data) {
        const state = this._stateCollection.get(name);
        if (state) {
            await state.update(data);
        }
    }
    setHandler(name, handler) {
        var _a;
        (_a = this._stateCollection.get(name)) === null || _a === void 0 ? void 0 : _a.setHandler(handler);
    }
    addObserver(name, observer) {
        var _a;
        (_a = this._stateCollection.get(name)) === null || _a === void 0 ? void 0 : _a.addObserver(observer);
    }
    removeObserver(name, observer) {
        var _a;
        (_a = this._stateCollection.get(name)) === null || _a === void 0 ? void 0 : _a.removeObserver(observer);
    }
    _eventListener(event) {
        event.preventDefault();
        event.stopPropagation();
        this.updateState(event.type, event.detail);
    }
}
//# sourceMappingURL=StateManager.js.map