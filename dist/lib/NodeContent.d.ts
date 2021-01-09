import { NodeContentData } from './types.js';
export default class NodeContent<T extends Node> {
    private _container;
    private _context;
    constructor(container: T, context?: any);
    get container(): T;
    update(content: NodeContentData): void;
    clone(): DocumentFragment;
    private _createDocumentFragment;
    private _patchNodesInsideOf;
    private _patchNodes;
    private _patchAttributes;
    private _fixOneventHandlersInsideOf;
    private _fixOneventHandlers;
}
