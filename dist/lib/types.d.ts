export interface Dictionary<T> {
    [key: string]: T;
}
export interface Observer<T> {
    (value: T): void;
}
export declare type NodeContentData = string | Node | NodeList;
export declare type RouterMode = 'hash' | 'history';
export interface RouteHandler {
    (params: Dictionary<string>): void;
}
export declare type WebStorageMode = 'local' | 'session';
