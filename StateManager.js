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

    constructor(handler) {
        super(handler);
        this.beforeAddHook = null;
        this.afterRemoveHook = null;
    }

    add(type, handler) {
        this.beforeAddHook(type);
        super.add(type, handler);
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
        this._eventListener = this._eventListener.bind(this);
        this._state = new Map();

        this._eventHandler = null;
        this._actionHandler = null;
        this._stateHandler = null;
        this._viewHandler = null;

        this._setupHandlers();
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

    dispatch(type, params = {}) {
        this._target.dispatchEvent(new CustomEvent(type, {detail: params}));
    }

    _eventListener(event) {
        event.preventDefault();
        event.stopPropagation();
        this._callHandlers(event.detail, event.type);
    }

    _setupHandlers() {
        this._eventHandler = new TypeHandler((params) => {
            return params;
        });

        this._actionHandler = new TypeHandler(() => {
            return {};
        });

        this._stateHandler = new TypeHandler((state, type) => {
            this._state.set(type, state);
            return state;
        });

        this._viewHandler = new TypeHandler(() => {
            return {};
        });

        const beforeAddHook = (type) => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._stateHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.addEventListener(type, this._eventListener, false);
                this._state.set(type, {});
            }
        };

        const afterRemoveHook = (type) => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._stateHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.removeEventListener(type, this._eventListener, false);
                this._state.delete(type);
            }
        };

        this._eventHandler.beforeAddHook = beforeAddHook;
        this._eventHandler.afterRemoveHook = afterRemoveHook;

        this._actionHandler.beforeAddHook = beforeAddHook;
        this._actionHandler.afterRemoveHook = afterRemoveHook;

        this._stateHandler.beforeAddHook = beforeAddHook;
        this._stateHandler.afterRemoveHook = afterRemoveHook;

        this._viewHandler.beforeAddHook = beforeAddHook;
        this._viewHandler.afterRemoveHook = afterRemoveHook;
    }

    async _callHandlers(params, type) {
        try {
            const passedParams = await this._eventHandler.call(params, type);
            if (!passedParams) {
                return;
            }
            const state = await this._actionHandler.call(passedParams, type);
            if (!state) {
                return;
            }
            const passedState = await this._stateHandler.call(state, type);
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
