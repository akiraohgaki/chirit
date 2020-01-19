import { DataDict } from './common.js';
interface HandlerFunc {
    (data: DataDict, type: string): DataDict | boolean;
}
export default class Handler {
    private _initialHandler;
    private _defaultHandler;
    private _typeHandlersCollection;
    constructor(handler: HandlerFunc);
    resetDefault(): this;
    setDefault(handler: HandlerFunc): this;
    add(type: string, handler: HandlerFunc): this;
    remove(type: string, handler: HandlerFunc): this;
    has(type: string): boolean;
    invoke(data?: DataDict, type?: string): Promise<DataDict | null>;
    defaultChangedCallback(_handler: HandlerFunc): void;
    beforeAddCallback(_type: string, _handler: HandlerFunc): void;
    afterAddCallback(_type: string, _handler: HandlerFunc): void;
    beforeRemoveCallback(_type: string, _handler: HandlerFunc): void;
    afterRemoveCallback(_type: string, _handler: HandlerFunc): void;
}
export {};
