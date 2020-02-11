import NodeContent from './NodeContent.js';
export default class Component extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.initShadow();
        this._state = this.initState();
        this._updateLockCount = 0;
        this._updatedCount = 0;
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
        this._updateLockCount++;
        this.componentStateChangedCallback(oldState, newState);
        this._updateLockCount--;
        if (!this._updateLockCount && this._updatedCount) {
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
        if (this.isConnected) {
            this.render();
            this._updatedCount++;
            this.componentUpdatedCallback();
        }
    }
    initShadow() {
        return this.attachShadow({ mode: 'open' });
    }
    initState() {
        return {};
    }
    init() { }
    render() {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }
    template() {
        return '';
    }
    static get observedAttributes() {
        return this.componentObservedAttributes;
    }
    attributeChangedCallback(name, oldValue, newValue, namespace) {
        this._updateLockCount++;
        this.componentAttributeChangedCallback(name, oldValue, newValue, namespace);
        this._updateLockCount--;
        if (!this._updateLockCount && this._updatedCount
            && oldValue !== newValue) {
            this._update();
        }
    }
    connectedCallback() {
        this._updateLockCount++;
        this.componentConnectedCallback();
        this._updateLockCount--;
        if (!this._updateLockCount && !this._updatedCount) {
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
    componentAttributeChangedCallback(_name, _oldValue, _newValue, _namespace) { }
    componentConnectedCallback() { }
    componentDisconnectedCallback() { }
    componentAdoptedCallback(_oldDocument, _newDocument) { }
    componentStateChangedCallback(_oldState, _newState) { }
    componentUpdatedCallback() { }
}
//# sourceMappingURL=Component.js.map