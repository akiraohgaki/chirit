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
 * prop.__reflectToAttribute('count');
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
  __reflectFromAttribute: (key: string) => void = () => {}; // this is a trick to ensure the method is defined

  /**
   * Reflects the current value from the property to the attribute.
   *
   * @param key - The property key to reflect to the attribute.
   */
  __reflectToAttribute: (key: string) => void = () => {}; // this is a trick to ensure the method is defined

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

    const proxyBase = {
      __reflectFromAttribute: (key: string) => {
        const propConfig = config[key];

        if (!propConfig) {
          console.warn(`Configuration for key '${key}' not found during reflectFromAttribute.`);
          return;
        }

        const target = getTarget();
        const value = properties.get(key);
        const attrValue = target.getAttribute(key) ?? '';

        if (value === undefined) {
          return;
        } else if (propConfig.converter && typeof propConfig.converter === 'function') {
          properties.set(key, propConfig.converter(attrValue));
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
      },
      __reflectToAttribute: (key: string) => {
        const propConfig = config[key];

        if (!propConfig) {
          console.warn(`Configuration for key '${key}' not found during reflectToAttribute.`);
          return;
        }

        const target = getTarget();
        const value = properties.get(key);

        if (value === undefined) {
          return;
        } else if (typeof value === 'boolean') {
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
      },
    };

    for (const [key, propConfig] of Object.entries(config)) {
      properties.set(key, propConfig.value);
      const target = getTarget();
      if (target.hasAttribute(key)) {
        proxyBase.__reflectFromAttribute(key);
      } else if (propConfig.reflect) {
        proxyBase.__reflectToAttribute(key);
      }
    }

    return new Proxy(proxyBase, {
      set: (proxyTarget, key, value) => {
        if (typeof key === 'string' && properties.has(key)) {
          properties.set(key, value);
          if (config[key].reflect) {
            proxyTarget.__reflectToAttribute(key);
          }
          return true;
        }
        return false;
      },
      get: (proxyTarget, key) => {
        if (key === '__reflectFromAttribute') {
          return proxyTarget.__reflectFromAttribute;
        }

        if (key === '__reflectToAttribute') {
          return proxyTarget.__reflectToAttribute;
        }

        if (typeof key === 'string' && properties.has(key)) {
          return properties.get(key);
        }
        return undefined;
      },
      deleteProperty: (_proxyTarget, _key) => {
        return false; // Deletion is not allowed
      },
      has: (_proxyTarget, key) => {
        if (typeof key === 'string' && properties.has(key)) {
          return true;
        }
        return false;
      },
      ownKeys: () => {
        return Array.from(properties.keys());
      },
      getOwnPropertyDescriptor: (_proxyTarget, key) => {
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
