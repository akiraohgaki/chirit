import dom from './dom.ts';

const _HTMLElement = dom.globalThis.HTMLElement;

/**
 * A base class for custom elements
 *
 * This class provides a mechanism for asynchronous updates and lifecycle callbacks.
 *
 * ----
 *
 * ### Basic usage
 *
 * Create a custom class that extends the CustomElement class.
 *
 * ```ts
 * class ColorPreviewElement extends CustomElement {
 *   static override get observedAttributes(): Array<string> {
 *     return ['color', 'size'];
 *   }
 *
 *   override render(): void {
 *     const color = this.getAttribute('color') ?? '#000000';
 *     const size = this.getAttribute('size') ?? '100px';
 *
 *     this.style.display = 'inline-block';
 *     this.style.backgroundColor = color;
 *     this.style.width = size;
 *     this.style.height = size;
 *
 *     this.textContent = color;
 *   }
 *
 *   override updatedCallback(): void {
 *     console.log('Element updated');
 *   }
 * }
 * ```
 *
 * Define the custom element.
 *
 * ```ts
 * ColorPreviewElement.define('color-preview');
 * ```
 *
 * Use the custom element.
 *
 * ```html
 * <color-preview color="#ff0000" size="100px"></color-preview>
 * ```
 */
export default class CustomElement extends _HTMLElement {
  #updateCounter: number;

  #updateTimerId: number | undefined;
  #updateDelay: number;
  #updatePromiseResolvers: Array<{ (): void }>;

  /**
   * Returns an array of observed attributes.
   */
  static get observedAttributes(): Array<string> {
    return [];
  }

  /**
   * Defines a custom element with the specified name.
   *
   * @param name - The name of the custom element.
   * @param options - Options for the custom element definition.
   */
  static define(name: string, options?: ElementDefinitionOptions): void {
    dom.globalThis.customElements.define(name, this, options);
  }

  /**
   * Creates a new instance of the custom element.
   */
  constructor() {
    super();

    this.#updateCounter = 0;

    this.#updateTimerId = undefined;
    this.#updateDelay = 100;
    this.#updatePromiseResolvers = [];
  }

  /**
   * Returns the number of times the element has been updated.
   */
  get updateCounter(): number {
    return this.#updateCounter;
  }

  /**
   * Callback invoked when an observed attribute changes.
   *
   * @param _name - The name of the attribute that changed.
   * @param oldValue - The previous value of the attribute.
   * @param newValue - The new value of the attribute.
   * @param _namespace - The namespace of the attribute.
   */
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

  /**
   * Callback invoked when the element is connected to a parent node.
   */
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

  /**
   * Callback invoked when the element is disconnected from a parent node.
   */
  disconnectedCallback(): void {
  }

  /**
   * Callback invoked when the element is moved to a new document.
   *
   * @param _oldDocument - The previous document.
   * @param _newDocument - The new document.
   */
  adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
  }

  /**
   * Updates the element asynchronously, scheduling an update for later execution.
   */
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

  /**
   * Updates the element synchronously, calling additional lifecycle callbacks.
   */
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

  /**
   * Renders the element's content.
   *
   * This method should be overridden by subclasses to implement custom rendering logic.
   */
  render(): void {
  }

  /**
   * Callback invoked after the element has been updated.
   */
  updatedCallback(): void {
  }

  /**
   * Callback invoked when an error occurs during the update process.
   *
   * @param exception - The error that occurred.
   */
  errorCallback(exception: unknown): void {
    console.error(exception);
  }
}
