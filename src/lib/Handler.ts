import {Dictionary} from './common.js';

interface HandlerFunction {
    (data: Dictionary<any>, type: string): Dictionary<any> | boolean;
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
        return this.setDefault(this._initialHandler);
    }

    setDefault(handler: HandlerFunction): this {
        this._defaultHandler = handler;
        this.defaultChangedCallback(handler);
        return this;
    }

    add(type: string, handler: HandlerFunction): this {
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

    has(type: string): boolean {
        return this._typeHandlersCollection.has(type);
    }

    async invoke(data: Dictionary<any> = {}, type: string = ''): Promise<Dictionary<any> | null> {
        // Wrap registered handlers with Promise and call those promises by Promise.all()
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

        // Combine all return values of handlers into single object
        // If any handlers returned false, this function will return null
        if (values.includes(false)) {
            return null;
        }

        const combinedData = {};
        for (const value of values) {
            Object.assign(combinedData, value);
        }
        return combinedData;
    }

    defaultChangedCallback(_handler: HandlerFunction): void {}

    beforeAddCallback(_type: string, _handler: HandlerFunction): void {}

    afterAddCallback(_type: string, _handler: HandlerFunction): void {}

    beforeRemoveCallback(_type: string, _handler: HandlerFunction): void {}

    afterRemoveCallback(_type: string, _handler: HandlerFunction): void {}

}