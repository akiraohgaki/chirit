/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Handler {

    constructor() {
        this._defaultType = `default_${Math.random()}`;
        this._initialHandlerCollection = new Map(); // [[handler, options]]
        this._handlerCollection = new Map(); // [[type, [[handler, options]]]]

        this.setInitial(() => {}, {});
        this.resetDefault();
    }

    setInitial(handler, options = {}) {
        this._checkTypeOfHandler(handler);
        this._initialHandlerCollection.clear();
        this._initialHandlerCollection.set(handler, options);
        return this;
    }

    setDefault(handler, options = {}) {
        this._checkTypeOfHandler(handler);
        const defaultHandlerCollection = new Map();
        defaultHandlerCollection.set(handler, options);
        this._handlerCollection.set(this._defaultType, defaultHandlerCollection);
        return this;
    }

    resetDefault() {
        this._handlerCollection.set(this._defaultType, this._initialHandlerCollection);
        return this;
    }

    add(type, handler, options = {}) {
        this._checkTypeOfHandler(handler);
        const typeHandlerCollection = this._handlerCollection.get(type) || new Map();
        typeHandlerCollection.set(handler, options);
        this._handlerCollection.set(type, typeHandlerCollection);
        return this;
    }

    remove(type, handler) {
        this._checkTypeOfHandler(handler);
        if (this._handlerCollection.has(type)) {
            const typeHandlerCollection = this._handlerCollection.get(type);
            if (typeHandlerCollection.has(handler)) {
                typeHandlerCollection.delete(handler);
                if (typeHandlerCollection.size) {
                    this._handlerCollection.set(type, typeHandlerCollection);
                }
                else {
                    this._handlerCollection.delete(type);
                }
            }
        }
        return this;
    }

    has(type) {
        return this._handlerCollection.has(type);
    }

    async call(type, data = {}) {
        // This function make registered handlers wrapped into Promise and Promise.all().
        // And all return values of the handlers in the same type will combine finally, and return value as object.
        // If any handler returned false, will not values combine, and return value as undefined.

        // Handler:
        // (data, options, type) => {
        //     return {};
        // }

        if (!this._handlerCollection.has(type)) {
            return;
        }

        const promises = [];

        const defaultHandlerCollection = this._handlerCollection.get(this._defaultType);
        const [handler, options] = defaultHandlerCollection.entries().next().value;
        promises.push(new Promise((resolve) => {
            resolve(handler(data, options, type));
        }));

        const typeHandlerCollection = this._handlerCollection.get(type);
        for (const [handler, options] of typeHandlerCollection) {
            promises.push(new Promise((resolve) => {
                resolve(handler(data, options, type));
            }));
        }

        const values = await Promise.all(promises);

        if (values.includes(false)) {
            return;
        }

        const combinedData = {};
        for (const value of values) {
            Object.assign(combinedData, value);
        }
        return combinedData;
    }

    _checkTypeOfHandler(handler) {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }
    }

}
