/**
 * Chirit
 *
 * @author      Akira Ohgaki <akiraohgaki@gmail.com>
 * @copyright   Akira Ohgaki
 * @license     https://opensource.org/licenses/BSD-2-Clause
 * @link        https://github.com/akiraohgaki/chirit
 */

export default class Component {

    // Subclass should use init() instead of constructor()
    constructor(element, state) {
        // "element" should be Element object or selector string
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        this.element = element || document.createElement('div');
        this.innerHTML = this.element.innerHTML;
        this.state = state;

        this.init();
        this._build();
        this.complete();
    }

    _build() {
        const html = this.html();
        const style = this.style();
        const script = this.script();
        this.element.innerHTML = html
            + (style ? `<style>${style}</style>` : '')
            + (script ? `<script>${script}</script>` : '');
    }

    update(state) {
        this.state = state;
        this._build();
    }

    init() {}

    complete() {}

    html() {
        return '';
    }

    style() {
        return '';
    }

    script() {
        return '';
    }

}
