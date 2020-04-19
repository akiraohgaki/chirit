import { NodeContentData } from './types.js';
export default class NodeContent {
    private _target;
    constructor(target: Node);
    get target(): Node;
    update(content: NodeContentData, deep?: boolean): void;
    set(content: NodeContentData): void;
    get(): DocumentFragment;
    clear(): void;
    private _createDocumentFragment;
    private _updateChildNodes;
    private _updateChild;
    private _updateAttributes;
}
