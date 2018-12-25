/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class TypeHandler {

    constructor() {
        this._defaultType = '__default__';
        this._initialSet = new Map(); // [[handler, options]]
        this._collection = new Map(); // [[type, [[handler, options]]]]

        this.setInitial(() => {}, {});
        this.resetDefault();
    }

    setInitial(handler, options = {}) {
        this._checkHandlerType(handler);
        this._initialSet.clear();
        this._initialSet.set(handler, options);
        return this;
    }

    setDefault(handler, options = {}) {
        this._checkHandlerType(handler);
        const defaultSet = new Map();
        defaultSet.set(handler, options);
        this._collection.set(this._defaultType, defaultSet);
        return this;
    }

    resetDefault() {
        this._collection.set(this._defaultType, this._initialSet);
        return this;
    }

    add(type, handler, options = {}) {
        this._checkHandlerType(handler);
        const handlers = this._collection.get(type) || new Map();
        handlers.set(handler, options);
        this._collection.set(type, handlers);
        return this;
    }

    remove(type, handler) {
        this._checkHandlerType(handler);
        if (this._collection.has(type)) {
            const handlers = this._collection.get(type);
            if (handlers.has(handler)) {
                handlers.delete(handler);
                if (handlers.size) {
                    this._collection.set(type, handlers);
                }
                else {
                    this._collection.delete(type);
                }
            }
        }
        return this;
    }

    has(type) {
        return this._collection.has(type);
    }

    async call(type, data = {}) {
        // Handlers wrapped with Promise and called within Promise.all()
        // (data, options, type) => {
        //     // All return values in the same type will combined
        //     return {};
        //     // Stop the combine process and return undefined
        //     return false;
        // }

        if (!this._collection.has(type)) {
            return;
        }

        const promises = [];

        const defaultSet = this._collection.get(this._defaultType);
        const [handler, options] = defaultSet.entries().next().value;
        promises.push(new Promise((resolve) => {
            resolve(handler(data, options, type));
        }));

        const handlers = this._collection.get(type);
        for (const [handler, options] of handlers) {
            promises.push(new Promise((resolve) => {
                resolve(handler(data, options, type));
            }));
        }

        const values = await Promise.all(promises);

        if (values.includes(false)) {
            return;
        }

        const combineData = {};
        for (const value of values) {
            Object.assign(combineData, value);
        }
        return combineData;
    }

    _checkHandlerType(handler) {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }
    }

}
