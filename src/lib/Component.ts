import {NodeContentData} from './types.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';

export default class Component extends HTMLElement {

    private _attrs: ElementAttributesProxy;
    private _content: NodeContent;
    private _isUpdated: boolean;

    private _updateTimerId: number | undefined;
    private _updateDelay: number;

    constructor() {
        super();

        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.initContentContainer());
        this._isUpdated = false;

        this._updateTimerId = undefined;
        this._updateDelay = 100;
    }

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    get attrs(): ElementAttributesProxy {
        return this._attrs;
    }

    get content(): NodeContent {
        return this._content;
    }

    get isUpdated(): boolean {
        return this._isUpdated;
    }

    dispatch(type: string, detail?: any): boolean {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }

    update(): void {
        if (this._updateTimerId !== undefined) {
            window.clearTimeout(this._updateTimerId);
        }

        this._updateTimerId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
            this.updateSync();
        }, this._updateDelay);
    }

    updateSync(): void {
        this.render();
        this._isUpdated = true;
        this.updatedCallback();
    }

    static get observedAttributes(): Array<string> {
        return [];
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void {
        if (this.isUpdated && oldValue !== newValue) {
            this.update();
        }
    }

    connectedCallback(): void {
        if (!this.isUpdated) {
            this.updateSync();
        }
    }

    disconnectedCallback(): void {
    }

    adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
    }

    updatedCallback(): void {
    }

    protected initContentContainer(): Node {
        return this.attachShadow({mode: 'open'});
    }

    protected render(): void {
        this.content.update(this.template());
    }

    protected template(): NodeContentData {
        return '';
    }

}
