interface Dictionary<T> {
    [key: string]: T;
}

interface Observer {
    (value: any): void;
}

type NodeContentData = string | Node | NodeList;

type WebStorageType = 'local' | 'session';

export {
    Dictionary,
    Observer,
    NodeContentData,
    WebStorageType
};
