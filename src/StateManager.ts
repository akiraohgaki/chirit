import Handler from './Handler.js';

interface StateObject {
    [key: string]: any;
}

export default class StateManager {

    private _target: Node;
    private _state: Map<string, StateObject>;
    private _eventHandler: Handler;
    private _actionHandler: Handler;
    private _stateHandler: Handler;
    private _viewHandler: Handler;

    constructor(target?: Node | string) {
        if (typeof target === 'string') {
            target = document.querySelector(target) || undefined;
        }

        this._target = target || document;
        this._state = new Map();

        this._eventListener = this._eventListener.bind(this);

        this._eventHandler = new Handler((data) => {
            return data;
        });

        this._actionHandler = new Handler(() => {
            return {};
        });

        this._stateHandler = new Handler((data, type) => {
            this._state.set(type, data);
            return data;
        });

        this._viewHandler = new Handler(() => {
            return {};
        });

        const beforeAddCallback = (type: string): void => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._stateHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.addEventListener(type, this._eventListener as EventListener, false);
                this._state.set(type, {});
            }
        };

        const afterRemoveCallback = (type: string): void => {
            if (!this._eventHandler.has(type)
                && !this._actionHandler.has(type)
                && !this._stateHandler.has(type)
                && !this._viewHandler.has(type)
            ) {
                this._target.removeEventListener(type, this._eventListener as EventListener, false);
                this._state.delete(type);
            }
        };

        this._eventHandler.beforeAddCallback = beforeAddCallback;
        this._eventHandler.afterRemoveCallback = afterRemoveCallback;

        this._actionHandler.beforeAddCallback = beforeAddCallback;
        this._actionHandler.afterRemoveCallback = afterRemoveCallback;

        this._stateHandler.beforeAddCallback = beforeAddCallback;
        this._stateHandler.afterRemoveCallback = afterRemoveCallback;

        this._viewHandler.beforeAddCallback = beforeAddCallback;
        this._viewHandler.afterRemoveCallback = afterRemoveCallback;
    }

    get target(): Node {
        return this._target;
    }

    get state(): Map<string, StateObject> {
        return this._state;
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

    dispatch(type: string, data: object = {}): void {
        this._target.dispatchEvent(new CustomEvent(type, {detail: data}));
    }

    private _eventListener(event: CustomEvent<any>): void {
        event.preventDefault();
        event.stopPropagation();
        this._invokeHandlers(event.detail, event.type);
    }

    private async _invokeHandlers(data: object, type: string): Promise<void> {
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
            //const viewResult = await this._viewHandler.invoke(stateResult, type);
            this._viewHandler.invoke(stateResult, type);
        }
        catch (error) {
            console.error(error);
        }
    }

}
