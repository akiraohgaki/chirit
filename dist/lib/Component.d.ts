import { NodeContentData } from './types.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
export default class Component extends HTMLElement {
    private _contentRoot;
    private _attrs;
    private _isUpdated;
    private _updateTimerId;
    private _updateDelay;
    constructor();
    static define(name: string, options?: ElementDefinitionOptions): void;
    get contentRoot(): Node;
    get attrs(): ElementAttributesProxy;
    get isUpdated(): boolean;
    dispatch(type: string, detail?: any): boolean;
    update(): void;
    updateSync(): void;
    static get observedAttributes(): Array<string>;
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(_oldDocument: Document, _newDocument: Document): void;
    updatedCallback(): void;
    protected initContentRoot(): Node;
    protected initAttrs(): ElementAttributesProxy;
    protected render(): void;
    protected template(): NodeContentData;
}
