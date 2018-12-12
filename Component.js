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
    constructor(target, state) {
        // "target" should be Element object or selector string
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }

        this._target = target || document.createElement('div');
        this._state = state;

        this.init();
        this.preBuild();
        this._build();
        this.postBuild();
        this.complete();
    }

    get target() {
        return this._target;
    }

    get state() {
        return this._state;
    }

    _build() {
        const html = this.html();
        const style = this.style();
        const script = this.script();
        this._target.innerHTML = (html || '')
            + (style ? `<style>${style}</style>` : '')
            + (script ? `<script>${script}</script>` : '');
    }

    update(state) {
        this._state = state;
        this.preBuild();
        this._build();
        this.postBuild();
    }

    init() {}

    complete() {}

    preBuild() {}

    postBuild() {}

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
