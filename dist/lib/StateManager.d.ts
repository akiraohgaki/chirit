import { Dictionary } from './common.js';
import { StateHandler, StateObserver } from './State.js';
export default class StateManager {
    private _target;
    private _stateCollection;
    constructor(target: EventTarget);
    get target(): EventTarget;
    hasState(name: string): boolean;
    createState(name: string, state?: Dictionary<any>, handler?: StateHandler, observers?: Iterable<StateObserver>): void;
    removeState(name: string): void;
    getState(name: string): Dictionary<any> | null;
    updateState(name: string, data: Dictionary<any>): Promise<void>;
    setHandler(name: string, handler: StateHandler): void;
    addObserver(name: string, observer: StateObserver): void;
    removeObserver(name: string, observer: StateObserver): void;
    private _eventListener;
}
