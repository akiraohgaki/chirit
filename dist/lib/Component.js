export default class Component extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = null;
        this._state = {};
        this._updateCount = 0;
        this.initShadow();
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
    setContent(content) {
        const oldContent = this.getContent();
        this.contentRoot.textContent = null;
        this.contentRoot.appendChild(content.cloneNode(true));
        const newContent = this.getContent();
        this.componentContentChangedCallback(oldContent, newContent);
    }
    getContent() {
        const content = document.createDocumentFragment();
        if (this.contentRoot.hasChildNodes()) {
            const childNodes = this.contentRoot.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                content.appendChild(childNodes[i].cloneNode(true));
            }
        }
        return content;
    }
    enableShadow(options = { mode: 'open' }) {
        this._shadowRoot = this.attachShadow(options);
    }
    dispatch(type, data = {}) {
        return this.dispatchEvent(new CustomEvent(type, {
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
        this.enableShadow();
    }
    init() { }
    template() {
        return '';
    }
    render() {
        let template = this.template();
        if (typeof template === 'string') {
            const templateElement = document.createElement('template');
            templateElement.innerHTML = template;
            template = templateElement;
        }
        this.setContent(template.content);
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
        if (!this._updateCount) {
            this._update();
        }
    }
    static get componentObservedAttributes() {
        return [];
    }
    componentAttributeChangedCallback(_attributeName, _oldValue, _newValue, _namespace) { }
    componentConnectedCallback() { }
    componentDisconnectedCallback() { }
    componentAdoptedCallback(_oldDocument, _newDocument) { }
    componentStateChangedCallback(_oldState, _newState) { }
    componentContentChangedCallback(_oldContent, _newContent) { }
    componentUpdatedCallback() { }
}
//# sourceMappingURL=Component.js.map