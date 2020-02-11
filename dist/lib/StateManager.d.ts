import { Dictionary } from './common.js';
import Handler from './Handler.js';
declare type StateManagerStateCollection = Map<string, Dictionary<any>>;
export default class StateManager {
    private _target;
    private _stateCollection;
    private _eventHandler;
    private _actionHandler;
    private _stateHandler;
    private _viewHandler;
    constructor(target: EventTarget);
    get target(): EventTarget;
    get state(): StateManagerStateCollection;
    get eventHandler(): Handler;
    get actionHandler(): Handler;
    get stateHandler(): Handler;
    get viewHandler(): Handler;
    invokeHandlers(type: string, data?: Dictionary<any>): Promise<void>;
    private _eventListener;
    private _handlerBeforeAddCallback;
    private _handlerAfterRemoveCallback;
}
export {};
