import type { ElementPropertiesProxyConfig } from './types.ts';

/**
 * Creates Proxy object that represents properties based on an element's attributes.
 *
 * This class simplifies reflecting from properties to attributes and vice versa.
 *
 * ----
 *
 * @example Element's property manipulation
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
 *
 * prop.__onchange = (key, oldValue, newValue) => {
 *   console.log('Property has changed.');
 * };
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
   * The function to be called when a property changed.
   *
   * @param key - The property key that changed.
   * @param oldValue - The old value of the property.
   * @param newValue - The new value of the property.
   */
  __onchange: (key: string, oldValue: unknown, newValue: unknown) => void = () => {}; // this is a trick to ensure the method is defined

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
          console.warn(`Property "${key}" is not defined in the configuration.`);
          return;
        }

        const target = getTarget();
        const value = properties.get(key);

        if (!target.hasAttribute(key) && typeof value !== 'boolean') {
          return;
        }

        const attrValue = target.getAttribute(key) ?? '';

        try {
          if (propConfig.converter && typeof propConfig.converter === 'function') {
            properties.set(key, propConfig.converter(attrValue));
          } else if (typeof value === 'boolean') {
            properties.set(key, target.hasAttribute(key));
          } else if (typeof value === 'string') {
            properties.set(key, attrValue);
          } else if (typeof value === 'number') {
            properties.set(key, Number(attrValue));
          } else if (typeof value === 'bigint') {
            properties.set(key, BigInt(attrValue));
          } else if (typeof value === 'object' && value !== null) {
            properties.set(key, JSON.parse(attrValue));
          } else {
            // value is undefined, null, symbol or function.
            properties.set(key, attrValue);
          }
        } catch (exception) {
          console.error(`Error reflecting from attribute "${key}":`, exception);
        }

        const newValue = properties.get(key);
        if (value !== newValue) {
          proxyBase.__onchange(key, value, newValue);
        }
      },
      __reflectToAttribute: (key: string) => {
        const propConfig = config[key];

        if (!propConfig) {
          console.warn(`Property "${key}" is not defined in the configuration.`);
          return;
        }

        const target = getTarget();
        const value = properties.get(key);

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
          console.error(`Error reflecting to attribute "${key}":`, exception);
        }
      },
      __onchange: (_key: string, _oldValue: unknown, _newValue: unknown) => {},
    };

    // Initialize properties based on the config.
    // This will set the initial values and reflect them to attributes if needed.
    for (const [key, propConfig] of Object.entries(config)) {
      properties.set(key, propConfig.value);

      const target = getTarget();

      if (target.hasAttribute(key) || typeof propConfig.value === 'boolean') {
        proxyBase.__reflectFromAttribute(key);
      } else if (propConfig.reflect) {
        proxyBase.__reflectToAttribute(key);
      }
    }

    return new Proxy(proxyBase, {
      set: (proxyTarget, key, value) => {
        if (typeof key === 'string' && properties.has(key)) {
          const oldValue = properties.get(key);
          properties.set(key, value);
          if (oldValue !== value) {
            proxyTarget.__onchange(key, oldValue, value);
            if (config[key].reflect) {
              proxyTarget.__reflectToAttribute(key);
            }
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

        if (key === '__onchange') {
          return proxyTarget.__onchange;
        }

        if (typeof key === 'string' && properties.has(key)) {
          return properties.get(key);
        }
        return undefined;
      },
      deleteProperty: (_proxyTarget, _key) => {
        // Deletion is not allowed.
        return false;
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
            configurable: true,
            enumerable: true,
            value: properties.get(key),
          };
        }
        return undefined;
      },
    });
  }
}
