/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class StateManager {

    constructor(target) {
        // "target" should be Element object or selector string
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }

        this._target = target || document;
        this._states = new Map();
        this._eventHandlers = new Map();
        this._actionHandlers = new Map();
        this._storeHandlers = new Map();
        this._viewHandlers = new Map();

        this._eventListener = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this._handleEvent(event.type, event.detail);
        };
    }

    get target() {
        return this._target;
    }

    getStates() {
        return this._states;
    }

    getState(type) {
        return this._states.get(type);
    }

    addEventHandler(type, handler, options = {}) {
        this._addHandler(this._eventHandlers, type, handler, options);
    }

    removeEventHandler(type, handler) {
        this._removeHandler(this._eventHandlers, type, handler);
    }

    addActionHandler(type, handler, options = {}) {
        this._addHandler(this._actionHandlers, type, handler, options);
    }

    removeActionHandler(type, handler) {
        this._removeHandler(this._actionHandlers, type, handler);
    }

    addStoreHandler(type, handler, options = {}) {
        this._addHandler(this._storeHandlers, type, handler, options);
    }

    removeStoreHandler(type, handler) {
        this._removeHandler(this._storeHandlers, type, handler);
    }

    addViewHandler(type, handler, options = {}) {
        this._addHandler(this._viewHandlers, type, handler, options);
    }

    removeViewHandler(type, handler) {
        this._removeHandler(this._viewHandlers, type, handler);
    }

    dispatch(type, params = {}) {
        this._target.dispatchEvent(new CustomEvent(type, {detail: params}));
    }

    _addHandler(collection, type, handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }

        if (!this._eventHandlers.has(type)
            && !this._actionHandlers.has(type)
            && !this._storeHandlers.has(type)
            && !this._viewHandlers.has(type)
        ) {
            this._target.addEventListener(type, this._eventListener, false);
            this._states.set(type, {});
        }

        const handlers = collection.get(type) || new Map();
        handlers.set(handler, options);
        collection.set(type, handlers);
    }

    _removeHandler(collection, type, handler) {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }

        if (collection.has(type)) {
            const handlers = collection.get(type);
            if (handlers.has(handler)) {
                handlers.delete(handler);
                if (handlers.size) {
                    collection.set(type, handlers);
                }
                else {
                    collection.delete(type);
                }
            }
        }

        if (!this._eventHandlers.has(type)
            && !this._actionHandlers.has(type)
            && !this._storeHandlers.has(type)
            && !this._viewHandlers.has(type)
        ) {
            this._target.removeEventListener(type, this._eventListener, false);
            this._states.delete(type);
        }
    }

    async _handleEvent(type, params = {}) {
        try {
            const eventParams = this._defaultEventHandler(type, params);
            if (this._eventHandlers.has(type)) {
                Object.assign(
                    eventParams,
                    await this._callHandlers(this._eventHandlers, type, params)
                );
            }

            const actionState = this._defaultActionHandler(type, eventParams);
            if (this._actionHandlers.has(type)) {
                Object.assign(
                    actionState,
                    await this._callHandlers(this._actionHandlers, type, eventParams)
                );
            }

            const storeState = this._defaultStoreHandler(type, actionState);
            if (this._storeHandlers.has(type)) {
                Object.assign(
                    storeState,
                    await this._callHandlers(this._storeHandlers, type, actionState)
                );
            }

            const viewData = this._defaultViewHandler(type, storeState);
            if (this._viewHandlers.has(type)) {
                Object.assign(
                    viewData,
                    await this._callHandlers(this._viewHandlers, type, storeState)
                );
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    _defaultEventHandler(type, params = {}) {
        return params;
    }

    _defaultActionHandler(type, params = {}) {
        return {};
    }

    _defaultStoreHandler(type, state = {}) {
        this._states.set(type, state);
        return state;
    }

    _defaultViewHandler(type, state = {}) {
        return {};
    }

    async _callHandlers(collection, type, data = {}) {
        const handlers = collection.get(type);
        const promises = [];
        for (const [handler, options] of handlers) {
            if (typeof handler === 'function') {
                promises.push(new Promise((resolve) => {
                    // If registered handler has no return value,
                    // keep this promise with pending status so don't reach the next phase.
                    const value = handler(data, options);
                    if (value !== undefined) {
                        resolve(value);
                    }
                }));
            }
        }
        const values = await Promise.all(promises);
        const mergedData = {};
        for (const value of values) {
            Object.assign(mergedData, value);
        }
        return mergedData;
    }

}
