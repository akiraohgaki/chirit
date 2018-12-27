/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

import Handler from './Handler.js';

class TypeHandler extends Handler {

    constructor(handler, options = {}) {
        super(handler, options);
        this.beforeAddHook = null;
        this.afterRemoveHook = null;
    }

    add(type, handler, options = {}) {
        this.beforeAddHook(type);
        super.add(type, handler, options);
        return this;
    }

    remove(type, handler) {
        super.remove(type, handler);
        this.afterRemoveHook(type);
        return this;
    }

}

export default class StateManager {

    constructor(target) {
        // "target" should be Element object or selector string
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }

        this._target = target || document;
        this._states = new Map();

        this._eventHandler = null;
        this._actionHandler = null;
        this._storeHandler = null;
        this._viewHandler = null;

        this._setupHandlers();
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

    get eventHandler() {
        return this._eventHandler;
    }

    get actionHandler() {
        return this._actionHandler;
    }

    get storeHandler() {
        return this._storeHandler;
    }

    get viewHandler() {
        return this._viewHandler;
    }

    dispatch(type, params = {}) {
        this._target.dispatchEvent(new CustomEvent(type, {detail: params}));
    }

    _setupHandlers() {
        this._eventHandler = new TypeHandler((params) => {
            return params;
        });

        this._actionHandler = new TypeHandler(() => {
            return {};
        });

        this._storeHandler = new TypeHandler((state, type) => {
            this._states.set(type, state);
            return state;
        });

        this._viewHandler = new TypeHandler(() => {
            return {};
        });

        const eventListener = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this._handleEvent(event.type, event.detail);
        };

        const beforeAddHook = (type) => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._storeHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.addEventListener(type, eventListener, false);
                this._states.set(type, {});
            }
        };

        const afterRemoveHook = (type) => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._storeHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.removeEventListener(type, eventListener, false);
                this._states.delete(type);
            }
        };

        this._eventHandler.beforeAddHook = beforeAddHook;
        this._eventHandler.afterRemoveHook = afterRemoveHook;

        this._actionHandler.beforeAddHook = beforeAddHook;
        this._actionHandler.afterRemoveHook = afterRemoveHook;

        this._storeHandler.beforeAddHook = beforeAddHook;
        this._storeHandler.afterRemoveHook = afterRemoveHook;

        this._viewHandler.beforeAddHook = beforeAddHook;
        this._viewHandler.afterRemoveHook = afterRemoveHook;
    }

    async _handleEvent(type, params = {}) {
        try {
            const passedParams = await this._eventHandler.call(params, type);
            if (!passedParams) {
                return;
            }
            const state = await this._actionHandler.call(passedParams, type);
            if (!state) {
                return;
            }
            const passedState = await this._storeHandler.call(state, type);
            if (!passedState) {
                return;
            }
            //const data = await this._viewHandler.call(passedState, type);
            this._viewHandler.call(passedState, type);
        }
        catch (error) {
            console.error(error);
        }
    }

}
