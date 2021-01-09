export default class CustomElement extends HTMLElement {
    constructor() {
        super();
        this._updatedCount = 0;
        this._updateTimerId = undefined;
        this._updateDelay = 100;
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
        if (!this._updatedCount) {
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
            this.updateSync();
        }, this._updateDelay);
    }
    updateSync() {
        try {
            this.render();
            this._updatedCount++;
            this.updatedCallback();
        }
        catch (error) {
            this.errorCallback(error);
        }
    }
    render() {
    }
    updatedCallback() {
    }
    errorCallback(error) {
        console.error(error);
    }
}
//# sourceMappingURL=CustomElement.js.map