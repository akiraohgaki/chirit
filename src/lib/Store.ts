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
    private _observableCollection: Map<string, Observable>;

    constructor(state: Dictionary<any> = {}) {
        this._state = state;
        this._handlerCollection = new Map();
        this._observableCollection = new Map();
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

    addObserver(type: string, observer: StoreObserver): void {
        const observable = this._observableCollection.get(type);
        if (observable) {
            observable.addObserver(observer);
        }
        else {
            this._observableCollection.set(type, new Observable([observer]));
        }
    }

    removeObserver(type: string, observer: StoreObserver): void {
        const observable = this._observableCollection.get(type);
        if (observable) {
            observable.removeObserver(observer);
            if (!observable.size) {
                this._observableCollection.delete(type);
            }
        }
    }

    dispatch(type: string, payload: Dictionary<any>): void {
        const handler = this._handlerCollection.get(type);
        if (handler) {
            handler(this._state, payload);

            const observable = this._observableCollection.get(type);
            if (observable) {
                observable.notifyObservers(this._state);
            }
        }
    }

}
