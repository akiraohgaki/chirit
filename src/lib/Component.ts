import {DataDict} from './common.js';
import NodeContent from './NodeContent.js';

export default class Component extends HTMLElement {

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    private _shadowRoot: ShadowRoot | null;
    private _state: DataDict;
    private _updateCount: number;

    constructor() {
        super();

        this._shadowRoot = this.initShadow();
        this._state = {};
        this._updateCount = 0;

        this.init();
    }

    get contentRoot(): ShadowRoot | this {
        return this._shadowRoot || this.shadowRoot || this;
    }

    set state(state: DataDict) {
        this.setState(state);
    }

    get state(): DataDict {
        return this.getState();
    }

    setState(state: DataDict): void {
        const oldState = {...this._state};
        this._state = state;
        const newState = {...this._state};
        this.componentStateChangedCallback(oldState, newState);
        if (this._updateCount) {
            this._update();
        }
        // Check if the state is difference
        //if (this._updateCount && this._checkStateDifference(oldState, newState)) {
        //    this._update();
        //}
    }

    getState(): DataDict {
        return this._state;
    }

    dispatch(type: string, data: DataDict = {}): boolean {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    private _update(): void {
        this.render();
        this._updateCount++;
        this.componentUpdatedCallback();
    }

    // Overridable methods

    protected initShadow(): ShadowRoot | null {
        return this.attachShadow({mode: 'open'});
    }

    protected init(): void {}

    protected template(): Node | NodeList | string {
        return '';
    }

    protected render(): void {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }

    // Lifecycle methods

    static get observedAttributes(): Array<string> {
        return this.componentObservedAttributes;
    }

    attributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void {
        this.componentAttributeChangedCallback(attributeName, oldValue, newValue, namespace);
        if (this._updateCount && oldValue !== newValue) {
            this._update();
        }
    }

    connectedCallback(): void {
        this.componentConnectedCallback();
        if (!this._updateCount) {
            this._update();
        }
    }

    disconnectedCallback(): void {
        this.componentDisconnectedCallback();
    }

    adoptedCallback(oldDocument: Document, newDocument: Document): void {
        this.componentAdoptedCallback(oldDocument, newDocument);
        if (!this._updateCount) {
            this._update();
        }
    }

    static get componentObservedAttributes(): Array<string> {
        return [];
    }

    componentAttributeChangedCallback(_attributeName: string, _oldValue: string, _newValue: string, _namespace: string): void {}

    componentConnectedCallback(): void {}

    componentDisconnectedCallback(): void {}

    componentAdoptedCallback(_oldDocument: Document, _newDocument: Document): void {}

    componentStateChangedCallback(_oldState: DataDict, _newState: DataDict): void {}

    componentUpdatedCallback(): void {}

}
