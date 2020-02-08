import {Dictionary} from './common.js';
import Handler from './Handler.js';

type StateManagerStateCollection = Map<string, Dictionary<any>>;

export default class StateManager {

    private _target: EventTarget;
    private _stateCollection: StateManagerStateCollection;
    private _eventHandler: Handler;
    private _actionHandler: Handler;
    private _stateHandler: Handler;
    private _viewHandler: Handler;

    constructor(target: EventTarget) {
        this._target = target;
        this._stateCollection = new Map();

        this._eventHandler = new Handler((data) => {
            return data;
        });

        this._actionHandler = new Handler(() => {
            return {};
        });

        this._stateHandler = new Handler((data, type) => {
            this._stateCollection.set(type, data);
            return data;
        });

        this._viewHandler = new Handler(() => {
            return {};
        });

        this._eventListener = this._eventListener.bind(this);
        this._handlerBeforeAddCallback = this._handlerBeforeAddCallback.bind(this);
        this._handlerAfterRemoveCallback = this._handlerAfterRemoveCallback.bind(this);

        this._eventHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._eventHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;

        this._actionHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._actionHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;

        this._stateHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._stateHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;

        this._viewHandler.beforeAddCallback = this._handlerBeforeAddCallback;
        this._viewHandler.afterRemoveCallback = this._handlerAfterRemoveCallback;
    }

    get target(): EventTarget {
        return this._target;
    }

    get state(): StateManagerStateCollection {
        return this._stateCollection;
    }

    get eventHandler(): Handler {
        return this._eventHandler;
    }

    get actionHandler(): Handler {
        return this._actionHandler;
    }

    get stateHandler(): Handler {
        return this._stateHandler;
    }

    get viewHandler(): Handler {
        return this._viewHandler;
    }

    dispatch(type: string, data: Dictionary<any> = {}): boolean {
        return this._target.dispatchEvent(new CustomEvent(type, {detail: data}));
    }

    private _eventListener(event: CustomEvent<Dictionary<any>>): void {
        event.preventDefault();
        event.stopPropagation();
        this._invokeHandlers(event.detail, event.type);
    }

    private _handlerBeforeAddCallback(type: string): void {
        if (!this._eventHandler.has(type)
            && !this._actionHandler.has(type)
            && !this._stateHandler.has(type)
            && !this._viewHandler.has(type)
        ) {
            this._target.addEventListener(type, this._eventListener as EventListener, false);
            this._stateCollection.set(type, {});
        }
    }

    private _handlerAfterRemoveCallback(type: string): void {
        if (!this._eventHandler.has(type)
            && !this._actionHandler.has(type)
            && !this._stateHandler.has(type)
            && !this._viewHandler.has(type)
        ) {
            this._target.removeEventListener(type, this._eventListener as EventListener, false);
            this._stateCollection.delete(type);
        }
    }

    private async _invokeHandlers(data: Dictionary<any>, type: string): Promise<void> {
        try {
            const eventRusult = await this._eventHandler.invoke(data, type);
            if (!eventRusult) {
                return;
            }
            const actionResult = await this._actionHandler.invoke(eventRusult, type);
            if (!actionResult) {
                return;
            }
            const stateResult = await this._stateHandler.invoke(actionResult, type);
            if (!stateResult) {
                return;
            }
            const viewResult = await this._viewHandler.invoke(stateResult, type);
            if (!viewResult) {
                return;
            }
        }
        catch (error) {
            console.error(error);
        }
    }

}
