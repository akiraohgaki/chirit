import {Dictionary} from './common.js';
import State, {StateHandler, StateObserver} from './State.js';

export default class StateManager {

    private _target: EventTarget;
    private _stateCollection: Map<string, State>;

    constructor(target: EventTarget) {
        this._target = target;
        this._stateCollection = new Map();
        this._eventListener = this._eventListener.bind(this);
    }

    get target(): EventTarget {
        return this._target;
    }

    createState(name: string, state?: Dictionary<any>, handler?: StateHandler, observers?: Iterable<StateObserver>): State {
        if (this._stateCollection.has(name)) {
            this.removeState(name);
        }
        const stateInstance = new State(state, handler, observers);
        this._stateCollection.set(name, stateInstance);
        this._target.addEventListener(name, this._eventListener as EventListener, false);
        return stateInstance;
    }

    getState(name: string): State | null {
        return this._stateCollection.get(name) || null;
    }

    removeState(name: string): void {
        this._target.removeEventListener(name, this._eventListener as EventListener, false);
        this._stateCollection.delete(name);
    }

    async updateState(name: string, data: Dictionary<any>): Promise<void> {
        const state = this._stateCollection.get(name);
        if (state) {
            await state.update(data);
        }
    }

    private _eventListener(event: CustomEvent<Dictionary<any>>): void {
        event.preventDefault();
        event.stopPropagation();
        this.updateState(event.type, event.detail);
    }

}
