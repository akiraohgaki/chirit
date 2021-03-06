export default class CustomElement extends HTMLElement {
    private _updatedCount;
    private _updateTimerId;
    private _updateDelay;
    private _updatePromiseResolvers;
    constructor();
    static get observedAttributes(): Array<string>;
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(_oldDocument: Document, _newDocument: Document): void;
    static define(name: string, options?: ElementDefinitionOptions): void;
    get updatedCount(): number;
    update(): Promise<void>;
    updateSync(): void;
    protected render(): void;
    protected updatedCallback(): void;
    protected errorCallback(exception: any): void;
}
