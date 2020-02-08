import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.initShadow();
        this._state = {};
        this._updateCount = 0;
        this.init();
    }
    static define(name, options) {
        window.customElements.define(name, this, options);
    }
    get contentRoot() {
        return this._shadowRoot || this.shadowRoot || this;
    }
    set state(state) {
        this.setState(state);
    }
    get state() {
        return this.getState();
    }
    setState(state) {
        const oldState = Object.assign({}, this._state);
        this._state = state;
        const newState = Object.assign({}, this._state);
        this.componentStateChangedCallback(oldState, newState);
        if (this._updateCount) {
            this._update();
        }
    }
    getState() {
        return this._state;
    }
    dispatch(type, data = {}) {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }
    _update() {
        this.render();
        this._updateCount++;
        this.componentUpdatedCallback();
    }
    initShadow() {
        return this.attachShadow({ mode: 'open' });
    }
    init() { }
    template() {
        return '';
    }
    render() {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }
    static get observedAttributes() {
        return this.componentObservedAttributes;
    }
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
        this.componentAttributeChangedCallback(attributeName, oldValue, newValue, namespace);
        if (this._updateCount && oldValue !== newValue) {
            this._update();
        }
    }
    connectedCallback() {
        this.componentConnectedCallback();
        if (!this._updateCount) {
            this._update();
        }
    }
    disconnectedCallback() {
        this.componentDisconnectedCallback();
    }
    adoptedCallback(oldDocument, newDocument) {
        this.componentAdoptedCallback(oldDocument, newDocument);
    }
    static get componentObservedAttributes() {
        return [];
    }
    componentAttributeChangedCallback(_attributeName, _oldValue, _newValue, _namespace) { }
    componentConnectedCallback() { }
    componentDisconnectedCallback() { }
    componentAdoptedCallback(_oldDocument, _newDocument) { }
    componentStateChangedCallback(_oldState, _newState) { }
    componentUpdatedCallback() { }
}
//# sourceMappingURL=Component.js.map