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
  styles?: (context: T) => NodeStructureStyles;
  /**
   * Creates the template content.
   */
  template?: (context: T) => NodeStructureContent;
}

/**
 * General event handler.
 */
export type OnEventHandler = (event: Event) => unknown;

/**
 * General error handler.
 */
export type OnErrorHandler = (exception: unknown) => unknown;

/**
 * Observer for Observable.
 */
export type Observer<T> = (value: T) => void;

/**
 * Route handler for Router.
 */
export type RouteHandler = (params: Record<string, string>) => void;

/**
 * Content container in Component.
 */
export type ComponentContentContainer = Element | DocumentFragment;

/**
 * Styles in NodeStructure.
 */
export type NodeStructureStyles = string | CSSStyleSheet | Array<string | CSSStyleSheet>;

/**
 * Content in NodeStructure.
 */
export type NodeStructureContent = string | Node | NodeList;

/**
 * Routing mode in Router.
 */
export type RouterMode = 'hash' | 'history';

/**
 * Storage mode in WebStorage.
 */
export type WebStorageMode = 'local' | 'session';
