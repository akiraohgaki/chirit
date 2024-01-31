import type { WebStorageMode } from './types.ts';

import dom from './dom.ts';

export default class WebStorage {
  #mode: WebStorageMode;
  #prefix: string;

  #storage: Storage;

  constructor(mode: WebStorageMode, prefix: string = '') {
    this.#mode = mode;
    this.#prefix = prefix;

    switch (this.#mode) {
      case 'local': {
        this.#storage = dom.globalThis.localStorage;
        break;
      }
      case 'session': {
        this.#storage = dom.globalThis.sessionStorage;
        break;
      }
      default: {
        throw new Error('The mode must be set "local" or "session".');
      }
    }
  }

  get mode(): WebStorageMode {
    return this.#mode;
  }

  get prefix(): string {
    return this.#prefix;
  }

  get size(): number {
    return this.#storage.length;
  }

  keys(): Array<string> {
    const keys: Array<string> = [];
    if (this.#storage.length) {
      for (let i = 0; i < this.#storage.length; i++) {
        keys.push(this.#storage.key(i) as string);
      }
    }
    return keys;
  }

  set(key: string, value: unknown): void {
    // Stores value as special JSON object
    this.#storage.setItem(
      this.#prefix + key,
      JSON.stringify({ _k: key, _v: value }),
    );
  }

  get(key: string): unknown {
    // Returns original value stored in special JSON object
    const value = this.#storage.getItem(this.#prefix + key);
    if (value) {
      try {
        const deserializedValue = JSON.parse(value);
        if (deserializedValue?._k === key) {
          return deserializedValue._v;
        }
      } catch {
        void 0;
      }
    }
    return value;
  }

  delete(key: string): void {
    this.#storage.removeItem(this.#prefix + key);
  }

  clear(): void {
    this.#storage.clear();
  }
}
