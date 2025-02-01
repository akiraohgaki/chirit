import type { Component } from './Component.ts';

/**
 * Options for createComponent.
 */
export interface CreateComponentOptions<T> {
  /**
   * The base component to be extended.
   */
  base?: typeof Component;
  /**
   * List of an observed attributes.
   */
  observedAttributes?: Array<string>;
  /**
   * Callback invoked when the element is created.
   */
  init?: (context: T) => void;
  /**
   * Callback invoked when the element is connected to a parent node.
   */
  connected?: (context: T) => void;
  /**
   * Callback invoked when the element is disconnected from a parent node.
   */
  disconnected?: (context: T) => void;
  /**
   * Creates the styles.
   */
  styles?: (context: T) => string | CSSStyleSheet | Array<string | CSSStyleSheet>;
  /**
   * Creates the template content.
   */
  template?: (context: T) => string | Node | NodeList;
}
