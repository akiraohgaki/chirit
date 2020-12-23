import {WebStorageMode} from './types.js';

export default class WebStorage {

    private _mode: WebStorageMode;
    private _prefix: string;

    private _storage: Storage;

    constructor(mode: WebStorageMode, prefix: string = '') {
        this._mode = mode;
        this._prefix = prefix;

        switch (this._mode) {
            case 'local': {
                this._storage = window.localStorage;
                break;
            }
            case 'session': {
                this._storage = window.sessionStorage;
                break;
            }
        }
    }

    get mode(): WebStorageMode {
        return this._mode;
    }

    get prefix(): string {
        return this._prefix;
    }

    get length(): number {
        return this._storage.length;
    }

    key(index: number): string | null {
        return this._storage.key(index);
    }

    setItem(key: string, value: any): void {
        this._storage.setItem(
            this._prefix + key,
            JSON.stringify({_k: key, _v: value})
        );
    }

    getItem(key: string): any {
        const value = this._storage.getItem(this._prefix + key);
        if (value) {
            try {
                // JSON.parse() throw parse error if value is invalid JSON data
                const deserializedValue = JSON.parse(value);
                if (deserializedValue
                    && deserializedValue._k === key
                    && deserializedValue._v !== undefined
                ) {
                    return deserializedValue._v;
                }
            }
            catch {
                return value;
            }
        }
        return value;
    }

    removeItem(key: string): void {
        this._storage.removeItem(this._prefix + key);
    }

    clear(): void {
        this._storage.clear();
    }

}
