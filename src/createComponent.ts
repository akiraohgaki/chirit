import type { CreateComponentOptions, ElementPropertiesConfig } from './types.ts';

import { Component } from './Component.ts';

/**
 * Creates web component.
 *
 * It is based on the Component class.
 *
 * @remarks
 * Consider using the Component class to create complex components.
 *
 * @example Create a component
 * ```ts
 * // This is the interface of the component.
 * interface ColorPreviewComponentInterface extends Component {
 *   clickHandler: (event: Event) => void;
 * }
 *
 * // The State class is an observable state for managing atomic state.
 * const debugState = new State(true);
 *
 * // Create the component as a color-preview element.
 * createComponent<ColorPreviewComponentInterface>(
 *   'color-preview',
 *   {
 *     base: Component,
 *     properties: {
 *       color: { value: '#000000' },
 *       size: { value: '100px' },
 *     },
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
 *       return `
 *         <style>
 *         :host { width: ${context.props.size}; height: ${context.props.size}; }
 *         div { background-color: ${context.props.color}; }
 *         </style>
 *
 *         <!-- The execution context for an event handler is the component instance. -->
 *         <div onclick="this.clickHandler(event)">
 *         ${debugState.get() ? context.props.color : ''}
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
 * @param options - The options for the component.
 */
export function createComponent<T = Component>(name: string, options: Partial<CreateComponentOptions<T>> = {}): T {
  const BaseComponent = options.base ?? Component;

  const CustomComponent = class extends BaseComponent {
    static override get properties(): ElementPropertiesConfig {
      return (options.properties && typeof options.properties === 'object') ? options.properties : super.properties;
    }

    constructor() {
      super();

      if (options.init && typeof options.init === 'function') {
        options.init(this as unknown as T);
      }
    }

    override connectedCallback(): void {
      super.connectedCallback();

      if (options.connected && typeof options.connected === 'function') {
        options.connected(this as unknown as T);
      }
    }

    override disconnectedCallback(): void {
      if (options.disconnected && typeof options.disconnected === 'function') {
        options.disconnected(this as unknown as T);
      }

      super.disconnectedCallback();
    }

    override styles(): string | CSSStyleSheet | Array<string | CSSStyleSheet> {
      return (options.styles && typeof options.styles === 'function')
        ? options.styles(this as unknown as T)
        : super.styles();
    }

    override template(): string | Node | NodeList {
      return (options.template && typeof options.template === 'function')
        ? options.template(this as unknown as T)
        : super.template();
    }
  };

  CustomComponent.define(name);

  return CustomComponent as T;
}
