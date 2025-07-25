import type { ElementPropertiesProxyConfig } from './types.ts';

/**
 * Creates Proxy object that represents properties based on an element's attributes.
 *
 * This class simplifies reflecting from attributes to properties and vice versa.
 *
 * ----
 *
 * @example Element's attribute and property management
 * ```ts
 * const element = document.createElement('counter-button');
 *
 * const prop = new ElementPropertiesProxy(element, {
 *   'count': { value: 0, reflect: true },
 *   'is-active': { value: false, reflect: true }
 * });
 *
 * console.log(prop.count); // or prop['count']
 * // 0
 * console.log(element.getAttribute('count'));
 * // '0'
 *
 * console.log(prop['is-active']);
 * // false
 * console.log(element.hasAttribute('is-active'));
 * // false
 *
 * prop.count = 1;
 * prop['is-active'] = true;
 *
 * console.log(prop.count);
 * // 1
 * console.log(element.getAttribute('count'));
 * // '1'
 *
 * console.log(prop['is-active']);
 * // true
 * console.log(element.hasAttribute('is-active'));
 * // true
 *
 * console.log('count' in prop);
 * // true
 *
 * console.log(Object.keys(prop));
 * // ['count', 'is-active']
 *
 * delete prop.count;
 * // Deletion is not allowed
 *
 * prop.__reflectFromAttribute('count');
 * // Reflects the current value from the attribute to the property
 *
 * * prop.__reflectToAttribute('count');
 * // Reflects the current value from the property to the attribute
 * ```
 */
export class ElementPropertiesProxy {
  /**
   * Type of properties
   */
  [key: string]: unknown;

  /**
   * Reflects the current value from the attribute to the property.
   *
   * @param key - The property key to reflect from the attribute.
   */
  __reflectFromAttribute: (key: string) => void = () => {}; // this is a trick for type definitions

  /**
   * Reflects the current value from the property to the attribute.
   *
   * @param key - The property key to reflect to the attribute.
   */
  __reflectToAttribute: (key: string) => void = () => {}; // this is a trick for type definitions

  /**
   * Creates a new Proxy object but the instance is not the ElementPropertiesProxy class.
   *
   * @param target - The target element whose properties this proxy will manage.
   * @param config - Object for configuring properties.
   */
  constructor(target: Element, config: ElementPropertiesProxyConfig) {
    // Avoid circular references to make GC easier.
    let targetRef: WeakRef<Element> | null = new WeakRef(target);

    const getTarget = () => {
      if (targetRef) {
        const target = targetRef.deref();
        if (target) {
          return target;
        } else {
          targetRef = null;
        }
      }
      throw new Error('The target element is not available.');
    };

    const properties: Map<string, unknown> = new Map();

    const reflectFromAttribute = (key: string) => {
      const target = getTarget();
      const value = properties.get(key);
      const attrValue = target.getAttribute(key) ?? '';
      if (config[key].converter && typeof config[key].converter === 'function') {
        properties.set(key, config[key].converter(attrValue));
      } else if (typeof value === 'boolean') {
        properties.set(key, target.hasAttribute(key));
      } else if (typeof value === 'string') {
        properties.set(key, attrValue);
      } else if (typeof value === 'number') {
        properties.set(key, parseFloat(attrValue));
      } else if (typeof value === 'object') {
        try {
          properties.set(key, JSON.parse(attrValue));
        } catch {
          properties.set(key, null);
        }
      }
    };

    const reflectToAttribute = (key: string) => {
      const target = getTarget();
      const value = properties.get(key);
      if (typeof value === 'boolean') {
        if (value) {
          target.setAttribute(key, '');
        } else {
          target.removeAttribute(key);
        }
      } else if (typeof value === 'string') {
        target.setAttribute(key, value);
      } else if (typeof value === 'number') {
        target.setAttribute(key, value.toString());
      } else if (typeof value === 'object') {
        try {
          target.setAttribute(key, JSON.stringify(value));
        } catch {
          target.setAttribute(key, '');
        }
      }
    };

    for (const [key, value] of Object.entries(config)) {
      properties.set(key, value.value); // should use structuredClone() ?
      const target = getTarget();
      if (target.hasAttribute(key)) {
        reflectFromAttribute(key);
      } else if (value.reflect) {
        reflectToAttribute(key);
      }
    }

    return new Proxy({
      __reflectFromAttribute: reflectFromAttribute,
      __reflectToAttribute: reflectToAttribute,
    }, {
      set: (_target, key, value) => {
        if (typeof key === 'string' && properties.has(key)) {
          properties.set(key, value);
          if (config[key].reflect) {
            reflectToAttribute(key);
          }
          return true;
        }
        return false;
      },
      get: (target, key) => {
        if (['__reflectFromAttribute', '__reflectToAttribute'].includes(key as string)) {
          return Reflect.get(target, key);
        }

        if (typeof key === 'string' && properties.has(key)) {
          return properties.get(key);
        }
        return undefined;
      },
      deleteProperty: (_target, _key) => {
        return false; // Deletion is not allowed
      },
      has: (_target, key) => {
        if (typeof key === 'string' && properties.has(key)) {
          return true;
        }
        return false;
      },
      ownKeys: () => {
        return Array.from(properties.keys());
      },
      getOwnPropertyDescriptor: (_target, key) => {
        if (typeof key === 'string' && properties.has(key)) {
          return {
            configurable: false,
            enumerable: true,
            value: properties.get(key),
          };
        }
        return undefined;
      },
    });
  }
}
