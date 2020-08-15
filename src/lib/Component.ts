import {NodeContentData} from './types.js';
import NodeContent from './NodeContent.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';

export default class Component extends HTMLElement {

    private _contentRoot: Node;
    private _attrs: ElementAttributesProxy;
    private _isUpdated: boolean;

    private _updateTimerId: number | undefined;
    private _updateDelay: number;

    constructor() {
        super();

        this._contentRoot = this.initContentRoot();
        this._attrs = new ElementAttributesProxy(this);
        this._isUpdated = false;

        this._updateTimerId = undefined;
        this._updateDelay = 100;
    }

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    get contentRoot(): Node {
        return this._contentRoot;
    }

    get attrs(): ElementAttributesProxy {
        return this._attrs;
    }

    get isUpdated(): boolean {
        return this._isUpdated;
    }

    dispatch(type: string, detail?: any): boolean {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
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

    protected initContentRoot(): Node {
        return this.attachShadow({mode: 'open'});
    }

    protected render(): void {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template(), true);
    }

    protected template(): NodeContentData {
        return '';
    }

}
