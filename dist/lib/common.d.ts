interface Dictionary<T> {
    [key: string]: T;
}
interface Observer {
    (value: any): void;
}
declare type NodeContentData = string | Node | NodeList;
declare type WebStorageType = 'local' | 'session';
export { Dictionary, Observer, NodeContentData, WebStorageType };
