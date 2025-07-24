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
 * // Error thrown
 * ```
 */
export class ElementPropertiesProxy {
  /**
   * Type of properties
   */
  [key: string]: unknown;

  /**
   * Creates a new Proxy object but the instance is not the ElementPropertiesProxy class.
   *
   * @param target - The target element whose properties this proxy will manage.
   */
  constructor(
    target: Element,
    definition: Record<string, { value: unknown; reflect?: boolean; converter?: (value: string) => unknown }>,
  ) {
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

    return new Proxy({}, {});
  }
}
