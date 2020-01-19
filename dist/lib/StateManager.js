import Handler from './Handler.js';
export default class StateManager {
    constructor(target = document) {
        if (typeof target === 'string') {
            target = document.querySelector(target) || document;
        }
        this._target = target;
        this._state = new Map();
        this._eventHandler = new Handler((data) => {
            return data;
        });
        this._actionHandler = new Handler(() => {
            return {};
        });
        this._stateHandler = new Handler((data, type) => {
            this._state.set(type, data);
            return data;
        });
        this._viewHandler = new Handler(() => {
            return {};
        });
        this._eventListener = this._eventListener.bind(this);
        this._handlerBeforeAddCallback = this._handlerBeforeAddCallback.bind(this);
        this._handlerAfterRemoveCallback = this._handlerAfterRemoveCallback.bind(this);
        this._eventHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._eventHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;
        this._actionHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._actionHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;
        this._stateHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._stateHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;
        this._viewHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._viewHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;
    }
    get target() {
        return this._target;
    }
    get state() {
        return this._state;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get actionHandler() {
        return this._actionHandler;
    }
    get stateHandler() {
        return this._stateHandler;
    }
    get viewHandler() {
        return this._viewHandler;
    }
    dispatch(type, data = {}) {
        return this._target.dispatchEvent(new CustomEvent(type, { detail: data }));
    }
    _eventListener(event) {
        event.preventDefault();
        event.stopPropagation();
        this._invokeHandlers(event.detail, event.type);
    }
    _handlerBeforeAddCallback(type) {
        if (!this._eventHandler.has(type)
            && !this._actionHandler.has(type)
            && !this._stateHandler.has(type)
            && !this._viewHandler.has(type)) {
            this._target.addEventListener(type, this._eventListener, false);
            this._state.set(type, {});
        }
    }
    _handlerAfterRemoveCallback(type) {
        if (!this._eventHandler.has(type)
            && !this._actionHandler.has(type)
            && !this._stateHandler.has(type)
            && !this._viewHandler.has(type)) {
            this._target.removeEventListener(type, this._eventListener, false);
            this._state.delete(type);
        }
    }
    async _invokeHandlers(data, type) {
        try {
            const eventRusult = await this._eventHandler.invoke(data, type);
            if (!eventRusult) {
                return;
            }
            const actionResult = await this._actionHandler.invoke(eventRusult, type);
            if (!actionResult) {
                return;
            }
            const stateResult = await this._stateHandler.invoke(actionResult, type);
            if (!stateResult) {
                return;
            }
            const viewResult = await this._viewHandler.invoke(stateResult, type);
            if (!viewResult) {
                return;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=StateManager.js.map