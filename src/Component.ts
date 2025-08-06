import { ElementPropertiesConfig } from './types.ts';

import { CustomElement } from './CustomElement.ts';
import { ElementAttributes } from './ElementAttributes.ts';
import { ElementProperties } from './ElementProperties.ts';
import { NodeStructure } from './NodeStructure.ts';
import { dom } from './dom.ts';

/**
 * A base class for creating web component.
 *
 * It inherited the CustomElement class.
 *
 * Consider using the createComponent function for a quick way to create a component.
 *
 * @example Create a component
 * ```ts
 * // Create a custom class that extends the Component class.
 * class ColorPreviewComponent extends Component {
 *   static override get properties(): ElementPropertiesConfig {
 *     return {
 *       color: { value: '#000000' },
 *       size: { value: '100px' },
 *     };
 *   }
 *
 *   override styles(): Array<string | CSSStyleSheet> {
 *     return [
 *       ...document.adoptedStyleSheets,
 *       `
 *         :host { display: inline-block; }
 *         div { width: 100%; height: 100%; }
 *       `,
 *     ];
 *   }
 *
 *   // When a property or an observed attribute changes, the template content is re-rendered.
 *   override template(): string {
 *     return `
 *       <style>
 *       :host { width: ${this.props.size}; height: ${this.props.size}; }
 *       div { background-color: ${this.props.color}; }
 *       </style>
 *
 *       <!-- The execution context for an event handler is the instance of the component. -->
 *       <div onclick="this.clickHandler(event)"></div>
 *     `;
 *   }
 *
 *   clickHandler(_event: Event): void {
 *     this.dispatch('color-preview-click');
 *   }
 * }
 *
 * // Define the custom element.
 * ColorPreviewComponent.define('color-preview');
 *
 * // Use the custom element in HTML.
 * // <color-preview color="#ff0000" size="100px"></color-preview>
 * // <color-preview color="#00ff00" size="100px"></color-preview>
 * // <color-preview color="#0000ff" size="100px"></color-preview>
 * ```
 *
 * @example State management in a component
 * ```ts
 * // The Store class is an observable store for managing complex state.
 * const colorPreviewStore = new Store({
 *   color: '#000000',
 *   size: '100px',
 * });
 *
 * // The State class is an observable state for managing atomic state.
 * const debugState = new State(true);
 *
 * class ColorPreviewComponent extends Component {
 *   override connectedCallback(): void {
 *     super.connectedCallback(); // it must always be called first.
 *     this.observe(colorPreviewStore, debugState); // observe the observables.
 *   }
 *
 *   override disconnectedCallback(): void {
 *     this.unobserve(colorPreviewStore, debugState); // unobserve the observables.
 *     super.disconnectedCallback(); // it should always be called last.
 *   }
 *
 *   override styles(): Array<string | CSSStyleSheet> {
 *     return [
 *       ...document.adoptedStyleSheets,
 *       `
 *         :host { display: inline-block; }
 *         div { width: 100%; height: 100%; }
 *       `,
 *     ];
 *   }
 *
 *   // When the observables changes, the template content is re-rendered.
 *   override template(): string {
 *     return `
 *       <style>
 *       :host {
 *         width: ${colorPreviewStore.state.size};
 *         height: ${colorPreviewStore.state.size};
 *       }
 *       div {
 *         background-color: ${colorPreviewStore.state.color};
 *       }
 *       </style>
 *
 *       <div onclick="this.clickHandler(event)">
 *       ${debugState.get() ? colorPreviewStore.state.color : ''}
 *       </div>
 *     `;
 *   }
 *
 *   clickHandler(event: Event): void {
 *     this.dispatch('color-preview-click');
 *     if (debugState.get()) {
 *       console.log(event);
 *     }
 *   }
 * }
 *
 * ColorPreviewComponent.define('color-preview');
 *
 * // Use the custom element in HTML.
 * // <color-preview></color-preview>
 * // <color-preview></color-preview>
 * // <color-preview></color-preview>
 * ```
 */
export class Component extends CustomElement {
  #elementAttributes: ElementAttributes;

  #elementProperties: ElementProperties;

  #nodeStructure: NodeStructure<Element | DocumentFragment>;

  /**
   * An observed attributes.
   *
   * By default, returns the keys of the properties configuration.
   */
  static override get observedAttributes(): Array<string> {
    return Object.keys(this.properties);
  }

  /**
   * A properties configuration.
   *
   * By default, returns empty object.
   */
  static get properties(): ElementPropertiesConfig {
    return {};
  }

