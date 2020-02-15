import {Dictionary} from './common.js';
import State, {StateHandler} from './State.js';

interface StateManagerViewHandler {
    (data: Dictionary<any>): void;
}

type StateManagerStateCollection = Map<string, State>;
type StateManagerViewCollection = Map<string, Set<StateManagerViewHandler>>;

export default class StateManager {

    private _target: EventTarget;
    private _stateCollection: StateManagerStateCollection;
    private _viewCollection: StateManagerViewCollection;

    constructor(target: EventTarget) {
        this._target = target;
        this._stateCollection = new Map();
        this._viewCollection = new Map();
        this._eventListener = this._eventListener.bind(this);
    }

    get target(): EventTarget {
        return this._target;
    }

    createState(name: string, data?: Dictionary<any>, handler?: StateHandler): void {
        if (!this._stateCollection.has(name)) {
            this._stateCollection.set(name, new State(data, handler));
            this._viewCollection.set(name, new Set());
            this._target.addEventListener(name, this._eventListener as EventListener, false);
        }
    }

    async updateState(name: string, data: Dictionary<any>): Promise<void> {
        const state = this._stateCollection.get(name);
        if (state) {
            await state.update(data);
            this._invokeViewHandlers(name, state.data);
        }
    }

    getState(name: string): Dictionary<any> | null {
        return this._stateCollection.get(name)?.data || null;
    }

    deleteState(name: string): void {
        this._target.removeEventListener(name, this._eventListener as EventListener, false);
        this._viewCollection.delete(name);
        this._stateCollection.delete(name);
    }

    addView(name: string, handler: StateManagerViewHandler): void {
        const viewHandlers = this._viewCollection.get(name);
        if (viewHandlers) {
            viewHandlers.add(handler);
        }
    }

    private _invokeViewHandlers(name: string, data: Dictionary<any>): void {
        const viewHandlers = this._viewCollection.get(name);
        if (viewHandlers) {
            for (const viewHandler of viewHandlers) {
                viewHandler(data);
            }
        }
    }

    private _eventListener(event: CustomEvent<Dictionary<any>>): void {
        event.preventDefault();
        event.stopPropagation();
        this.updateState(event.type, event.detail);
    }

}
