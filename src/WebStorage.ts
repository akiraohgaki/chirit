import type { WebStorageMode } from './types.ts';

import dom from './dom.ts';

/**
 * A wrapper class for web storage.
 *
 * This class provides a consistent interface for interacting with web storage (localStorage or sessionStorage).
 * Any value to JSON serializable can be stored in the storage.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * // Set and get values in the storage.
 * const storage = new WebStorage('local');
 * storage.set('app_first_run', false);
 * const isAppFirstRun = storage.get('app_first_run');
 *
 * // Define prefix for keys.
 * const user = new WebStorage('local', 'user_');
 * // these actual key name is user_settings.
 * user.set('settings', { colorTheme: 'dark' });
 * const settings = user.get('settings');
 *
 * // When using this class the actual data is stored as a special JSON object.
 * console.log(localStorage.getItem('user_settings'));
 * // '{"_v":{"colorTheme":"dark"}}'
 * ```
 */
export default class WebStorage {
  #mode: WebStorageMode;
  #prefix: string;

  #storage: Storage;

  /**
   * Creates a new instance of the WebStorage class.
   *
   * @param mode - The storage mode to use (`local` or `session`).
   * @param prefix - The prefix to add to keys.
   *
   * @throws {Error} - If the provided mode is not `local` or `session`.
   */
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
        throw new Error('The storage mode must be set to "local" or "session".');
      }
    }
  }

  /**
   * Returns the current storage mode.
   */
  get mode(): WebStorageMode {
    return this.#mode;
  }

  /**
   * Returns the current prefix.
   */
  get prefix(): string {
    return this.#prefix;
  }

  /**
   * Returns the number of items stored in the storage.
   */
  get size(): number {
    return this.#storage.length;
  }

  /**
   * Gets all keys stored in the storage.
   */
  keys(): Array<string> {
    const keys: Array<string> = [];
    if (this.#storage.length) {
      for (let i = 0; i < this.#storage.length; i++) {
        keys.push(this.#storage.key(i) as string);
      }
    }
    return keys;
  }

  /**
   * Sets a value in the storage.
   *
   * @param key - The key to use.
   * @param value - The value to store.
   */
  set(key: string, value: unknown): void {
    // Stores value as special JSON object.
    this.#storage.setItem(
      this.#prefix + key,
      JSON.stringify({ _v: value }),
    );
  }

  /**
   * Gets a value from the storage.
   *
   * @param key - The key to use.
   *
   * @returns The stored value, or `undefined` if not found.
   */
  get(key: string): unknown {
    const value = this.#storage.getItem(this.#prefix + key);
    if (typeof value === 'string') {
      if (value) {
        try {
          // Returns original value stored in special JSON object.
          const deserializedValue = JSON.parse(value);
          return deserializedValue._v;
        } catch {
          // Returns raw value if error occured.
          return value;
        }
      }
      // Returns ''.
      return value;
    }
    // Returns `undefined` instead of `null`.
    return undefined;
  }

  /**
   * Removes a value from the storage.
   *
   * @param key - The key to remove.
   */
  delete(key: string): void {
    this.#storage.removeItem(this.#prefix + key);
  }

  /**
   * Clears all items from the storage.
   */
  clear(): void {
    this.#storage.clear();
  }
}
