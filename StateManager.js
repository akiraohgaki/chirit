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
        this._actionTypes = new Map();
        this._viewTypes = new Map();

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

    registerAction(type, action, options = {}) {
        const actions = this._actionTypes.get(type) || new Map();
        if (!actions.size) {
            this._states.set(type, {});
            this._target.addEventListener(type, this._listener, false);
        }
        actions.set(action, options);
        this._actionTypes.set(type, actions);
    }

    unregisterAction(type, action) {
        if (this._actionTypes.has(type)) {
            const actions = this._actionTypes.get(type);
            if (actions.has(action)) {
                actions.delete(action);
                if (actions.size) {
                    this._actionTypes.set(type, actions);
                }
                else {
                    this._actionTypes.delete(type);
                    this._states.delete(type);
                    this._target.removeEventListener(type, this._listener, false);
                }
            }
        }
    }

    registerView(type, view, options = {}) {
        const views = this._viewTypes.get(type) || new Map();
        views.set(view, options);
        this._viewTypes.set(type, views);
    }

    unregisterView(type, view) {
        if (this._viewTypes.has(type)) {
            const views = this._viewTypes.get(type);
            if (views.has(view)) {
                views.delete(view);
                if (views.size) {
                    this._viewTypes.set(type, views);
                }
                else {
                    this._viewTypes.delete(type);
                }
            }
        }
    }

    dispatch(type, params = {}) {
        this._target.dispatchEvent(new CustomEvent(type, {detail: params}));
    }

    _handleEvent(type, params) {
        new Promise((resolve) => {
            resolve(this._callActions(type, params));
        })
        .then((state) => {
            this._callViews(type, state);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    _callActions(type, params) {
        if (!this._actionTypes.has(type)) {
            throw new Error(`Undefined action type "${type}"`);
        }

        const actions = this._actionTypes.get(type);
        const promises = [];
        for (const [action, options] of actions) {
            promises.push(new Promise((resolve) => {
                resolve(action(params, options));
            }));
        }

        return Promise.all(promises).then((values) => {
            const state = {};
            for (const value of values) {
                Object.assign(state, value);
            }
            this._states.set(type, state);
            return state;
        });
    }

    _callViews(type, state) {
        if (!this._viewTypes.has(type)) {
            return;
        }

        const views = this._viewTypes.get(type);
        const promises = [];
        for (const [view, options] of views) {
            promises.push(new Promise((resolve) => {
                resolve(view(state, options));
            }));
        }

        Promise.all(promises);
    }

}
