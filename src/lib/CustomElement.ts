export default class CustomElement extends HTMLElement {
  private _updatedCount: number;

  private _updateTimerId: number | undefined;
  private _updateDelay: number;
  private _updatePromiseResolvers: Array<{ (): void }>;

  constructor() {
    super();

    this._updatedCount = 0;

    this._updateTimerId = undefined;
    this._updateDelay = 100;
    this._updatePromiseResolvers = [];
  }

  static get observedAttributes(): Array<string> {
    return [];
  }

  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
    _namespace?: string | null,
  ): void {
    // Runs update task when observed attribute has changed but don't run before initial update
    if (this._updatedCount && oldValue !== newValue) {
      this.update();
    }
  }

  connectedCallback(): void {
    // Runs update task when this Element has connected to parent Node
    if (this._updatedCount) {
      // Re-update, this Element may have moved into another parent Node
      this.update();
    } else {
      // Initial update
      this.updateSync();
    }
  }

  disconnectedCallback(): void {
  }

  adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
  }

  static define(name: string, options?: ElementDefinitionOptions): void {
    globalThis.customElements.define(name, this, options);
  }

  get updatedCount(): number {
    return this._updatedCount;
  }

  update(): Promise<void> {
    // This is an asynchronous updating method that scheduled updates
    if (this._updateTimerId !== undefined) {
      globalThis.clearTimeout(this._updateTimerId);
      this._updateTimerId = undefined;
    }

    this._updateTimerId = globalThis.setTimeout(() => {
      globalThis.clearTimeout(this._updateTimerId);
      this._updateTimerId = undefined;

      // Take out Promise resolvers of this update point before the updating starts
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

  updateSync(): void {
    // This is a synchronous updating method that calls an additional lifecycle callbacks
    try {
      this.render();
      this._updatedCount++;
      this.updatedCallback();
    } catch (exception) {
      this.errorCallback(exception);
    }
  }

  protected render(): void {
  }

  protected updatedCallback(): void {
  }

  protected errorCallback(exception: unknown): void {
    console.error(exception);
  }
}
