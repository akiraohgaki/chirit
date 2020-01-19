declare type WebStorageType = 'local' | 'session';
export default class WebStorage {
    private _type;
    private _prefix;
    private _storage;
    constructor(type?: WebStorageType, prefix?: string);
    get type(): string;
    get prefix(): string;
    get length(): number;
    key(index: number): string | null;
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
    clear(): void;
}
export {};
