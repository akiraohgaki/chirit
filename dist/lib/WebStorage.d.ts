import type { WebStorageMode } from './types.js';
export default class WebStorage {
    private _mode;
    private _prefix;
    private _storage;
    constructor(mode: WebStorageMode, prefix?: string);
    get mode(): WebStorageMode;
    get prefix(): string;
    get length(): number;
    key(index: number): string | null;
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
    clear(): void;
}
