export default class WebStorage {

    private _type: string;
    private _prefix: string;
    private _storage: Storage;

    constructor(type: string = 'local', prefix: string = '') {
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
            default: {
                throw new Error('Storage type must be "local" or "session"');
            }
        }
    }

    get type(): string {
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
            JSON.stringify({_key: key, _value: value})
        );
    }

    getItem(key: string): any {
        const value = this._storage.getItem(this._prefix + key);
        if (value) {
            const deserializedValue = JSON.parse(value);
            if (deserializedValue
                && deserializedValue._key === key
                && deserializedValue._value !== undefined
            ) {
                return deserializedValue._value;
            }
            return value;
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
