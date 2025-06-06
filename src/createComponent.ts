import type { CreateComponentOptions } from './types.ts';

import { Component } from './Component.ts';

/**
 * Creates custom web components.
 *
 * This function is a convenient way to creates a component based on the Component class.
 *
 * If you need to create a complex component, consider using the Component class.
 *
 * ----
 *
 * @example Create a component
 * ```ts
 * // The interface of the component to be created.
 * interface ColorPreviewComponentInterface extends Component {
 *   clickHandler: (event: Event) => void;
 * }
 *
 * // The State class is an observable state for atomic state management.
 * const debugState = new State(true);
 *
 * // Create the component as color-preview element.
 * createComponent<ColorPreviewComponentInterface>(
 *   'color-preview',
 *   {
 *     base: Component,
 *     observedAttributes: ['color', 'size'],
 *     init: (context) => {
 *       context.clickHandler = (event) => {
 *         context.dispatch('color-preview-click');
 *         if (debugState.get()) {
 *           console.log(event);
 *         }
 *       };
 *     },
 *     connected: (context) => {
 *       context.observe(debugState);
 *     },
 *     disconnected: (context) => {
 *       context.unobserve(debugState);
 *     },
 *     styles: (_context) => {
 *       return [
 *         ...document.adoptedStyleSheets,
 *         `
 *           :host { display: inline-block; }
 *           div { width: 100%; height: 100%; }
 *         `,
 *       ];
 *     },
 *     template: (context) => {
 *       const color = context.attr.color ?? '#000000';
 *       const size = context.attr.size ?? '100px';
 *
 *       return `
 *         <style>
 *         :host { width: ${size}; height: ${size}; }
 *         div { background-color: ${color}; }
 *         </style>
 *
 *         <!-- The execution context for an event handler is the component instance. -->
 *         <div onclick="this.clickHandler(event)">
 *         ${debugState.get() ? color : ''}
 *         </div>
 *       `;
 *     },
 *   },
 * );
 *
 * // Use the custom element in HTML.
 * // <color-preview color="#ff0000" size="100px"></color-preview>
 * // <color-preview color="#00ff00" size="100px"></color-preview>
 * // <color-preview color="#0000ff" size="100px"></color-preview>
 * ```
 *
 * @template T - The type of the component class.
 *
 * @param name - The name of the custom element.
 * @param options - The options for configuring the component.
 */
export function createComponent<T = Component>(name: string, options?: CreateComponentOptions<T>): T {
  const BaseComponent = options?.base ?? Component;

  const CustomComponent = class extends BaseComponent {
    static override get observedAttributes(): Array<string> {
      return (options?.observedAttributes && Array.isArray(options.observedAttributes))
        ? options.observedAttributes
        : super.observedAttributes;
    }

    constructor() {
      super();

      if (options?.init && typeof options.init === 'function') {
        options.init(this as unknown as T);
      }
    }

    override connectedCallback(): void {
      super.connectedCallback();

      if (options?.connected && typeof options.connected === 'function') {
        options.connected(this as unknown as T);
      }
    }

    override disconnectedCallback(): void {
      if (options?.disconnected && typeof options.disconnected === 'function') {
        options.disconnected(this as unknown as T);
      }

      super.disconnectedCallback();
    }

    override styles(): string | CSSStyleSheet | Array<string | CSSStyleSheet> {
      return (options?.styles && typeof options.styles === 'function')
        ? options.styles(this as unknown as T)
        : super.styles();
    }

    override template(): string | Node | NodeList {
      return (options?.template && typeof options.template === 'function')
        ? options.template(this as unknown as T)
        : super.template();
    }
  };

  CustomComponent.define(name);

  return CustomComponent as T;
}
