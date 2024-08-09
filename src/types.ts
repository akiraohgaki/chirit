export interface CreateComponentOptions<T> {
  observedAttributes?: Array<string>;
  init?: { (context: T): void };
  connected?: { (context: T): void };
  disconnected?: { (context: T): void };
  template?: { (context: T): NodeStructureContent };
}

export interface OnEventHandler {
  (event: Event): unknown;
}

export interface OnErrorHandler {
  (exception: unknown): unknown;
}

export interface Observer<T> {
  (value: T): void;
}

export interface RouteHandler {
  (params: Record<string, string>): void;
}

export type ComponentContentContainer = Element | DocumentFragment;

export type NodeStructureContent = string | Node | NodeList;

export type RouterMode = 'hash' | 'history';

export type WebStorageMode = 'local' | 'session';
