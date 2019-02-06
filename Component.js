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

    initShadow() {
        this.enableShadow();
    }

    initTemplate() {
        this.importTemplate(document.createElement('template'));
    }

    update(state) {
        if (state !== undefined) {
            this.setState(state);
            return;
        }

        let content = this.render();
        if (content === undefined) {
            content = this.exportTemplate().content;
        }

        this.setContent(content);

        this._updatedCallback();
    }

    setState(state) {
        if (typeof state !== 'object' || state === null) {
            throw new TypeError(`"${state}" is not an object`);
        }

        const oldState = Object.assign({}, this._state);
        this._state = state;
        const newState = Object.assign({}, this._state);

        this._stateChangedCallback(oldState, newState);
    }

    setContent(content) {
        // "content" should be Node object or string
        if (typeof content === 'string') {
            const template = document.createElement('template');
            template.innerHTML = content;
            content = template.content;
        }

        const oldContent = this._template.content.cloneNode(true);
        this._template.textContent = null;
        this._template.appendChild(content);
        const newContent = this._template.content.cloneNode(true);

        this.contentRoot.textContent = null;
        this.contentRoot.appendChild(newContent);

        this._contentChangedCallback(oldContent, newContent);
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

    dispatch(type, data = {}) {
        this.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    // Abstract methods

    init() {}

    render() {}

    // Component lifecycle methods

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
        //if (this._updateCount && JSON.stringify(oldState) !== JSON.stringify(newState)) {
        //    this.update();
        //}
        if (this._updateCount) {
            this.update();
        }
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
