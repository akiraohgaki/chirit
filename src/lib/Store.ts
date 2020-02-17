import {Dictionary} from './common.js';

export interface StoreHandler {
    (state: Dictionary<any>, payload: Dictionary<any>): void;
}

export interface StoreObserver {
    (state: Dictionary<any>): void;
}

type StoreCollection<T> = Map<string, Set<T>>;

export default class Store {

    private _state: Dictionary<any>;
    private _handlerCollection: StoreCollection<StoreHandler>;
    private _observerCollection: StoreCollection<StoreObserver>;

    constructor(state: Dictionary<any> = {}) {
        this._state = state;
        this._handlerCollection = new Map();
        this._observerCollection = new Map();
    }

    get state(): Dictionary<any> {
        return this._state;
    }

    addHandler(type: string, handler: StoreHandler): void {
        this._addCollectionItem(this._handlerCollection, type, handler);
    }

    removeHandler(type: string, handler: StoreHandler): void {
        this._removeCollectionItem(this._handlerCollection, type, handler);
    }

    addObserver(type: string, observer: StoreObserver): void {
        this._addCollectionItem(this._observerCollection, type, observer);
    }

    removeObserver(type: string, observer: StoreObserver): void {
        this._removeCollectionItem(this._observerCollection, type, observer);
    }

    dispatch(type: string, payload: Dictionary<any>): void {
        const handlers = this._handlerCollection.get(type);
        if (handlers) {
            for (const handler of handlers) {
                handler(this._state, payload);
            }
            this._notifyObservers(type);
        }
    }

    private _notifyObservers(type: string): void {
        const observers = this._observerCollection.get(type);
        if (observers) {
            for (const observer of observers) {
                observer(this._state);
            }
        }
    }

    private _addCollectionItem(collection: StoreCollection<any>, key: string, item: any): void {
        const items = collection.get(key);
        if (items) {
            items.add(item);
        }
        else {
            collection.set(key, new Set([item]));
        }
    }

    private _removeCollectionItem(collection: StoreCollection<any>, key: string, item: any): void {
        const items = collection.get(key);
        if (items) {
            items.delete(item);
            if (!items.size) {
                collection.delete(key);
            }
        }
    }

}
