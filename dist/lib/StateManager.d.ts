import { DataDict } from './common.js';
import Handler from './Handler.js';
declare type StateCollection = Map<string, DataDict>;
export default class StateManager {
    private _target;
    private _state;
    private _eventHandler;
    private _actionHandler;
    private _stateHandler;
    private _viewHandler;
    constructor(target?: EventTarget | string);
    get target(): EventTarget;
    get state(): StateCollection;
    get eventHandler(): Handler;
    get actionHandler(): Handler;
    get stateHandler(): Handler;
    get viewHandler(): Handler;
    dispatch(type: string, data?: DataDict): boolean;
    private _eventListener;
    private _handlerBeforeAddCallback;
    private _handlerAfterRemoveCallback;
    private _invokeHandlers;
}
export {};
