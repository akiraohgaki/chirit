import {NodeContentData} from './types.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';

export default class Component extends HTMLElement {

    private _attrs: ElementAttributesProxy;
    private _content: NodeContent;

    private _isRendered: boolean;
    private _renderTimerId: number | undefined;
    private _renderDelay: number;

    constructor() {
        super();

        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.attachShadow({mode: 'open'}));

        this._isRendered = false;
        this._renderTimerId = undefined;
        this._renderDelay = 100;
    }

    static get observedAttributes(): Array<string> {
        return [];
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void {
        if (this._isRendered && oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback(): void {
        if (!this._isRendered) {
            this.render();
        }
    }

    disconnectedCallback(): void {
    }

    adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
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

    dispatch(type: string, detail?: any): boolean {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }

    render(): void {
        if (this._renderTimerId !== undefined) {
            window.clearTimeout(this._renderTimerId);
        }

        this._renderTimerId = window.setTimeout(() => {
            window.clearTimeout(this._renderTimerId);
            this._renderTimerId = undefined;

            this._content.update(this.template());
            this._isRendered = true;
            this.renderedCallback();
        }, this._renderDelay);
    }

    renderedCallback(): void {
    }

    protected template(): NodeContentData {
        return '';
    }

}
