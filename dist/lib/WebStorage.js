export default class WebStorage {
    constructor(mode, prefix = '') {
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
    get mode() {
        return this._mode;
    }
    get prefix() {
        return this._prefix;
    }
    get length() {
        return this._storage.length;
    }
    key(index) {
        return this._storage.key(index);
    }
    setItem(key, value) {
        this._storage.setItem(this._prefix + key, JSON.stringify({ _k: key, _v: value }));
    }
    getItem(key) {
        const value = this._storage.getItem(this._prefix + key);
        if (value) {
            try {
                const deserializedValue = JSON.parse(value);
                if (deserializedValue
                    && deserializedValue._k === key
                    && deserializedValue._v !== undefined) {
                    return deserializedValue._v;
                }
            }
            catch (_a) {
                return value;
            }
        }
        return value;
    }
    removeItem(key) {
        this._storage.removeItem(this._prefix + key);
    }
    clear() {
        this._storage.clear();
    }
}
//# sourceMappingURL=WebStorage.js.map