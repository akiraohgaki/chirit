type WebStorageType = 'local' | 'session';

export default class WebStorage {

    private _type: WebStorageType;
    private _prefix: string;
    private _storage: Storage;

    constructor(type: WebStorageType = 'local', prefix: string = '') {
        this._type = type;
        this._prefix = prefix;

        switch (this._type) {
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

    get type(): WebStorageType {
        return this._type;
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
                const deserializedValue = JSON.parse(value);
                if (deserializedValue
                    && deserializedValue._k === key
                    && deserializedValue._v !== undefined
                ) {
                    return deserializedValue._v;
                }
                return value;
            }
            catch (error) {
                console.error(error);
                return value;
            }
        }
        return null;
    }

    removeItem(key: string): void {
        this._storage.removeItem(this._prefix + key);
    }

    clear(): void {
        this._storage.clear();
    }

}
