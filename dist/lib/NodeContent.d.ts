import { NodeContentData } from './types.js';
export default class NodeContent<T extends Node> {
    private _container;
    constructor(container: T);
    get container(): T;
    update(content: NodeContentData): void;
    clone(): DocumentFragment;
    private _createDocumentFragment;
    private _patchChildNodes;
    private _patchNode;
    private _patchAttributes;
}
