import { Dictionary } from './common.js';
export interface StateHandler {
    (data: Dictionary<any>, state: Dictionary<any>): Dictionary<any>;
}
export interface StateObserver {
    (state: Dictionary<any>): void;
}
export default class State {
    private _state;
    private _handler;
    private _observerCollection;
    constructor(state?: Dictionary<any>, handler?: StateHandler, observers?: Iterable<StateObserver>);
    get state(): Dictionary<any>;
    setHandler(handler: StateHandler): void;
    addObserver(observer: StateObserver): void;
    removeObserver(observer: StateObserver): void;
    update(data: Dictionary<any>): Promise<void>;
    private _defaultHandler;
}
