export default class CustomElement extends HTMLElement {
    constructor() {
        super();
        this._updatedCount = 0;
        this._updateTimerId = undefined;
        this._updateDelay = 100;
        this._updatePromiseResolvers = [];
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this._updatedCount && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (this._updatedCount) {
            this.update();
        }
        else {
            this.updateSync();
        }
    }
    disconnectedCallback() {
    }
    adoptedCallback(_oldDocument, _newDocument) {
    }
    static define(name, options) {
        window.customElements.define(name, this, options);
    }
    get updatedCount() {
        return this._updatedCount;
    }
    update() {
        if (this._updateTimerId !== undefined) {
            window.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
        }
        this._updateTimerId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
            const promiseResolvers = this._updatePromiseResolvers.splice(0);
            this.updateSync();
            if (promiseResolvers.length) {
                for (const resolve of promiseResolvers) {
                    resolve();
                }
            }
        }, this._updateDelay);
        return new Promise((resolve) => {
            this._updatePromiseResolvers.push(resolve);
        });
    }
    updateSync() {
        try {
            this.render();
            this._updatedCount++;
            this.updatedCallback();
        }
        catch (exception) {
            this.errorCallback(exception);
        }
    }
    render() {
    }
    updatedCallback() {
    }
    errorCallback(exception) {
        console.error(exception);
    }
}
//# sourceMappingURL=CustomElement.js.map