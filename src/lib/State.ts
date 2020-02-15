import {Dictionary} from './common.js';

export interface StateHandler {
    (data: Dictionary<any>, state: Dictionary<any>): Dictionary<any>;
}

export interface StateObserver {
    (state: Dictionary<any>): void;
}

export default class State {

    private _state: Dictionary<any>;
    private _handler: StateHandler;
    private _observerCollection: Set<StateObserver>;

    constructor(state?: Dictionary<any>, handler?: StateHandler, observers?: Iterable<StateObserver>) {
        this._state = state || {};
        this._handler = handler || this._defaultHandler;
        this._observerCollection = new Set(observers);
    }

    getState(): Dictionary<any> {
        return this._state;
    }

    setHandler(handler: StateHandler): void {
        this._handler = handler;
    }

    addObserver(observer: StateObserver): void {
        this._observerCollection.add(observer);
    }

    deleteObserver(observer: StateObserver): boolean {
        return this._observerCollection.delete(observer);
    }

    async update(data: Dictionary<any>): Promise<void> {
        this._state = await Promise.resolve(this._handler(data, this._state));
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(this._state);
            }
        }
    }

    private _defaultHandler(data: Dictionary<any>): Dictionary<any> {
        return data;
    }

}
