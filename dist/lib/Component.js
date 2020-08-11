import NodeContent from './NodeContent.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._contentRoot = this.initContentRoot();
        this._attrs = this.initAttrs();
        this._isUpdated = false;
        this._updateTimerId = undefined;
        this._updateDelay = 100;
    }
    static define(name, options) {
        window.customElements.define(name, this, options);
    }
    get contentRoot() {
        return this._contentRoot;
    }
    get attrs() {
        return this._attrs;
    }
    get isUpdated() {
        return this._isUpdated;
    }
    dispatch(type, detail) {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
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
        this.render();
        this._isUpdated = true;
        this.updatedCallback();
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this.isUpdated && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (!this.isUpdated) {
            this.updateSync();
        }
    }
    disconnectedCallback() {
    }
    adoptedCallback(_oldDocument, _newDocument) {
    }
    updatedCallback() {
    }
    initContentRoot() {
        return this.attachShadow({ mode: 'open' });
    }
    initAttrs() {
        return new ElementAttributesProxy(this);
    }
    render() {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template(), true);
    }
    template() {
        return '';
    }
}
//# sourceMappingURL=Component.js.map