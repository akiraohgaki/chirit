import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.attachShadow({ mode: 'open' }));
        this._isRendered = false;
        this._renderTimerId = undefined;
        this._renderDelay = 100;
    }
    static define(name, options) {
        window.customElements.define(name, this, options);
    }
    get attrs() {
        return this._attrs;
    }
    get content() {
        return this._content;
    }
    dispatch(type, detail) {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }
    render() {
        if (this._renderTimerId !== undefined) {
            window.clearTimeout(this._renderTimerId);
        }
        this._renderTimerId = window.setTimeout(() => {
            window.clearTimeout(this._renderTimerId);
            this._renderTimerId = undefined;
            this.renderSync();
        }, this._renderDelay);
    }
    renderSync() {
        this._content.update(this.template());
        this._isRendered = true;
        this.renderedCallback();
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this._isRendered && oldValue !== newValue) {
            this.render();
        }
    }
    connectedCallback() {
        if (!this._isRendered) {
            this.renderSync();
        }
    }
    disconnectedCallback() {
    }
    adoptedCallback(_oldDocument, _newDocument) {
    }
    renderedCallback() {
    }
    template() {
        return '';
    }
}
//# sourceMappingURL=Component.js.map