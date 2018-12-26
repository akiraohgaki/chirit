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
        this.preAddHook = null;
        this.postRemoveHook = null;
    }

    add(type, handler, options = {}) {
        this.preAddHook(type);
        super.add(type, handler, options);
    }

    remove(type, handler) {
        super.remove(type, handler);
        this.postRemoveHook(type);
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

        this._storeHandler = new TypeHandler((state, options, type) => {
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

        const preAddHook = (type) => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._storeHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.addEventListener(type, eventListener, false);
                this._states.set(type, {});
            }
        };

        const postRemoveHook = (type) => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._storeHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.removeEventListener(type, eventListener, false);
                this._states.delete(type);
            }
        };

        this._eventHandler.preAddHook = preAddHook;
        this._eventHandler.postRemoveHook = postRemoveHook;

        this._actionHandler.preAddHook = preAddHook;
        this._actionHandler.postRemoveHook = postRemoveHook;

        this._storeHandler.preAddHook = preAddHook;
        this._storeHandler.postRemoveHook = postRemoveHook;

        this._viewHandler.preAddHook = preAddHook;
        this._viewHandler.postRemoveHook = postRemoveHook;
    }

    async _handleEvent(type, params = {}) {
        try {
            const eventParams = await this._eventHandler.call(type, params);
            if (eventParams) {
                const actionState = await this._actionHandler.call(type, eventParams);
                if (actionState) {
                    const storeState = await this._storeHandler.call(type, actionState);
                    if (storeState) {
                        this._viewHandler.call(type, storeState);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }

}
