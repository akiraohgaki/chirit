interface HandlerFunction {
    (data: any, type: string): any
}

export default class Handler {

    private _initialHandler: HandlerFunction;
    private _defaultHandler: HandlerFunction;
    private _typeHandlersCollection: Map<string, Set<HandlerFunction>>;

    constructor(handler: HandlerFunction) {
        this._initialHandler = handler;
        this._defaultHandler = this._initialHandler;
        this._typeHandlersCollection = new Map();
    }

    resetDefault(): this {
        this.setDefault(this._initialHandler);
        return this;
    }

    setDefault(handler: HandlerFunction): this {
        //this._checkTypeOfHandler(handler);
        this._defaultHandler = handler;
        this.defaultChangedCallback(handler);
        return this;
    }

    add(type: string, handler: HandlerFunction): this {
        //this._checkTypeOfHandler(handler);
        this.beforeAddCallback(type, handler);
        const typeHandlers = this._typeHandlersCollection.get(type) || new Set();
        if (!typeHandlers.has(handler)) {
            typeHandlers.add(handler);
            this._typeHandlersCollection.set(type, typeHandlers);
            this.afterAddCallback(type, handler);
        }
        return this;
    }

    remove(type: string, handler: HandlerFunction): this {
        //this._checkTypeOfHandler(handler);
        this.beforeRemoveCallback(type, handler);
        const typeHandlers = this._typeHandlersCollection.get(type);
        if (typeHandlers && typeHandlers.delete(handler)) {
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

    has(type: string): boolean {
        return this._typeHandlersCollection.has(type);
    }

    async invoke(data: any = {}, type: string = ''): Promise<object | null> {
        // This function will wrap and call registered handlers with Promise and Promise.all().
        // And all return values of the same type of handlers will be combined in object finally.
        // If any handler returned false, will not combine values and return null.

        const promises = [];

        promises.push(new Promise((resolve) => {
            resolve(this._defaultHandler(data, type));
        }));

        const typeHandlers = this._typeHandlersCollection.get(type);
        if (typeHandlers) {
            for (const handler of typeHandlers) {
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

    defaultChangedCallback(handler: HandlerFunction): void {}

    beforeAddCallback(type: string, handler: HandlerFunction): void {}

    afterAddCallback(type: string, handler: HandlerFunction): void {}

    beforeRemoveCallback(type: string, handler: HandlerFunction): void {}

    afterRemoveCallback(type: string, handler: HandlerFunction): void {}

    /*private _checkTypeOfHandler(handler: HandlerFunction): void {
        if (typeof handler !== 'function') {
            throw new TypeError(`"${handler}" is not a function`);
        }
    }*/

}
