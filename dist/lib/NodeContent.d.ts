import { NodeContentData } from './types.js';
export default class NodeContent<T extends Node> {
    private _container;
    constructor(container: T);
    get container(): T;
    update(content: NodeContentData): void;
    get(): DocumentFragment;
    private _createDocumentFragment;
    private _updateChildNodes;
    private _updateChildNode;
    private _updateAttributes;
}
