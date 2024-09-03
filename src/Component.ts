import type { ComponentContentContainer, NodeStructureContent } from './types.ts';

import CustomElement from './CustomElement.ts';
import ElementAttributesProxy from './ElementAttributesProxy.ts';
import NodeStructure from './NodeStructure.ts';
import dom from './dom.ts';

/**
 * A base class for building custom web components.
 *
 * This class is built on `CustomElement`, `ElementAttributesProxy`, and `NodeStructure`, inheriting their features.
 *
 * If you want to quickly create a component, consider using the `createComponent` function.
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
 *   // When a observed attributes changes, the template content is re-rendered.
 *   override template(): string {
 *     const color = this.attr.color ?? '#000000';
 *     const size = this.attr.size ?? '100px';
 *
 *     return `
 *       <style>
 *       :host {
 *         display: inline-block;
 *         width: ${size};
 *         height: ${size};
 *       }
 *       div {
 *         width: 100%;
 *         height: 100%;
 *         background-color: ${color};
 *       }
 *       </style>
 *
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
 * // An observable store for complex state management.
 * const colorPreviewStore = new Store({
 *   color: '#000000',
 *   size: '100px',
 * });
 *
 * // An observable value for atomic state management.
 * const debugMode = new ObservableValue(true);
 *
 * // Create a custom class that extends the Component class.
 * class ColorPreviewComponent extends Component {
 *   override connectedCallback(): void {
 *     super.connectedCallback(); // must always be called first
 *     this.observe(colorPreviewStore, debugMode);
 *   }
 *
 *   override disconnectedCallback(): void {
 *     this.unobserve(colorPreviewStore, debugMode);
 *     super.disconnectedCallback(); // should always be called last
 *   }
 *
 *   // When a observed state changes, the template content is re-rendered.
 *   override template(): string {
 *     return `
 *       <style>
 *       :host {
 *         display: inline-block;
 *         width: ${colorPreviewStore.state.size};
 *         height: ${colorPreviewStore.state.size};
 *       }
 *       div {
 *         width: 100%;
 *         height: 100%;
 *         background-color: ${colorPreviewStore.state.color};
 *       }
 *       </style>
 *
 *       <div onclick="this.clickHandler(event)">
 *       ${debugMode.get() ? colorPreviewStore.state.color : ''}
 *       </div>
 *     `;
 *   }
 *
 *   clickHandler(event: Event): void {
 *     this.dispatch('color-preview-click');
 *     if (debugMode.get()) {
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
export default class Component extends CustomElement {
  #attr: ElementAttributesProxy;
  #structure: NodeStructure<ComponentContentContainer>;

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
  get structure(): NodeStructure<ComponentContentContainer> {
    return this.#structure;
  }

  /**
   * Returns the same of `this.structure.host`.
   *
   * This is a convenient way to access the content container of the component.
   */
  get content(): ComponentContentContainer {
    return this.#structure.host;
  }

  /**
   * Observes one or more objects for changes.
   *
   * If the object has a `subscribe` function, it will be called with the `update` method of this component as a callback for change notifications.
   *
   * @param args - The objects to observe for changes.
   */
  observe(...args: Array<unknown>): void {
    if (args.length) {
      for (const arg of args as Array<Record<string, unknown>>) {
        if (arg.subscribe && typeof arg.subscribe === 'function') {
          arg.subscribe(this.update);
        }
      }
    }
  }

  /**
   * Stops observing one or more objects for changes.
   *
   * If the object has an `unsubscribe` function, it will be called with the `update` method of this component to remove it from the list of observers.
   *
   * @param args - The objects to stop observing.
   */
  unobserve(...args: Array<unknown>): void {
    if (args.length) {
      for (const arg of args as Array<Record<string, unknown>>) {
        if (arg.unsubscribe && typeof arg.unsubscribe === 'function') {
          arg.unsubscribe(this.update);
        }
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
  createContentContainer(): ComponentContentContainer {
    return this.attachShadow({ mode: 'open' });
  }

  /**
   * Renders DOM with the template content.
   */
  override render(): void {
    this.#structure.update(this.template());
  }

  /**
   * Creates the template content.
   *
   * This method should be implemented by subclasses to return the content.
   */
  template(): NodeStructureContent {
    return '';
  }
}
