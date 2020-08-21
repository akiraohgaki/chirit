import { NodeContentData } from './types.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    private _attrs;
    private _content;
    private _isUpdated;
    private _updateTimerId;
    private _updateDelay;
    constructor();
    static define(name: string, options?: ElementDefinitionOptions): void;
    get attrs(): ElementAttributesProxy;
    get content(): NodeContent;
    get contentRoot(): Node;
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
    protected render(): void;
    protected template(): NodeContentData;
}
