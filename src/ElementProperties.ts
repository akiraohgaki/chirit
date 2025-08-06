import type { ElementPropertiesConfig } from './types.ts';

import { isEqual } from './util/isEqual.ts';

/**
 * Manages the properties of an element.
 *
 * It simplifies reflecting from properties to attributes and vice versa.
 *
 * @example Element's property manipulation
 * ```ts
 * const element = document.createElement('counter-button');
 *
 * const elementProperties = new ElementProperties(element, {
 *   'count': { value: 0, reflect: true },
 *   'is-active': { value: false, reflect: true }
 * });
 *
 * elementProperties.sync();
 *
 * console.log(elementProperties.proxy.count);
 * // 0
 * console.log(element.getAttribute('count'));
 * // '0'
 *
 * console.log(elementProperties.proxy['is-active']);
 * // false
 * console.log(element.hasAttribute('is-active'));
 * // false
 *
 * elementProperties.proxy.count = 1;
 * elementProperties.proxy['is-active'] = true;
 *
 * console.log(elementProperties.proxy.count);
 * // 1
 * console.log(element.getAttribute('count'));
 * // '1'
 *
 * console.log(elementProperties.proxy['is-active']);
 * // true
 * console.log(element.hasAttribute('is-active'));
 * // true
 *
 * console.log('count' in elementProperties.proxy);
 * // true
 *
 * console.log(Object.keys(elementProperties.proxy));
 * // ['count', 'is-active']
 *
 * delete elementProperties.proxy.count;
 * // Deletion is not allowed.
 *
 * elementProperties.reflectFromAttribute('count');
 *
 * elementProperties.reflectToAttribute('count');
 *
 * elementProperties.onchange = (_key, _oldValue, _newValue) => {
 *   console.log('Property has changed.');
 * };
 * ```
 */
export class ElementProperties {
  #targetRef: WeakRef<Element> | null;

  #config: ElementPropertiesConfig;

  #properties: Map<string, unknown>;

  #proxy: Record<string, unknown>;

  #onchange: (key: string, oldValue: unknown, newValue: unknown) => unknown;

  /**
   * Creates a new instance of the ElementProperties class.
   *
   * @param target - The target element to manage properties for.
   * @param config - The configuration object defining properties and their behaviors.
   */
  constructor(target: Element, config: ElementPropertiesConfig) {
    // Avoid circular references to make GC easier.
    this.#targetRef = new WeakRef(target);

    this.#config = config;
    this.#properties = new Map();
    this.#initProperties();

    this.#proxy = this.#createProxy();
    this.#onchange = () => {};
  }

  /**
   * The proxy object for property manipulation.
   */
  get proxy(): Record<string, unknown> {
    return this.#proxy;
  }

  /**
   * The function to be called when a property changed.
   *
   * @param key - The key of the property that changed.
   * @param oldValue - The previous value of the property.
   * @param newValue - The new value of the property.
   */
  set onchange(handler: (key: string, oldValue: unknown, newValue: unknown) => unknown) {
    this.#onchange = handler;
  }

  /**
   * The function to be called when a property changed.
   *
   * @param key - The key of the property that changed.
   * @param oldValue - The previous value of the property.
   * @param newValue - The new value of the property.
   */
  get onchange(): (key: string, oldValue: unknown, newValue: unknown) => unknown {
    return this.#onchange;
  }

