export default class Component extends HTMLElement {

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    private _state: object;
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

    set state(state: object) {
        this.setState(state);
    }

    get state(): object {
        return this.getState();
    }

    setState(state: object): void {
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

    getState(): object {
        return this._state;
    }

    setContent(content: Node | string) {
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

    getContent(): Node {
        const documentFragment = document.createDocumentFragment();
        if (this.contentRoot.hasChildNodes()) {
            const childNodes = this.contentRoot.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                documentFragment.appendChild(childNodes[i].cloneNode(true));
            }
        }
        return documentFragment;
    }

    enableShadow(options: ShadowRootInit = {mode: 'open'}): void {
        this._shadowRoot = this.attachShadow(options);
    }

    dispatch(type: string, data: object = {}): void {
        this.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

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

    private _update(): void {
        this.render();
        this._updateCount++;
        this.componentUpdatedCallback();
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

    protected componentAttributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void {}

    protected componentConnectedCallback(): void {}

    protected componentDisconnectedCallback(): void {}

    protected componentAdoptedCallback(oldDocument: Node, newDocument: Node): void {}

    protected componentStateChangedCallback(oldState: object, newState: object): void {}

    protected componentContentChangedCallback(oldContent: Node, newContent: Node): void {}

    protected componentUpdatedCallback(): void {}

}
