/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Component extends HTMLElement {

    static define(name, options) {
        window.customElements.define(name, this, options);
    }

    // Subclass should use init() instead of constructor()
    constructor() {
        super();
        this._state = null;
        this._template = document.createElement('template');
        this._updateCount = 0;
        this.attachShadow({mode: 'open'});
        this.init();
    }

    get contentRoot() {
        return this.shadowRoot || this;
    }

    set state(state) {
        this._state = state;
    }

    get state() {
        return this._state;
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

    update(state) {
        if (state !== undefined) {
            this._state = state;
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

    dispatch(type, data = null) {
        this.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    init() {}

    render() {}

    componentUpdatedCallback() {}

    static get componentObservedAttributes() {
        return [];
    }

    componentAttributeChangedCallback() {}

    componentConnectedCallback() {}

    componentDisconnectedCallback() {}

    componentAdoptedCallback() {}

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

}
