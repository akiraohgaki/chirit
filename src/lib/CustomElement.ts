export default class CustomElement extends HTMLElement {

    private _updatedCount: number;

    private _updateTimerId: number | undefined;
    private _updateDelay: number;

    constructor() {
        super();

        this._updatedCount = 0;

        this._updateTimerId = undefined;
        this._updateDelay = 100;
    }

    static get observedAttributes(): Array<string> {
        return [];
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void {
        if (this._updatedCount && oldValue !== newValue) {
            this.update();
        }
    }

    connectedCallback(): void {
        if (!this._updatedCount) {
            this.updateSync();
        }
    }

    disconnectedCallback(): void {
    }

    adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
    }

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    get updatedCount(): number {
        return this._updatedCount;
    }

    update(): void {
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

    updateSync(): void {
        this.render();
        this._updatedCount++;
        this.updatedCallback();
    }

    protected render(): void {
    }

    protected updatedCallback(): void {
    }

}
