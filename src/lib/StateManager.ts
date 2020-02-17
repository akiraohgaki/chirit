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

    create(name: string, state?: Dictionary<any>, handler?: StateHandler, observers?: Iterable<StateObserver>): State {
        const stateInstance = new State(state, handler, observers);
        this.set(name, stateInstance);
        return stateInstance;
    }

    set(name: string, stateInstance: State): void {
        this.delete(name);

        this._stateCollection.set(name, stateInstance);
        this._target.addEventListener(name, this._eventListener as EventListener, false);
    }

    delete(name: string): void {
        if (this._stateCollection.delete(name)) {
            this._target.removeEventListener(name, this._eventListener as EventListener, false);
        }
    }

    get(name: string): State | undefined {
        return this._stateCollection.get(name);
    }

    has(name: string): boolean {
        return this._stateCollection.has(name);
    }

    private async _update(name: string, data: Dictionary<any>): Promise<void> {
        const stateInstance = this._stateCollection.get(name);
        if (stateInstance) {
            await stateInstance.update(data);
        }
    }

    private _eventListener(event: CustomEvent<Dictionary<any>>): void {
        event.preventDefault();
        event.stopPropagation();
        this._update(event.type, event.detail);
    }

}
