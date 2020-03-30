import {Dictionary} from './common.js';

interface StoreHandler {
    (store: Store, payload: any): void;
}

export default class Store {

    private _state: Dictionary<any>;
    private _handlerCollection: Map<string, StoreHandler>;

    constructor(state: Dictionary<any> = {}) {
        this._state = state;
        this._handlerCollection = new Map();
    }

    get state(): Dictionary<any> {
        return this._state;
    }

    setHandler(type: string, handler: StoreHandler): void {
        this._handlerCollection.set(type, handler);
    }

    removeHandler(type: string): void {
        this._handlerCollection.delete(type);
    }

    async dispatch(type: string, payload: any): Promise<void> {
        const handler = this._handlerCollection.get(type);
        if (handler) {
            await Promise.resolve(handler(this, payload));
        }
    }

}
