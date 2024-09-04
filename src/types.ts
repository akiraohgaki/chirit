/**
 * Options for createComponent.
 */
export interface CreateComponentOptions<T> {
  /**
   * List of an observed attributes.
   */
  observedAttributes?: Array<string>;
  /**
   * Callback invoked when the element is created.
   */
  init?: { (context: T): void };
  /**
   * Callback invoked when the element is connected to a parent node.
   */
  connected?: { (context: T): void };
  /**
   * Callback invoked when the element is disconnected from a parent node.
   */
  disconnected?: { (context: T): void };
  /**
   * Creates the template content.
   */
  template?: { (context: T): NodeStructureContent };
}

/**
 * General event handler.
 */
export interface OnEventHandler {
  (event: Event): unknown;
}

/**
 * General error handler.
 */
export interface OnErrorHandler {
  (exception: unknown): unknown;
}

/**
 * Observer for Observable.
 */
export interface Observer<T> {
  (value: T): void;
}

/**
 * Route handler for Router.
 */
export interface RouteHandler {
  (params: Record<string, string>): void;
}

/**
 * Content container in Component.
 */
export type ComponentContentContainer = Element | DocumentFragment;

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
