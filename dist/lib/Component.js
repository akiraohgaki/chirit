import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.attachShadow({ mode: 'open' }));
        this._isInitialUpdated = false;
        this._updateTimerId = undefined;
        this._updateDelay = 100;
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this._isInitialUpdated && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (!this._isInitialUpdated) {
            this.updateSync();
        }
    }
    disconnectedCallback() {
    }
    adoptedCallback(_oldDocument, _newDocument) {
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
    update() {
        if (this._updateTimerId !== undefined) {
            window.clearTimeout(this._updateTimerId);
        }
        this._updateTimerId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
            this.updateSync();
        }, this._updateDelay);
    }
    updateSync() {
        this._content.update(this.template());
        if (!this._isInitialUpdated) {
            this._isInitialUpdated = true;
        }
        this.updatedCallback();
    }
    updatedCallback() {
    }
    template() {
        return '';
    }
}
//# sourceMappingURL=Component.js.map