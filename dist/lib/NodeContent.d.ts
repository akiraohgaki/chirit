import { NodeContentData } from './types.js';
export default class NodeContent {
    private _container;
    constructor(container: Node);
    get container(): Node;
    update(content: NodeContentData): void;
    get(): DocumentFragment;
    private _createDocumentFragment;
    private _updateChildNodes;
    private _updateChildNode;
    private _updateAttributes;
}
