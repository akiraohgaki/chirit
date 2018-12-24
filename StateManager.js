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
        this._viewHandlers = new Map();

        this._listener = (event) => {
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
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }

        const handlers = this._eventHandlers.get(type) || new Map();
        handlers.set(handler, options);
        this._eventHandlers.set(type, handlers);
    }

    removeEventHandler(type, handler) {
        if (this._eventHandlers.has(type)) {
            const handlers = this._eventHandlers.get(type);
            if (handlers.has(handler)) {
                handlers.delete(handler);
                if (handlers.size) {
                    this._eventHandlers.set(type, handlers);
                }
                else {
                    this._eventHandlers.delete(type);
                }
            }
        }
    }

    addActionHandler(type, handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }

        const handlers = this._actionHandlers.get(type) || new Map();
        if (!handlers.size) {
            this._target.addEventListener(type, this._listener, false);
            //this._states.set(type, {});
        }
        handlers.set(handler, options);
        this._actionHandlers.set(type, handlers);
    }

    removeActionHandler(type, handler) {
        if (this._actionHandlers.has(type)) {
            const handlers = this._actionHandlers.get(type);
            if (handlers.has(handler)) {
                handlers.delete(handler);
                if (handlers.size) {
                    this._actionHandlers.set(type, handlers);
                }
                else {
                    this._actionHandlers.delete(type);
                    this._target.removeEventListener(type, this._listener, false);
                    //this._states.delete(type);
                }
            }
        }
    }

    addViewHandler(type, handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }

        const handlers = this._viewHandlers.get(type) || new Map();
        handlers.set(handler, options);
        this._viewHandlers.set(type, handlers);
    }

    removeViewHandler(type, handler) {
        if (this._viewHandlers.has(type)) {
            const handlers = this._viewHandlers.get(type);
            if (handlers.has(handler)) {
                handlers.delete(handler);
                if (handlers.size) {
                    this._viewHandlers.set(type, handlers);
                }
                else {
                    this._viewHandlers.delete(type);
                }
            }
        }
    }

    dispatch(type, params = {}) {
        this._target.dispatchEvent(new CustomEvent(type, {detail: params}));
    }

    async _handleEvent(type, params) {
        try {
            if (this._actionHandlers.has(type)) {
                const state = await this._callActions(type, params);
                if (this._viewHandlers.has(type)) {
                    //const state = await this._callViews(type, state);
                    this._callViews(type, state);
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    async _callActions(type, params) {
        const handlers = this._actionHandlers.get(type);
        const promises = [];
        for (const [handler, options] of handlers) {
            if (typeof handler === 'function') {
                promises.push(new Promise((resolve) => {
                    // If registered handler has no return value,
                    // keep this promise with pending status so don't reach the next phase.
                    const value = handler(params, options);
                    if (value !== undefined) {
                        resolve(value);
                    }
                }));
            }
        }
        const values = await Promise.all(promises);
        const state = {};
        for (const value of values) {
            Object.assign(state, value);
        }
        this._states.set(type, state);
        return state;
    }

    async _callViews(type, state) {
        const handlers = this._viewHandlers.get(type);
        const promises = [];
        for (const [handler, options] of handlers) {
            if (typeof handler === 'function') {
                promises.push(new Promise((resolve) => {
                    // If registered handler has no return value,
                    // keep this promise with pending status so don't reach the next phase.
                    const value = handler(state, options);
                    if (value !== undefined) {
                        resolve(value);
                    }
                }));
            }
        }
        const values = await Promise.all(promises);
        //const state = {};
        for (const value of values) {
            Object.assign(state, value);
        }
        return state;
    }

}
