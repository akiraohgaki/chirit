import { ElementPropertiesConfig } from './types.ts';

import { CustomElement } from './CustomElement.ts';
import { ElementAttributes } from './ElementAttributes.ts';
import { ElementProperties } from './ElementProperties.ts';
import { NodeStructure } from './NodeStructure.ts';
import { dom } from './dom.ts';

/**
 * A base class for creating reusable web components.
 *
 * It provides many powerful features.
 *
 * @remarks
 * If you need a quick way to create a component, consider using the createComponent function.
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
 *     super.connectedCallback(); // must always be called first.
 *     this.observe(colorPreviewStore, debugState); // observe the observables.
 *   }
 *
 *   override disconnectedCallback(): void {
 *     this.unobserve(colorPreviewStore, debugState); // unobserve the observables.
 *     super.disconnectedCallback(); // should always be called last.
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
  #elementAttributes: ElementAttributes;

  #elementProperties: ElementProperties;

  #nodeStructure: NodeStructure<Element | DocumentFragment>;

  /**
   * An observed attributes.
   *
   * @remarks
   * By default, it returns the keys of the properties configuration.
   */
  static override get observedAttributes(): Array<string> {
    return Object.keys(this.properties);
  }

  /**
   * A properties configuration.
   *
   * @remarks
   * This method should be implemented by subclasses to return the content.
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
   * @remarks
   * This is an alias for Component.elementAttributes.proxy.
   */
  get attrs(): Record<string, string> {
    return this.#elementAttributes.proxy;
  }

  /**
   * The proxy object for property manipulation.
   *
   * @remarks
   * This is an alias for Component.elementProperties.proxy.
   *
   * The properties are defined in the static properties getter.
   */
  get props(): Record<string, unknown> {
    return this.#elementProperties.proxy;
  }

  /**
   * The content container of the component.
   *
   * @remarks
   * This is an alias for Component.nodeStructure.host.
   */
  get content(): Element | DocumentFragment {
    return this.#nodeStructure.host;
  }

  /**
   * Callback invoked when an observed attribute changed.
   *
   * @remarks
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
      this.#elementProperties.reflectFromAttribute(name); // update method will be called by onchange callback.
      this.update();
    }
  }

  /**
   * Callback invoked when the element is connected to a parent node.
   *
   * @remarks
   * By default, the element is updated.
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
   * @remarks
   * By default, this method creates an open shadow DOM.
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
   * @remarks
   * This method works only if the content container is a ShadowRoot.
   *
   * This method should be implemented by subclasses to return the content.
   */
  styles(): string | CSSStyleSheet | Array<string | CSSStyleSheet> {
    return [];
  }

  /**
   * Creates the template content.
   *
   * @remarks
   * This method should be implemented by subclasses to return the content.
   */
  template(): string | Node | NodeList {
    return '';
  }
}
