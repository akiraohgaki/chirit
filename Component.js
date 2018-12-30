/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Component extends HTMLElement {

    //static get observedAttributes() {
    //    return this.componentObservedAttributes();
    //}

    //static componentObservedAttributes() {}

    // Subclass should use init() instead of constructor()
    constructor() {
        super();
        this.state = null;
        this._template = document.createElement('template');
        this._forceShadow = false;
        this._forceUpdate = false;
        this._updateCount = 0;
        this.init();
    }

    get contentRoot() {
        return this.shadowRoot || this;
    }

    init() {}

    // Subclass should use componentConnected() instead of connectedCallback()
    connectedCallback() {
        if (this._forceUpdate || !this._updateCount) {
            this.update();
        }
        this.componentConnected();
    }

    componentConnected() {}

    // Subclass should use componentDisconnected() instead of disconnectedCallback()
    disconnectedCallback() {
        this.componentDisconnected();
    }

    componentDisconnected() {}

    // Subclass should use componentAttributeChanged() instead of attributeChangedCallback()
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
        if (this._forceUpdate || !this._updateCount) {
            this.update();
        }
        this.componentAttributeChanged(attributeName, oldValue, newValue, namespace);
    }

    componentAttributeChanged() {}

    // Subclass should use componentAdopted() instead of adoptedCallback()
    adoptedCallback(oldDocument, newDocument) {
        this.componentAdopted(oldDocument, newDocument);
    }

    componentAdopted() {}

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
            this.state = state;
        }

        if (this._forceShadow && !this.shadowRoot) {
            this.attachShadow({mode: 'open'});
        }

        this.beforeRender();
        const content = this.render();
        if (content !== undefined) {
            this._template.innerHTML = content;
        }
        this.contentRoot.innerHTML = this._template.innerHTML;

        this.afterRender();

        this._updateCount++;
    }

    beforeRender() {}

    render() {}

    afterRender() {}

}
