import {Dictionary} from './common.js';
import Observable from './Observable.js';

interface StoreHandler {
    (state: Dictionary<any>, payload: Dictionary<any>): void;
}

interface StoreObserver {
    (state: Dictionary<any>): void;
}

export default class Store {

    private _state: Dictionary<any>;
    private _handlerCollection: Map<string, StoreHandler>;
    private _observable: Observable;
    private _stateChangedKeyCollection: Set<string>;

    constructor(state: Dictionary<any> = {}) {
        this._state = this._createStateProxy(state);
        this._handlerCollection = new Map();
        this._observable = new Observable();
        this._stateChangedKeyCollection = new Set();

        this._notifyHandler = this._notifyHandler.bind(this);
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

    subscribe(observer: StoreObserver, steteKeys: Array<string> = []): void {
        this._observable.subscribe(observer, steteKeys);
    }

    unsubscribe(observer: StoreObserver): void {
        this._observable.unsubscribe(observer);
    }

    async dispatch(type: string, payload: Dictionary<any>): Promise<void> {
        const handler = this._handlerCollection.get(type);
        if (handler) {
            await Promise.resolve(handler(this._state, payload));

            if (this._stateChangedKeyCollection.size) {
                this._observable.notify(this._state, this._notifyHandler);
                this._stateChangedKeyCollection.clear();
            }
        }
    }

    private _createStateProxy(state: Dictionary<any>): Dictionary<any> {
        return new Proxy(state, {
            set: (target, key, value) => {
                if (typeof key === 'string') {
                    target[key] = value;
                    this._stateChangedKeyCollection.add(key);
                    return true;
                }
                return false;
            }
        });
    }

    private _notifyHandler(state: Dictionary<any>, observer: StoreObserver, stateKeys: Array<string>): void {
        if (stateKeys.length) {
            for (const key of stateKeys) {
                if (this._stateChangedKeyCollection.has(key)) {
                    observer(state);
                    break;
                }
            }
        }
        else {
            observer(state);
        }
    }

}
