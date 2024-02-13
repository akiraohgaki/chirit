import dom from './dom.ts';

const BaseElement = dom.globalThis.HTMLElement;

export default class CustomElement extends BaseElement {
  #updateCounter: number;

  #updateTimerId: number | undefined;
  #updateDelay: number;
  #updatePromiseResolvers: Array<{ (): void }>;

  static get observedAttributes(): Array<string> {
    return [];
  }

  static define(name: string, options?: ElementDefinitionOptions): void {
    dom.globalThis.customElements.define(name, this, options);
  }

  constructor() {
    super();

    this.#updateCounter = 0;

    this.#updateTimerId = undefined;
    this.#updateDelay = 100;
    this.#updatePromiseResolvers = [];
  }

  get updateCounter(): number {
    return this.#updateCounter;
  }

  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
    _namespace?: string | null,
  ): void {
    // Update when observed attribute has changed, but not before initial update
    if (this.#updateCounter && oldValue !== newValue) {
      this.update();
    }
  }

  connectedCallback(): void {
    // Update when this Element is connected to parent Node
    if (this.#updateCounter) {
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

  update(): Promise<void> {
    // This is an asynchronous updating method that scheduled updates
    if (this.#updateTimerId !== undefined) {
      dom.globalThis.clearTimeout(this.#updateTimerId);
      this.#updateTimerId = undefined;
    }

    this.#updateTimerId = dom.globalThis.setTimeout(() => {
      dom.globalThis.clearTimeout(this.#updateTimerId);
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
      this.#updateCounter++;
      this.updatedCallback();
    } catch (exception) {
      this.errorCallback(exception);
    }
  }

  render(): void {
  }

  updatedCallback(): void {
  }

  errorCallback(exception: unknown): void {
    console.error(exception);
  }
}
