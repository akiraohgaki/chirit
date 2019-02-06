/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   2018, Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Component extends HTMLElement {

    static define(name, options) {
        window.customElements.define(name, this, options);
    }

    // Subclass should use init*() instead of constructor()
    constructor() {
        super();

        this._state = {};
        this._shadowRoot = null;
        this._template = null;

        this._updateCount = 0;

        this.initShadow();
        this.initTemplate();
        this.init();
    }

    set state(state) {
        this._state = state;
    }

    get state() {
        return this._state;
    }

    get contentRoot() {
        return this._shadowRoot || this.shadowRoot || this;
    }

    update(state) {
        if (state !== undefined) {
            const oldState = Object.assign({}, this._state);
            this._state = state;
            this.componentStateChangedCallback(oldState, this._state);
        }

        const content = this.render();
        if (content !== undefined) {
            this._template.innerHTML = content;
        }
        this.contentRoot.textContent = null;
        this.contentRoot.appendChild(this._template.content.cloneNode(true));

        this._updateCount++;
        this.componentUpdatedCallback();
    }

    dispatch(type, data = {}) {
        this.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    enableShadow(options = {}) {
        this._shadowRoot = this.attachShadow(Object.assign(
            {mode: 'open'},
            options
        ));
    }

    importTemplate(template) {
        if (!(template instanceof HTMLTemplateElement)) {
            throw new TypeError(`"${template}" is not a HTMLTemplateElement`);
        }

        this._template = template.cloneNode(true);
    }

    exportTemplate() {
        return this._template.cloneNode(true);
    }

    // Abstract methods

    initShadow() {
        this.enableShadow();
    }

    initTemplate() {
        this.importTemplate(document.createElement('template'));
    }

    init() {}

    render() {}

    // Component lifecycle methods

    componentStateChangedCallback() {}

    componentUpdatedCallback() {}

    static get componentObservedAttributes() {
        return [];
    }

    componentAttributeChangedCallback() {}

    componentConnectedCallback() {}

    componentDisconnectedCallback() {}

    componentAdoptedCallback() {}

    componentStateChangedCallback() {}

    componentContentChangedCallback() {}

    componentUpdatedCallback() {}

    // Subclass should use componentObservedAttributes instead of observedAttributes
    static get observedAttributes() {
        return this.componentObservedAttributes;
    }

    // Subclass should use componentAttributeChangedCallback() instead of attributeChangedCallback()
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
        if (this._updateCount && oldValue !== newValue) {
            this.update();
        }
        this.componentAttributeChangedCallback(attributeName, oldValue, newValue, namespace);
    }

    // Subclass should use componentConnectedCallback() instead of connectedCallback()
    connectedCallback() {
        if (!this._updateCount) {
            this.update();
        }
        this.componentConnectedCallback();
    }

    // Subclass should use componentDisconnectedCallback() instead of disconnectedCallback()
    disconnectedCallback() {
        this.componentDisconnectedCallback();
    }

    // Subclass should use componentAdoptedCallback() instead of adoptedCallback()
    adoptedCallback(oldDocument, newDocument) {
        if (!this._updateCount) {
            this.update();
        }
        this.componentAdoptedCallback(oldDocument, newDocument);
    }

    // Subclass should use componentStateChangedCallback() instead of _stateChangedCallback()
    _stateChangedCallback(oldState, newState) {
        this.componentStateChangedCallback(oldState, newState);
    }

    // Subclass should use componentContentChangedCallback() instead of _contentChangedCallback()
    _contentChangedCallback(oldContent, newContent) {
        this.componentContentChangedCallback(oldContent, newContent);
    }

    // Subclass should use componentUpdatedCallback() instead of _updatedCallback()
    _updatedCallback() {
        this._updateCount++;
        this.componentUpdatedCallback();
    }

}
