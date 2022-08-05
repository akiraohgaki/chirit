import type { WebStorageMode } from './types.ts';

export default class WebStorage {
  #mode: WebStorageMode;
  #prefix: string;

  #storage: Storage;

  constructor(mode: WebStorageMode, prefix: string = '') {
    this.#mode = mode;
    this.#prefix = prefix;

    switch (this.#mode) {
      case 'local': {
        this.#storage = globalThis.localStorage;
        break;
      }
      case 'session': {
        this.#storage = globalThis.sessionStorage;
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

  get length(): number {
    return this.#storage.length;
  }

  key(index: number): string | null {
    return this.#storage.key(index);
  }

  setItem(key: string, value: unknown): void {
    // Adds prefix to the key
    // and makes the value into special object and serialise to JSON
    this.#storage.setItem(
      this.#prefix + key,
      JSON.stringify({ _k: key, _v: value }),
    );
  }

  getItem(key: string): unknown {
    // Checks if the value is JSON created from special object and returns original value
    // otherwise just returns the value
    const value = this.#storage.getItem(this.#prefix + key);
    if (value) {
      try {
        // JSON.parse() will throw a parse error if the value is not valid JSON
        const deserializedValue = JSON.parse(value);
        if (
          deserializedValue &&
          deserializedValue._k === key &&
          deserializedValue._v !== undefined
        ) {
          // Will return original value
          return deserializedValue._v;
        }
      } catch {
        // Will return string
        return value;
      }
    }
    // Will return string or null
    return value;
  }

  removeItem(key: string): void {
    this.#storage.removeItem(this.#prefix + key);
  }

  clear(): void {
    this.#storage.clear();
  }
}
