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
    //    return this.observedComponentAttributes;
    //}

    //static get observedComponentAttributes() {
    //    return [];
    //}

    // Subclass should use init() instead of constructor()
    constructor() {
        super();
        this.state = null;
        this.forceUpdate = false;
        this._updateCount = 0;
        this.init();
    }

    init() {}

    // Subclass should use componentConnected() instead of connectedCallback()
    connectedCallback() {
        if (this.forceUpdate || !this._updateCount) {
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
        if (this.forceUpdate || !this._updateCount) {
            this.update();
        }
        this.componentAttributeChanged(attributeName, oldValue, newValue, namespace);
    }

    componentAttributeChanged(attributeName, oldValue, newValue, namespace) {}

    // Subclass should use componentAdopted() instead of adoptedCallback()
    adoptedCallback(oldDocument, newDocument) {
        this.componentAdopted(oldDocument, newDocument);
    }

    componentAdopted(oldDocument, newDocument) {}

    update(state) {
        if (state !== undefined) {
            this.state = state;
        }
        this.beforeRender();
        const root = this.shadowRoot || this;
        root.innerHTML = this.render() || '';
        this.afterRender();
        this._updateCount++;
    }

    beforeRender() {}

    render() {}

    afterRender() {}

}
