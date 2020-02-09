import {Dictionary} from './common.js';
import NodeContent from './NodeContent.js';

type ComponentTemplate = Node | NodeList | string; // for NodeContent

export default class Component extends HTMLElement {

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    private _shadowRoot: ShadowRoot | null;
    private _state: Dictionary<any>;
    private _updateCount: number;

    constructor() {
        super();

        this._shadowRoot = this.initShadow();
        this._state = this.initState();
        this._updateCount = 0;

        this.init();
    }

    get contentRoot(): ShadowRoot | this {
        return this._shadowRoot || this.shadowRoot || this;
    }

    set state(state: Dictionary<any>) {
        this.setState(state);
    }

    get state(): Dictionary<any> {
        return this.getState();
    }

    setState(state: Dictionary<any>): void {
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

    getState(): Dictionary<any> {
        return this._state;
    }

    dispatch(type: string, data: Dictionary<any> = {}): boolean {
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

    protected initState(): Dictionary<any> {
        return {};
    }

    protected init(): void {}

    protected render(): void {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }

    protected template(): ComponentTemplate {
        return '';
    }

    // Lifecycle methods

    static get observedAttributes(): Array<string> {
        return this.componentObservedAttributes;
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null, namespace: string | null): void {
        this.componentAttributeChangedCallback(name, oldValue, newValue, namespace);
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
    }

    static get componentObservedAttributes(): Array<string> {
        return [];
    }

    componentAttributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null, _namespace: string | null): void {}

    componentConnectedCallback(): void {}

    componentDisconnectedCallback(): void {}

    componentAdoptedCallback(_oldDocument: Document, _newDocument: Document): void {}

    componentStateChangedCallback(_oldState: Dictionary<any>, _newState: Dictionary<any>): void {}

    componentUpdatedCallback(): void {}

}
