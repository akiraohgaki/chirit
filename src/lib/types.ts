export interface Dictionary<T> {
    [key: string]: T;
}

export interface Observer {
    (value: any): void;
}

export type NodeContentData = string | Node | NodeList;

export type WebStorageType = 'local' | 'session';
