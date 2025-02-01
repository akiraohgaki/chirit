import { CustomElement } from './CustomElement.ts';
import { ElementAttributesProxy } from './ElementAttributesProxy.ts';
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
 *   static override get observedAttributes(): Array<string> {
 *     return ['color', 'size'];
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
 *   // When a observed attributes changed, the template content is re-rendered.
 *   override template(): string {
 *     const color = this.attr.color ?? '#000000';
 *     const size = this.attr.size ?? '100px';
 *
 *     return `
 *       <style>
 *       :host { width: ${size}; height: ${size}; }
 *       div { background-color: ${color}; }
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
 *   // When a observed state changed, the template content is re-rendered.
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
  #attr: ElementAttributesProxy;

  #structure: NodeStructure<Element | DocumentFragment>;

  /**
   * Creates a new instance of the Component class.
   */
  constructor() {
    super();

    this.update = this.update.bind(this);

    this.#attr = new ElementAttributesProxy(this);
    this.#structure = new NodeStructure(this.createContentContainer(), this);
  }

  /**
   * Returns a proxy object for element attributes.
   */
  get attr(): ElementAttributesProxy {
    return this.#attr;
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
