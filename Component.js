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
    constructor(target, state = {}) {
        // "target" should be Element object or selector string
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }

        this._target = target || document.createElement('div');
        this._state = {};

        this.init();
        this.update(state);
        this.complete();
    }

    get target() {
        return this._target;
    }

    set state(state) {
        this._mergeState(state);
    }

    get state() {
        return this._state;
    }

    update(state = {}) {
        this._mergeState(state);
        this.preRender();
        this._target.innerHTML = this.render() || '';
        this.postRender();
    }

    init() {}

    preRender() {}

    render() {
        return '';
    }

    postRender() {}

    complete() {}

    _mergeState(state) {
        Object.assign(this._state, state);
    }

}
