import { NodeContentData } from './types.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    private _attrs;
    private _content;
    private _isRendered;
    private _renderTimerId;
    private _renderDelay;
    constructor();
    static define(name: string, options?: ElementDefinitionOptions): void;
    get attrs(): ElementAttributesProxy;
    get content(): NodeContent;
    dispatch(type: string, detail?: any): boolean;
    render(): void;
    renderSync(): void;
    static get observedAttributes(): Array<string>;
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(_oldDocument: Document, _newDocument: Document): void;
    renderedCallback(): void;
    protected template(): NodeContentData;
}
