interface StateObject {
    [key: string]: any;
}

export default class Component extends HTMLElement {

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    private _state: StateObject;
    private _shadowRoot: ShadowRoot | null;
    private _template: HTMLTemplateElement;
    private _updateCount: number;

    constructor() {
        super();

        this._state = {};
        this._shadowRoot = null;
        this._template = document.createElement('template');
        this._updateCount = 0;

        this.initShadow();
        //this.initTemplate();
        this.init();
    }

    set state(state: StateObject) {
        this.setState(state);
    }

    get state(): StateObject {
        return this.getState();
    }

    get contentRoot(): ShadowRoot | this {
        return this._shadowRoot || this.shadowRoot || this;
    }

    initShadow(): void {
        this.enableShadow();
    }

    /*initTemplate(): void {
        this.importTemplate(document.createElement('template'));
    }*/

    setState(state: StateObject): void {
        /*if (typeof state !== 'object' || state === null) {
            throw new TypeError(`"${state}" is not an object`);
        }*/

        const oldState = {...this._state};
        this._state = state;
        const newState = {...this._state};

        this._stateChangedCallback(oldState, newState);
    }

    getState(): StateObject {
        return this._state;
    }

    setContent(content: string | Node): void {
        if (typeof content === 'string') {
            const template = document.createElement('template');
            template.innerHTML = content;
            content = template.content;
        }

        const oldContent = this.exportTemplate().content;
        this._template.content.textContent = null;
        this._template.content.appendChild(content);
        const newContent = this.exportTemplate().content;

        this.contentRoot.textContent = null;
        this.contentRoot.appendChild(newContent.cloneNode(true));

        this._contentChangedCallback(oldContent, newContent);
    }

    enableShadow(options: object = {}): void {
        this._shadowRoot = this.attachShadow({mode: 'open', ...options});
    }

    importTemplate(template: HTMLTemplateElement): void {
        /*if (!(template instanceof HTMLTemplateElement)) {
            throw new TypeError(`"${template}" is not a HTMLTemplateElement`);
        }*/
        this._template = template.cloneNode(true) as HTMLTemplateElement;
    }

    exportTemplate(): HTMLTemplateElement {
        return this._template.cloneNode(true) as HTMLTemplateElement;
    }

    dispatch(type: string, data: object = {}): void {
        this.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    update(state?: StateObject): void {
        if (state !== undefined) {
            this.setState(state);
        }
        else {
            this._update();
        }
    }

    private _update(): void {
        let content = this.render();
        if (typeof content !== 'string' && !content) {
            content = this.exportTemplate().content;
        }

        this.setContent(content);

        this._updatedCallback();
    }

    // Abstract methods

    init(): void {}

    render(): string | Node | void {}

    // Lifecycle methods

    static get componentObservedAttributes(): Array<string> {
        return [];
    }

    componentAttributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void {}

    componentConnectedCallback(): void {}

    componentDisconnectedCallback(): void {}

    componentAdoptedCallback(oldDocument: Document, newDocument: Document): void {}

    componentStateChangedCallback(oldState: StateObject, newState: StateObject): void {}

    componentContentChangedCallback(oldContent: Node, newContent: Node): void {}

    componentUpdatedCallback(): void {}

    // Lifecycle methods in parent class

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

    // Additional lifecycle methods

    private _stateChangedCallback(oldState: StateObject, newState: StateObject): void {
        this.componentStateChangedCallback(oldState, newState);
        //if (this._updateCount && JSON.stringify(oldState) !== JSON.stringify(newState)) {
        //    this.update();
        //}
        if (this._updateCount) {
            this._update();
        }
    }

    private _contentChangedCallback(oldContent: Node, newContent: Node): void {
        this.componentContentChangedCallback(oldContent, newContent);
    }

    private _updatedCallback(): void {
        this._updateCount++;
        this.componentUpdatedCallback();
    }

}
