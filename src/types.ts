import type { Component } from './Component.ts';

/**
 * The options for the component.
 */
export interface CreateComponentOptions<T> {
  /**
   * The base component class.
   */
  base: typeof Component;
  /**
   * The configuration object defining properties and their behaviors.
   */
  properties: ElementPropertiesConfig;
  /**
   * Callback invoked when the element is created.
   *
   * @param context - The instance of the element.
   */
  init: (context: T) => void;
  /**
   * Callback invoked when the element is connected to a parent node.
   *
   * @param context - The instance of the element.
   */
  connected: (context: T) => void;
  /**
   * Callback invoked when the element is disconnected from a parent node.
   *
   * @param context - The instance of the element.
   */
  disconnected: (context: T) => void;
  /**
   * Creates the styles.
   *
   * @param context - The instance of the element.
   *
   * @returns The stylesheets of the element.
   */
  styles: (context: T) => string | CSSStyleSheet | Array<string | CSSStyleSheet>;
  /**
   * Creates the template content.
   *
   * @param context - The instance of the element.
   *
   * @returns The template content of the element.
   */
  template: (context: T) => string | Node | NodeList;
}

/**
 * The configuration object defining properties and their behaviors.
 */
export interface ElementPropertiesConfig {
  [key: string]: {
    /**
     * The initial value of the property.
     */
    value: unknown;
    /**
     * Whether to reflect the property to the attribute.
     */
    reflect?: boolean;
    /**
     * Converts the attribute value to the property value.
     *
     * @param value - The value of the attribute.
     *
     * @returns The value to the property.
     */
    converter?: (value: string) => unknown;
  };
}
