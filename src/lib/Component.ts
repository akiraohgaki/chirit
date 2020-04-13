import {Dictionary} from './common.js';
import NodeContent, {NodeContentData} from './NodeContent.js';

export default class Component extends HTMLElement {

    private _shadowRoot: ShadowRoot | null;
    private _updateTimeoutId: number | undefined;
    private _updateDelay: number;
    private _updateCount: number;

    constructor() {
        super();

        this._shadowRoot = this.initShadow();
        this._updateTimeoutId = undefined;
        this._updateDelay = 100;
        this._updateCount = 0;
    }

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    get contentRoot(): ShadowRoot | this {
        return this._shadowRoot || this.shadowRoot || this;
    }

    dispatch(type: string, detail: Dictionary<any> = {}): boolean {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }

    update(): void {
        if (this._updateTimeoutId !== undefined) {
            window.clearTimeout(this._updateTimeoutId);
        }
        this._updateTimeoutId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimeoutId);
            this._updateTimeoutId = undefined;
            this.render();
            this._updateCount++;
            this.updatedCallback();
        }, this._updateDelay);
    }

    // Overridable methods

    protected initShadow(): ShadowRoot | null {
        return this.attachShadow({mode: 'open'});
    }

    protected render(): void {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }

    protected template(): NodeContentData {
        return '';
    }

    // Lifecycle methods

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
        if (this._updateCount && oldValue !== newValue) {
            this.update();
        }
    }

    connectedCallback(): void {
        if (!this._updateCount) {
            this.update();
        }
    }

    updatedCallback(): void {}

}
