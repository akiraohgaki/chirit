export interface Dictionary<T> {
    [key: string]: T;
}
export interface Observer<T> {
    (value: T): void;
}
export declare type NodeContentData = string | Node | NodeList;
export declare type WebStorageType = 'local' | 'session';
