/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Handler {

    constructor(handler) {
        // handler:
        // (data = {}, type = '') => {
        //     return {};
        // }

        this._initialHandlerCollection = new Set(); // [handler]
        this._defaultHandlerCollection = new Set(); // [handler]
        this._typeHandlerCollections = new Map(); // [[type, [handler]]]

        this._initialHandlerCollection.add(handler);
        this.resetDefault();
    }

    setDefault(handler) {
        this._checkTypeOfHandler(handler);
        this._defaultHandlerCollection.clear();
        this._defaultHandlerCollection.add(handler);
        return this;
    }

    resetDefault() {
        const handler = this._initialHandlerCollection.values().next().value;
        this.setDefault(handler);
        return this;
    }

    add(type, handler) {
        this._checkTypeOfHandler(handler);
        const typeHandlerCollection = this._typeHandlerCollections.get(type) || new Set();
        if (!typeHandlerCollection.has(handler)) {
            typeHandlerCollection.add(handler);
            this._typeHandlerCollections.set(type, typeHandlerCollection);
        }
        return this;
    }

    remove(type, handler) {
        this._checkTypeOfHandler(handler);
        if (this._typeHandlerCollections.has(type)) {
            const typeHandlerCollection = this._typeHandlerCollections.get(type);
            if (typeHandlerCollection.has(handler)) {
                typeHandlerCollection.delete(handler);
                if (typeHandlerCollection.size) {
                    this._typeHandlerCollections.set(type, typeHandlerCollection);
                }
                else {
                    this._typeHandlerCollections.delete(type);
                }
            }
        }
        return this;
    }

    has(type) {
        return this._typeHandlerCollections.has(type);
    }

    async invoke(data = {}, type = '') {
        // This function make registered handlers wrapped into Promise and Promise.all().
        // And all return values of the handlers in the same type will combine finally, and return value as object.
        // If any handler returned false, will not values combine, and return value as null.

        const promises = [];

        const handler = this._defaultHandlerCollection.values().next().value;
        promises.push(new Promise((resolve) => {
            resolve(handler(data, type));
        }));

        if (type && this._typeHandlerCollections.has(type)) {
            const typeHandlerCollection = this._typeHandlerCollections.get(type);
            for (const handler of typeHandlerCollection) {
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
