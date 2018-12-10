/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class StateManager {

    constructor(element) {
        // "element" should be Element object or selector string
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        this._target = element || document;
        this._listener = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.dispatch(event.type, event.detail);
        };

        this._states = new Map();
        this._actionTypes = new Map();
        this._viewTypes = new Map();
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

    registerAction(type, action, options) {
        const actions = this._actionTypes.has(type) ? this._actionTypes.get(type) : new Map();
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

    registerView(type, view, options) {
        const views = this._viewTypes.has(type) ? this._viewTypes.get(type) : new Map();
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

    dispatch(type, params) {
        if (!this._actionTypes.has(type)) {
            console.error(new Error(`No actions for type "${type}"`));
            return;
        }

        const actions = this._actionTypes.get(type);
        const promises = [];
        for (const [action, options] of actions) {
            promises.push(new Promise((resolve, reject) => {
                action(resolve, reject, params, options);
            }));
        }

        Promise.all(promises)
            .then((values) => {
                const state = {};
                for (const value of values) {
                    Object.assign(state, value);
                }
                this._states.set(type, state);
                return state;
            })
            .then((state) => {
                if (!this._viewTypes.has(type)) {
                    console.log(`No views for type "${type}"`); // This case is not error
                    return;
                }
                const views = this._viewTypes.get(type);
                for (const [view, options] of views) {
                    view(state, options);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

}
