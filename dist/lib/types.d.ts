export interface Dictionary<T> {
    [key: string]: T;
}
export interface OnEventHandler {
    (event: Event): any;
}
export interface OnErrorHandler {
    (exception: any): any;
}
export interface Observer<T> {
    (value: T): void;
}
export interface RouteHandler {
    (params: Dictionary<string>): void;
}
export declare type ComponentContentContainer = Element | DocumentFragment;
export declare type NodeContentData = string | Node | NodeList;
export declare type RouterMode = 'hash' | 'history';
export declare type WebStorageMode = 'local' | 'session';
