interface DataDict {
    [key: string]: any;
}

export default class Component extends HTMLElement {

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    private _state: DataDict;
    private _shadowRoot: ShadowRoot | null;
    private _updateCount: number;

    constructor() {
        super();

        this._state = {};
        this._shadowRoot = null;
        this._updateCount = 0;

        this.initShadow();
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
        //if (this._updateCount && JSON.stringify(oldState) !== JSON.stringify(newState)) {
        //    this._update();
        //}
    }

    getState(): DataDict {
        return this._state;
    }

    dispatch(type: string, data: DataDict = {}): boolean {
        return this.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    protected setContent(content: Node | string): void {
        if (content instanceof HTMLTemplateElement) {
            content = content.content;
        }
        else if (typeof content === 'string') {
            const template = document.createElement('template');
            template.innerHTML = content;
            content = template.content;
        }
        const oldContent = this.getContent();
        this.contentRoot.textContent = null;
        this.contentRoot.appendChild(content.cloneNode(true));
        const newContent = this.getContent();
        this.componentContentChangedCallback(oldContent, newContent);
    }

    protected getContent(): Node {
        const documentFragment = document.createDocumentFragment();
        if (this.contentRoot.hasChildNodes()) {
            const childNodes = this.contentRoot.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                documentFragment.appendChild(childNodes[i].cloneNode(true));
            }
        }
        return documentFragment;
    }

    protected enableShadow(options: ShadowRootInit = {mode: 'open'}): void {
        this._shadowRoot = this.attachShadow(options);
    }

    private _update(): void {
        this.render();
        this._updateCount++;
        this.componentUpdatedCallback();
    }

    // Abstractable methods

    protected initShadow(): void {
        this.enableShadow();
    }

    protected init(): void {}

    protected template(): Node | string {
        return '';
    }

    protected render(): void {
        this.setContent(this.template());
    }

    // Lifecycle callbacks

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

    adoptedCallback(oldDocument: Node, newDocument: Node): void {
        this.componentAdoptedCallback(oldDocument, newDocument);
        if (!this._updateCount) {
            this._update();
        }
    }

    static get componentObservedAttributes(): Array<string> {
        return [];
    }

    protected componentAttributeChangedCallback(_attributeName: string, _oldValue: string, _newValue: string, _namespace: string): void {}

    protected componentConnectedCallback(): void {}

    protected componentDisconnectedCallback(): void {}

    protected componentAdoptedCallback(_oldDocument: Node, _newDocument: Node): void {}

    protected componentStateChangedCallback(_oldState: DataDict, _newState: DataDict): void {}

    protected componentContentChangedCallback(_oldContent: Node, _newContent: Node): void {}

    protected componentUpdatedCallback(): void {}

}