  /**
   * Synchronizes properties with attributes.
   */
  sync(): void {
    const target = this.#getTarget();

    for (const [key, propConfig] of Object.entries(this.#config)) {
      if (target.hasAttribute(key) || typeof this.#properties.get(key) === 'boolean') {
        this.reflectFromAttribute(key);
      } else if (propConfig.reflect) {
        this.reflectToAttribute(key);
      }
    }
  }

  /**
   * Reflects the current value from the attribute to the property.
   *
   * @param key - The property key to reflect from the attribute.
   */
  reflectFromAttribute(key: string): void {
    const propConfig = this.#config[key];

    if (!propConfig) {
      return;
    }

    const target = this.#getTarget();
    const value = this.#properties.get(key);

    if (!target.hasAttribute(key) && typeof value !== 'boolean') {
      return;
    }

    const attrValue = target.getAttribute(key) ?? '';

    try {
      if (propConfig.converter && typeof propConfig.converter === 'function') {
        this.#properties.set(key, propConfig.converter(attrValue));
      } else if (typeof value === 'boolean') {
        this.#properties.set(key, target.hasAttribute(key));
      } else if (typeof value === 'string') {
        this.#properties.set(key, attrValue);
      } else if (typeof value === 'number') {
        this.#properties.set(key, Number(attrValue));
      } else if (typeof value === 'bigint') {
        this.#properties.set(key, BigInt(attrValue));
      } else if (typeof value === 'object' && value !== null) {
        this.#properties.set(key, JSON.parse(attrValue));
      } else {
        // value is undefined, null, symbol or function.
        this.#properties.set(key, attrValue);
      }
    } catch (exception) {
      console.error(`An error occurred while reflecting from attribute "${key}".`, exception);
    }

    const newValue = this.#properties.get(key);
    if (!isEqual(value, newValue)) {
      this.#onchange(key, value, newValue);
    }
  }

  /**
   * Reflects the current value from the property to the attribute.
   *
   * @param key - The property key to reflect to the attribute.
   */
  reflectToAttribute(key: string): void {
    const propConfig = this.#config[key];

    if (!propConfig) {
      return;
    }

    const target = this.#getTarget();
    const value = this.#properties.get(key);

    try {
      if (value === undefined || value === null) {
        target.removeAttribute(key);
      } else if (typeof value === 'boolean') {
        if (value) {
          target.setAttribute(key, '');
        } else {
          target.removeAttribute(key);
        }
      } else if (typeof value === 'string') {
        target.setAttribute(key, value);
      } else if (typeof value === 'number') {
        target.setAttribute(key, String(value));
      } else if (typeof value === 'bigint') {
        target.setAttribute(key, String(value));
      } else if (typeof value === 'object' && value !== null) {
        target.setAttribute(key, JSON.stringify(value));
      } else {
        // value is symbol or function.
        target.setAttribute(key, String(value));
      }
    } catch (exception) {
      console.error(`An error occurred while reflecting to attribute "${key}".`, exception);
    }
  }

  /**
   * Gets the target element.
   *
   * @throws {Error} - If the target element is not available.
   */
  #getTarget(): Element {
    if (this.#targetRef) {
      const target = this.#targetRef.deref();
      if (target) {
        return target;
      } else {
        this.#targetRef = null;
      }
    }
    throw new Error('The target element is not available.');
  }

  /**
   * Initializes properties based on the configuration.
   */
  #initProperties(): void {
    for (const [key, propConfig] of Object.entries(this.#config)) {
      this.#properties.set(key, propConfig.value);
    }
  }

  /**
   * Creates a proxy object for property manipulation.
   */
  #createProxy(): Record<string, unknown> {
    return new Proxy({}, {
      set: (_proxyTarget, key, value) => {
        if (typeof key === 'string' && this.#properties.has(key)) {
          const oldValue = this.#properties.get(key);
          this.#properties.set(key, value);
          if (!isEqual(oldValue, value)) {
            this.#onchange(key, oldValue, value);
            if (this.#config[key].reflect) {
              this.reflectToAttribute(key);
            }
          }
          return true;
        }
        return false;
      },
      get: (_proxyTarget, key) => {
        if (typeof key === 'string' && this.#properties.has(key)) {
          return this.#properties.get(key);
        }
        return undefined;
      },
      deleteProperty: (_proxyTarget, _key) => {
        // Deletion is not allowed.
        return false;
      },
      has: (_proxyTarget, key) => {
        if (typeof key === 'string' && this.#properties.has(key)) {
          return true;
        }
        return false;
      },
      ownKeys: () => {
        return Array.from(this.#properties.keys());
      },
      getOwnPropertyDescriptor: (_proxyTarget, key) => {
        if (typeof key === 'string' && this.#properties.has(key)) {
          return {
            configurable: true,
            enumerable: true,
            value: this.#properties.get(key),
          };
        }
        return undefined;
      },
    });
  }
}
