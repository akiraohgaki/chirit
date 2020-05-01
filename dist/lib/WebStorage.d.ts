import { WebStorageType } from './types.js';
export default class WebStorage {
    private _type;
    private _prefix;
    private _storage;
    constructor(type: WebStorageType, prefix?: string);
    get type(): WebStorageType;
    get prefix(): string;
    get length(): number;
    key(index: number): string | null;
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
    clear(): void;
}
