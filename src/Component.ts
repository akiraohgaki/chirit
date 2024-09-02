import type { ComponentContentContainer, NodeStructureContent } from './types.ts';

import CustomElement from './CustomElement.ts';
import ElementAttributesProxy from './ElementAttributesProxy.ts';
import NodeStructure from './NodeStructure.ts';
import dom from './dom.ts';

/**
 * A base class for building custom web components.
 *
 * This class used CustomElement, ElementAttributesProxy, and NodeStructure.
 *
 * ----
 *
 * ### Basic usage
 *
 * Create a custom class that extends the Component class.
 *
 * ```ts
 * class ColorPreviewComponent extends Component {
 *   static override get observedAttributes(): Array<string> {
 *     return ['color', 'size'];
 *   }
 *
 *   override template(): string {
 *     const color = this.attr.color ?? '#000000';
 *     const size = this.attr.size ?? '100px';
 *
 *     return `
 *       <style>
 *         :host {
 *           display: inline-block;
 *           width: ${size};
 *           height: ${size};
 *         }
 *         div {
 *           width: 100%;
 *           height: 100%;
 *           background-color: ${color};
 *         }
 *       </style>
 *
 *       <div onclick="this.clickHandler(event)">
 *       ${color}
 *       </div>
 *     `;
 *   }
 *
 *   override updatedCallback(): void {
 *     this.dispatch('color-preview-updated', {
 *       color: this.attr.color,
 *       size: this.attr.size,
 *     });
 *   }
 *
 *   clickHandler(_event: Event): void {
 *     this.dispatch('color-preview-click');
 *   }
 * }
 * ```
 *
 * Define the custom element.
 *
 * ```ts
 * ColorPreviewComponent.define('color-preview');
 * ```
 *
 * Use the custom element.
 *
 * ```html
 * <color-preview color="#ff0000" size="100px"></color-preview>
 * ```
 *
 * ### Component with state management
 *
 * Store or ObservableValue is a good choice for managing a component's state.
 *
 * ```ts
 * const colorPreviewStore = new Store({
 *   color: '#000000',
 *   size: '100px',
 * });
 *
 * const debugMode = new ObservableValue(true);
 *
 * class ColorPreviewComponent extends Component {
 *   override connectedCallback(): void {
 *     super.connectedCallback();
 *     this.observe(colorPreviewStore, debugMode);
 *   }
 *
 *   override disconnectedCallback(): void {
 *     this.unobserve(colorPreviewStore, debugMode);
 *     super.disconnectedCallback();
 *   }
 *
 *   override template(): string {
 *     return `
 *        <style>
 *          :host {
 *            display: inline-block;
 *            width: ${colorPreviewStore.state.size};
 *            height: ${colorPreviewStore.state.size};
 *          }
 *          div {
 *            width: 100%;
 *            height: 100%;
 *            background-color: ${colorPreviewStore.state.color};
 *          }
 *        </style>
 *
 *        <div onclick="this.clickHandler(event)">
 *        ${debugMode.get() ? '[debug mode]' : ''}
 *        ${colorPreviewStore.state.color}
 *        </div>
 *      `;
 *   }
 *
 *   override updatedCallback(): void {
 *     this.dispatch('color-preview-updated');
 *
 *     if (debugMode.get()) {
 *       console.log({
 *         updated: this.updateCounter,
 *         color: colorPreviewStore.state.color,
 *         size: colorPreviewStore.state.size,
 *       });
 *     }
 *   }
 *
 *   clickHandler(event: Event): void {
 *     this.dispatch('color-preview-click');
 *
 *     if (debugMode.get()) {
 *       console.log(event);
 *     }
 *   }
 * }
 * ```
 */
export default class Component extends CustomElement {
  #attr: ElementAttributesProxy;
  #structure: NodeStructure<ComponentContentContainer>;

  /**
   * Creates a new instance of the custom web component.
   */
  constructor() {
    super();

    this.update = this.update.bind(this);

    this.#attr = new ElementAttributesProxy(this);
    this.#structure = new NodeStructure(this.createContentContainer(), this);
  }

  /**
   * Returns a proxy object for accessing and manipulating element attributes.
   */
  get attr(): ElementAttributesProxy {
    return this.#attr;
  }

  /**
   * Returns the internal NodeStructure instance that manages the component's content.
   */
  get structure(): NodeStructure<ComponentContentContainer> {
    return this.#structure;
  }

  /**
   * Returns the same content container of `this.structure.host`.
   *
   * This is a convenient way to access the content container (host element) of the component's NodeStructure.
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
   * Dispatches a custom event on the component's content container.
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
   * Creates the content container (host element) for the component's NodeStructure.
   *
   * By default, this method creates an open shadow DOM.
   */
  createContentContainer(): ComponentContentContainer {
    return this.attachShadow({ mode: 'open' });
  }

  /**
   * Renders the component's structure with the latest template content.
   */
  override render(): void {
    this.#structure.update(this.template());
  }

  /**
   * Creates the component's template content.
   *
   * This method should be implemented by subclasses to return the content for the NodeStructure to update.
   */
  template(): NodeStructureContent {
    return '';
  }
}
