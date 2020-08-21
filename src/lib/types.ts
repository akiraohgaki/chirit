export interface Dictionary<T> {
    [key: string]: T;
}

export interface Observer<T> {
    (value: T): void;
}

export type NodeContentData = string | Node | NodeList;

export type RouterMode = 'hash' | 'history';

export interface RouteHandler {
    (params: Dictionary<string>): void;
}

export type WebStorageMode = 'local' | 'session';
