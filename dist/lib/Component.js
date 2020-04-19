import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.initShadow();
        this._attrs = this.initAttrs();
        this._updateTimerId = undefined;
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
        if (this._updateTimerId !== undefined) {
            window.clearTimeout(this._updateTimerId);
        }
        this._updateTimerId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
            this._updateImmediate();
        }, this._updateDelay);
    }
    _updateImmediate() {
        this.render();
        this._updateCount++;
        this.updatedCallback();
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this._updateCount && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (!this._updateCount) {
            this._updateImmediate();
        }
    }
    disconnectedCallback() { }
    adoptedCallback(_oldDocument, _newDocument) { }
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
            },
            ownKeys: () => {
                const keys = [];
                const attributes = Array.from(this.attributes);
                for (const attribute of attributes) {
                    keys.push(attribute.name);
                }
                return keys;
            },
            getOwnPropertyDescriptor: (_target, name) => {
                if (typeof name === 'string' && this.hasAttribute(name)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        value: this.getAttribute(name)
                    };
                }
                return undefined;
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