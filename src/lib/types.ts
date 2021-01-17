export interface Dictionary<T> {
    [key: string]: T;
}

export interface ErrorHandler {
    (exception: any): void;
}

export interface Observer<T> {
    (value: T): void;
}

export interface RouteHandler {
    (params: Dictionary<string>): void;
}

export type ComponentContentContainer = Element | DocumentFragment;

export type NodeContentData = string | Node | NodeList;

export type RouterMode = 'hash' | 'history';

export type WebStorageMode = 'local' | 'session';
