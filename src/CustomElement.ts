import { dom } from './dom.ts';
import { debounce } from './util/debounce.ts';

/**
 * A base class for creating custom element.
 *
 * It provides a mechanism for asynchronous updates and handling lifecycle callbacks.
 *
 * @example Create a custom element
 * ```ts
 * // Create a custom class that extends the CustomElement class.
 * class ColorPreviewElement extends CustomElement {
 *   static override get observedAttributes(): Array<string> {
 *     return ['color', 'size'];
 *   }
 *
 *   // When an observed attribute changes, the element is re-rendered.
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
export class CustomElement extends dom.globalThis.HTMLElement {
  #updateCounter: number;

  #debouncedUpdate: () => void;

  /**
   * An observed attributes.
   *
   * By default, returns empty array.
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

    this.#debouncedUpdate = debounce(this.updateSync.bind(this), 50);
  }

  /**
   * The number of times the element has been updated.
   */
  get updateCounter(): number {
    return this.#updateCounter;
  }

  /**
   * Callback invoked when an observed attribute changes.
   *
   * By default, updates the element.
   *
   * @param _name - The name of the attribute that changed.
   * @param oldValue - The old value of the attribute.
   * @param newValue - The new value of the attribute.
   * @param _namespace - The namespace of the attribute.
   */
  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
    _namespace?: string | null,
  ): void {
    // This should be executed after the initial update via connectedCallback.
    if (this.#updateCounter && oldValue !== newValue) {
      this.update();
    }
  }

  /**
   * Callback invoked when the element is connected to a parent node.
   *
   * By default, updates the element.
   */
  connectedCallback(): void {
    if (this.#updateCounter) {
      // Re-update.
      // The element might have changed its parent node.
      this.update();
    } else {
      // Initial update.
      this.updateSync();
    }
  }

  /**
   * Callback invoked when the element is disconnected from a parent node.
   *
   * By default, do nothing.
   */
  disconnectedCallback(): void {
  }

  /**
   * Callback invoked when the element is moved to a new document.
   *
   * By default, do nothing.
   *
   * @param _oldDocument - The old document.
   * @param _newDocument - The new document.
   */
  adoptedCallback(_oldDocument: Document, _newDocument: Document): void {
  }

  /**
   * Asynchronously updates the element, scheduling an update for later execution.
   */
  update(): void {
    this.#debouncedUpdate();
  }

  /**
   * Synchronously updates the element and calls additional lifecycle callbacks.
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
   * Renders the content of the element.
   *
   * Subclasses should implement this method.
   */
  render(): void {
  }

  /**
   * Callback invoked when the element has been updated.
   *
   * By default, do nothing.
   */
  updatedCallback(): void {
  }

  /**
   * Callback invoked when an error occurs during element updating.
   *
   * By default, output an error log.
   *
   * @param exception - The error that occurred.
   */
  errorCallback(exception: unknown): void {
    console.error(exception);
  }
}
