export default class Handler {
    constructor(handler) {
        this._initialHandler = handler;
        this._defaultHandler = this._initialHandler;
        this._typeHandlersCollection = new Map();
    }
    resetDefault() {
        return this.setDefault(this._initialHandler);
    }
    setDefault(handler) {
        this._defaultHandler = handler;
        this.defaultChangedCallback(handler);
        return this;
    }
    add(type, handler) {
        this.beforeAddCallback(type, handler);
        const typeHandlers = this._typeHandlersCollection.get(type) || new Set();
        if (!typeHandlers.has(handler)) {
            typeHandlers.add(handler);
            this._typeHandlersCollection.set(type, typeHandlers);
            this.afterAddCallback(type, handler);
        }
        return this;
    }
    remove(type, handler) {
        this.beforeRemoveCallback(type, handler);
        const typeHandlers = this._typeHandlersCollection.get(type);
        if (typeHandlers && typeHandlers.has(handler)) {
            typeHandlers.delete(handler);
            if (typeHandlers.size) {
                this._typeHandlersCollection.set(type, typeHandlers);
            }
            else {
                this._typeHandlersCollection.delete(type);
            }
            this.afterRemoveCallback(type, handler);
        }
        return this;
    }
    has(type) {
        return this._typeHandlersCollection.has(type);
    }
    async invoke(data = {}, type = '') {
        const promises = [];
        promises.push(new Promise((resolve) => {
            resolve(this._defaultHandler(data, type));
        }));
        if (type) {
            const typeHandlers = this._typeHandlersCollection.get(type);
            if (typeHandlers) {
                for (const handler of typeHandlers) {
                    promises.push(new Promise((resolve) => {
                        resolve(handler(data, type));
                    }));
                }
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
    defaultChangedCallback(_handler) { }
    beforeAddCallback(_type, _handler) { }
    afterAddCallback(_type, _handler) { }
    beforeRemoveCallback(_type, _handler) { }
    afterRemoveCallback(_type, _handler) { }
}
//# sourceMappingURL=Handler.js.map