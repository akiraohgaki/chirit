/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Component extends HTMLElement {

    // Subclass should use init() instead of constructor()
    constructor() {
        super();

        this.state = null;

        this.init();
        this.update();
        this.complete();
    }

    //static get observedAttributes() {
    //    return [];
    //}

    //connectedCallback() {}

    //disconnectedCallback() {}

    //attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}

    //adoptedCallback(oldDocument, newDocument) {}

    update(state) {
        if (state !== undefined) {
            this.state = state;
        }
        this.beforeRender();
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = this.render() || '';
        }
        else {
            this.innerHTML = this.render() || '';
        }
        this.afterRender();
    }

    init() {}

    beforeRender() {}

    render() {}

    afterRender() {}

    complete() {}

}
