import {Dictionary} from './common.js';

export interface StateHandler {
    (data: Dictionary<any>, currentData: Dictionary<any>): Dictionary<any>;
}

export default class State {

    private _data: Dictionary<any>;
    private _handler: StateHandler;

    constructor(data?: Dictionary<any>, handler?: StateHandler) {
        this._data = data || {};
        this._handler = handler || this._defaultHandler;
    }

    get data(): Dictionary<any> {
        return this._data;
    }

    async update(data: Dictionary<any>): Promise<void> {
        this._data = await Promise.resolve(this._handler(data, this._data));
    }

    private _defaultHandler(data: Dictionary<any>): Dictionary<any> {
        return data;
    }

}
