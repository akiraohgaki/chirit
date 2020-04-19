import { Dictionary, NodeContentData } from './types.js';
export default class Component extends HTMLElement {
    private _shadowRoot;
    private _attrs;
    private _updateTimerId;
    private _updateDelay;
    private _updateCount;
    constructor();
    static define(name: string, options?: ElementDefinitionOptions): void;
    get contentRoot(): ShadowRoot | this;
    get attrs(): Dictionary<string | null>;
    dispatch(type: string, detail?: any): boolean;
    update(): void;
    private _updateImmediate;
    static get observedAttributes(): Array<string>;
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(_oldDocument: Document, _newDocument: Document): void;
    updatedCallback(): void;
    protected initShadow(): ShadowRoot | null;
    protected initAttrs(): Dictionary<string | null>;
    protected render(): void;
    protected template(): NodeContentData;
}
