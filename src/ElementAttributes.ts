/**
 * Manage the attributes of an element.
 *
 * It simplifies attribute manipulation to the target element.
 *
 * @example Attribute manipulation
 * ```ts
 * const element = document.createElement('color-preview');
 *
 * const elementAttributes = new ElementAttributes(element);
 *
 * console.log(elementAttributes.proxy.color);
 * // undefined
 *
 * elementAttributes.proxy.color = '#ff0000';
 *
 * console.log(elementAttributes.proxy.color);
 * // '#ff0000'
 *
 * console.log('color' in elementAttributes.proxy);
 * // true
 *
 * console.log(Object.keys(elementAttributes.proxy));
 * // ['color']
 *
 * delete elementAttributes.proxy.color;
 * ```
 */
export class ElementAttributes {
  #targetRef: WeakRef<Element> | null;

  #proxy: Record<string, string>;

  /**
   * Creates a new instance of the ElementAttributes class.
   *
   * @param target - The target element to manage attributes for.
   */
  constructor(target: Element) {
    // Avoid circular references to make GC easier.
    this.#targetRef = new WeakRef(target);

    this.#proxy = this.#createProxy();
  }

  /**
   * The proxy object for attribute manipulation.
   */
  get proxy(): Record<string, string> {
    return this.#proxy;
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
   * Creates a proxy object for attribute manipulation.
   */
  #createProxy(): Record<string, string> {
    return new Proxy({}, {
      set: (_proxyTarget, key, value) => {
        const target = this.#getTarget();
        if (typeof key === 'string' && typeof value === 'string') {
          target.setAttribute(key, value);
          return true;
        }
        return false;
      },
      get: (_proxyTarget, key) => {
        const target = this.#getTarget();
        // Returns undefined instead of null if attribute is not exist.
        if (typeof key === 'string' && target.hasAttribute(key)) {
          return target.getAttribute(key);
        }
        return undefined;
      },
      deleteProperty: (_proxyTarget, key) => {
        const target = this.#getTarget();
        if (typeof key === 'string' && target.hasAttribute(key)) {
          target.removeAttribute(key);
          return true;
        }
        return false;
      },
      has: (_proxyTarget, key) => {
        const target = this.#getTarget();
        if (typeof key === 'string' && target.hasAttribute(key)) {
          return true;
        }
        return false;
      },
      ownKeys: () => {
        const target = this.#getTarget();
        const keys: Array<string> = [];
        if (target.hasAttributes()) {
          for (const attribute of Array.from(target.attributes)) {
            keys.push(attribute.name);
          }
        }
        return keys;
      },
      getOwnPropertyDescriptor: (_proxyTarget, key) => {
        const target = this.#getTarget();
        if (typeof key === 'string' && target.hasAttribute(key)) {
          return {
            configurable: true,
            enumerable: true,
            value: target.getAttribute(key),
          };
        }
        return undefined;
      },
    });
  }
}
