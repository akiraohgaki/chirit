import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.initShadow();
        this._attrs = this.initAttrs();
        this._updateTimeoutId = undefined;
        this._updateDelay = 100;
        this._updateCount = 0;
    }
    static define(name, options) {
        window.customElements.define(name, this, options);
    }
    get contentRoot() {
        return this._shadowRoot || this.shadowRoot || this;
    }
    get attrs() {
        return this._attrs;
    }
    dispatch(type, detail) {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }
    update() {
        if (this._updateTimeoutId !== undefined) {
            window.clearTimeout(this._updateTimeoutId);
        }
        this._updateTimeoutId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimeoutId);
            this._updateTimeoutId = undefined;
            this._updateImmediate();
        }, this._updateDelay);
    }
    _updateImmediate() {
        this.render();
        this._updateCount++;
        this.updatedCallback();
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (this._updateCount && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (!this._updateCount) {
            this._updateImmediate();
        }
    }
    updatedCallback() { }
    initShadow() {
        return this.attachShadow({ mode: 'open' });
    }
    initAttrs() {
        return new Proxy({}, {
            set: (_target, name, value) => {
                if (typeof name === 'string' && typeof value === 'string') {
                    this.setAttribute(name, value);
                    return true;
                }
                return false;
            },
            get: (_target, name) => {
                if (typeof name === 'string') {
                    return this.getAttribute(name);
                }
                return null;
            },
            deleteProperty: (_target, name) => {
                if (typeof name === 'string' && this.hasAttribute(name)) {
                    this.removeAttribute(name);
                    return true;
                }
                return false;
            },
            has: (_target, name) => {
                if (typeof name === 'string' && this.hasAttribute(name)) {
                    return true;
                }
                return false;
            }
        });
    }
    render() {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }
    template() {
        return '';
    }
}
//# sourceMappingURL=Component.js.map