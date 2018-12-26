/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Handler {

    constructor(handler, options = {}) {
        // handler:
        // (data, type) => {
        //     return {};
        // }
        //
        // options:
        // Maybe use it for something control in the future

        this._initialHandlerCollection = new Map(); // [[handler, options]]
        this._defaultHandlerCollection = new Map(); // [[handler, options]]
        this._typeHandlersCollection = new Map(); // [[type, [[handler, options]]]]

        this._initialHandlerCollection.set(handler, options);
        this.resetDefault();
    }

    setDefault(handler, options = {}) {
        this._checkTypeOfHandler(handler);
        this._defaultHandlerCollection.clear();
        this._defaultHandlerCollection.set(handler, options);
        return this;
    }

    resetDefault() {
        const [handler, options] = this._initialHandlerCollection.entries().next().value;
        this.setDefault(handler, options);
        return this;
    }

    add(type, handler, options = {}) {
        this._checkTypeOfHandler(handler);
        const typeHandlerCollection = this._typeHandlersCollection.get(type) || new Map();
        typeHandlerCollection.set(handler, options);
        this._typeHandlersCollection.set(type, typeHandlerCollection);
        return this;
    }

    remove(type, handler) {
        this._checkTypeOfHandler(handler);
        if (this._typeHandlersCollection.has(type)) {
            const typeHandlerCollection = this._typeHandlersCollection.get(type);
            if (typeHandlerCollection.has(handler)) {
                typeHandlerCollection.delete(handler);
                if (typeHandlerCollection.size) {
                    this._typeHandlersCollection.set(type, typeHandlerCollection);
                }
                else {
                    this._typeHandlersCollection.delete(type);
                }
            }
        }
        return this;
    }

    has(type) {
        return this._typeHandlersCollection.has(type);
    }

    async call(type = '', data = {}) {
        // This function make registered handlers wrapped into Promise and Promise.all().
        // And all return values of the handlers in the same type will combine finally, and return value as object.
        // If any handler returned false, will not values combine, and return value as null.

        const promises = [];

        //const [handler, options] = this._defaultHandlerCollection.entries().next().value;
        const [handler] = this._defaultHandlerCollection.entries().next().value;
        promises.push(new Promise((resolve) => {
            resolve(handler(data, type));
        }));

        if (type && this._typeHandlersCollection.has(type)) {
            const typeHandlerCollection = this._typeHandlersCollection.get(type);
            //for (const [handler, options] of typeHandlerCollection) {
            for (const [handler] of typeHandlerCollection) {
                promises.push(new Promise((resolve) => {
                    resolve(handler(data, type));
                }));
            }
        }

        const values = await Promise.all(promises);

        if (values.includes(false)) {
            return null;
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
