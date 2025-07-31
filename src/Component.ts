import { ElementPropertiesConfig } from './types.ts';

import { CustomElement } from './CustomElement.ts';
import { ElementAttributes } from './ElementAttributes.ts';
import { ElementProperties } from './ElementProperties.ts';
import { NodeStructure } from './NodeStructure.ts';
import { dom } from './dom.ts';

/**
 * A base class for creating custom web components.
 *
 * This class as a base class for creating reusable web components, it provides many powerful features.
 *
 * If you need a quick way to create a component, consider using the createComponent function.
 *
 * ----
 *
 * @example Create a component
 * ```ts
 * // Create a custom class that extends the Component class.
 * class ColorPreviewComponent extends Component {
 *   static override get properties(): ElementPropertiesConfig {
 *     return {
 *      color: { value: '#000000' },
 *      size: { value: '100px' },
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
 *   // When a properties or an observed attributes changed, the template content is re-rendered.
 *   override template(): string {
 *     return `
 *       <style>
 *       :host { width: ${this.props.size}; height: ${this.props.size}; }
 *       div { background-color: ${this.props.color}; }
 *       </style>
 *
 *       <!-- The execution context for an event handler is the component instance. -->
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
 * @example State management in component
 * ```ts
 * // The Store class is an observable store for complex state management.
 * const colorPreviewStore = new Store({
 *   color: '#000000',
 *   size: '100px',
 * });
 *
 * // The State class is an observable state for atomic state management.
 * const debugState = new State(true);
 *
 * // Create a custom class that extends the Component class.
 * class ColorPreviewComponent extends Component {
 *   override connectedCallback(): void {
 *     super.connectedCallback(); // must always be called first
 *     this.observe(colorPreviewStore, debugState); // observe the observables
 *   }
 *
 *   override disconnectedCallback(): void {
 *     this.unobserve(colorPreviewStore, debugState); // unobserve the observables
 *     super.disconnectedCallback(); // should always be called last
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
 *   // When an observed state changed, the template content is re-rendered.
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
 *       <!-- The execution context for an event handler is the component instance. -->
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
 * // Define the custom element.
 * ColorPreviewComponent.define('color-preview');
 *
 * // Use the custom element in HTML.
 * // <color-preview></color-preview>
 * // <color-preview></color-preview>
 * // <color-preview></color-preview>
 * ```
 */
export class Component extends CustomElement {
  #attributes: ElementAttributes;

  #properties: ElementProperties;

  #structure: NodeStructure<Element | DocumentFragment>;

  /**
   * Returns an observed attributes.
   *
   * By default, it returns the keys of the properties configuration.
   */
  static override get observedAttributes(): Array<string> {
    return Object.keys(this.properties);
  }

  /**
   * Returns a properties configuration.
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

    this.#attributes = new ElementAttributes(this);
    this.#properties = new ElementProperties(
      this,
      (this.constructor as unknown as { properties: ElementPropertiesConfig }).properties,
    );
    this.#properties.onchange = () => {
      this.update();
    };
    this.#structure = new NodeStructure(this.createContentContainer(), this);
  }

  /**
   * Returns a proxy object for element attributes.
   */
  get attrs(): Record<string, string> {
    return this.#attributes.proxy;
  }

  /**
   * Returns a proxy object for element properties.
   *
   * The properties are defined in the static properties getter.
   */
  get props(): Record<string, unknown> {
    return this.#properties.proxy;
  }

  /**
   * Returns the internal NodeStructure instance.
   */
  get structure(): NodeStructure<Element | DocumentFragment> {
    return this.#structure;
  }

  /**
   * Returns the same of Component.structure.host.
   *
   * This is a convenient way to access the content container of the component.
   */
  get content(): Element | DocumentFragment {
    return this.#structure.host;
  }

  /**
   * Callback invoked when an observed attribute changed.
   *
   * By default, the element is updated.
   *
   * @param name - The name of the attribute that changed.
   * @param oldValue - The previous value of the attribute.
   * @param newValue - The new value of the attribute.
   * @param _namespace - The namespace of the attribute.
   */
  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
    _namespace?: string | null,
  ): void {
    // Should be executed after the initial update via connectedCallback.
    if (this.updateCounter && oldValue !== newValue) {
      this.#properties.reflectFromAttribute(name); // update method will be called by onchange callback
      this.update();
    }
  }

  /**
   * Callback invoked when the element is connected to a parent node.
   *
   * By default, the element is updated.
   */
  override connectedCallback(): void {
    if (this.updateCounter) {
      // Re-update
      // The element might have changed its parent node.
      this.update();
    } else {
      this.#properties.sync();
      // Initial update
      this.updateSync();
    }
  }

  /**
   * Observes one or more objects for changes.
   *
   * If the object has a subscribe function, it will be called with the Component.update method of this component as a callback for change notifications.
   *
   * @param args - The objects to observe for changes.
   */
  observe(...args: Array<unknown>): void {
    for (const arg of args as Array<Record<string, unknown>>) {
      if (arg.subscribe && typeof arg.subscribe === 'function') {
        arg.subscribe(this.update);
      }
    }
  }

  /**
   * Stops observing one or more objects for changes.
   *
   * If the object has an unsubscribe function, it will be called with the Component.update method of this component to remove it from the list of observers.
   *
   * @param args - The objects to stop observing.
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
    return this.#structure.host.dispatchEvent(
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
   * By default, this method creates an open shadow DOM.
   */
  createContentContainer(): Element | DocumentFragment {
    return this.attachShadow({ mode: 'open' });
  }

  /**
   * Renders DOM with the styles and the template content.
   */
  override render(): void {
    if (!this.updateCounter && this.#structure.host instanceof dom.globalThis.ShadowRoot) {
      this.#structure.adoptStyles(this.styles());
    }
    this.#structure.update(this.template());
  }

  /**
   * Creates the styles.
   *
   * This method works only if the content container is a ShadowRoot.
   *
   * This method should be implemented by subclasses to return the styles.
   */
  styles(): string | CSSStyleSheet | Array<string | CSSStyleSheet> {
    return [];
  }

  /**
   * Creates the template content.
   *
   * This method should be implemented by subclasses to return the content.
   */
  template(): string | Node | NodeList {
    return '';
  }
}
