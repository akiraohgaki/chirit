import { Dictionary } from './common.js';
interface HandlerFunction {
    (data: Dictionary<any>, type: string): Dictionary<any> | boolean;
}
export default class Handler {
    private _initialHandler;
    private _defaultHandler;
    private _typeHandlersCollection;
    constructor(handler: HandlerFunction);
    resetDefault(): this;
    setDefault(handler: HandlerFunction): this;
    add(type: string, handler: HandlerFunction): this;
    remove(type: string, handler: HandlerFunction): this;
    has(type: string): boolean;
    invoke(data?: Dictionary<any>, type?: string): Promise<Dictionary<any> | null>;
    defaultChangedCallback(_handler: HandlerFunction): void;
    beforeAddCallback(_type: string, _handler: HandlerFunction): void;
    afterAddCallback(_type: string, _handler: HandlerFunction): void;
    beforeRemoveCallback(_type: string, _handler: HandlerFunction): void;
    afterRemoveCallback(_type: string, _handler: HandlerFunction): void;
}
export {};
