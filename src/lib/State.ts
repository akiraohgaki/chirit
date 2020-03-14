import {Dictionary} from './common.js';

export default class State {

    private _json: string;
    private _jsonCollection: Map<string, string>;
    private _handler: ProxyHandler<Dictionary<any>>;

    constructor(state: Dictionary<any> = {}, handler: ProxyHandler<Dictionary<any>> = {}) {
        this._json = JSON.stringify(state);
        this._jsonCollection = new Map();
        this._handler = handler;
    }

    commit(state: Dictionary<any>): void {
        this._merge(this.clone(), state);
    }

    clone(): Dictionary<any> {
        return JSON.parse(this._json);
    }

    createVersion(version: string): void {
        this._jsonCollection.set(version, this._json);
    }

    deleteVersion(version: string): boolean {
        return this._jsonCollection.delete(version);
    }

    cloneFromVersion(version: string): Dictionary<any> | null {
        const json = this._jsonCollection.get(version);
        if (json) {
            return JSON.parse(json);
        }
        return null;
    }

    revertToVersion(version: string): boolean {
        const state = this.cloneFromVersion(version);
        if (state) {
            this._merge({}, state);
            return true;
        }
        return false;
    }

    versions(): Array<string> {
        return Array.from(this._jsonCollection.keys());
    }

    private _merge(oldState: Dictionary<any>, newState: Dictionary<any>): void {
        const proxy = new Proxy(oldState, this._handler);
        Object.assign(proxy, newState);
        this._json = JSON.stringify(proxy);
    }

}
