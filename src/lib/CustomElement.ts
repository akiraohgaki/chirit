export default class CustomElement extends HTMLElement {
  #updatedCount: number;

  #updateTimerId: number | undefined;
  #updateDelay: number;
  #updatePromiseResolvers: Array<{ (): void }>;

  constructor() {
    super();

    this.#updatedCount = 0;

    this.#updateTimerId = undefined;
    this.#updateDelay = 100;
    this.#updatePromiseResolvers = [];
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
    if (this.#updatedCount && oldValue !== newValue) {
      this.update();
    }
  }

  connectedCallback(): void {
    // Runs update task when this Element has connected to parent Node
    if (this.#updatedCount) {
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
    return this.#updatedCount;
  }

  update(): Promise<void> {
    // This is an asynchronous updating method that scheduled updates
    if (this.#updateTimerId !== undefined) {
      globalThis.clearTimeout(this.#updateTimerId);
      this.#updateTimerId = undefined;
    }

    this.#updateTimerId = globalThis.setTimeout(() => {
      globalThis.clearTimeout(this.#updateTimerId);
      this.#updateTimerId = undefined;

      // Take out Promise resolvers of this update point before the updating starts
      const promiseResolvers = this.#updatePromiseResolvers.splice(0);

      this.updateSync();

      if (promiseResolvers.length) {
        for (const resolve of promiseResolvers) {
          resolve();
        }
      }
    }, this.#updateDelay);

    return new Promise((resolve) => {
      this.#updatePromiseResolvers.push(resolve);
    });
  }

  updateSync(): void {
    // This is a synchronous updating method that calls an additional lifecycle callbacks
    try {
      this.render();
      this.#updatedCount++;
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
