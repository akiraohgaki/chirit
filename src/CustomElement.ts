import dom from './dom.ts';

const HTMLElementRef = dom.globalThis.HTMLElement;

/**
 * A base class for building custom elements.
 *
 * This class provides a mechanism for asynchronous updates and handling lifecycle callbacks.
 *
 * ----
 *
 * @example Create a custom element
 * ```ts
 * // Create a custom class that extends the CustomElement class.
 * class ColorPreviewElement extends CustomElement {
 *   static override get observedAttributes(): Array<string> {
 *     return ['color', 'size'];
 *   }
 *
 *   // When a observed attributes changed, the element is re-rendered.
 *   override render(): void {
 *     const color = this.getAttribute('color') ?? '#000000';
 *     const size = this.getAttribute('size') ?? '100px';
 *
 *     this.style.display = 'inline-block';
 *     this.style.width = size;
 *     this.style.height = size;
 *     this.style.backgroundColor = color;
 *
 *     this.textContent = color;
 *   }
 *
 *   override updatedCallback(): void {
 *     console.log('color-preview-updated');
 *   }
 * }
 *
 * // Define the custom element.
 * ColorPreviewElement.define('color-preview');
 *
 * // Use the custom element in HTML.
 * // <color-preview color="#ff0000" size="100px"></color-preview>
 * // <color-preview color="#00ff00" size="100px"></color-preview>
 * // <color-preview color="#0000ff" size="100px"></color-preview>
 * ```
 */
export default class CustomElement extends HTMLElementRef {
  #updateCounter: number;

  #updateDelay: number;
  #updateTimerId: number | undefined;
  #updatePromiseResolvers: Array<{ (): void }>;

  /**
   * Returns an observed attributes.
   */
  static get observedAttributes(): Array<string> {
    return [];
  }

  /**
   * Defines a custom element.
   *
   * @param name - The name of the custom element.
   * @param options - The options for the custom element definition.
   */
  static define(name: string, options?: ElementDefinitionOptions): void {
    dom.globalThis.customElements.define(name, this, options);
  }

  /**
   * Creates a new instance of the CustomElement class.
   */
  constructor() {
    super();

    this.#updateCounter = 0;

    this.#updateDelay = 50;
    this.#updateTimerId = undefined;
    this.#updatePromiseResolvers = [];
  }

  /**
   * Returns the number of times the element has been updated.
   */
  get updateCounter(): number {
    return this.#updateCounter;
  }

  /**
   * Callback invoked when an observed attribute changed.
   *
   * By default, the element is updated.
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
    // Should be executed after the initial update via connectedCallback.
    if (this.#updateCounter && oldValue !== newValue) {
      this.update();
    }
  }

  /**
   * Callback invoked when the element is connected to a parent node.
   *
   * By default, the element is updated.
   */
  connectedCallback(): void {
    if (this.#updateCounter) {
      // Re-update
      // The element might have changed its parent node.
      this.update();
    } else {
      // Initial update
      this.updateSync();
    }
  }

  /**
   * Callback invoked when the element is disconnected from a parent node.
   *
   * By default, to do nothing.
   */
  disconnectedCallback(): void {
  }

  /**
   * Callback invoked when the element is moved to a new document.
   *
   * By default, to do nothing.
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
    if (this.#updateTimerId !== undefined) {
      dom.globalThis.clearTimeout(this.#updateTimerId);
      this.#updateTimerId = undefined;
    }

    this.#updateTimerId = dom.globalThis.setTimeout(() => {
      dom.globalThis.clearTimeout(this.#updateTimerId);
      this.#updateTimerId = undefined;

      // Should retrieve all Promise resolvers associated with this update before proceeding.
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
   * This method should be implemented by subclasses to render the content.
   */
  render(): void {
  }

  /**
   * Callback invoked when the element has been updated.
   *
   * By default, to do nothing.
   */
  updatedCallback(): void {
  }

  /**
   * Callback invoked when an error occurs during the update process.
   *
   * By default, output an error log.
   *
   * @param exception - The error that occurred.
   */
  errorCallback(exception: unknown): void {
    console.error(exception);
  }
}