  /**
   * Creates a new instance of the Component class.
   */
  constructor() {
    super();

    this.update = this.update.bind(this);

    this.#elementAttributes = new ElementAttributes(this);
    this.#elementProperties = new ElementProperties(
      this,
      (this.constructor as unknown as { properties: ElementPropertiesConfig }).properties,
    );
    this.#nodeStructure = new NodeStructure(this.createContentContainer(), this);
  }

  /**
   * The internal ElementAttributes instance.
   */
  get elementAttributes(): ElementAttributes {
    return this.#elementAttributes;
  }

  /**
   * The internal ElementProperties instance.
   */
  get elementProperties(): ElementProperties {
    return this.#elementProperties;
  }

  /**
   * The internal NodeStructure instance.
   */
  get nodeStructure(): NodeStructure<Element | DocumentFragment> {
    return this.#nodeStructure;
  }

  /**
   * The proxy object for attribute manipulation.
   *
   * This is an alias for Component.elementAttributes.proxy.
   */
  get attrs(): Record<string, string> {
    return this.#elementAttributes.proxy;
  }

  /**
   * The proxy object for property manipulation.
   *
   * This is an alias for Component.elementProperties.proxy.
   */
  get props(): Record<string, unknown> {
    return this.#elementProperties.proxy;
  }

  /**
   * The content container of the component.
   *
   * This is an alias for Component.nodeStructure.host.
   */
  get content(): Element | DocumentFragment {
    return this.#nodeStructure.host;
  }

  /**
   * Callback invoked when an observed attribute changes.
   *
   * By default, updates the element.
   *
   * @param name - The name of the attribute that changed.
   * @param oldValue - The old value of the attribute.
   * @param newValue - The new value of the attribute.
   * @param _namespace - The namespace of the attribute.
   */
  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
    _namespace?: string | null,
  ): void {
    // This should be executed after the initial update via connectedCallback.
    if (this.updateCounter && oldValue !== newValue) {
      this.#elementProperties.reflectFromAttribute(name); // The update method will be invoked by the onchange callback.
      this.update();
    }
  }

  /**
   * Callback invoked when the element is connected to a parent node.
   *
   * By default, updates the element.
   */
  override connectedCallback(): void {
    if (this.updateCounter) {
      // Re-update.
      // The element might have changed its parent node.
      this.update();
    } else {
      this.#elementProperties.sync();
      this.#elementProperties.onchange = () => {
        this.update();
      };

      // Initial update.
      this.updateSync();
    }
  }

  /**
   * Observes an observable objects.
   *
   * The observable object should have an interface similar to the Observable class.
   *
   * @param args - An observable objects.
   */
  observe(...args: Array<unknown>): void {
    for (const arg of args as Array<Record<string, unknown>>) {
      if (arg.subscribe && typeof arg.subscribe === 'function') {
        arg.subscribe(this.update);
      }
    }
  }

  /**
   * Stops observing an observable objects.
   *
   * The observable object should have an interface similar to the Observable class.
   *
   * @param args - An observable objects.
   */
  unobserve(...args: Array<unknown>): void {
    for (const arg of args as Array<Record<string, unknown>>) {
      if (arg.unsubscribe && typeof arg.unsubscribe === 'function') {
        arg.unsubscribe(this.update);
      }
    }
  }

  /**
   * Dispatches a custom event on the content container of the component.
   *
   * The event bubbles out of the shadow DOM.
   *
   * @param type - The type of the event to dispatch.
   * @param detail - Details to include in the event object.
   */
  dispatch(type: string, detail?: unknown): boolean {
    return this.#nodeStructure.host.dispatchEvent(
      new dom.globalThis.CustomEvent(type, {
        detail: detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Creates the content container for the internal NodeStructure.
   *
   * By default, creates an open shadow DOM.
   */
  createContentContainer(): Element | DocumentFragment {
    return this.attachShadow({ mode: 'open' });
  }

  /**
   * Renders DOM with the styles and the template content.
   */
  override render(): void {
    if (!this.updateCounter && this.#nodeStructure.host instanceof dom.globalThis.ShadowRoot) {
      this.#nodeStructure.adoptStyles(this.styles());
    }
    this.#nodeStructure.update(this.template());
  }

  /**
   * Creates the styles.
   *
   * By default, returns empty array.
   *
   * This method works only if the content container is a ShadowRoot.
   *
   * @returns The stylesheets.
   */
  styles(): string | CSSStyleSheet | Array<string | CSSStyleSheet> {
    return [];
  }

  /**
   * Creates the template content.
   *
   * By default, returns empty string.
   *
   * @returns The template content.
   */
  template(): string | Node | NodeList {
    return '';
  }
}
