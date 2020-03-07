import {Dictionary} from './common.js';

export default class State {

    private _state: Dictionary<any>;
    private _stateProxy: Dictionary<any>;
    private _stateJson: string;
    private _stateJsonCollection: Map<string, string>;

    constructor(state: Dictionary<any>, handler?: ProxyHandler<Dictionary<any>>) {
        this._state = state;
        this._stateProxy = new Proxy(this._state, handler || {});
        this._stateJson = JSON.stringify(this._state);
        this._stateJsonCollection = new Map();
    }

    commit(state: Dictionary<any>, tag?: string): void {
        Object.assign(this._stateProxy, state);
        this._stateJson = JSON.stringify(this._state);
        if (tag) {
            this._stateJsonCollection.set(tag, this._stateJson);
        }
    }

    checkout(tag?: string): Dictionary<any> | null {
        if (tag) {
            const stateJson = this._stateJsonCollection.get(tag);
            if (stateJson) {
                return JSON.parse(stateJson);
            }
            return null;
        }
        return JSON.parse(this._stateJson);
    }

    tags(): Array<string> {
        return Array.from(this._stateJsonCollection.keys());
    }

}
