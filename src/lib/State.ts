import {Dictionary} from './common.js';

export interface StateHandler {
    (data: Dictionary<any>): Dictionary<any>;
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
        const newData = await Promise.resolve(this._handler(data));
        this._data = {...this._data, ...newData};
    }

    private _defaultHandler(data: Dictionary<any>): Dictionary<any> {
        return data;
    }

}
